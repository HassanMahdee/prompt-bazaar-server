const dns = require("node:dns");
dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);

const express = require("express");

// Import CORS middleware
const cors = require("cors");

// Import MongoDB client
const client = require("./db/mongodb");

// Import all route modules
const promptsRoutes = require("./routes/prompts.routes");
const usersRoutes = require("./routes/users.routes");
const bookmarksRoutes = require("./routes/bookmarks.routes");
const reportsRoutes = require("./routes/reports.routes");
const paymentsRoutes = require("./routes/payments.routes");
const analyticsRoutes = require("./routes/analytics.routes");

// Load environment variables from .env file
require("dotenv").config();

// Create an Express application
const app = express();

// Get the port from environment variables or use 5000 as default
const port = process.env.PORT || 5000;

/**
 * Middleware Configuration
 * Middleware functions are executed before the route handlers
 */

// Enable CORS (Cross-Origin Resource Sharing)
// This allows frontend applications to communicate with this backend
app.use(cors());

// Parse incoming JSON request bodies
// This makes req.body available in route handlers
app.use(express.json());

/**
 * Middleware to attach database instance to request
 * This allows controllers to access the database via req.db
 */
app.use(async (req, res, next) => {
  try {
    // Check if client is connected
    if (!client.topology || !client.topology.isConnected()) {
      await client.connect();
    }

    // Attach database instance to request
    req.db = client.db("prompt-bazaar");

    // Proceed to next middleware/route
    next();
  } catch (error) {
    console.error("Database connection error:", error);
    res.status(500).json({
      success: false,
      message: "Database connection error",
    });
  }
});

/**
 * Route Configuration
 * Mount all route modules at their respective paths
 */
app.use("/prompts", promptsRoutes);
app.use("/user", usersRoutes);
app.use("/bookmarks", bookmarksRoutes);
app.use("/reports", reportsRoutes);
app.use("/payments", paymentsRoutes);
app.use("/analytics", analyticsRoutes);

/**
 * Root Route
 * A simple health check endpoint
 */
app.get("/", (req, res) => {
  res.send("Prompt Bazaar server is running now");
});

/**
 * 404 Handler
 * This middleware handles requests to routes that don't exist
 */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

/**
 * Error Handler
 * This middleware catches any errors that occur in the application
 */
app.use((err, req, res, next) => {
  console.error("Error:", err);

  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: err.message,
  });
});

/**
 * Start the Server
 * This function connects to MongoDB and starts listening for requests
 */
async function run() {
  try {
    // Connect to MongoDB
    await client.connect();

    // Start the Express server
    app.listen(port, () => {
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

/**
 * Graceful Shutdown
 * Handle server shutdown events (Ctrl+C, etc.)
 */
process.on("SIGINT", async () => {
  try {
    // Close the MongoDB connection
    await client.close();


    // Exit the process
    process.exit(0);
  } catch (error) {
    process.exit(1);
  }
});

// Start the server
run().catch(console.dir);
