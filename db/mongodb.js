// Import MongoDB client from the mongodb package
const { MongoClient, ServerApiVersion } = require("mongodb");

// Load environment variables from .env file
require("dotenv").config();

// Get MongoDB connection string from environment variables
const uri = process.env.MONGODB_URI;

// Create a new MongoClient instance with server API configuration
// This follows the reference structure from ClubSphere
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// Export the client so it can be used in index.js
module.exports = client;
