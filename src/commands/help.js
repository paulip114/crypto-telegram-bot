const commands = `
*Available Commands:*  
/start \\- Start the bot  
/price \\- Get crypto price \\(e\\.g\\., /price BTCUSDT\\)  
/buy \\- Buy crypto \\(e\\.g\\., /buy BTCUSDT 0\\.01\\)  
/sell \\- Sell crypto \\(e\\.g\\., /sell BTCUSDT 0\\.01\\)
`;

module.exports = (ctx) => {
  ctx.replyWithMarkdownV2(commands);
};
