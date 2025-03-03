const { z } = require("zod");
const { zodResponseFormat } = require("openai/helpers/zod");
const { OpenAI } = require("openai");
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function analyzeNewsSentiment(newsText) {
  const newsObj = z.object({
    newsTitle: z.string(),
    sentiment: z.string(),
    explaination: z.string(),
  });
  const result = z.object({
    newsSentiment: z.array(newsObj),
  });

  try {
    const completion = await openai.beta.chat.completions.parse({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `Analyze the following crypto-related news and determine if it is positive for the crypto market:
          Reply with only one word: Positive, Neutral, or Negative.
          For each news, provide:
          - news title
          - sentiment (Positive, Neutral, or Negative)
          - explaination of sentiment (within 20 words)
          News: "${newsText}"`,
        },
      ],
      response_format: zodResponseFormat(result, "gpt_result"),
    });
    const gpt_result = completion.choices[0].message.parsed;
    return gpt_result;
  } catch (error) {
    console.error("❌ Error analyzing sentiment:", error);
    return "Neutral";
  }
}

module.exports = { analyzeNewsSentiment };
