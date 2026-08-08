const express = require('express');
const config = require('./config/env');
const trendingRouter = require('./routes/trending');
const watchProvidersRouter = require('./routes/watchProviders');
const animeCalendarRouter = require('./routes/calendar');
const releaseCalendarRouter = require('./routes/releaseCalendar');
const moviesRouter = require('./routes/movies');
const tvShowsRouter = require('./routes/tvShows');
const animeRouter = require('./routes/anime');
const app = express();
const cors = require('cors');

// FRONTEND_URL restricts CORS to the deployed frontend's origin(s) in
// production (comma-separated if there's more than one, e.g. a Vercel
// preview + production URL). Left unset, CORS stays open — fine for local
// dev and for this read-only public API with no auth/cookies to protect.
const allowedOrigins = process.env.FRONTEND_URL?.split(',').map((s) => s.trim());
app.use(cors(allowedOrigins ? { origin: allowedOrigins } : {}));

app.use('/api/trending', trendingRouter);
app.use('/api/watch-providers', watchProvidersRouter);
app.use('/api/anime-calendar', animeCalendarRouter);
app.use('/api/release-calendar', releaseCalendarRouter);
app.use('/api/movies', moviesRouter);
app.use('/api/tv-shows', tvShowsRouter);
app.use('/api/anime', animeRouter);

app.use((err, req, res, next) => {
    console.error(err);
    const status = err.response?.status && err.response.status >= 400 && err.response.status < 600
        ? err.response.status
        : 500;
    res.status(status).json({ error: err.message || 'Internal Server Error' });
});

const server = app.listen(config.port, () => {
    console.log(`Server running on http://localhost:${config.port}`);
});

// Ensure Ctrl+C actually terminates the process instead of leaving node.exe
// orphaned in the background.
function shutdown() {
    server.close(() => process.exit(0));
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);