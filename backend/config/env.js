require('dotenv').config();

const config = {
    port: process.env.PORT || 4000,
    tmdb: {
        readAccessToken: process.env.TMDB_READ_ACCESS_TOKEN,
        baseUrl: 'https://api.themoviedb.org/3',
    },
};

module.exports = config;