const axios = require("axios");

const anilistClient = axios.create({
  baseURL: "https://graphql.anilist.co",
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
});

const RETRYABLE_ERROR_CODES = new Set(["ECONNRESET", "ETIMEDOUT", "ECONNABORTED", "EAI_AGAIN"]);
const MAX_RETRIES = 3;

const MAX_RETRY_DELAY_MS = 5000;

// AniList's rate limit is tight enough that a single retry often lands
// inside the same throttle window and fails again. Back off longer each
// attempt, and prefer AniList's own Retry-After header (seconds) when it
// sends one — it knows the real window better than a guess does. Capped so
// a large Retry-After (AniList can ask for a full minute under sustained
// throttling) doesn't stall a request longer than a user will wait for —
// better to fail fast into the frontend's error state than hang.
function retryDelayMs(err, attempt) {
  if (err.response?.status === 429) {
    const retryAfter = Number(err.response.headers?.["retry-after"]);
    if (Number.isFinite(retryAfter) && retryAfter > 0) return Math.min(retryAfter * 1000, MAX_RETRY_DELAY_MS);
    return Math.min(1500 * attempt, MAX_RETRY_DELAY_MS);
  }
  if (RETRYABLE_ERROR_CODES.has(err.code)) return 500; // dropped connection — brief retry
  return null;
}

// AniList's public rate limit is tight (reports put it around 30
// requests/minute — roughly one every 2s). Space outbound requests apart
// globally at that rate so a burst (calendar's 4 parallel page fetches, a
// totalPages binary search's ~8 probes, several distinct fresh filters at
// once) gets serialized with gaps instead of firing all at once — cheaper
// than reacting to 429s after the fact. Caching (below) means this only
// ever matters for genuinely new, uncached requests.
const MIN_REQUEST_INTERVAL_MS = 2000;
let nextAvailableAt = 0;

async function throttleGate() {
  const now = Date.now();
  const wait = Math.max(0, nextAvailableAt - now);
  nextAvailableAt = Math.max(now, nextAvailableAt) + MIN_REQUEST_INTERVAL_MS;
  if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait));
}

async function postGraphQLOnce(query, variables) {
  await throttleGate();
  const { data } = await anilistClient.post("", { query, variables });
  return data.data;
}

// Multiple identical requests can land at nearly the same time (React
// StrictMode's double-invoked effects in dev, several browser tabs, the
// totalPages binary search racing itself under concurrent users) — without
// dedup each one fires its own request, and a burst like that is exactly
// what trips AniList's rate limit. In-flight requests for the same
// query+variables share one promise instead of each hitting the network.
const inFlightRequests = new Map();

// A short response cache means repeat visits (or several users browsing
// the same page/filter/anime) don't hit AniList at all — free to run, and
// the single biggest lever against 429s since it avoids the network call
// entirely instead of just retrying it more gracefully. If a fresh fetch
// ultimately fails after retries, a stale cached value (even expired) is
// served instead of an error — a slightly outdated anime list beats a
// broken page.
const cache = new Map();
const DEFAULT_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
// Entries stay around well past their freshness TTL so they're still usable
// as a stale-on-error fallback, but not forever — bounds memory on a
// long-running instance since nothing ever explicitly clears this Map.
const HARD_EXPIRE_MS = 6 * 60 * 60 * 1000; // 6 hours

setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of cache) {
    if (entry.hardExpiresAt <= now) cache.delete(key);
  }
}, 30 * 60 * 1000).unref();

async function postGraphQL(query, variables, { ttlMs = DEFAULT_CACHE_TTL_MS } = {}) {
  const key = JSON.stringify({ query, variables });

  const cached = cache.get(key);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  const existing = inFlightRequests.get(key);
  if (existing) return existing;

  const promise = (async () => {
    for (let attempt = 1; ; attempt++) {
      try {
        const data = await postGraphQLOnce(query, variables);
        cache.set(key, { data, expiresAt: Date.now() + ttlMs, hardExpiresAt: Date.now() + HARD_EXPIRE_MS });
        return data;
      } catch (err) {
        const delay = attempt <= MAX_RETRIES ? retryDelayMs(err, attempt) : null;
        if (delay === null) {
          if (cached) return cached.data; // stale-but-served beats a broken page
          throw err;
        }
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  })();

  inFlightRequests.set(key, promise);
  try {
    return await promise;
  } finally {
    inFlightRequests.delete(key);
  }
}

const MEDIA_FIELDS = `
    id
    idMal
    isAdult
    title {
      romaji
      english
    }
    description
    coverImage {
      large
    }
    startDate {
      year
      month
      day
    }
    averageScore
    genres
    season
    seasonYear
    studios(isMain: true) {
      nodes {
        name
      }
    }
    externalLinks {
      url
      site
      type
      icon
      color
    }
`;

const TRENDING_ANIME_QUERY = `
    query{
        Page(page: 1, perPage: 20){
            media(type: ANIME, sort: TRENDING_DESC, isAdult: false){
            ${MEDIA_FIELDS}
            }
        }
    }
`;

// Querying airingSchedules directly returns every episode airing in the
// window (thousands, mostly obscure), and a single page's worth gets
// exhausted by whichever days sort first — leaving other days empty. Instead
// we page through currently-releasing anime sorted by popularity and read
// each show's own nextAiringEpisode, which naturally spreads across whatever
// day it actually airs and stays limited to shows worth showing.
const ANIME_RELEASING_QUERY = `
    query ($page: Int, $perPage: Int) {
        Page(page: $page, perPage: $perPage) {
            pageInfo {
                hasNextPage
            }
            media(type: ANIME, status: RELEASING, sort: POPULARITY_DESC, isAdult: false) {
                ${MEDIA_FIELDS}
                nextAiringEpisode {
                    airingAt
                    episode
                }
            }
        }
    }
`;

const ANIME_LIST_QUERY = `
    query ($page: Int, $perPage: Int, $genre: String, $season: MediaSeason, $seasonYear: Int, $search: String) {
        Page(page: $page, perPage: $perPage) {
            pageInfo {
                hasNextPage
            }
            media(type: ANIME, sort: POPULARITY_DESC, genre: $genre, season: $season, seasonYear: $seasonYear, isAdult: false, search: $search) {
                ${MEDIA_FIELDS}
            }
        }
    }
`;

const ANIME_BY_ID_QUERY = `
    query ($id: Int) {
        Media(id: $id, type: ANIME) {
            ${MEDIA_FIELDS}
        }
    }
`;

// Used to cross-reference MyAnimeList search hits (MAL's search indexes
// native/Japanese titles, AniList's doesn't) back into AniList's own data
// shape via the shared MAL id.
const ANIME_BY_MAL_IDS_QUERY = `
    query ($ids: [Int]) {
        Page(page: 1, perPage: 25) {
            media(type: ANIME, idMal_in: $ids, isAdult: false) {
                ${MEDIA_FIELDS}
            }
        }
    }
`;

const ANIME_EXTERNAL_LINKS_QUERY = `
    query ($id: Int) {
        Media(id: $id, type: ANIME) {
            externalLinks {
                url
                site
                type
                icon
                color
            }
        }
    }
`;

async function getTrendingAnime() {
  const data = await postGraphQL(TRENDING_ANIME_QUERY);
  return data.Page.media;
}

async function getReleasingAnimePage(page, perPage) {
  const data = await postGraphQL(ANIME_RELEASING_QUERY, { page, perPage });
  return data.Page;
}

// Fetches several pages of popular currently-releasing anime and merges
// them, capped so a calendar load never fires an unbounded number of
// requests at AniList.
async function getReleasingAnime(maxPages = 4, perPage = 50) {
  const pageNumbers = Array.from({ length: maxPages }, (_, i) => i + 1);
  const results = await Promise.all(pageNumbers.map((page) => getReleasingAnimePage(page, perPage)));
  return results.flatMap((result) => result.media);
}

async function getAnimeList(page, perPage, filters = {}) {
  const { genre, season, seasonYear, search } = filters;
  const data = await postGraphQL(ANIME_LIST_QUERY, { page, perPage, genre, season, seasonYear, search });
  return data.Page;
}

// Detail data for a given anime essentially never changes within an hour,
// and detail pages for popular titles get hit repeatedly — worth a much
// longer TTL than the default.
const DETAIL_CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

async function getAnimeById(id) {
  const data = await postGraphQL(ANIME_BY_ID_QUERY, { id }, { ttlMs: DETAIL_CACHE_TTL_MS });
  return data.Media;
}

async function getAnimeExternalLinks(id) {
  const data = await postGraphQL(ANIME_EXTERNAL_LINKS_QUERY, { id }, { ttlMs: DETAIL_CACHE_TTL_MS });
  return data.Media.externalLinks;
}

async function getAnimeByMalIds(ids) {
  if (ids.length === 0) return [];
  const data = await postGraphQL(ANIME_BY_MAL_IDS_QUERY, { ids });
  return data.Page.media;
}

module.exports = {
  getTrendingAnime,
  getReleasingAnime,
  getAnimeList,
  getAnimeById,
  getAnimeExternalLinks,
  getAnimeByMalIds,
};
