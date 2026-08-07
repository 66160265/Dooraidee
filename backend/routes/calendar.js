const express = require('express');
const router = express.Router();
const anilistService = require('../services/anilistService');
const { normalizeAnime } = require('../services/normalizer');

const THAI_DAYS = ['วันอาทิตย์', 'วันจันทร์', 'วันอังคาร', 'วันพุธ', 'วันพฤหัสบดี', 'วันศุกร์', 'วันเสาร์'];
const BANGKOK_OFFSET_MS = 7 * 60 * 60 * 1000;

function startOfBangkokDay(date) {
    const bangkokTime = new Date(date.getTime() + BANGKOK_OFFSET_MS);
    bangkokTime.setUTCHours(0, 0, 0, 0);
    return new Date(bangkokTime.getTime() - BANGKOK_OFFSET_MS);
}

function normalizeSchedule(node) {
    return {
        ...normalizeAnime(node.media),
        airingAt: node.airingAt,
        episode: node.episode,
    };
}

async function fetchSchedule(startSec, endSec) {
    const rawSchedules = await anilistService.getAiringSchedule(startSec, endSec);
    return rawSchedules.map(normalizeSchedule);
}

router.get('/today', async (req, res, next) => {
    try {
        const startSec = Math.floor(startOfBangkokDay(new Date()).getTime() / 1000);
        const endSec = startSec + 24 * 60 * 60;

        const items = await fetchSchedule(startSec, endSec);

        res.json({ count: items.length, results: items });
    } catch (err) {
        next(err);
    }
});

router.get('/', async (req, res, next) => {
    try {
        const startSec = Math.floor(startOfBangkokDay(new Date()).getTime() / 1000);
        const endSec = startSec + 7 * 24 * 60 * 60;

        const items = await fetchSchedule(startSec, endSec);

        const days = THAI_DAYS.map((dayOfWeek) => ({ dayOfWeek, items: [] }));
        for (const item of items) {
            const bangkokDate = new Date(item.airingAt * 1000 + BANGKOK_OFFSET_MS);
            days[bangkokDate.getUTCDay()].items.push(item);
        }

        res.json({ days });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
