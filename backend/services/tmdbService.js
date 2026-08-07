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

async function searchMovies(page, query) {
    const { data } = await tmdbClient.get('/search/movie', {
        params: { page, query, include_adult: false },
    });
    return data;
}

async function searchTvShows(page, query) {
    const { data } = await tmdbClient.get('/search/tv', {
        params: { page, query, include_adult: false },
    });
    return data;
}

async function findCompanyLogoUrl(name) {
    const { data } = await tmdbClient.get('/search/company', {
        params: { query: name },
    });

    const exactMatch = data.results.find(
        (c) => c.name.toLowerCase() === name.toLowerCase() && c.logo_path
    );
    const anyMatch = data.results.find((c) => c.logo_path);
    const match = exactMatch || anyMatch;

    return match ? `https://image.tmdb.org/t/p/w200${match.logo_path}` : null;
}

async function getMovieById(id) {
    const [{ data }, thOverview] = await Promise.all([
        tmdbClient.get(`/movie/${id}`, {
            params: { append_to_response: 'keywords' },
        }),
        tmdbClient
            .get(`/movie/${id}`, { params: { language: 'th-TH' } })
            .then((res) => res.data.overview)
            .catch(() => null),
    ]);
    if (thOverview) data.overview = thOverview;
    return data;
}

async function getTvById(id) {
    const [{ data }, thOverview] = await Promise.all([
        tmdbClient.get(`/tv/${id}`, {
            params: { append_to_response: 'keywords' },
        }),
        tmdbClient
            .get(`/tv/${id}`, { params: { language: 'th-TH' } })
            .then((res) => res.data.overview)
            .catch(() => null),
    ]);
    if (thOverview) data.overview = thOverview;
    return data;
}

module.exports = {
    getTrendingMovies,
    getTrendingTvShows,
    getWatchProviders,
    getDiscoverMovies,
    getDiscoverTvShows,
    searchMovies,
    searchTvShows,
    getMovieById,
    getTvById,
    findCompanyLogoUrl,
};