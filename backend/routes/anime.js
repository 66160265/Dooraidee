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

function cacheKey(filters) {
    return JSON.stringify(filters);
}

async function pageHasResults(page, filters) {
    const result = await anilistService.getAnimeList(page, PER_PAGE, filters);
    return result.media.length > 0;
}

async function findTotalPages(filters, firstPage) {
    const key = cacheKey(filters);
    const cached = pageCountCache.get(key);
    if (cached && cached.expiresAt > Date.now()) {
        return cached.totalPages;
    }

    let totalPages;
    if (firstPage.media.length === 0) {
        totalPages = 0;
    } else if (!firstPage.pageInfo.hasNextPage) {
        totalPages = 1;
    } else if (await pageHasResults(MAX_PAGE, filters)) {
        totalPages = MAX_PAGE;
    } else {
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
        totalPages = lastGood;
    }

    pageCountCache.set(key, { totalPages, expiresAt: Date.now() + PAGE_COUNT_CACHE_TTL_MS });
    return totalPages;
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

        const data = await anilistService.getAnimeList(page, PER_PAGE, filters);
        const totalPages = await findTotalPages(filters, page === 1 ? data : await anilistService.getAnimeList(1, PER_PAGE, filters));

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
