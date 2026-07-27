const express = require('express');
const config = require('./config/env');
const tmdbService = require('./services/tmdbService');
const anilistService = require('./services/anilistService');

const app = express();

app.get('/test-tmdb', async (req, res) => {
    try {
        const movies = await tmdbService.getTrendingMovies();
        res.json(movies);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/test-anilist', async (req, res) => {
    try {
        const anime = await anilistService.getTrendingAnime();
        res.json(anime);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(config.port, () => {
    console.log(`Server running on http://localhost:${config.port}`);
});