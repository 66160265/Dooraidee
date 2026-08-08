const express = require('express');
const router = express.Router();
const tmdbService = require('../services/tmdbService');
const { normalizeMovie, normalizeTv, isAdultTmdb } = require('../services/normalizer');

router.get('/movies', async (req, res, next) => {
    try {
        const data = await tmdbService.getUpcomingMovies(1);
        const results = data.results
            .filter((m) => !isAdultTmdb(m))
            .map(normalizeMovie)
            .sort((a, b) => new Date(a.releaseDate) - new Date(b.releaseDate));
        res.json({ results });
    } catch (err) {
        next(err);
    }
});

router.get('/tv-shows', async (req, res, next) => {
    try {
        const data = await tmdbService.getOnTheAirTv(1);
        const shows = data.results.filter((s) => !isAdultTmdb(s)).slice(0, 20);

        const withNextEpisode = await Promise.all(
            shows.map(async (show) => {
                const nextEpisode = await tmdbService.getTvNextEpisode(show.id).catch(() => null);
                return { show, nextEpisode };
            })
        );

        const results = withNextEpisode
            .filter(({ nextEpisode }) => nextEpisode?.air_date)
            .map(({ show, nextEpisode }) => ({
                ...normalizeTv(show),
                nextEpisodeDate: nextEpisode.air_date,
                nextEpisodeNumber: nextEpisode.episode_number,
            }))
            .sort((a, b) => new Date(a.nextEpisodeDate) - new Date(b.nextEpisodeDate));

        res.json({ results });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
