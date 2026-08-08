const express = require('express');
const router = express.Router();
const anilistService = require('../services/anilistService');
const { normalizeAnime, isAdultAnime } = require('../services/normalizer');

const THAI_DAYS = ['วันอาทิตย์', 'วันจันทร์', 'วันอังคาร', 'วันพุธ', 'วันพฤหัสบดี', 'วันศุกร์', 'วันเสาร์'];
const BANGKOK_OFFSET_MS = 7 * 60 * 60 * 1000;

function startOfBangkokDay(date) {
    const bangkokTime = new Date(date.getTime() + BANGKOK_OFFSET_MS);
    bangkokTime.setUTCHours(0, 0, 0, 0);
    return new Date(bangkokTime.getTime() - BANGKOK_OFFSET_MS);
}

function bangkokDayOfWeek(unixSeconds) {
    return new Date(unixSeconds * 1000 + BANGKOK_OFFSET_MS).getUTCDay();
}

function normalizeUpcomingEpisode(anime) {
    return {
        ...normalizeAnime(anime),
        airingAt: anime.nextAiringEpisode.airingAt,
        episode: anime.nextAiringEpisode.episode,
    };
}

async function fetchReleasingSchedule() {
    const releasing = await anilistService.getReleasingAnime();
    return releasing
        .filter((anime) => anime.nextAiringEpisode)
        .filter((anime) => !isAdultAnime(anime))
        .map(normalizeUpcomingEpisode);
}

router.get('/today', async (req, res, next) => {
    try {
        const startSec = Math.floor(startOfBangkokDay(new Date()).getTime() / 1000);
        const endSec = startSec + 24 * 60 * 60;

        const items = (await fetchReleasingSchedule())
            .filter((item) => item.airingAt >= startSec && item.airingAt < endSec)
            .sort((a, b) => a.airingAt - b.airingAt);

        res.json({ count: items.length, results: items });
    } catch (err) {
        next(err);
    }
});

router.get('/', async (req, res, next) => {
    try {
        const items = await fetchReleasingSchedule();

        // nextAiringEpisode is only ever the single next occurrence, so a show
        // whose episode already aired earlier today points at next week's —
        // still the same weekday it always airs on. Bucket by weekday (a
        // recurring weekly slot) rather than a strict "next 7 days" window,
        // so today's full lineup shows even for shows that already aired.
        const days = THAI_DAYS.map((dayOfWeek) => ({ dayOfWeek, items: [] }));
        for (const item of items) {
            days[bangkokDayOfWeek(item.airingAt)].items.push(item);
        }
        days.forEach((day) => day.items.sort((a, b) => a.airingAt - b.airingAt));

        // Present days starting from today, wrapping around the week.
        const todayIndex = bangkokDayOfWeek(Math.floor(Date.now() / 1000));
        const orderedDays = [...days.slice(todayIndex), ...days.slice(0, todayIndex)];

        const nowSec = Math.floor(Date.now() / 1000);
        const upcoming = items.filter((item) => item.airingAt >= nowSec).sort((a, b) => a.airingAt - b.airingAt);

        res.json({ days: orderedDays, soonest: upcoming[0] || null });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
