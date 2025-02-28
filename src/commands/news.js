const { summarizeCryptoNews } = require("../GPT/summarizeNews");
const axios = require("axios");
async function fetchCryptoNews() {
  const API_KEY = process.env.NEWS_API; // Replace with your API key
  const url = `https://cryptopanic.com/api/v1/posts/?auth_token=${API_KEY}&currencies=BTC,ETH&kind=news`;

  try {
    const response = await axios.get(url);
    return response.data.results.slice(0, 3); // Return top 3 news articles
  } catch (error) {
    console.error("Error fetching crypto news:", error);
    return [];
  }
}

module.exports = async (ctx) => {
  ctx.reply("🔍 Fetching crypto news, please wait...");

  const newsArticles = await fetchCryptoNews();
  const articlesTitle = newsArticles
    .map((article, index) => `${index + 1}. ${article.title}`)
    .join("\n\n");

  ctx.reply(articlesTitle);
  ctx.reply(await summarizeCryptoNews(newsArticles));
};
