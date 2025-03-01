const mongoose = require("mongoose");
const { encrypt, decrypt } = require("../security");

const userBinanceKeySchema = new mongoose.Schema({
  userId: String,
  apiKey: String,
  apiSecret: String,
});

const UserBinanceKey = mongoose.model("UserBinanceKey", userBinanceKeySchema);

async function storeUserBinanceKey(userId, apiKey, apiSecret) {
  const encryptedApiKey = encrypt(apiKey);
  const encryptedApiSecret = encrypt(apiSecret);

  await UserBinanceKey.findOneAndUpdate(
    { userId },
    { apiKey: encryptedApiKey, apiSecret: encryptedApiSecret },
    { upsert: true }
  );
}

async function getUserBinanceKey(userId) {
  const user = await UserBinanceKey.findOne({ userId });
  return user
    ? { apiKey: decrypt(user.apiKey), apiSecret: decrypt(user.apiSecret) }
    : null;
}

module.exports = { storeUserBinanceKey, getUserBinanceKey };
