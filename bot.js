require("dotenv").config();
const { Telegraf } = require("telegraf");
const { message } = require("telegraf/filters");
const Binance = require("node-binance-api");
const { getGPTResponse } = require("./src/GPT/autoResponse");

// Credential
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
const binance = new Binance().options({
  APIKEY: process.env.BINANCE_APIKEY,
  APISECRET: process.env.BINANCE_APISECRET,
});

// Import commands
const startCommand = require("./src/commands/start");
const helpCommand = require("./src/commands/help");
const priceCommand = require("./src/commands/price");
const buyCommand = require("./src/commands/buy");
const sellCommand = require("./src/commands/sell");
const dexCommand = require("./src/commands/dex");
const newsCommand = require("./src/commands/news");
// getCexBalance = require("")

// Register commands
bot.start(startCommand);
bot.command("help", helpCommand);
bot.command("price", priceCommand);
bot.command("buy", buyCommand(binance)); // Pass Binance instance
bot.command("sell", sellCommand(binance)); // Pass Binance instance
bot.command("dex", dexCommand);
bot.command("news", newsCommand);

// Handle all non-command messages
bot.on(message("text"), async (ctx) => {
  const userMessage = ctx.message.text;
  await ctx.sendChatAction("typing");
  const botResponse = await getGPTResponse(userMessage);
  ctx.reply(botResponse);
});

// Start the bot
bot.launch();
console.log("CryptoBot is running...");

// Graceful Stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
