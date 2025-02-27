module.exports = (binance) => async (ctx) => {
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
};
