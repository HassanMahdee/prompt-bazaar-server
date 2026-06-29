// Import Express framework
const express = require("express");

// Import all controller functions
const {
  submitReport,
  getAllReports,
  removeReportedPrompt,
  warnCreator,
  dismissReport,
} = require("../controllers/reports.controller");
const { verifyToken, verifyAdmin, verifyCreator } = require("../utils/auth");

// Create a new router instance
const router = express.Router();

/**
 * POST /reports
 * Submit a report
 */
router.post("/", verifyToken, submitReport);

/**
 * GET /reports
 * Get all reports
 */
router.get("/", verifyToken, verifyAdmin, getAllReports);


router.delete("/:id", verifyToken, verifyAdmin, dismissReport);

// Export the router
module.exports = router;
