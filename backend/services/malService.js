const axios = require('axios');
const config = require('../config/env');

const malClient = axios.create({
    baseURL: config.mal.baseUrl,
    headers: {
        'X-MAL-CLIENT-ID': config.mal.clientId,
    },
});

async function getAnimeRating(malId) {
    const { data } = await malClient.get(`/anime/${malId}`, {
        params: { fields: 'rating' },
    });
    return data.rating || null;
}

// MAL's own search indexes native (Japanese) titles and synonyms, unlike
// AniList's `search` argument which only matches romaji/English — used as a
// fallback so searching in Japanese still finds something.
async function searchAnime(query, limit, offset) {
    const { data } = await malClient.get('/anime', {
        params: { q: query, limit, offset },
    });
    return data.data || [];
}

module.exports = {
    getAnimeRating,
    searchAnime,
};
