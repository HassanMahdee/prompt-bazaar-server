// Import Express framework
const express = require("express");

// Import all controller functions
const {
  addBookmark,
  removeBookmark,
  getUserBookmarks,
  checkBookmarkStatus,
} = require("../controllers/bookmarks.controller");
const { verifyToken } = require("../utils/auth");

// Create a new router instance
const router = express.Router();

/**
 * POST /bookmarks
 * Add a bookmark
 */
router.post("/", verifyToken, addBookmark);

/**
 * DELETE /bookmarks/:promptId
 * Remove a bookmark
 */
router.delete("/:promptId", verifyToken, removeBookmark);

/**
 * GET /bookmarks
 * Get user's bookmarks
 */
router.get("/", verifyToken, getUserBookmarks);

/**
 * GET /bookmarks/check/:promptId
 * Check if prompt is bookmarked
 */
router.get("/check/:promptId", verifyToken, checkBookmarkStatus);

// Export the router
module.exports = router;
