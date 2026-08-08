const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const {
    normalizeMovie,
    normalizeTv,
    normalizeAnime,
    normalizeWatchProviders,
    normalizeAnimeWatchProviders,
    isAdultAnime,
    isAdultTmdb,
    ageRatingLabel,
} = require('./normalizer');

describe('normalizeMovie', () => {
    test('maps discover/movie-by-id shape (genres as objects) directly', () => {
        const result = normalizeMovie({
            id: 155,
            title: 'The Dark Knight',
            overview: 'Batman raises the stakes.',
            poster_path: '/abc.jpg',
            vote_average: 8.5,
            release_date: '2008-07-16',
            genres: [{ id: 28, name: 'Action' }, { id: 18, name: 'Drama' }],
        });

        assert.equal(result.uniqueId, 'movie-155');
        assert.equal(result.originalId, 155);
        assert.equal(result.mediaType, 'movie');
        assert.equal(result.title, 'The Dark Knight');
        assert.equal(result.posterUrl, 'https://image.tmdb.org/t/p/w500/abc.jpg');
        assert.equal(result.score, 8.5);
        assert.equal(result.releaseDate, '2008-07-16');
        assert.deepEqual(result.genres, ['Action', 'Drama']);
    });

    test('falls back to genre_ids lookup (list/search shape) and drops unknown ids', () => {
        const result = normalizeMovie({
            id: 1,
            title: 'X',
            overview: '',
            poster_path: null,
            vote_average: 0,
            release_date: '',
            genre_ids: [28, 999999],
        });

        assert.deepEqual(result.genres, ['Action']);
    });
});

describe('normalizeTv', () => {
    test('reads name/first_air_date instead of title/release_date', () => {
        const result = normalizeTv({
            id: 42,
            name: 'Breaking Bad',
            overview: '',
            poster_path: '/x.jpg',
            vote_average: 9.5,
            first_air_date: '2008-01-20',
            genres: [{ id: 18, name: 'Drama' }],
        });

        assert.equal(result.uniqueId, 'tv-42');
        assert.equal(result.mediaType, 'tv');
        assert.equal(result.title, 'Breaking Bad');
        assert.equal(result.releaseDate, '2008-01-20');
    });
});

describe('normalizeAnime', () => {
    const baseAnime = {
        id: 16498,
        idMal: 16498,
        isAdult: false,
        title: { romaji: 'Shingeki no Kyojin', english: 'Attack on Titan' },
        description: 'Humanity fights titans.',
        coverImage: { large: 'https://example.com/cover.jpg' },
        startDate: { year: 2013, month: 4, day: 7 },
        averageScore: 85,
        genres: ['Action', 'Drama'],
        season: 'SPRING',
        seasonYear: 2013,
        studios: { nodes: [{ name: 'Wit Studio' }] },
        externalLinks: [],
    };

    test('prefers the English title, falling back to romaji', () => {
        assert.equal(normalizeAnime(baseAnime).title, 'Attack on Titan');
        assert.equal(
            normalizeAnime({ ...baseAnime, title: { romaji: 'Only Romaji', english: null } }).title,
            'Only Romaji',
        );
    });

    test('scales averageScore (0-100) down to a 0-10 score', () => {
        assert.equal(normalizeAnime(baseAnime).score, 8.5);
    });

    test('returns null studio when no studio node is present', () => {
        assert.equal(normalizeAnime({ ...baseAnime, studios: { nodes: [] } }).studio, null);
    });
});

describe('isAdultAnime', () => {
    test('flags via the isAdult field', () => {
        assert.equal(isAdultAnime({ isAdult: true, genres: [] }), true);
    });

    test('flags via the Hentai genre even when isAdult is false', () => {
        assert.equal(isAdultAnime({ isAdult: false, genres: ['Hentai'] }), true);
    });

    test('is false for a normal anime', () => {
        assert.equal(isAdultAnime({ isAdult: false, genres: ['Action'] }), false);
    });
});

describe('isAdultTmdb', () => {
    test('flags via the adult field', () => {
        assert.equal(isAdultTmdb({ adult: true }), true);
    });

    test('flags via hentai/erotic keywords (movie keywords.keywords shape)', () => {
        assert.equal(isAdultTmdb({ adult: false, keywords: { keywords: [{ name: 'hentai' }] } }), true);
    });

    test('flags via hentai/erotic keywords (tv keywords.results shape)', () => {
        assert.equal(isAdultTmdb({ adult: false, keywords: { results: [{ name: 'erotic' }] } }), true);
    });

    test('is false when neither adult nor a matching keyword is present', () => {
        assert.equal(isAdultTmdb({ adult: false, keywords: { keywords: [{ name: 'superhero' }] } }), false);
    });
});

describe('ageRatingLabel', () => {
    test('maps known MAL ratings to Thai labels', () => {
        assert.equal(ageRatingLabel('pg_13'), 'เหมาะสำหรับอายุ 13 ปีขึ้นไป');
        assert.equal(ageRatingLabel('rx'), 'สำหรับผู้ใหญ่เท่านั้น');
    });

    test('returns null for an unknown or missing rating', () => {
        assert.equal(ageRatingLabel('not-a-real-rating'), null);
        assert.equal(ageRatingLabel(undefined), null);
    });
});

describe('normalizeWatchProviders (TMDB, TH region only)', () => {
    test('returns empty when the TH region is not present', () => {
        assert.deepEqual(normalizeWatchProviders({}, 'Some Title'), { platforms: [], link: null });
    });

    test('merges flatrate/rent/buy and dedupes repeated providers', () => {
        const results = {
            TH: {
                link: 'https://www.themoviedb.org/movie/1/watch',
                flatrate: [{ provider_name: 'Netflix', logo_path: '/n.jpg' }],
                rent: [{ provider_name: 'Netflix', logo_path: '/n.jpg' }],
                buy: [{ provider_name: 'Apple TV', logo_path: '/a.jpg' }],
            },
        };

        const { platforms } = normalizeWatchProviders(results, 'Some Title');
        assert.equal(platforms.length, 2);
        assert.equal(platforms[0].name, 'Netflix');
    });

    test('builds a direct search URL for known providers instead of the generic aggregator link', () => {
        const results = { TH: { link: 'https://fallback.example', flatrate: [{ provider_name: 'Netflix', logo_path: '/n.jpg' }] } };
        const { platforms } = normalizeWatchProviders(results, 'The Dark Knight');
        assert.equal(platforms[0].url, 'https://www.netflix.com/th/search?q=The%20Dark%20Knight');
    });

    test('falls back to the aggregator link for providers with no known search template', () => {
        const results = { TH: { link: 'https://fallback.example', flatrate: [{ provider_name: 'Some Obscure Service', logo_path: '/x.jpg' }] } };
        const { platforms } = normalizeWatchProviders(results, 'Title');
        assert.equal(platforms[0].url, 'https://fallback.example');
    });
});

describe('anime streaming platforms (TH-only filtering + YouTube channel names)', () => {
    function platformsFor(externalLinks) {
        return normalizeAnimeWatchProviders(externalLinks).platforms;
    }

    test('excludes non-streaming links and sites not available in Thailand', () => {
        const platforms = platformsFor([
            { type: 'INFO', site: 'Netflix', url: 'https://netflix.com/x' },
            { type: 'STREAMING', site: 'Hulu', url: 'https://hulu.com/x' },
            { type: 'STREAMING', site: 'Netflix', url: 'https://netflix.com/x', icon: '/netflix-icon.png' },
        ]);

        assert.equal(platforms.length, 1);
        assert.equal(platforms[0].name, 'Netflix');
    });

    test('resolves a known YouTube handle to its display channel name', () => {
        const platforms = platformsFor([
            { type: 'STREAMING', site: 'YouTube', url: 'https://youtube.com/@museasia' },
        ]);

        assert.equal(platforms[0].name, 'Muse Asia');
    });

    test('title-cases an unrecognized YouTube handle', () => {
        const platforms = platformsFor([
            { type: 'STREAMING', site: 'YouTube', url: 'https://youtube.com/@some_random-channel' },
        ]);

        assert.equal(platforms[0].name, 'Some Random Channel');
    });

    test('drops YouTube links with no @handle (e.g. playlist links)', () => {
        const platforms = platformsFor([
            { type: 'STREAMING', site: 'YouTube', url: 'https://www.youtube.com/playlist?list=abc123' },
        ]);

        assert.equal(platforms.length, 0);
    });

    test('drops YouTube handles with no Latin characters (unusable as a display name)', () => {
        const platforms = platformsFor([
            { type: 'STREAMING', site: 'YouTube', url: 'https://youtube.com/@ミューズ' },
        ]);

        assert.equal(platforms.length, 0);
    });

    test('dedupes platforms with the same resolved name', () => {
        const platforms = platformsFor([
            { type: 'STREAMING', site: 'YouTube', url: 'https://youtube.com/@museasia' },
            { type: 'STREAMING', site: 'YouTube', url: 'https://youtube.com/@MuseAsia' },
        ]);

        assert.equal(platforms.length, 1);
    });

    test('uses a real TMDB logo for platforms in the known-logo map', () => {
        const platforms = platformsFor([
            { type: 'STREAMING', site: 'Netflix', url: 'https://netflix.com/x' },
        ]);

        assert.equal(platforms[0].logoUrl, 'https://image.tmdb.org/t/p/w92/pbpMk2JmcoNnQwx5JGpXngfoWtp.jpg');
        assert.equal(platforms[0].color, null);
    });

    test('falls back to AniList icon/color for platforms with no known logo override', () => {
        const platforms = platformsFor([
            { type: 'STREAMING', site: 'trueid', url: 'https://trueid.net/x', icon: '/trueid-icon.png', color: '#ff0000' },
        ]);

        assert.equal(platforms[0].logoUrl, '/trueid-icon.png');
        assert.equal(platforms[0].color, '#ff0000');
    });
});
