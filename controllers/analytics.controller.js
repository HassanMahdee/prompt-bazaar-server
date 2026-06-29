/**
 * Analytics Controller
 * Handles all analytics-related operations including:
 * - Admin summary statistics
 * - Creator summary statistics
 * - User summary statistics
 * - Prompt growth data for charts
 */

/**
 * Get admin summary statistics
 * This function handles GET /analytics/admin-summary
 * Admin only - returns overall platform statistics
 */
async function getAdminSummary(req, res) {
  try {
    // Get the database instance from request
    const db = req.db;

    // Get reference to all collections
    const usersCollection = db.collection("user");
    const promptsCollection = db.collection("prompts");
    const reviewsCollection = db.collection("prompts"); // Reviews are embedded in prompts
    const bookmarksCollection = db.collection("bookmarks");
    const reportsCollection = db.collection("reports");
    const paymentsCollection = db.collection("payments");

    // Count total users
    const totalUsers = await usersCollection.countDocuments();

    // Count total prompts
    const totalPrompts = await promptsCollection.countDocuments();

    // Count approved prompts
    const approvedPrompts = await promptsCollection.countDocuments({
      status: "approved",
    });

    // Count pending prompts
    const pendingPrompts = await promptsCollection.countDocuments({
      status: "pending",
    });

    // Count rejected prompts
    const rejectedPrompts = await promptsCollection.countDocuments({
      status: "rejected",
    });

    // Count total reviews (sum of all reviews arrays in prompts)
    const prompts = await promptsCollection.find().toArray();
    const totalReviews = prompts.reduce(
      (sum, prompt) => sum + (prompt.reviews?.length || 0),
      0,
    );

    // Count total bookmarks
    const totalBookmarks = await bookmarksCollection.countDocuments();

    // Count total reports
    const totalReports = await reportsCollection.countDocuments();

    // Count total payments
    const totalPayments = await paymentsCollection.countDocuments();

    // Calculate total revenue
    const payments = await paymentsCollection.find().toArray();
    const totalRevenue = payments.reduce(
      (sum, payment) => sum + (payment.amount || 0),
      0,
    );

    // Count total copies
    const promptsWithCopies = await promptsCollection
      .find({ copyCount: { $gt: 0 } })
      .toArray();
    const totalCopies = promptsWithCopies.reduce(
      (sum, prompt) => sum + (prompt.copyCount || 0),
      0,
    );

    // Return summary statistics
    res.json({
      totalUsers,
      totalPrompts,
      approvedPrompts,
      pendingPrompts,
      rejectedPrompts,
      totalReviews,
      totalBookmarks,
      totalReports,
      totalPayments,
      totalRevenue,
      totalCopies,
    });
  } catch (error) {
    // Log the error for debugging
    console.error("Error getting admin summary:", error);

    // Return error response
    res.status(500).json({
      success: false,
      message: "Error retrieving admin summary",
      error: error.message,
    });
  }
}

/**
 * Get creator summary statistics
 * This function handles GET /analytics/creator-summary/:email
 * Returns statistics for a specific creator
 */
async function getCreatorSummary(req, res) {
  try {
    // Get the database instance from request
    const db = req.db;

    // Get reference to collections
    const promptsCollection = db.collection("prompts");
    const bookmarksCollection = db.collection("bookmarks");

    // Get creator email from route parameters
    const { email } = req.params;

    // Count total prompts by creator
    const totalPrompts = await promptsCollection.countDocuments({
      userEmail: email,
    });

    // Count approved prompts by creator
    const approvedPrompts = await promptsCollection.countDocuments({
      creatorId: email,
      status: "approved",
    });

    // Count pending prompts by creator
    const pendingPrompts = await promptsCollection.countDocuments({
      creatorId: email,
      status: "pending",
    });

    // Get all prompts by creator to calculate totals
    const prompts = await promptsCollection
      .find({ creatorId: email })
      .toArray();

    // Calculate total copies
    const totalCopies = prompts.reduce(
      (sum, prompt) => sum + (prompt.copyCount || 0),
      0,
    );

    // Calculate total reviews
    const totalReviews = prompts.reduce(
      (sum, prompt) => sum + (prompt.reviews?.length || 0),
      0,
    );

    // Get prompt IDs
    const promptIds = prompts.map((prompt) => prompt._id.toString());

    // Count total bookmarks for creator's prompts
    const totalBookmarks = await bookmarksCollection.countDocuments({
      promptId: { $in: promptIds },
    });

    // Return creator summary
    res.json({
      totalPrompts,
      approvedPrompts,
      pendingPrompts,
      totalCopies,
      totalReviews,
      totalBookmarks,
    });
  } catch (error) {
    // Log the error for debugging
    console.error("Error getting creator summary:", error);

    // Return error response
    res.status(500).json({
      success: false,
      message: "Error retrieving creator summary",
      error: error.message,
    });
  }
}

/**
 * Get user summary statistics
 * This function handles GET /analytics/user-summary/:email
 * Returns statistics for a specific user
 */
async function getUserSummary(req, res) {
  try {
    // Get the database instance from request
    const db = req.db;

    // Get reference to collections
    const promptsCollection = db.collection("prompts");
    const bookmarksCollection = db.collection("bookmarks");

    // Get user email from route parameters
    const { email } = req.params;
    console.log("email", email);

    // Count total bookmarks by user
    const totalBookmarks = await bookmarksCollection.countDocuments({
      userEmail: email,
    });

    const reviews = await promptsCollection
      .aggregate([
        { $unwind: "$reviews" },

        { $match: { "reviews.userEmail": email } },

        {
          $project: {
            _id: 0,
            promptId: "$_id",
            promptTitle: "$title",
            promptCategory: "$category",
            review: "$reviews",
          },
        },

        { $sort: { "review.createdAt": -1 } },
      ])
      .toArray();

    // Return user summary
    res.status(200).json({
      success: true,
      data: {
        totalBookmarks,
        reviews,
        totalReviews: reviews.length,
      },
    });
  } catch (error) {
    // Log the error for debugging
    console.error("Error getting user summary:", error);

    // Return error response
    res.status(500).json({
      success: false,
      message: "Error retrieving user summary",
      error: error.message,
    });
  }
}

/**
 * Get prompt growth data for charts
 * This function handles GET /analytics/prompt-growth
 * Returns monthly prompt creation data for the last 6 months
 */
async function getPromptGrowth(req, res) {
  try {
    // Get the database instance from request
    const db = req.db;

    // Get reference to prompts collection
    const collection = db.collection("prompts");

    // Calculate date range (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    // Use aggregation to group prompts by month
    const pipeline = [
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 },
      },
    ];

    const growthData = await collection.aggregate(pipeline).toArray();

    // Format the data for frontend
    const formattedData = growthData.map((item) => ({
      month: `${item._id.year}-${String(item._id.month).padStart(2, "0")}`,
      count: item.count,
    }));

    // Return growth data
    res.json(formattedData);
  } catch (error) {
    // Log the error for debugging
    console.error("Error getting prompt growth:", error);

    // Return error response
    res.status(500).json({
      success: false,
      message: "Error retrieving prompt growth data",
      error: error.message,
    });
  }
}

/**
 * Get top creators
 * This function handles GET /analytics/top-creators
 * Returns top creators by prompt count and copies
 */
async function getTopCreators(req, res) {
  try {
    // Get the database instance from request
    const db = req.db;

    // Get reference to prompts collection
    const collection = db.collection("prompts");

    // Use aggregation to get top creators
    const pipeline = [
      {
        $group: {
          _id: "$creatorId",
          totalPrompts: { $sum: 1 },
          totalCopies: { $sum: "$copyCount" },
          totalReviews: { $sum: { $size: "$reviews" } },
        },
      },
      {
        $sort: { totalCopies: -1 },
      },
      {
        $limit: 10,
      },
    ];

    const topCreators = await collection.aggregate(pipeline).toArray();

    // Return top creators
    res.json(topCreators);
  } catch (error) {
    // Log the error for debugging
    console.error("Error getting top creators:", error);

    // Return error response
    res.status(500).json({
      success: false,
      message: "Error retrieving top creators",
      error: error.message,
    });
  }
}

/**
 * Get featured prompts for homepage
 * This function handles GET /analytics/featured-prompts
 * Returns featured prompts (approved and marked as featured)
 */
async function getFeaturedPrompts(req, res) {
  try {
    // Get the database instance from request
    const db = req.db;

    // Get reference to prompts collection
    const collection = db.collection("prompts");

    // Get featured prompts
    const featuredPrompts = await collection
      .find({ featured: true, status: "approved" })
      .sort({ copyCount: -1 })
      .limit(6)
      .toArray();

    // If no featured prompts, get latest approved prompts
    if (featuredPrompts.length === 0) {
      const latestPrompts = await collection
        .find({ status: "approved" })
        .sort({ createdAt: -1 })
        .limit(6)
        .toArray();

      return res.json(latestPrompts);
    }

    // Return featured prompts
    res.json(featuredPrompts);
  } catch (error) {
    // Log the error for debugging
    console.error("Error getting featured prompts:", error);

    // Return error response
    res.status(500).json({
      success: false,
      message: "Error retrieving featured prompts",
      error: error.message,
    });
  }
}

// Export all controller functions
module.exports = {
  getAdminSummary,
  getCreatorSummary,
  getUserSummary,
  getPromptGrowth,
  getTopCreators,
  getFeaturedPrompts,
};
