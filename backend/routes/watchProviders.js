const express = require('express');
const router = express.Router();
const tmdbService = require('../services/tmdbService');
const { normalizeWatchProviders } = require('../services/normalizer');

router.get('/:mediaType/:id', async (req, res, next) => {
    try {
        const { mediaType, id } = req.params;
        const rawResults = await tmdbService.getWatchProviders(mediaType, id);
        const normalized = normalizeWatchProviders(rawResults);
        res.json(normalized);
    } catch (err) {
        next(err);
    }
});

module.exports = router;