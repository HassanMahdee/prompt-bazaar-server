const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware Setup
app.use(cors()); // Enables Cross-Origin Resource Sharing
app.use(express.json()); // Parses incoming JSON payloads

// Base Test Route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to the Prompt Bazaar API server!",
    timestamp: new Date(),
  });
});

// Global Error Handling Middleware (Catch-all)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Something went wrong on the server.",
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server is running smoothly on port ${PORT}`);
});
