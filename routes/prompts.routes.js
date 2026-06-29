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
  getAllPromptsAdmin,
} = require("../controllers/prompts.controller");

// Import upload middleware for image uploads
const upload = require("../middleware/upload");
const { verifyToken, verifyAdmin, verifyCreator } = require("../utils/auth");

// Create a new router instance
const router = express.Router();

//Get all prompts for admin
router.get("/all-prompts-admin", verifyToken, verifyAdmin, getAllPromptsAdmin);

/**
 * GET /prompts
 * Get all prompts with optional filtering and sorting
 */
router.get("/", getAllPrompts);

/**
 * GET /prompts/creator/:creatorId
 * Get all prompts created by a specific creator
 */
router.get("/creator/:email", verifyToken, verifyCreator, getPromptsByCreator);

/**
 * GET /prompts/:id
 * Get a single prompt by ID
 */
router.get("/:id", verifyToken, getPromptById);

/**
 * POST /prompts
 * Create a new prompt
 */
router.post("/", verifyToken, verifyCreator, createPrompt);

/**
 * PATCH /prompts/:id
 * Update a prompt by ID
 */
router.patch("/:id", verifyToken, verifyCreator, updatePrompt);

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
router.patch("/:id/status", verifyToken, verifyAdmin, updatePromptStatus);

/**
 * PATCH /prompts/:id/feature
 */
router.patch("/:id/featured", verifyToken, verifyAdmin, featurePrompt);

/**
 * POST /prompts/:id/reviews
 * Add a review to a prompt
 */
router.post("/:id/reviews", verifyToken, addReview);

// Export the router
module.exports = router;
