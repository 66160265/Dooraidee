const express = require('express');
const router = express.Router();
const tmdbService = require('../services/tmdbService');
const { normalizeMovie, isAdultTmdb, TMDB_GENRE_MAP } = require('../services/normalizer');

const GENRE_NAME_TO_ID = Object.fromEntries(
    Object.entries(TMDB_GENRE_MAP).map(([id, name]) => [name, Number(id)])
);

router.get('/', async (req, res, next) => {
    try {
        const page = Number(req.query.page) || 1;
        const { genre, year, search } = req.query;
        const data = search
            ? await tmdbService.searchMovies(page, search)
            : await tmdbService.getDiscoverMovies(page, {
                genreId: genre ? GENRE_NAME_TO_ID[genre] : undefined,
                year: year || undefined,
            });
        // TMDB reports total_pages far beyond what it will actually serve —
        // page requests above 500 error out regardless of the reported total.
        const totalPages = Math.min(data.total_pages, 500);
        res.json({
            page: data.page,
            hasNextPage: data.page < totalPages,
            totalPages,
            results: data.results.map(normalizeMovie),
        });
    } catch (err) {
        next(err);
    }
});

router.get('/:id', async (req, res, next) => {
    try {
        const movie = await tmdbService.getMovieById(req.params.id);
        if (isAdultTmdb(movie)) {
            return res.status(404).json({ error: 'Not found' });
        }
        res.json(normalizeMovie(movie));
    } catch (err) {
        next(err);
    }
});

module.exports = router;
