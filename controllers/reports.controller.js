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
    const userEmail = "admin@g.com";

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
 * Update report status
 * This function handles PATCH /reports/:id/status
 * Admin only - updates the status of a report
 */
async function updateReportStatus(req, res) {
  try {
    // Get the database instance from request
    const db = req.db;

    // Get reference to the reports collection
    const collection = db.collection("reports");

    // Get report ID from route parameters
    const { id } = req.params;

    // Get new status from request body
    const { status } = req.body;

    // Validate status
    const allowedStatuses = ["pending", "reviewed", "dismissed"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    // Convert string ID to MongoDB ObjectId
    const { ObjectId } = require("mongodb");
    const objectId = new ObjectId(id);

    // Check if report exists
    const existingReport = await collection.findOne({ _id: objectId });

    if (!existingReport) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    // Update report status
    const result = await collection.updateOne(
      { _id: objectId },
      { $set: { status, updatedAt: new Date() } },
    );

    // Return success response
    res.status(200).json({
      success: true,
      message: "Report status updated successfully",
    });
  } catch (error) {
    // Log the error for debugging
    console.error("Error updating report status:", error);

    // Return error response
    res.status(500).json({
      success: false,
      message: "Error updating report status",
      error: error.message,
    });
  }
}

/**
 * Remove prompt (admin action)
 * This function handles DELETE /reports/:id/prompt
 * Admin only - removes the reported prompt
 */
async function removeReportedPrompt(req, res) {
  try {
    // Get the database instance from request
    const db = req.db;

    // Get reference to the reports and prompts collections
    const reportsCollection = db.collection("reports");
    const promptsCollection = db.collection("prompts");

    // Get report ID from route parameters
    const { id } = req.params;

    // Convert string ID to MongoDB ObjectId
    const { ObjectId } = require("mongodb");
    const objectId = new ObjectId(id);

    // Find the report
    const report = await reportsCollection.findOne({ _id: objectId });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    // Delete the prompt
    const promptObjectId = new ObjectId(report.promptId);
    const deleteResult = await promptsCollection.deleteOne({
      _id: promptObjectId,
    });

    // Update report status to reviewed
    await reportsCollection.updateOne(
      { _id: objectId },
      { $set: { status: "reviewed", actionTaken: "prompt_removed" } },
    );

    // Return success response
    res.status(200).json({
      success: true,
      message: "Prompt removed successfully",
    });
  } catch (error) {
    // Log the error for debugging
    console.error("Error removing reported prompt:", error);

    // Return error response
    res.status(500).json({
      success: false,
      message: "Error removing prompt",
      error: error.message,
    });
  }
}

/**
 * Warn creator (admin action)
 * This function handles POST /reports/:id/warn
 * Admin only - sends a warning to the prompt creator
 */
async function warnCreator(req, res) {
  try {
    // Get the database instance from request
    const db = req.db;

    // Get reference to the reports collection
    const reportsCollection = db.collection("reports");

    // Get report ID from route parameters
    const { id } = req.params;

    // Get warning message from request body
    const { warningMessage } = req.body;

    // Convert string ID to MongoDB ObjectId
    const { ObjectId } = require("mongodb");
    const objectId = new ObjectId(id);

    // Find the report
    const report = await reportsCollection.findOne({ _id: objectId });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    // Get the prompt to find the creator
    const promptsCollection = db.collection("prompts");
    const prompt = await promptsCollection.findOne({
      _id: new ObjectId(report.promptId),
    });

    if (!prompt) {
      return res.status(404).json({
        success: false,
        message: "Prompt not found",
      });
    }

    // Update report with warning details
    await reportsCollection.updateOne(
      { _id: objectId },
      {
        $set: {
          status: "reviewed",
          actionTaken: "creator_warned",
          warningMessage,
          warningSentAt: new Date(),
        },
      },
    );

    // In a real application, you would send an email notification here
    // For now, we'll just log it
    console.log(
      `Warning sent to creator ${prompt.creatorId}: ${warningMessage}`,
    );

    // Return success response
    res.status(200).json({
      success: true,
      message: "Warning sent to creator successfully",
    });
  } catch (error) {
    // Log the error for debugging
    console.error("Error warning creator:", error);

    // Return error response
    res.status(500).json({
      success: false,
      message: "Error warning creator",
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

    // Get dismissal reason from request body
    const { dismissalReason } = req.body;

    // Convert string ID to MongoDB ObjectId
    const { ObjectId } = require("mongodb");
    const objectId = new ObjectId(id);

    // Check if report exists
    const existingReport = await collection.findOne({ _id: objectId });

    if (!existingReport) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    // Update report status to dismissed
    await collection.updateOne(
      { _id: objectId },
      {
        $set: {
          status: "dismissed",
          actionTaken: "dismissed",
          dismissalReason: dismissalReason || "Not harmful",
          dismissedAt: new Date(),
        },
      },
    );

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
  updateReportStatus,
  removeReportedPrompt,
  warnCreator,
  dismissReport,
};
