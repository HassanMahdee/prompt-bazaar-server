// Import Express framework
const express = require("express");

// Import all controller functions
const {
  getAdminSummary,
  getCreatorSummary,
  getUserSummary,
  getPromptGrowth,
  getTopCreators,
  getFeaturedPrompts,
} = require("../controllers/analytics.controller");

// Create a new router instance
const router = express.Router();

/**
 * GET /analytics/admin-summary
 * Get admin summary statistics
 */
router.get("/admin-summary", getAdminSummary);

/**
 * GET /analytics/creator-summary/:email
 * Get creator summary statistics
 */
router.get("/creator-summary/:email", getCreatorSummary);

/**
 * GET /analytics/user-summary/:email
 * Get user summary statistics
 */
router.get("/user-summary/:email", getUserSummary);

/**
 * GET /analytics/prompt-growth
 * Get prompt growth data for charts
 */
router.get("/prompt-growth", getPromptGrowth);

/**
 * GET /analytics/top-creators
 * Get top creators
 */
router.get("/top-creators", getTopCreators);

/**
 * GET /analytics/featured-prompts
 * Get featured prompts for homepage
 */
router.get("/featured-prompts", getFeaturedPrompts);

// Export the router
module.exports = router;
