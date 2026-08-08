require('dotenv').config();

const config = {
    port: process.env.PORT || 4000,
    tmdb: {
        readAccessToken: process.env.TMDB_READ_ACCESS_TOKEN,
        baseUrl: 'https://api.themoviedb.org/3',
    },
    mal: {
        clientId: process.env.MAL_CLIENT_ID,
        baseUrl: 'https://api.myanimelist.net/v2',
    },
};

module.exports = config;