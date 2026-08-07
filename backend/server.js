const express = require('express');
const config = require('./config/env');
const trendingRouter = require('./routes/trending');
const watchProvidersRouter = require('./routes/watchProviders');
const animeCalendarRouter = require('./routes/calendar');
const app = express();
const cors = require('cors');

app.use(cors());

app.use('/api/trending', trendingRouter);
app.use('/api/watch-providers', watchProvidersRouter);
app.use('/api/anime-calendar', animeCalendarRouter);

app.listen(config.port, () => {
    console.log(`Server running on http://localhost:${config.port}`);
});