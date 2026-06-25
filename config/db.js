const mongoose = require("mongoose");

/**
 * Initializes a secure connection instance to MongoDB.
 * Terminates server execution gracefully if the initial handshake fails.
 */
const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error(
        "MONGO_URI environment variable is completely missing inside your .env configuration.",
      );
    }

    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`📡 MongoDB Connected Successfully: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Critical Database Connection Failure: ${error.message}`);
    // Shut down server instance with a failure exit code (1)
    process.exit(1);
  }
};

// Monitor ongoing cluster health updates after an established initialization
mongoose.connection.on("error", (err) => {
  console.error(`💥 Runtime Database Error discovered: ${err}`);
});

mongoose.connection.on("disconnected", () => {
  console.warn("⚠️ Alert: Connection to MongoDB host has dropped.");
});

module.exports = connectDB;
