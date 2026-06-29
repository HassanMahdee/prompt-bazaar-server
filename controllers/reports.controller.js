/**
 * Reports Controller
 * Handles all report-related operations including:
 * - Submit a report
 * - Get all reports (admin only)
 * - Update report status (admin only)
 * - Warn creator (admin only)
 * - Dismiss report (admin only)
 */

/**
 * Submit a report
 * This function handles POST /reports
 * Allows logged-in users to report a prompt
 */
async function submitReport(req, res) {
  try {
    // Get the database instance from request
    const db = req.db;

    // Get reference to the reports collection
    const collection = db.collection("reports");

    // Get user email from request (set by verifyToken middleware)
    const userEmail = req.body.userEmail;

    // Get report data from request body
    const { promptId, reason, description } = req.body;

    // Validate required fields
    if (!promptId || !reason) {
      return res.status(400).json({
        success: false,
        message: "Prompt ID and reason are required",
      });
    }

    // Validate reason is one of the allowed values
    const allowedReasons = [
      "Inappropriate Content",
      "Spam",
      "Copyright Violation",
      "Other",
    ];
    if (!allowedReasons.includes(reason)) {
      return res.status(400).json({
        success: false,
        message: "Invalid reason",
      });
    }

    // Check if user already reported this prompt
    const existingReport = await collection.findOne({
      userEmail,
      promptId,
    });

    if (existingReport) {
      return res.status(400).json({
        success: false,
        message: "You have already reported this prompt",
      });
    }

    // Create report object
    const report = {
      userEmail,
      promptId,
      reason,
      description: description || "",
      status: "pending", // pending, reviewed, dismissed
      createdAt: new Date(),
    };

    // Insert report into database
    const result = await collection.insertOne(report);

    // Return success response
    res.status(201).json({
      success: true,
      message: "Report submitted successfully",
      data: { ...report, _id: result.insertedId },
    });
  } catch (error) {
    // Log the error for debugging
    console.error("Error submitting report:", error);

    // Return error response
    res.status(500).json({
      success: false,
      message: "Error submitting report",
      error: error.message,
    });
  }
}

/**
 * Get all reports
 * This function handles GET /reports
 * Admin only - returns all reports with prompt details
 */
async function getAllReports(req, res) {
  try {
    // Get the database instance from request
    const db = req.db;

    // Get reference to the reports and prompts collections
    const reportsCollection = db.collection("reports");
    const promptsCollection = db.collection("prompts");

    // Get all reports
    const reports = await reportsCollection
      .find()
      .sort({ createdAt: -1 })
      .toArray();

    // If no reports found, return empty array
    if (reports.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: [],
      });
    }

    // Get prompt IDs from reports
    const promptIds = reports.map((report) => report.promptId);

    // Convert string IDs to ObjectIds
    const { ObjectId } = require("mongodb");
    const objectIds = promptIds.map((id) => new ObjectId(id));

    // Find all prompts that are reported
    const prompts = await promptsCollection
      .find({ _id: { $in: objectIds } })
      .toArray();

    // Create a map of prompt ID to prompt details
    const promptMap = {};
    prompts.forEach((prompt) => {
      promptMap[prompt._id.toString()] = prompt;
    });

    // Combine reports with prompt details
    const reportsWithDetails = reports.map((report) => ({
      ...report,
      promptDetails: promptMap[report.promptId] || null,
    }));

    // Return reports with prompt details
    res.status(200).json({
      success: true,
      count: reportsWithDetails.length,
      data: reportsWithDetails,
    });
  } catch (error) {
    // Log the error for debugging
    console.error("Error getting all reports:", error);

    // Return error response
    res.status(500).json({
      success: false,
      message: "Error retrieving reports",
      error: error.message,
    });
  }
}

/**
 * Dismiss report (admin action)
 * This function handles PATCH /reports/:id/dismiss
 * Admin only - dismisses a report as not harmful
 */
async function dismissReport(req, res) {
  try {
    // Get the database instance from request
    const db = req.db;

    // Get reference to the reports collection
    const collection = db.collection("reports");

    // Get report ID from route parameters
    const { id } = req.params;


    // Convert string ID to MongoDB ObjectId
    const { ObjectId } = require("mongodb");
    const objectId = new ObjectId(id);

    // Check if report exists
    const existingReport = await collection.findOne({ _id: objectId });


    // remove report if dismissed
    const result = await collection.deleteOne({ _id: objectId });

    // Return success response
    res.status(200).json({
      success: true,
      message: "Report dismissed successfully",
    });
  } catch (error) {
    // Log the error for debugging
    console.error("Error dismissing report:", error);

    // Return error response
    res.status(500).json({
      success: false,
      message: "Error dismissing report",
      error: error.message,
    });
  }
}

// Export all controller functions
module.exports = {
  submitReport,
  getAllReports,
  dismissReport,
};
