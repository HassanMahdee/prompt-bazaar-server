// index.js
const dns = require("node:dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser"); // Needed to read session cookies easily
const { auth } = require("./config/auth");
const { toNodeHandler } = require("better-auth/node");
const {
  verifyToken,
  verifyCreator,
  verifyAdmin,
} = require("./middleware/authMiddleware");
const promptRoutes = require("./routes/promptRoutes");
const connectDB = require("./config/db");

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB Cluster
connectDB();

// Standard Boilerplate Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true, // Crucial for cookie-based session verification if used
  }),
);
app.use(express.json());
app.use(cookieParser());

// Structural Sanity Check Vector
app.use("/", (req, res) => {
  res.json({
    status: "online",
    message: "Welcome to Prompt Bazaar Backend API Core",
  });
});

/**
 * 1. Mount Better Auth Handlers
 * This catches all requests hitting /api/auth/* and redirects them to Better Auth engine
 */
app.all("/api/auth/*path", toNodeHandler(auth));

// 2. Sample Public Route
app.get("/", (req, res) => {
  res.json({ success: true, message: "Welcome to Prompt Bazaar API!" });
});

// 3. Protected Dashboard Route (Any authenticated user)
app.get("/api/dashboard", verifyToken, (req, res) => {
  res.json({
    success: true,
    message: `Hello ${req.user.name}, welcome to your Obsidian Dashboard.`,
  });
});

// 4. Creator Studio Route (Creators & Admins only)
app.post("/api/prompts/create", verifyToken, verifyCreator, (req, res) => {
  res.json({ success: true, message: "Prompt creation field initialized." });
});

// 5. Admin Panel Route (Strictly Admins only)
app.get("/api/admin/analytics", verifyToken, verifyAdmin, (req, res) => {
  res.json({ success: true, message: "System-wide data analysis loaded." });
});

// Mount Modular Enterprise API Route Groups
app.use("/api/prompts", promptRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
