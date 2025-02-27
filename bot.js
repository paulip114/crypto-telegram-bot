require("dotenv").config();
const { Telegraf } = require("telegraf");
const axios = require("axios");

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

const Binance = require("node-binance-api");
const binance = new Binance().options({
  APIKEY: process.env.BINANCE_APIKEY,
  APISECRET: process.env.BINANCE_APISECRET,
});

const commands = `
*Available Commands:*  
/start \\- Start the bot  
/price \\- Get crypto price \\(e\\.g\\., /price BTCUSDT\\)  
/buy \\- Buy crypto \\(e\\.g\\., /buy BTCUSDT 0\\.01\\)  
/sell \\- Sell crypto \\(e\\.g\\., /sell BTCUSDT 0\\.01\\)
`;

// Fetch crypto price from CoinGecko
async function getCryptoPrice(symbol) {
  try {
    const response = await axios.get(
      `https://api.coingecko.com/api/v3/simple/price?ids=${symbol}&vs_currencies=usd`
    );
    return response.data[symbol].usd;
  } catch (error) {
    return "Error fetching price. Try again.";
  }
}

// Start command
bot.start((ctx) =>
  ctx.reply(
    "🚀 Welcome to CryptoBot! Use /price <coin> to get the latest price."
  )
);

// Help
bot.command("help", async (ctx) => {
  ctx.replyWithMarkdownV2(commands);
});

// Get crypto price
bot.command("price", async (ctx) => {
  const message = ctx.message.text.split(" ");
  if (message.length < 2) return ctx.reply("Usage: /price bitcoin");
  const symbol = message[1].toLowerCase();
  const price = await getCryptoPrice(symbol);
  ctx.reply(`💰 ${symbol.toUpperCase()} Price: $${price}`);
});

// Trade with Binance
bot.command("buy", async (ctx) => {
  try {
    const message = ctx.message.text.split(" ");
    if (message.length < 3) return ctx.reply("Usage: /buy BTCUSDT 0.01");

    const symbol = message[1].toUpperCase();
    const quantity = parseFloat(message[2]);

    if (isNaN(quantity) || quantity <= 0) {
      return ctx.reply(
        "Invalid quantity. Please enter a valid number greater than zero."
      );
    }

    // Execute buy trade using Binance API
    const result = await binance.marketBuy(symbol, quantity).catch((err) => {
      throw new Error(`Binance API Error: ${err.message}`);
    });

    ctx.reply(`✅ Buy Order Executed: ${quantity} ${symbol}`);
  } catch (error) {
    console.error("Buy Trade Error:", error);
    ctx.reply(`⚠️ Buy Order Failed: ${error.message}`);
  }
});

bot.command("sell", async (ctx) => {
  try {
    const message = ctx.message.text.split(" ");
    if (message.length < 3) return ctx.reply("Usage: /sell BTCUSDT 0.01");

    const symbol = message[1].toUpperCase();
    const quantity = parseFloat(message[2]);

    if (isNaN(quantity) || quantity <= 0) {
      return ctx.reply(
        "Invalid quantity. Please enter a valid number greater than zero."
      );
    }

    // Execute sell trade using Binance API
    const result = await binance.marketSell(symbol, quantity).catch((err) => {
      throw new Error(`Binance API Error: ${err.message}`);
    });

    ctx.reply(`✅ Sell Order Executed: ${quantity} ${symbol}`);
  } catch (error) {
    console.error("Sell Trade Error:", error);
    ctx.reply(`⚠️ Sell Order Failed: ${error.message}`);
  }
});

// Start the bot
bot.launch();
console.log("CryptoBot is running...");

// Graceful Stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
