const express = require('express');
const router = express.Router();
const anilistService = require('../services/anilistService');
const tmdbService = require('../services/tmdbService');
const malService = require('../services/malService');
const translateService = require('../services/translateService');
const { normalizeAnime, isAdultAnime, ageRatingLabel } = require('../services/normalizer');

const PER_PAGE = 20;

router.get('/', async (req, res, next) => {
    try {
        const page = Number(req.query.page) || 1;
        const { genre, season, year, search } = req.query;
        const data = await anilistService.getAnimeList(page, PER_PAGE, {
            genre: genre || undefined,
            season: season ? season.toUpperCase() : undefined,
            seasonYear: year ? Number(year) : undefined,
            search: search || undefined,
        });
        res.json({
            page,
            hasNextPage: data.pageInfo.hasNextPage,
            results: data.media.filter((a) => !isAdultAnime(a)).map(normalizeAnime),
        });
    } catch (err) {
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
