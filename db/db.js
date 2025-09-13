const mongoose = require("mongoose");

async function connectToDB() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.DB_CONNECT);
    console.log("✅ Connected to MongoDB successfully");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1); // Exit app if DB connection fails
  }
}

module.exports = connectToDB;
