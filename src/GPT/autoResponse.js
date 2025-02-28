const { OpenAI } = require("openai");
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function getGPTResponse(userMessage) {
  const prompt = `${userMessage}`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4", // Use GPT-4 or GPT-3.5
      messages: [{ role: "assistant", content: prompt }],
      max_tokens: 200,
    });

    return completion.choices[0].message.content.trim();
  } catch (error) {
    console.error("Error generating response:", error);
    return "Failed to generating response from gpt.";
  }
}

module.exports = { getGPTResponse };
