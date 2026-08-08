const axios = require("axios");

const anilistClient = axios.create({
  baseURL: "https://graphql.anilist.co",
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
});

const RETRYABLE_ERROR_CODES = new Set(["ECONNRESET", "ETIMEDOUT", "ECONNABORTED", "EAI_AGAIN"]);
const MAX_RETRIES = 3;

// AniList's rate limit is tight enough that a single retry often lands
// inside the same throttle window and fails again. Back off longer each
// attempt, and prefer AniList's own Retry-After header (seconds) when it
// sends one — it knows the real window better than a guess does.
function retryDelayMs(err, attempt) {
  if (err.response?.status === 429) {
    const retryAfter = Number(err.response.headers?.["retry-after"]);
    if (Number.isFinite(retryAfter) && retryAfter > 0) return retryAfter * 1000;
    return 1500 * attempt;
  }
  if (RETRYABLE_ERROR_CODES.has(err.code)) return 500; // dropped connection — brief retry
  return null;
}

async function postGraphQLOnce(query, variables) {
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

async function postGraphQL(query, variables) {
  const key = JSON.stringify({ query, variables });
  const existing = inFlightRequests.get(key);
  if (existing) return existing;

  const promise = (async () => {
    for (let attempt = 1; ; attempt++) {
      try {
        return await postGraphQLOnce(query, variables);
      } catch (err) {
        const delay = attempt <= MAX_RETRIES ? retryDelayMs(err, attempt) : null;
        if (delay === null) throw err;
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

async function getAnimeById(id) {
  const data = await postGraphQL(ANIME_BY_ID_QUERY, { id });
  return data.Media;
}

async function getAnimeExternalLinks(id) {
  const data = await postGraphQL(ANIME_EXTERNAL_LINKS_QUERY, { id });
  return data.Media.externalLinks;
}

module.exports = {
  getTrendingAnime,
  getReleasingAnime,
  getAnimeList,
  getAnimeById,
  getAnimeExternalLinks,
};
