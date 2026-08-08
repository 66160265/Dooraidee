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

module.exports = {
    getAnimeRating,
};
