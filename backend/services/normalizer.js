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
    };
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
    };
}

function normalizeWatchProviders(results) {
    const regionData = results.TH || results.US;

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
                logoUrl: `https://image.tmdb.org/t/p/w92${provider.logo_path}`
            })
        }
    }
    return { platforms, link: regionData.link };
}

module.exports = {
    normalizeMovie,
    normalizeTv,
    normalizeAnime,
    normalizeWatchProviders,
};