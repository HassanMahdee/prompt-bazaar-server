// index.js
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser"; // Needed to read session cookies easily
import { auth } from "./config/auth.js";
import { toNodeHandler } from "better-auth/node";
import { verifyToken, verifyCreator, verifyAdmin } from "./middleware/authMiddleware.js";

const app = express();

// Standard Boilerplate Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true // Crucial for cookie-based session verification if used
}));
app.use(express.json());
app.use(cookie_parser());

/**
 * 1. Mount Better Auth Handlers
 * This catches all requests hitting /api/auth/* and redirects them to Better Auth engine
 */
app.all("/api/auth/*", toNodeHandler(auth));

// 2. Sample Public Route
app.get("/", (req, res) => {
  res.json({ success: true, message: "Welcome to Prompt Bazaar API!" });
});

// 3. Protected Dashboard Route (Any authenticated user)
app.get("/api/dashboard", verifyToken, (req, res) => {
  res.json({ 
    success: true, 
    message: `Hello ${req.user.name}, welcome to your Obsidian Dashboard.` 
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});