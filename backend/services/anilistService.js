const axios = require("axios");

const anilistClient = axios.create({
  baseURL: "https://graphql.anilist.co",
  headers: { "Content-Tpye": "application/json" },
});

const TRENDING_ANIME_QUERY = `
    query{
        Page(page: 1, perPage: 20){
            media(type: ANIME, sort: TRENDING_DESC){
            id
            title{
                romaji
                english
            }
            coverImage{
                large
            }
            averageScore
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

module.exports = {
  getTrendingAnime,
};
