const { OpenAI } = require("openai");
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function summarizeCryptoNews(newsArticles) {
  if (newsArticles.length === 0) {
    return "⚠️ No crypto news available today.";
  }

  const articlesText = newsArticles
    .map((article, index) => `${index + 1}. ${article.title}: ${article.url}`)
    .join("\n");

  const prompt = `Base on the news, determine the trend of market. Provide an overall advice for investor. (No need to repeat the articles, within 100 words. No title is need.) \n\n${articlesText}`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4", // Use GPT-4 or GPT-3.5
      messages: [{ role: "user", content: prompt }],
      max_tokens: 200,
    });

    return (
      "🤖 Investment advice from GPT:\n\n" +
      completion.choices[0].message.content.trim()
    );
  } catch (error) {
    console.error("Error generating summary:", error);
    return "Failed to summarize news.";
  }
}

module.exports = { summarizeCryptoNews };
