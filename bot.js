require("dotenv").config();
const { Telegraf } = require("telegraf");
const { message } = require("telegraf/filters");
const { getGPTResponse } = require("./src/GPT/autoResponse");
const { storeUserThread, getUserThread } = require("./src/GPT/threadStorage");
const connectDB = require("./src/db");

// Connect MongoDB
connectDB();

// Credential
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

// Import commands
const startCommand = require("./src/commands/start");
const helpCommand = require("./src/commands/help");
const priceCommand = require("./src/commands/price");
const buyCommand = require("./src/commands/buy");
const sellCommand = require("./src/commands/sell");
const dexCommand = require("./src/commands/dex");
const newsCommand = require("./src/commands/news");
const setBinanceCommand = require("./src/commands/setBinance");

// Register commands
bot.start(startCommand);
bot.command("help", helpCommand);
bot.command("price", priceCommand);
bot.command("buy", buyCommand);
bot.command("sell", sellCommand);
bot.command("dex", dexCommand);
bot.command("news", newsCommand);
bot.command("setting", setBinanceCommand);

// Handle user text message
bot.on(message("text"), async (ctx) => {
  const userId = ctx.message.from.id;
  const userMessage = ctx.message.text;

  await ctx.sendChatAction("typing");

  let threadId = await getUserThread(userId);
  const botResponse = await getGPTResponse(userId, userMessage);
  if (!threadId) {
    await storeUserThread(userId, botResponse.threadId);
  }

  ctx.reply(botResponse.response);
});

// Start the bot
bot.launch();
console.log("CryptoBot is running...");

// Graceful Stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
