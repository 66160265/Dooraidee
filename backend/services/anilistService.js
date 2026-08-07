const axios = require("axios");

const anilistClient = axios.create({
  baseURL: "https://graphql.anilist.co",
  headers: { "Content-Type": "application/json" },
});

const MEDIA_FIELDS = `
    id
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
`;

const TRENDING_ANIME_QUERY = `
    query{
        Page(page: 1, perPage: 20){
            media(type: ANIME, sort: TRENDING_DESC){
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

async function getTrendingAnime() {
  const { data } = await anilistClient.post("", {
    query: TRENDING_ANIME_QUERY,
  });
  return data.data.Page.media;
}

async function getAiringSchedule(start, end) {
  const { data } = await anilistClient.post("", {
    query: AIRING_SCHEDULE_QUERY,
    variables: { start, end },
  });
  return data.data.Page.airingSchedules;
}

module.exports = {
  getTrendingAnime,
  getAiringSchedule,
};
