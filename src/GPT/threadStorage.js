const { createClient } = require("redis");

const redisClient = createClient({
  url: process.env.REDIS_URL, // Railway Redis URL from environment variables
  socket: {
    reconnectStrategy: () => 1000, // Auto-reconnect if disconnected
  },
});

redisClient.on("error", (err) =>
  console.error("❌ Redis Connection Error:", err)
);

(async () => {
  try {
    await redisClient.connect();
    console.log("✅ Redis Connected!");
  } catch (err) {
    console.error("❌ Failed to connect to Redis:", err);
  }
})();

async function storeUserThread(userId, threadId) {
  await redisClient.set(`userThread:${userId}`, threadId);
}

async function getUserThread(userId) {
  return await redisClient.get(`userThread:${userId}`);
}

module.exports = { storeUserThread, getUserThread };
