const express = require('express');
const router = express.Router();
const anilistService = require('../services/anilistService');
const tmdbService = require('../services/tmdbService');
const malService = require('../services/malService');
const translateService = require('../services/translateService');
const { normalizeAnime, isAdultAnime, ageRatingLabel } = require('../services/normalizer');

const PER_PAGE = 20;
const MAX_PAGE = 250;
const PAGE_COUNT_CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

// AniList's pageInfo.total is capped at a fixed value and doesn't reflect
// filtered/searched result counts at all, so the real last page has to be
// discovered by probing. Cached per filter combo since it only needs to run
// once — every other page request for the same filters reuses the result.
const pageCountCache = new Map();

// A binary search is ~10 AniList requests — if two requests for the same
// uncached filter combo land close together (StrictMode's double effect,
// several users browsing the same filter), each running its own search
// multiplies that into a burst big enough to trip AniList's rate limit.
// Sharing the in-flight promise collapses concurrent searches into one.
const inFlightSearches = new Map();

function cacheKey(filters) {
    return JSON.stringify(filters);
}

async function pageHasResults(page, filters) {
    const result = await anilistService.getAnimeList(page, PER_PAGE, filters);
    return result.media.length > 0;
}

async function searchTotalPages(filters, firstPage) {
    if (firstPage.media.length === 0) return 0;
    if (!firstPage.pageInfo.hasNextPage) return 1;
    if (await pageHasResults(MAX_PAGE, filters)) return MAX_PAGE;

    let lastGood = 1;
    let firstBad = MAX_PAGE;
    while (lastGood + 1 < firstBad) {
        const mid = Math.floor((lastGood + firstBad) / 2);
        // eslint-disable-next-line no-await-in-loop
        if (await pageHasResults(mid, filters)) {
            lastGood = mid;
        } else {
            firstBad = mid;
        }
    }
    return lastGood;
}

async function findTotalPages(filters, firstPage) {
    const key = cacheKey(filters);
    const cached = pageCountCache.get(key);
    if (cached && cached.expiresAt > Date.now()) {
        return cached.totalPages;
    }

    const existingSearch = inFlightSearches.get(key);
    if (existingSearch) return existingSearch;

    const searchPromise = (async () => {
        try {
            const totalPages = await searchTotalPages(filters, firstPage);
            pageCountCache.set(key, { totalPages, expiresAt: Date.now() + PAGE_COUNT_CACHE_TTL_MS });
            return totalPages;
        } finally {
            inFlightSearches.delete(key);
        }
    })();

    inFlightSearches.set(key, searchPromise);
    return searchPromise;
}

// AniList's search argument only matches romaji/English titles — searching
// in Japanese (or any script AniList doesn't index) returns nothing even
// when the anime exists. MyAnimeList's own search does index native titles,
// so as a fallback, look it up there and cross-reference the hits back into
// AniList's data shape via idMal. Scoped to a single page of MAL's results
// since this is a rare fallback path, not the primary browsing flow.
async function searchByNativeTitleFallback(query, page) {
    const offset = (page - 1) * PER_PAGE;
    const malHits = await malService.searchAnime(query, PER_PAGE, offset).catch(() => []);
    const malIds = malHits.map((hit) => hit.node.id);
    const anilistMatches = await anilistService.getAnimeByMalIds(malIds).catch(() => []);

    const byMalId = new Map(anilistMatches.map((media) => [media.idMal, media]));
    const media = malIds.map((id) => byMalId.get(id)).filter(Boolean);

    return { media, pageInfo: { hasNextPage: false } };
}

router.get('/', async (req, res, next) => {
    try {
        const page = Number(req.query.page) || 1;
        const { genre, season, year, search } = req.query;
        const filters = {
            genre: genre || undefined,
            season: season ? season.toUpperCase() : undefined,
            seasonYear: year ? Number(year) : undefined,
            search: search || undefined,
        };

        let data = await anilistService.getAnimeList(page, PER_PAGE, filters);
        let totalPages;

        if (filters.search && data.media.length === 0) {
            data = await searchByNativeTitleFallback(filters.search, page);
            totalPages = data.media.length > 0 ? 1 : 0;
        } else {
            try {
                const firstPage = page === 1 ? data : await anilistService.getAnimeList(1, PER_PAGE, filters);
                totalPages = await findTotalPages(filters, firstPage);
            } catch (err) {
                // Computing the exact total costs several extra AniList calls
                // (binary search) on top of the one that already got `data`
                // successfully — if AniList is rate-limiting hard enough that
                // those extra calls fail too, don't take the whole request
                // down with it. The page the user asked for still has real
                // results; just fall back to a conservative page-count guess.
                console.error('findTotalPages failed, falling back to an estimate:', err.message);
                totalPages = data.pageInfo.hasNextPage ? page + 1 : page;
            }
        }

        res.json({
            page,
            hasNextPage: data.pageInfo.hasNextPage,
            totalPages,
            results: data.media.filter((a) => !isAdultAnime(a)).map(normalizeAnime),
        });
    } catch (err) {
        // AniList rejects a page number past its own total with a 400 —
        // degrade to an empty page instead of surfacing an error.
        if (err.response?.status === 400) {
            return res.json({ page: Number(req.query.page) || 1, hasNextPage: false, totalPages: 0, results: [] });
        }
        next(err);
    }
});

router.get('/:id', async (req, res, next) => {
    try {
        const anime = await anilistService.getAnimeById(Number(req.params.id));
        if (isAdultAnime(anime)) {
            return res.status(404).json({ error: 'Not found' });
        }

        const normalized = normalizeAnime(anime);

        const [studioLogoUrl, translatedDescription, rawAgeRating] = await Promise.all([
            normalized.studio
                ? tmdbService.findCompanyLogoUrl(normalized.studio).catch(() => null)
                : Promise.resolve(null),
            translateService.translateToThai(normalized.description),
            normalized.idMal
                ? malService.getAnimeRating(normalized.idMal).catch(() => null)
                : Promise.resolve(null),
        ]);
        normalized.studioLogoUrl = studioLogoUrl;
        normalized.description = translatedDescription;
        normalized.ageRating = ageRatingLabel(rawAgeRating);

        res.json(normalized);
    } catch (err) {
        next(err);
    }
});

module.exports = router;
