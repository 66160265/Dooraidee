const TMDB_GENRE_MAP = {
    28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy",
    80: "Crime", 99: "Documentary", 18: "Drama", 10751: "Family",
    14: "Fantasy", 36: "History", 27: "Horror", 10402: "Music",
    9648: "Mystery", 10749: "Romance", 878: "Science Fiction",
    10770: "TV Movie", 53: "Thriller", 10752: "War", 37: "Western",
    10759: "Action & Adventure", 10762: "Kids", 10763: "News",
    10764: "Reality", 10765: "Sci-Fi & Fantasy", 10766: "Soap",
    10767: "Talk", 10768: "War & Politics",
};

function normalizeMovie(movie) {
    return {
        uniqueId: `movie-${movie.id}`,
        originalId: movie.id,
        mediaType: 'movie',
        title: movie.title,
        description: movie.overview,
        posterUrl: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
        score: movie.vote_average,
        releaseDate: movie.release_date,
        genres: movie.genres
            ? movie.genres.map((g) => g.name)
            : (movie.genre_ids || []).map((id) => TMDB_GENRE_MAP[id]).filter(Boolean),
    };
}

function normalizeTv(tvShow) {
    return {
        uniqueId: `tv-${tvShow.id}`,
        originalId: tvShow.id,
        mediaType: 'tv',
        title: tvShow.name,
        description: tvShow.overview,
        posterUrl: `https://image.tmdb.org/t/p/w500${tvShow.poster_path}`,
        score: tvShow.vote_average,
        releaseDate: tvShow.first_air_date,
        genres: tvShow.genres
            ? tvShow.genres.map((g) => g.name)
            : (tvShow.genre_ids || []).map((id) => TMDB_GENRE_MAP[id]).filter(Boolean),
    };
}

// Streaming platforms actually available/legally operating in Thailand.
// AniList's externalLinks aren't region-tagged, so we allowlist by site name.
const TH_AVAILABLE_SITES = new Set([
    'netflix',
    'iq', 'iqiyi',
    'wetv',
    'viu',
    'bilibili', 'bilibili tv',
    'amazon prime video', 'prime video',
    'disney plus', 'disney+',
    'youtube',
    'trueid',
    'crunchyroll',
]);

// Real full-color logos sourced from TMDB's watch-provider database —
// more accurate than AniList's flat icon+color composite. Platforms not
// listed here (TrueID, Bilibili) fall back to the AniList icon+color.
const TMDB_PROVIDER_LOGOS = {
    netflix: '/pbpMk2JmcoNnQwx5JGpXngfoWtp.jpg',
    'amazon prime video': '/pvske1MyAoymrs5bguRfVqYiM9a.jpg',
    'prime video': '/pvske1MyAoymrs5bguRfVqYiM9a.jpg',
    'disney plus': '/tHtNW975SmVydaBULhEaOqPTmo8.jpg',
    'disney+': '/tHtNW975SmVydaBULhEaOqPTmo8.jpg',
    viu: '/o7WsYI2r1llIf9h6JTGVX9yTHPx.jpg',
    crunchyroll: '/fzN5Jok5Ig1eJ7gyNGoMhnLSCfh.jpg',
    iq: '/c4eVkfMna2VzHzZ8N2vWXUnMrlD.jpg',
    iqiyi: '/c4eVkfMna2VzHzZ8N2vWXUnMrlD.jpg',
    wetv: '/r3tmJFjecQGAfHjWOafhr1pux6b.jpg',
};

// Known official anime-distribution YouTube channel handles -> display name.
const KNOWN_YOUTUBE_CHANNELS = {
    museasia: 'Muse Asia',
    musethailand: 'Muse Thailand',
    museindonesia: 'Muse Indonesia',
    musemalaysia: 'Muse Malaysia',
    musevietnam: 'Muse Vietnam',
    musephilippines: 'Muse Philippines',
    museindia: 'Muse India',
    anioneasia: 'Ani-One Asia',
    netflixanime: 'Netflix Anime',
    crunchyrollcollection: 'Crunchyroll Collection',
};

function normalizeSiteName(name) {
    return (name || '').toLowerCase().trim();
}

function formatYoutubeHandle(handle) {
    const key = handle.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (KNOWN_YOUTUBE_CHANNELS[key]) return KNOWN_YOUTUBE_CHANNELS[key];
    return handle
        .replace(/[_-]+/g, ' ')
        .trim()
        .split(' ')
        .filter(Boolean)
        .map((w) => w[0].toUpperCase() + w.slice(1))
        .join(' ');
}

function extractYoutubeChannelName(url) {
    const match = (url || '').match(/youtube\.com\/@([^/?&]+)/i);
    if (!match) return null; // playlist/channel-id links carry no readable name
    const handle = decodeURIComponent(match[1]);
    if (!/[a-zA-Z]/.test(handle)) return null; // non-Latin handles aren't useful display names
    return formatYoutubeHandle(handle);
}

function resolvePlatformLogo(link) {
    const key = normalizeSiteName(link.site);
    if (TMDB_PROVIDER_LOGOS[key]) {
        return { logoUrl: `https://image.tmdb.org/t/p/w92${TMDB_PROVIDER_LOGOS[key]}`, color: null };
    }
    return { logoUrl: link.icon, color: link.color || null };
}

function extractStreamingPlatforms(externalLinks) {
    const seen = new Set();
    const platforms = [];

    for (const link of externalLinks || []) {
        if (link.type !== 'STREAMING') continue;
        const siteKey = normalizeSiteName(link.site);
        if (!TH_AVAILABLE_SITES.has(siteKey)) continue;

        let name = link.site;
        if (siteKey === 'youtube') {
            const channelName = extractYoutubeChannelName(link.url);
            if (!channelName) continue; // skip links with no resolvable channel name
            name = channelName;
        }

        const dedupeKey = name.toLowerCase();
        if (seen.has(dedupeKey)) continue;
        seen.add(dedupeKey);

        platforms.push({
            name,
            url: link.url,
            ...resolvePlatformLogo(link),
        });
    }

    return platforms;
}

function normalizeAnime(anime) {
    return {
        uniqueId: `anime-${anime.id}`,
        originalId: anime.id,
        idMal: anime.idMal || null,
        mediaType: 'anime',
        title: anime.title.english || anime.title.romaji,
        description: anime.description,
        posterUrl: anime.coverImage.large,
        score: anime.averageScore / 10,
        releaseDate: `${anime.startDate.year}-${anime.startDate.month}-${anime.startDate.day}`,
        genres: anime.genres,
        studio: anime.studios?.nodes?.[0]?.name || null,
        season: anime.season || null,
        seasonYear: anime.seasonYear || null,
        platforms: extractStreamingPlatforms(anime.externalLinks),
    };
}

const MAL_RATING_LABELS_TH = {
    g: 'เหมาะสำหรับทุกวัย',
    pg: 'เด็กควรมีผู้ปกครองแนะนำ',
    pg_13: 'เหมาะสำหรับอายุ 13 ปีขึ้นไป',
    r: 'เหมาะสำหรับอายุ 17 ปีขึ้นไป (มีความรุนแรง)',
    'r+': 'เหมาะสำหรับอายุ 17 ปีขึ้นไป (มีภาพโป๊เปลือย)',
    rx: 'สำหรับผู้ใหญ่เท่านั้น',
};

function ageRatingLabel(rating) {
    return MAL_RATING_LABELS_TH[rating] || null;
}

function isAdultAnime(anime) {
    return Boolean(anime.isAdult) || (anime.genres || []).includes('Hentai');
}

const ADULT_TMDB_KEYWORDS = new Set(['hentai', 'erotic']);

function isAdultTmdb(item) {
    if (item.adult) return true;
    const keywordList = item.keywords?.keywords || item.keywords?.results || [];
    return keywordList.some((k) => ADULT_TMDB_KEYWORDS.has(k.name));
}

function normalizeWatchProviders(results) {
    const regionData = results.TH;

    if (!regionData) {
        return { platforms: [], link: null};
    }

    const allProviders = [
        ...(regionData.flatrate || []),
        ...(regionData.rent || []),
        ...(regionData.buy || []),
    ];

    const seen = new Set();
    const platforms = [];

    for (const provider of allProviders) {
        if (!seen.has(provider.provider_name)) {
            seen.add(provider.provider_name);
            platforms.push({
                name: provider.provider_name,
                logoUrl: `https://image.tmdb.org/t/p/w92${provider.logo_path}`,
                url: regionData.link,
            })
        }
    }
    return { platforms, link: regionData.link };
}

function normalizeAnimeWatchProviders(externalLinks) {
    return { platforms: extractStreamingPlatforms(externalLinks), link: null };
}

module.exports = {
    normalizeMovie,
    normalizeTv,
    normalizeAnime,
    normalizeWatchProviders,
    normalizeAnimeWatchProviders,
    isAdultAnime,
    isAdultTmdb,
    ageRatingLabel,
    TMDB_GENRE_MAP,
};