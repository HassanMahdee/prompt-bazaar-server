// Import Express framework
const express = require("express");

// Import all controller functions
const {
  getAllPrompts,
  getPromptById,
  createPrompt,
  updatePrompt,
  deletePrompt,
  incrementCopyCount,
  updatePromptStatus,
  addReview,
  getPromptsByCreator,
  featurePrompt,
} = require("../controllers/prompts.controller");

// Import upload middleware for image uploads
const upload = require("../middleware/upload");

// Create a new router instance
const router = express.Router();

/**
 * GET /prompts
 * Get all prompts with optional filtering and sorting
 */
router.get("/", getAllPrompts);

/**
 * GET /prompts/creator/:creatorId
 * Get all prompts created by a specific creator
 */
router.get("/creator/:creatorId", getPromptsByCreator);

/**
 * GET /prompts/:id
 * Get a single prompt by ID
 */
router.get("/:id", getPromptById);

/**
 * POST /prompts
 * Create a new prompt
 */
router.post("/", upload.single("image"), createPrompt);

/**
 * PATCH /prompts/:id
 * Update a prompt by ID
 */
router.patch("/:id", updatePrompt);

/**
 * DELETE /prompts/:id
 * Delete a prompt by ID
 */
router.delete("/:id", deletePrompt);

/**
 * PATCH /prompts/:id/copy
 * Increment the copyCount of a prompt by 1
 */
router.patch("/:id/copy", incrementCopyCount);

/**
 * PATCH /prompts/:id/status
 * Update the status of a prompt
 */
router.patch("/:id/status", updatePromptStatus);

/**
 * PATCH /prompts/:id/feature
 * Feature or unfeature a prompt
 */
router.patch("/:id/featured", featurePrompt);

/**
 * POST /prompts/:id/reviews
 * Add a review to a prompt
 */
router.post("/:id/reviews", addReview);

// Export the router
module.exports = router;
