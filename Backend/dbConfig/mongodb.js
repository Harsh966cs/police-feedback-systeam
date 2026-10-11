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
    const dbName = process.env.FEEDBACK_DB_NAME || "FEEDBACK";
    await mongoose.connect(dbUrl, { dbName });
    isConnected = true;
    console.log(`MongoDB connected successfully to database "${mongoose.connection.name}".`);
    return true;
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    return false;
  }
}

module.exports = connect;
