const Prompt = require("../models/prompt");

// @desc    Get all prompts with pagination, advanced search, filtering, and sorting
// @route   GET /api/prompts
// @access  Public
const getPrompts = async (req, res) => {
  try {
    // 1. Parsing Query Parameters with Defensively Handled Fallbacks
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 6;
    const skip = (page - 1) * limit;

    const { search, category, aiTool, difficulty, sortBy } = req.query;

    // 2. Building the Dynamic Query Object
    let query = {
      status: "approved", // Marketplace safety: only show approved items
      visibility: "public", // Privacy safety: exclude private drafts
    };

    // Text Search Rules (Applies to Title, Tags, and target AI Engine)
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { aiTool: { $regex: search, $options: "i" } },
        { tags: { $regex: search, $options: "i" } },
      ];
    }

    // Strict Filters
    if (category) query.category = category;
    if (aiTool) query.aiTool = aiTool;
    if (difficulty) query.difficulty = difficulty;

    // 3. Defining Sort Mappings
    let sortOption = { createdAt: -1 }; // Default: Latest
    if (sortBy === "popular" || sortBy === "copied") {
      sortOption = { copyCount: -1 };
    } else if (sortBy === "latest") {
      sortOption = { createdAt: -1 };
    }

    // 4. Database Execution
    const totalPrompts = await Prompt.countDocuments(query);
    const prompts = await Prompt.find(query)
      .populate("creatorId", "name image email") // Cross-reference matching User strings safely
      .sort(sortOption)
      .skip(skip)
      .limit(limit);

    // 5. Unified Normalized Response Block
    res.status(200).json({
      success: true,
      count: prompts.length,
      meta: {
        totalPrompts,
        currentPage: page,
        totalPages: Math.ceil(totalPrompts / limit),
        hasNextPage: page * limit < totalPrompts,
        hasPrevPage: page > 1,
      },
      data: prompts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error fetching marketplace prompts",
      error: error.message,
    });
  }
};

// @desc    Get platform-wide statistics using an aggregation pipeline
// @route   GET /api/prompts/analytics
// @access  Public/Admin
const getAnalytics = async (req, res) => {
  try {
    const stats = await Prompt.aggregate([
      {
        $facet: {
          // Pipeline Segment 1: High-Level Global Quantities
          globalStats: [
            {
              $group: {
                _id: null,
                totalPrompts: { $sum: 1 },
                totalCopies: { $sum: "$copyCount" },
              },
            },
          ],
          // Pipeline Segment 2: Categorical Structural Distribution
          categoryStats: [
            {
              $group: {
                _id: "$category",
                totalPrompts: { $sum: 1 },
                cumulativeCopies: { $sum: "$copyCount" },
              },
            },
            { $sort: { totalPrompts: -1 } },
          ],
        },
      },
    ]);

    // Destructure facet results with reliable fallback vectors
    const globalResult = stats[0]?.globalStats[0] || {
      totalPrompts: 0,
      totalCopies: 0,
    };
    const categoryResult = stats[0]?.categoryStats || [];

    res.status(200).json({
      success: true,
      data: {
        totalPrompts: globalResult.totalPrompts,
        totalCopies: globalResult.totalCopies,
        categories: categoryResult,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Database aggregation pipeline failure",
      error: error.message,
    });
  }
};

module.exports = {
  getPrompts,
  getAnalytics,
};
