// Import Express framework
const express = require("express");

// Import all controller functions
const {
  submitReport,
  getAllReports,
  updateReportStatus,
  removeReportedPrompt,
  warnCreator,
  dismissReport,
} = require("../controllers/reports.controller");

// Create a new router instance
const router = express.Router();

/**
 * POST /reports
 * Submit a report
 */
router.post("/", submitReport);

/**
 * GET /reports
 * Get all reports
 */
router.get("/", getAllReports);

/**
 * PATCH /reports/:id/status
 * Update report status
 */
router.patch("/:id/status", updateReportStatus);

/**
 * DELETE /reports/:id/prompt
 * Remove reported prompt
 */
router.delete("/:id/prompt", removeReportedPrompt);

/**
 * POST /reports/:id/warn
 * Warn creator
 */
router.post("/:id/warn", warnCreator);

/**
 * PATCH /reports/:id/dismiss
 * Dismiss report
 */
router.patch("/:id/dismiss", dismissReport);

// Export the router
module.exports = router;
