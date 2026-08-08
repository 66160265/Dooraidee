const axios = require("axios");

const anilistClient = axios.create({
  baseURL: "https://graphql.anilist.co",
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
});

const RETRYABLE_ERROR_CODES = new Set(["ECONNRESET", "ETIMEDOUT", "ECONNABORTED", "EAI_AGAIN"]);

// AniList's connection occasionally drops mid-request (ECONNRESET) under load;
// retry once after a short delay before giving up.
async function postGraphQL(query, variables) {
  try {
    const { data } = await anilistClient.post("", { query, variables });
    return data.data;
  } catch (err) {
    if (RETRYABLE_ERROR_CODES.has(err.code)) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const { data } = await anilistClient.post("", { query, variables });
      return data.data;
    }
    throw err;
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

const AIRING_SCHEDULE_QUERY = `
    query ($start: Int, $end: Int) {
        Page(page: 1, perPage: 50) {
            airingSchedules(airingAt_greater: $start, airingAt_lesser: $end, sort: TIME) {
                airingAt
                episode
                media {
                    ${MEDIA_FIELDS}
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

async function getAiringSchedule(start, end) {
  const data = await postGraphQL(AIRING_SCHEDULE_QUERY, { start, end });
  return data.Page.airingSchedules;
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
  getAiringSchedule,
  getAnimeList,
  getAnimeById,
  getAnimeExternalLinks,
};
