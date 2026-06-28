// Import Express framework
const express = require("express");

// Import all controller functions
const {
  addBookmark,
  removeBookmark,
  getUserBookmarks,
  checkBookmarkStatus,
} = require("../controllers/bookmarks.controller");

// Create a new router instance
const router = express.Router();

/**
 * POST /bookmarks
 * Add a bookmark
 */
router.post("/", addBookmark);

/**
 * DELETE /bookmarks/:promptId
 * Remove a bookmark
 */
router.delete("/:promptId", removeBookmark);

/**
 * GET /bookmarks
 * Get user's bookmarks
 */
router.get("/", getUserBookmarks);

/**
 * GET /bookmarks/check/:promptId
 * Check if prompt is bookmarked
 */
router.get("/check/:promptId", checkBookmarkStatus);

// Export the router
module.exports = router;
