const express = require('express');
const router = express.Router();
const tmdbService = require('../services/tmdbService');
const { normalizeTv } = require('../services/normalizer');

router.get('/', async (req, res, next) => {
    try {
        const page = Number(req.query.page) || 1;
        const data = await tmdbService.getDiscoverTvShows(page);
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
        res.json(normalizeTv(tvShow));
    } catch (err) {
        next(err);
    }
});

module.exports = router;
