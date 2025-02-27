module.exports = (binance) => async (ctx) => {
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
};
