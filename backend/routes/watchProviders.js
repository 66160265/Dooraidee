const express = require('express');
const router = express.Router();
const tmdbService = require('../services/tmdbService');
const anilistService = require('../services/anilistService');
const { normalizeWatchProviders, normalizeAnimeWatchProviders } = require('../services/normalizer');

router.get('/:mediaType/:id', async (req, res, next) => {
    try {
        const { mediaType, id } = req.params;

        if (mediaType === 'anime') {
            const externalLinks = await anilistService.getAnimeExternalLinks(Number(id));
            return res.json(normalizeAnimeWatchProviders(externalLinks));
        }

        const rawResults = await tmdbService.getWatchProviders(mediaType, id);
        const normalized = normalizeWatchProviders(rawResults);
        res.json(normalized);
    } catch (err) {
        next(err);
    }
});

module.exports = router;