const mongoose = require("mongoose");

const MONGO_URI = process.env.MONGO_URI;

async function connectDB() {
  try {
    const connection = await mongoose.connect(MONGO_URI, {
      dbName: "crypto-telegram-bot-db",
    });
    console.log(
      `✅ MongoDB Connected! Database: ${connection.connection.name}`
    );
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error);
    process.exit(1);
  }
}

module.exports = connectDB;
