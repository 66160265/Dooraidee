const express = require('express');
const router = express.Router();
const tmdbService = require('../services/tmdbService');
const { normalizeMovie } = require('../services/normalizer');

router.get('/', async (req, res, next) => {
    try {
        const page = Number(req.query.page) || 1;
        const data = await tmdbService.getDiscoverMovies(page);
        res.json({
            page: data.page,
            hasNextPage: data.page < data.total_pages,
            results: data.results.map(normalizeMovie),
        });
    } catch (err) {
        next(err);
    }
});

router.get('/:id', async (req, res, next) => {
    try {
        const movie = await tmdbService.getMovieById(req.params.id);
        res.json(normalizeMovie(movie));
    } catch (err) {
        next(err);
    }
});

module.exports = router;
