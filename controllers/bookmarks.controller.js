/**
 * Bookmarks Controller
 * Handles all bookmark-related operations including:
 * - Add bookmark
 * - Remove bookmark
 * - Get user's bookmarks
 * - Check if prompt is bookmarked
 */

/**
 * Add a bookmark
 * This function handles POST /bookmarks
 * Allows logged-in users to bookmark a prompt
 */
async function addBookmark(req, res) {
  try {
    // Get the database instance from request
    const db = req.db;

    // Get reference to the bookmarks collection
    const collection = db.collection("bookmarks");

    // Get user email from request (set by verifyToken middleware)
    const userEmail = req.user.email;

    // Get prompt ID from request body
    const { promptId } = req.body;

    // Validate that promptId is provided
    if (!promptId) {
      return res.status(400).json({
        success: false,
        message: "Prompt ID is required",
      });
    }

    // Check if bookmark already exists
    const existingBookmark = await collection.findOne({
      userEmail,
      promptId,
    });

    if (existingBookmark) {
      return res.status(400).json({
        success: false,
        message: "Prompt already bookmarked",
      });
    }

    // Create bookmark object
    const bookmark = {
      userEmail,
      promptId,
      bookmarkedAt: new Date(),
    };

    // Insert bookmark into database
    const result = await collection.insertOne(bookmark);

    // Return success response
    res.status(201).json({
      success: true,
      message: "Prompt bookmarked successfully",
      data: { ...bookmark, _id: result.insertedId },
    });
  } catch (error) {
    // Log the error for debugging
    console.error("Error adding bookmark:", error);

    // Return error response
    res.status(500).json({
      success: false,
      message: "Error adding bookmark",
      error: error.message,
    });
  }
}

/**
 * Remove a bookmark
 * This function handles DELETE /bookmarks/:promptId
 * Allows logged-in users to remove a bookmark
 */
async function removeBookmark(req, res) {
  try {
    // Get the database instance from request
    const db = req.db;

    // Get reference to the bookmarks collection
    const collection = db.collection("bookmarks");

    // Get user email from request (set by verifyToken middleware)
    const userEmail = req.user.email;

    // Get prompt ID from route parameters
    const { promptId } = req.params;

    // Check if bookmark exists
    const existingBookmark = await collection.findOne({
      userEmail,
      promptId,
    });

    if (!existingBookmark) {
      return res.status(404).json({
        success: false,
        message: "Bookmark not found",
      });
    }

    // Delete bookmark from database
    const result = await collection.deleteOne({
      userEmail,
      promptId,
    });

    // Return success response
    res.status(200).json({
      success: true,
      message: "Bookmark removed successfully",
    });
  } catch (error) {
    // Log the error for debugging
    console.error("Error removing bookmark:", error);

    // Return error response
    res.status(500).json({
      success: false,
      message: "Error removing bookmark",
      error: error.message,
    });
  }
}

/**
 * Get user's bookmarks
 * This function handles GET /bookmarks
 * Returns all bookmarks for the logged-in user
 */
async function getUserBookmarks(req, res) {
  try {
    // Get the database instance from request
    const db = req.db;

    // Get reference to the bookmarks collection
    const bookmarksCollection = db.collection("bookmarks");
    const promptsCollection = db.collection("prompts");

    // Get user email from request (set by verifyToken middleware)
    const userEmail = req.user.email;

    // Find all bookmarks for the user
    const bookmarks = await bookmarksCollection
      .find({ userEmail })
      .sort({ bookmarkedAt: -1 })
      .toArray();

    // If no bookmarks found, return empty array
    if (bookmarks.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: [],
      });
    }

    // Get prompt IDs from bookmarks
    const promptIds = bookmarks.map((bookmark) => bookmark.promptId);

    // Convert string IDs to ObjectIds
    const { ObjectId } = require("mongodb");
    const objectIds = promptIds.map((id) => new ObjectId(id));

    // Find all prompts that are bookmarked
    const prompts = await promptsCollection
      .find({ _id: { $in: objectIds } })
      .toArray();

    // Return bookmarks with prompt details
    res.status(200).json({
      success: true,
      count: prompts.length,
      data: prompts,
    });
  } catch (error) {
    // Log the error for debugging
    console.error("Error getting user bookmarks:", error);

    // Return error response
    res.status(500).json({
      success: false,
      message: "Error retrieving bookmarks",
      error: error.message,
    });
  }
}

/**
 * Check if prompt is bookmarked
 * This function handles GET /bookmarks/check/:promptId
 * Returns bookmark status for a specific prompt
 */
async function checkBookmarkStatus(req, res) {
  try {
    // Get the database instance from request
    const db = req.db;

    // Get reference to the bookmarks collection
    const collection = db.collection("bookmarks");

    // Get user email from request (set by verifyToken middleware)
    const userEmail = req.user.email;
    console.log("User email:", userEmail);

    // Get prompt ID from route parameters
    const { promptId } = req.params;

    // Check if bookmark exists
    const bookmark = await collection.findOne({
      userEmail,
      promptId,
    });

    // Return bookmark status
    res.status(200).json({
      success: true,
      isBookmarked: !!bookmark,
    });
  } catch (error) {
    // Log the error for debugging
    console.error("Error checking bookmark status:", error);

    // Return error response
    res.status(500).json({
      success: false,
      message: "Error checking bookmark status",
      error: error.message,
    });
  }
}

// Export all controller functions
module.exports = {
  addBookmark,
  removeBookmark,
  getUserBookmarks,
  checkBookmarkStatus,
};
