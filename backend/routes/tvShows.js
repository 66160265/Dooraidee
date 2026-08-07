const express = require('express');
const router = express.Router();
const tmdbService = require('../services/tmdbService');
const { normalizeTv, isAdultTmdb, TMDB_GENRE_MAP } = require('../services/normalizer');

const GENRE_NAME_TO_ID = Object.fromEntries(
    Object.entries(TMDB_GENRE_MAP).map(([id, name]) => [name, Number(id)])
);

router.get('/', async (req, res, next) => {
    try {
        const page = Number(req.query.page) || 1;
        const { genre, year } = req.query;
        const data = await tmdbService.getDiscoverTvShows(page, {
            genreId: genre ? GENRE_NAME_TO_ID[genre] : undefined,
            year: year || undefined,
        });
        res.json({
            page: data.page,
            hasNextPage: data.page < data.total_pages,
            results: data.results.map(normalizeTv),
        });
    } catch (err) {
        next(err);
    }
});

router.get('/:id', async (req, res, next) => {
    try {
        const tvShow = await tmdbService.getTvById(req.params.id);
        if (isAdultTmdb(tvShow)) {
            return res.status(404).json({ error: 'Not found' });
        }
        res.json(normalizeTv(tvShow));
    } catch (err) {
        next(err);
    }
});

module.exports = router;
