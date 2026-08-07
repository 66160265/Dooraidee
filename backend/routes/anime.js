const express = require('express');
const router = express.Router();
const anilistService = require('../services/anilistService');
const { normalizeAnime, isAdultAnime } = require('../services/normalizer');

const PER_PAGE = 20;

router.get('/', async (req, res, next) => {
    try {
        const page = Number(req.query.page) || 1;
        const { genre, season, year } = req.query;
        const data = await anilistService.getAnimeList(page, PER_PAGE, {
            genre: genre || undefined,
            season: season ? season.toUpperCase() : undefined,
            seasonYear: year ? Number(year) : undefined,
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
        res.json(normalizeAnime(anime));
    } catch (err) {
        next(err);
    }
});

module.exports = router;
