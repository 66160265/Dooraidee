const axios = require("axios");

const anilistClient = axios.create({
  baseURL: "https://graphql.anilist.co",
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
});

const RETRYABLE_ERROR_CODES = new Set(["ECONNRESET", "ETIMEDOUT", "ECONNABORTED", "EAI_AGAIN"]);

function retryDelayMs(err) {
  if (err.response?.status === 429) return 1500; // rate-limited — back off longer
  if (RETRYABLE_ERROR_CODES.has(err.code)) return 500; // dropped connection — brief retry
  return null;
}

// AniList's connection occasionally drops mid-request (ECONNRESET) under load,
// and bursts of requests can get rate-limited (429); retry once before giving up.
async function postGraphQL(query, variables) {
  try {
    const { data } = await anilistClient.post("", { query, variables });
    return data.data;
  } catch (err) {
    const delay = retryDelayMs(err);
    if (delay === null) throw err;
    await new Promise((resolve) => setTimeout(resolve, delay));
    const { data } = await anilistClient.post("", { query, variables });
    return data.data;
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
