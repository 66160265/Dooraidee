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

async function getTrendingTvShows() {
    const { data } = await tmdbClient.get('/trending/tv/day');
    return data.results;
}

async function getWatchProviders(mediaType, id) {
    const { data } = await tmdbClient.get(`/${mediaType}/${id}/watch/providers`);
    return data.results;
}

async function getDiscoverMovies(page, filters = {}) {
    const { data } = await tmdbClient.get('/discover/movie', {
        params: {
            page,
            with_genres: filters.genreId,
            primary_release_year: filters.year,
        },
    });
    return data;
}

async function getDiscoverTvShows(page, filters = {}) {
    const { data } = await tmdbClient.get('/discover/tv', {
        params: {
            page,
            with_genres: filters.genreId,
            first_air_date_year: filters.year,
        },
    });
    return data;
}

async function getMovieById(id) {
    const { data } = await tmdbClient.get(`/movie/${id}`);
    return data;
}

async function getTvById(id) {
    const { data } = await tmdbClient.get(`/tv/${id}`);
    return data;
}

module.exports = {
    getTrendingMovies,
    getTrendingTvShows,
    getWatchProviders,
    getDiscoverMovies,
    getDiscoverTvShows,
    getMovieById,
    getTvById,
};