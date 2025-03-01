const { storeUserBinanceKey } = require("../CEX/binanceStorage");

module.exports = async (ctx) => {
  const messageParts = ctx.message.text.split(" ");
  if (messageParts.length !== 3) {
    return ctx.reply("❌ Usage: /setting YOUR_API_KEY YOUR_API_SECRET");
  }

  const userId = ctx.message.from.id;
  const apiKey = messageParts[1];
  const apiSecret = messageParts[2];

  await storeUserBinanceKey(userId, apiKey, apiSecret);
  ctx.reply("✅ Your Binance API keys have been securely stored!");
};
