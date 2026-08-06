const express = require('express');
const config = require('./config/env');
const trendingRouter = require('./routes/trending');
const app = express();
const cors = require('cors');

app.use(cors());

app.use('/api/trending', trendingRouter);

app.listen(config.port, () => {
    console.log(`Server running on http://localhost:${config.port}`);
});