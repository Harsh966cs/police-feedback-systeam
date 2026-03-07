const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

let isConnected = false;

async function connect() {
  if (isConnected) {
    return true;
  }

  const dbUrl = process.env.DB_URL;
  if (!dbUrl) {
    console.warn("DB_URL is not set. Running without MongoDB persistence.");
    return false;
  }

  try {
    await mongoose.connect(dbUrl);
    isConnected = true;
    console.log("MongoDB connected successfully.");
    return true;
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    return false;
  }
}

module.exports = connect;
