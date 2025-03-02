const { Web3 } = require("web3");
const { isAddress } = require("web3-validator");
const solanaWeb3 = require("@solana/web3.js");

// Define supported blockchains and their RPC URLs
const RPC_URLS = {
  ethereum: `https://mainnet.infura.io/v3/${process.env.METAMASK_API}`,
  bsc: "https://bsc-dataseed.binance.org/",
  polygon: "https://polygon-rpc.com/",
  avalanche: "https://api.avax.network/ext/bc/C/rpc",
  solana: "https://api.mainnet-beta.solana.com",
};

// Function to create a Web3 instance for Ethereum-based blockchains
const getWeb3Instance = (chain) => {
  if (!RPC_URLS[chain] || chain === "solana") return null;
  return new Web3(new Web3.providers.HttpProvider(RPC_URLS[chain]));
};

// Function to detect which blockchain an address belongs to
const detectBlockchain = async (userAddress, isEvmAddress, isSolanaAddress) => {
  // Check EVM-based blockchains first
  if (isEvmAddress) {
    for (const chain of Object.keys(RPC_URLS)) {
      if (chain === "solana") continue; // Skip Solana for now
      const web3 = getWeb3Instance(chain);
      const balance = await web3.eth.getBalance(userAddress);
      if (parseFloat(web3.utils.fromWei(balance, "ether")) > 0) {
        return chain; // Return the first blockchain where balance > 0
      }
    }
  }

  if (isSolanaAddress) {
    // Check Solana separately
    const solanaConnection = new solanaWeb3.Connection(RPC_URLS.solana);
    const solanaPublicKey = new solanaWeb3.PublicKey(userAddress);
    const solBalance = await solanaConnection.getBalance(solanaPublicKey);
    if (solBalance > 0) {
      return "solana";
    }
  }

  return null; // No blockchain detected
};

// Export function properly to receive `ctx` from Telegraf
module.exports = async (ctx) => {
  try {
    if (!ctx?.message?.text) {
      console.error("❌ Error: Invalid Telegram context.");
      return;
    }

    // Extract wallet address from message
    const messageParts = ctx.message.text.split(" ");
    if (messageParts.length < 2) {
      return ctx.reply(
        "Usage: /dexbalance <your_wallet_address>\nExample: /dexbalance 0xYourEthereumAddress"
      );
    }

    const userAddress = messageParts[1].trim();

    // Validate Ethereum & Solana-style addresses
    const isEvmAddress = isAddress(userAddress);
    const isSolanaAddress = solanaWeb3.PublicKey.isOnCurve(userAddress); // Solana address check

    if (!isEvmAddress && !isSolanaAddress) {
      return ctx.reply(
        "❌ Invalid wallet address. Please enter a valid EVM or Solana address."
      );
    }
    await ctx.sendChatAction("typing");
    ctx.reply("🔍 Detecting blockchain, please wait...");

    // Detect blockchain
    const detectedChain = await detectBlockchain(
      userAddress,
      isEvmAddress,
      isSolanaAddress
    );
    if (!detectedChain) {
      return ctx.reply(
        "⚠️ No balance found on Ethereum, BSC, Polygon, Avalanche, or Solana."
      );
    }

    let balanceInNativeCurrency;

    if (detectedChain === "solana") {
      // Get Solana balance
      const solanaConnection = new solanaWeb3.Connection(RPC_URLS.solana);
      const solanaPublicKey = new solanaWeb3.PublicKey(userAddress);
      const solBalance = await solanaConnection.getBalance(solanaPublicKey);
      balanceInNativeCurrency = solBalance / solanaWeb3.LAMPORTS_PER_SOL; // Convert lamports to SOL
    } else {
      // Get EVM balance
      const web3Instance = getWeb3Instance(detectedChain);
      const balance = await web3Instance.eth.getBalance(userAddress);
      balanceInNativeCurrency = web3Instance.utils.fromWei(balance, "ether");
    }

    let currency;
    if (detectedChain === "solana") {
      currency = "SOL";
    } else if (detectedChain === "bsc") {
      currency = "BNB";
    } else {
      currency = "ETH";
    }

    ctx.reply(
      `✅ Detected Blockchain: ${detectedChain.toUpperCase()}\n💰 Wallet Balance: ${balanceInNativeCurrency} ${currency}`
    );
  } catch (error) {
    console.error("❌ Get DEX balance Error:", error);
    ctx?.reply?.(`⚠️ Failed to get balance.`);
  }
};
