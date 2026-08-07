const axios = require('axios');
const config = require('../config/env');

const tmdbClient = axios.create({
    baseURL: config.tmdb.baseUrl,
    headers: {
        Authorization: `Bearer ${config.tmdb.readAccessToken}`,
        accept: 'application/json',
    },
});

// TMDB keyword IDs for adult/hentai content — TMDB's own `adult` flag often
// doesn't catch these, so exclude them explicitly via without_keywords.
const EXCLUDED_KEYWORDS = '198385,256466'; // hentai, erotic

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
            include_adult: false,
            without_keywords: EXCLUDED_KEYWORDS,
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
            include_adult: false,
            without_keywords: EXCLUDED_KEYWORDS,
        },
    });
    return data;
}

async function getMovieById(id) {
    const { data } = await tmdbClient.get(`/movie/${id}`, {
        params: { append_to_response: 'keywords' },
    });
    return data;
}

async function getTvById(id) {
    const { data } = await tmdbClient.get(`/tv/${id}`, {
        params: { append_to_response: 'keywords' },
    });
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