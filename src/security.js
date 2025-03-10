const crypto = require("crypto");

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY; // 32 chars
const IV_LENGTH = 16;

function encrypt(text) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(
    "aes-256-gcm",
    Buffer.from(ENCRYPTION_KEY),
    iv
  );

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  const authTag = cipher.getAuthTag().toString("hex");

  return `${iv.toString("hex")}:${encrypted}:${authTag}`;
}

function decrypt(text) {
  try {
    const textParts = text.split(":");
    if (textParts.length !== 3)
      throw new Error("Invalid encrypted data format");

    const iv = Buffer.from(textParts[0], "hex");
    const encryptedText = Buffer.from(textParts[1], "hex");
    const authTag = Buffer.from(textParts[2], "hex");

    const decipher = crypto.createDecipheriv(
      "aes-256-gcm",
      Buffer.from(ENCRYPTION_KEY),
      iv
    );
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedText, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (error) {
    console.error("❌ Decryption Error:", error.message);
    throw new Error("Decryption failed. Data might be corrupted or tampered.");
  }
}

module.exports = { encrypt, decrypt };
