const axios = require('axios');
const config = require('../config/env');

const tmdbClient = axios.create({
    baseURL: config.tmdb.baseUrl,
    headers: {
        Authorization: `Bearer ${config.tmdb.readAccessToken}`,
        accept: 'application/json',
    },
});

async function getTrendingMovies() {
    const { data } = await tmdbClient.get('/trending/movie/day');
    return data.results;
}

module.exports = {
    getTrendingMovies,
};