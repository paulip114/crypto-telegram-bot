require("dotenv").config();
const { Telegraf } = require("telegraf");
const Binance = require("node-binance-api");

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

// Register commands
bot.start(startCommand);
bot.command("help", helpCommand);
bot.command("price", priceCommand);
bot.command("buy", buyCommand(binance)); // Pass Binance instance
bot.command("sell", sellCommand(binance)); // Pass Binance instance

// Start the bot
bot.launch();
console.log("CryptoBot is running...");

// Graceful Stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
