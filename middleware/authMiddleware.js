// middleware/authMiddleware.js
const { auth } = require("../config/auth"); // Importing your initialized Better Auth instance

/**
 * Core Middleware: Verifies the Better Auth Session Token
 * Extracts token from Authorization header or Cookies
 */
const verifyToken = async (req, res, next) => {
  try {
    // 1. Extract token from Authorization header or Fallback to cookies
    let token = null;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else if (req.cookies) {
      token = req.cookies["better-auth.session_token"];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access Denied: No session token provided.",
      });
    }

    // 2. Validate session token via Better Auth API surface
    // Better Auth parses headers natively using its own logic when we pass the request down
    const session = await auth.api.getSession({
      headers: req.headers, // Passes headers through for validation
    });

    if (!session || !session.user) {
      return res.status(401).json({
        success: false,
        message: "Session expired or invalid token.",
      });
    }

    // 3. Attach user and session details to request for downstream routes
    req.user = session.user;
    req.session = session.session;

    return next();
  } catch (error) {
    console.error("RBAC Authentication Middleware Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error during token verification.",
    });
  }
};

/**
 * Role Check: Verifies if the authenticated user is a Creator or Admin
 */
const verifyCreator = (req, res, next) => {
  // Ensure user object exists from verifyToken middleware
  if (!req.user) {
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized. Please log in first." });
  }

  const userRole = req.user.role;
  if (userRole === "creator" || userRole === "admin") {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: "Forbidden: Requires Creator privileges.",
  });
};

/**
 * Role Check: Verifies if the authenticated user is an Admin
 */
const verifyAdmin = (req, res, next) => {
  if (!req.user) {
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized. Please log in first." });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Forbidden: Requires Admin privileges.",
    });
  }

  return next();
};

module.exports = {
  verifyToken,
  verifyCreator,
  verifyAdmin,
};