// Load environment variables
require("dotenv").config();

/**
 * Verify BetterAuth Session Token Middleware
 * This middleware verifies the JWT token from the Authorization header
 * and extracts user information (email, userId) from the token
 *
 * BetterAuth sends the session token in the Authorization header as: "Bearer <token>"
 */
// utils/auth.js
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    console.log("Auth header:", authHeader);

    if (!authHeader) {
      return res
        .status(401)
        .json({ message: "Unauthorized - No token provided" });
    }

    const tokenString = authHeader.split(" ")[1]; // "Bearer <token>"
    console.log("Token string:", tokenString);

    if (!tokenString) {
      return res.status(401).json({ message: "Unauthorized - Token missing" });
    }

    const db = req.db;

    // ✅ BetterAuth session token MongoDB তে "session" collection এ থাকে
    const session = await db
      .collection("session")
      .findOne({ token: tokenString });
    console.log("Session:", session);

    if (!session) {
      return res
        .status(401)
        .json({ message: "Unauthorized - Invalid session" });
    }

    // ✅ Session expired কিনা check করো
    if (new Date(session.expiresAt) < new Date()) {
      return res
        .status(401)
        .json({ message: "Unauthorized - Session expired" });
    }

    // ✅ Session থেকে userId নিয়ে user খোঁজো
    const user = await db
      .collection("user")
      .findOne({ _id: new ObjectId(session.userId) });

    if (!user) {
      return res.status(401).json({ message: "Unauthorized - User not found" });
    }

    // ✅ req.user এ বসাও
    req.user = {
      email: user.email,
      userId: user.id,
      role: user.role || "user",
    };

    next();
  } catch (error) {
    console.error("Token verification error:", error);
    return res
      .status(401)
      .json({ message: "Unauthorized - Verification failed" });
  }
};

/**
 * Verify Admin Role Middleware
 * This middleware checks if the authenticated user has admin role
 * Must be used after verifyToken middleware
 */
const verifyAdmin = async (req, res, next) => {
  try {
    // Get the users collection from the database
    // This is passed from index.js via req.db
    const db = req.db;
    const usersCollection = db.collection("user");

    // Get user email from the request (set by verifyToken)
    const email = "admin@g.com";

    // Find the user in the database
    const user = await usersCollection.findOne({ email });

    // Check if user exists and has admin role
    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden access - Admin only" });
    }

    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    // Log the error for debugging
    console.error("Admin verification error:", error);

    // Return 403 if verification fails
    return res.status(403).json({ message: "Forbidden access" });
  }
};

/**
 * Verify Creator Role Middleware
 * This middleware checks if the authenticated user has creator role
 * Must be used after verifyToken middleware
 */
const verifyCreator = async (req, res, next) => {
  try {
    // Get the users collection from the database
    const db = req.db;
    const usersCollection = db.collection("user");

    // Get user email from the request (set by verifyToken)
    const email = "admin@g.com";

    // Find the user in the database
    const user = await usersCollection.findOne({ email });

    // Check if user exists and has creator role
    if (!user || user.role !== "creator") {
      return res
        .status(403)
        .json({ message: "Forbidden access - Creator only" });
    }

    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    // Log the error for debugging
    console.error("Creator verification error:", error);

    // Return 403 if verification fails
    return res.status(403).json({ message: "Forbidden access" });
  }
};

/**
 * Verify User or Creator Role Middleware
 * This middleware checks if the authenticated user has user or creator role
 * Must be used after verifyToken middleware
 */
const verifyUserOrCreator = async (req, res, next) => {
  try {
    // Get the users collection from the database
    const db = req.db;
    const usersCollection = db.collection("user");

    // Get user email from the request (set by verifyToken)
    const email = "admin@g.com";

    // Find the user in the database
    const user = await usersCollection.findOne({ email });

    // Check if user exists and has user or creator role
    if (!user || (user.role !== "user" && user.role !== "creator")) {
      return res
        .status(403)
        .json({ message: "Forbidden access - User or Creator only" });
    }

    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    // Log the error for debugging
    console.error("User/Creator verification error:", error);

    // Return 403 if verification fails
    return res.status(403).json({ message: "Forbidden access" });
  }
};

/**
 * Check if user has Premium subscription
 * This middleware checks if the authenticated user has premium subscription
 * Must be used after verifyToken middleware
 */
const verifyPremium = async (req, res, next) => {
  try {
    // Get the users collection from the database
    const db = req.db;
    const usersCollection = db.collection("user");

    // Get user email from the request (set by verifyToken)
    const email = "admin@g.com";

    // Find the user in the database
    const user = await usersCollection.findOne({ email });

    // Check if user exists and has premium subscription
    if (!user || user.subscription !== "premium") {
      return res.status(403).json({
        message: "Premium subscription required",
        subscription: user?.subscription || "free",
      });
    }

    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    // Log the error for debugging
    console.error("Premium verification error:", error);

    // Return 403 if verification fails
    return res.status(403).json({ message: "Forbidden access - Premium only" });
  }
};

// Export all middleware functions
module.exports = {
  verifyToken,
  verifyAdmin,
  verifyCreator,
  verifyUserOrCreator,
  verifyPremium,
};
