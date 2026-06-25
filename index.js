const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db"); // 👈 Import your Mongoose connection logic

const app = express();
const PORT = process.env.PORT || 5000;

// Execute MongoDB Connection Hook
connectDB();

// Global Request Middleware Parsers
app.use(cors());
app.use(express.json());

// Base Landing Route Verification Test
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to the Prompt Bazaar API server!",
    timestamp: new Date(),
  });
});

// Global Fallback Error Interceptor Layers
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Something went wrong on the server.",
  });
});

// Start the server listener module
app.listen(PORT, () => {
  console.log(`🚀 Server is running smoothly on port ${PORT}`);
});
