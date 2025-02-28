const { OpenAI } = require("openai");
const { storeUserThread, getUserThread } = require("./threadStorage");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Store Assistant ID globally (Create once & reuse)
let assistantId = null;

async function getGPTResponse(userId, userMessage) {
  try {
    // ✅ Create the assistant once
    if (!assistantId) {
      console.log("Creating Assistant...");
      const assistant = await openai.beta.assistants.create({
        name: "PaulTech Baby",
        instructions:
          "Your name is PaulTech Baby. You provide crypto insights.",
        model: "gpt-4-turbo",
      });
      assistantId = assistant.id;
    }

    // ✅ Retrieve the user's thread or create a new one
    let threadId = await getUserThread(userId);
    if (!threadId) {
      console.log(`Creating new thread for user ${userId}...`);
      const newThread = await openai.beta.threads.create();
      threadId = newThread.id;
      await storeUserThread(userId, threadId);
    }

    // ✅ Add user message to the thread
    await openai.beta.threads.messages.create(threadId, {
      role: "user",
      content: userMessage,
    });

    // ✅ Run Assistant in the same thread
    console.log(
      `Running assistant for user ${userId} in thread ${threadId}...`
    );
    const run = await openai.beta.threads.runs.create(threadId, {
      assistant_id: assistantId,
    });

    // ✅ Poll for completion
    let response = "";
    while (true) {
      const runStatus = await openai.beta.threads.runs.retrieve(
        threadId,
        run.id
      );
      if (runStatus.status === "completed") {
        const messages = await openai.beta.threads.messages.list(threadId);
        response = messages.data[0].content[0].text.value;
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Prevent excessive API calls
    }

    return { threadId, response: response.trim() };
  } catch (error) {
    console.error("Error generating response:", error);
    return {
      threadId: null,
      response: "⚠️ Failed to generate response from GPT.",
    };
  }
}

module.exports = { getGPTResponse };
