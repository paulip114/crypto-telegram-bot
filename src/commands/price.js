const axios = require("axios");

async function getCryptoPrice(symbol) {
  try {
    const response = await axios.get(
      `https://api.coingecko.com/api/v3/simple/price?ids=${symbol}&vs_currencies=usd`
    );
    return response.data[symbol]?.usd || "N/A";
  } catch (error) {
    return "Error fetching price. Try again.";
  }
}

module.exports = async (ctx) => {
  const message = ctx.message.text.split(" ");
  if (message.length < 2) return ctx.reply("Usage: /price bitcoin");

  const symbol = message[1].toLowerCase();
  const price = await getCryptoPrice(symbol);

  ctx.reply(`💰 ${symbol.toUpperCase()} Price: $${price}`);
};
