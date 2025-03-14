const axios = require("axios");
const { analyzeNewsSentiment } = require("../GPT/analyzeNewsSentiment");

const sentimentMap = {
  "Strongly Positive": "🚀 Strongly Positive",
  Positive: "📈 Positive",
  Neutral: "⚖️ Neutral",
  Negative: "📉 Negative",
  "Strongly Negative": "⛔ Strongly Negative",
};

async function eventDrivenTrading(previousNewsArticlesIds) {
  const newsArticles = await getFilteredCryptoNews(previousNewsArticlesIds);

  const newsArticlesIds = [
    ...(newsArticles?.map((article) => article.id) || []),
    ...(previousNewsArticlesIds || []),
  ];

  let replyMessage = "";

  if (newsArticles.length === 0) {
    console.log("❌ No relevant news articles found.");
    return { replyMessage, newsArticlesIds };
  }

  const articlesTitle = newsArticles
    .map((article, index) => `${index + 1}. ${article.title}`)
    .join("\n\n");

  const gptResult = await analyzeNewsSentiment(articlesTitle);

  if (!gptResult?.newsSentiment) {
    return "❌ Error processing sentiment analysis.";
  }

  replyMessage = gptResult.newsSentiment
    .map((result, index) =>
      `
        🔹 ${index + 1}. ${result.newsTitle}
        📈 Signal: ${sentimentMap[result.signal]}
        📊 Possible Market Impact: ${result.impact}
        🛠 Suggested Trading Action: ${result.suggestedTradingAction}
        🧐 Reason: ${result.explaination}
      `.trim()
    )
    .join("\n\n");

  return { replyMessage, newsArticlesIds };
}

async function fetchCryptoNews() {
  const API_KEY = process.env.NEWS_API;
  const url = `https://cryptopanic.com/api/v1/posts/?auth_token=${API_KEY}&kind=news`;

  try {
    const response = await axios.get(url);
    return response.data.results.slice(0, 10); // Return top 10 news articles
  } catch (error) {
    console.error("Error fetching crypto news:", error);
    return [];
  }
}

function filterRelevantNews(newsArticles) {
  const FILTER_KEYWORDS = [
    "Trump",
    "American",
    "USA",
    "US",
    "Federal Reserve",
    "US economy",
    "Inflation",
    "SEC",
    "Congress",
    "Interest rates",
    "Dollar",
    "Binance",
    "CoinBase",
  ];

  return newsArticles.filter((article) => {
    const title = article.title.toLowerCase();
    const content = article.body ? article.body.toLowerCase() : "";

    return FILTER_KEYWORDS.some(
      (keyword) =>
        title.includes(keyword.toLowerCase()) ||
        content.includes(keyword.toLowerCase())
    );
  });
}

async function getFilteredCryptoNews(previousNewsArticlesIds) {
  const cryptoNews = await fetchCryptoNews();
  let relevantNews = filterRelevantNews(cryptoNews);

  if (previousNewsArticlesIds) {
    relevantNews = relevantNews.filter((article) => {
      return !previousNewsArticlesIds.includes(article.id);
    });
  }

  return relevantNews;
}

module.exports = { eventDrivenTrading };
