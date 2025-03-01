const Binance = require("node-binance-api");
const { getUserBinanceKey } = require("../CEX/binanceStorage");

module.exports = async (ctx) => {
  const message = ctx.message.text.split(" ");
  if (message.length < 3) return ctx.reply("❌ Usage: /buy BTCUSDT 0.01");

  const userId = ctx.message.from.id;
  const symbol = message[1].toUpperCase();
  const quantity = parseFloat(message[2]);

  // Get user-specific Binance keys
  const userKeys = await getUserBinanceKey(userId);
  if (!userKeys) {
    return ctx.reply(
      "⚠️ Please set your Binance API keys first: /setbinance API_KEY API_SECRET"
    );
  }

  const userBinance = new Binance().options({
    APIKEY: userKeys.apiKey,
    APISECRET: userKeys.apiSecret,
  });

  try {
    const result = await userBinance.marketBuy(symbol, quantity);
    ctx.reply(`✅ Trade Executed: Bought ${quantity} ${symbol}`);
  } catch (error) {
    let errorMessage = "❌ Trade Failed: Unknown error";
    if (error.body) {
      try {
        const errorDetails = JSON.parse(error.body);
        errorMessage = `⚠️ Buy Order Failed: ${errorDetails.msg}`;
      } catch (parseError) {
        console.error("Error parsing Binance response:", parseError);
      }
    }

    console.error("Trade Error:", errorMessage);

    ctx.reply(errorMessage);
  }
};
