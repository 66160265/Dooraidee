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

function normalizeSiteName(name) {
    return (name || '').toLowerCase().trim();
}

function extractStreamingPlatforms(externalLinks) {
    return (externalLinks || [])
        .filter((link) => link.type === 'STREAMING' && TH_AVAILABLE_SITES.has(normalizeSiteName(link.site)))
        .map((link) => ({
            name: link.site,
            logoUrl: link.icon,
            url: link.url,
            color: link.color || null,
        }));
}

function normalizeAnime(anime) {
    return {
        uniqueId: `anime-${anime.id}`,
        originalId: anime.id,
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
    TMDB_GENRE_MAP,
};