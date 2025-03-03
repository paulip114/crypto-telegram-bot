const { z } = require("zod");
const { zodResponseFormat } = require("openai/helpers/zod");
const { OpenAI } = require("openai");
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function analyzeNewsSentiment(newsText) {
  const newsObj = z.object({
    newsTitle: z.string(),
    signal: z.string(),
    impact: z.string(),
    explaination: z.string(),
    suggestedTradingAction: z.string(),
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
          - signal (Strongly Positive, Positive, Neutral, Negative, Strongly Negative)
          - possible market impact (Major Bullish Signal, Bullish Signal, No significant impact, Bearish Signal, Major Bearish Signal)
          - explaination of signal (within 20 words)
          - suggested trading action (list one)
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
