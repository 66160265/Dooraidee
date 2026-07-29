const express = require('express');
const router = express.Router();
const tmdbService = require('../services/tmdbService');
const anilistService = require('../services/anilistService');
const { normalizeMovie, normalizeTv, normalizeAnime } = require('../services/normalizer');

router.get('/', async (req, res, next) => {
    try {
        const [rawMovies, rawTv, rawAnime] = await Promise.all([
            tmdbService.getTrendingMovies(),
            tmdbService.getTrendingTvShows(),
            anilistService.getTrendingAnime(),
        ]);

        const normalizedMovies = rawMovies.map(normalizeMovie);
        const normalizedTv = rawTv.map(normalizeTv);
        const normalizedAnime = rawAnime.map(normalizeAnime);

        const allMedia = [...normalizedMovies, ...normalizedTv, ...normalizedAnime];

        res.json({ count: allMedia.length, results: allMedia });
    } catch (err) {
        next(err);
    }
});

module.exports = router;