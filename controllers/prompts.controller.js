// Import the validation functions
const { validatePrompt, validateReview } = require("../utils/validatePrompt");

// Import upload middleware for image uploads
const upload = require("../middleware/upload");

/**
 * Get all prompts with optional filtering and sorting
 * This function handles GET /api/prompts
 * It supports query parameters for filtering and sorting
 */
async function getAllPrompts(req, res) {
  try {
    // Get the database instance from request
    const db = req.db;

    // Get reference to the prompts collection
    const collection = db.collection("prompts");

    // Build the query filter object
    // Start with an empty filter (no filtering)
    const filter = { status: "approved" }; // Only show approved prompts by default

    // Get query parameters from the request
    const {
      category,
      difficulty,
      aiTool,
      status,
      visibility,
      search,
      sort,
      featured,
      page = 1,
      limit = 10,
    } = req.query;

    // Add category filter if provided
    if (category && category !== "undefined") {
      filter.category = category;
    }

    // Add difficulty filter if provided
    if (difficulty && difficulty !== "undefined") {
      filter.difficultyLevel = difficulty;
    }

    // Add aiTool filter if provided
    if (aiTool && aiTool !== "undefined") {
      filter.aiTool = aiTool;
    }

    // Add status filter if provided (override default)
    if (status && status !== "undefined") {
      filter.status = status;
    }

    // Add visibility filter if provided
    if (visibility && visibility !== "undefined") {
      filter.visibility = visibility;
    }

    if (featured && featured !== "undefined") {
      filter.featured = featured; // Convert string to boolean
    }

    // Add search filter if provided (searches in title, tags, and aiTool)
    if (search && search !== "undefined") {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { tags: { $regex: search, $options: "i" } },
        { aiTool: { $regex: search, $options: "i" } },
      ];
    }

    // Build the sort object
    // Default sort is by createdAt in descending order (newest first)
    let sortOption = { createdAt: -1 };

    // Override sort based on query parameter
    if (sort === "latest") {
      // Sort by createdAt descending (newest first)
      sortOption = { createdAt: -1 };
    } else if (sort === "mostCopied") {
      // Sort by copyCount descending (most copied first)
      sortOption = { copyCount: -1 };
    } else if (sort === "mostPopular") {
      // Sort by average rating (most popular first)
      sortOption = { "reviews.rating": -1 };
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute the query with filter, sort, and pagination
    const prompts = await collection
      .find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();

    // Get total count for pagination info
    const total = await collection.countDocuments(filter);

    // Return the prompts with 200 status
    res.status(200).json({
      success: true,
      count: prompts.length,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      data: prompts,
    });
  } catch (error) {
    // Log the error for debugging
    console.error("Error getting all prompts:", error);

    // Return error response with 500 status
    res.status(500).json({
      success: false,
      message: "Error retrieving prompts",
      error: error.message,
    });
  }
}

/**
 * Get a single prompt by ID
 * This function handles GET /api/prompts/:id
 */
async function getPromptById(req, res) {
  try {
    // Get the database instance from request
    const db = req.db;

    // Get reference to the prompts collection
    const collection = db.collection("prompts");

    // Get the prompt ID from the route parameter
    const { id } = req.params;

    // Convert the string ID to MongoDB ObjectId
    const { ObjectId } = require("mongodb");
    const objectId = new ObjectId(id);

    // Find the prompt by ID
    const prompt = await collection.findOne({ _id: objectId });

    // Check if prompt exists
    if (!prompt) {
      // Return 404 if prompt not found
      return res.status(404).json({
        success: false,
        message: "Prompt not found",
      });
    }

    // Check if prompt is private and user is not premium
    if (prompt.visibility === "private") {
      // Get user from request (set by verifyToken middleware)
      const userEmail = req.user?.email;

      if (userEmail) {
        // Check if user has premium subscription
        const usersCollection = db.collection("user");
        const user = await usersCollection.findOne({ email: userEmail });

        if (!user || user.subscription !== "premium") {
          // Return prompt with locked content
          return res.status(200).json({
            success: true,
            data: {
              ...prompt,
              content: null, // Hide content for non-premium users
              isLocked: true,
            },
          });
        }
      } else {
        // User not logged in
        return res.status(200).json({
          success: true,
          data: {
            ...prompt,
            content: null,
            isLocked: true,
          },
        });
      }
    }

    // Return the prompt with 200 status
    res.status(200).json({
      success: true,
      data: {
        ...prompt,
        isLocked: false,
      },
    });
  } catch (error) {
    // Log the error for debugging
    console.error("Error getting prompt by ID:", error);

    // Return error response with 500 status
    res.status(500).json({
      success: false,
      message: "Error retrieving prompt",
      error: error.message,
    });
  }
}

/**
 * Create a new prompt
 * This function handles POST /api/prompts
 */
async function createPrompt(req, res) {
  try {
    // Get the database instance from request
    const db = req.db;

    // Get reference to the prompts collection
    const collection = db.collection("prompts");

    // Get the prompt data from the request body
    const promptData = req.body;

    // Get user email from request (set by verifyToken middleware)
    // const userEmail = "admin@g.com";

    // Handle image upload if present
    // if (req.file) {
    //   promptData.image = req.file.filename;
    // }

    // Check if user is free tier and has exceeded 3 prompt limit
    const usersCollection = db.collection("user");
    const user = await usersCollection.findOne({ email: "admin@g.com" });

    if (user && user.subscription === "free") {
      const promptCount = await collection.countDocuments({
        creatorId: "admin@g.com",
      });
      if (promptCount >= 3) {
        return res.status(403).json({
          success: false,
          message:
            "Free users can only create up to 3 prompts. Upgrade to premium for unlimited prompts.",
        });
      }
    }

    // Validate the prompt data
    const validation = validatePrompt(promptData);

    // Check if validation failed
    if (!validation.isValid) {
      // Return 400 with validation errors
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.errors,
      });
    }

    // Automatically set default values
    promptData.copyCount = 0;
    promptData.status = "pending";
    promptData.createdAt = new Date();
    promptData.updatedAt = new Date();

    // If tags is not provided, set it to empty array
    if (!promptData.tags) {
      promptData.tags = [];
    }

    // If reviews is not provided, set it to empty array
    if (!promptData.reviews) {
      promptData.reviews = [];
    }

    // Insert the new prompt into the collection
    const result = await collection.insertOne(promptData);

    // Get the inserted prompt by its ID
    const insertedPrompt = await collection.findOne({ _id: result.insertedId });

    // Return the created prompt with 201 status
    res.status(201).json({
      success: true,
      message: "Prompt created successfully",
      data: insertedPrompt,
    });
  } catch (error) {
    // Log the error for debugging
    console.error("Error creating prompt:", error);

    // Return error response with 500 status
    res.status(500).json({
      success: false,
      message: "Error creating prompt",
      error: error.message,
    });
  }
}

/**
 * Update a prompt by ID
 * This function handles PATCH /api/prompts/:id
 */
async function updatePrompt(req, res) {
  try {
    // Get the database instance from request
    const db = req.db;

    // Get reference to the prompts collection
    const collection = db.collection("prompts");

    // Get the prompt ID from the route parameter
    const { id } = req.params;

    // Get the update data from the request body
    const updateData = req.body;

    // Convert the string ID to MongoDB ObjectId
    const { ObjectId } = require("mongodb");
    const objectId = new ObjectId(id);

    // Check if prompt exists
    const existingPrompt = await collection.findOne({ _id: objectId });

    if (!existingPrompt) {
      // Return 404 if prompt not found
      return res.status(404).json({
        success: false,
        message: "Prompt not found",
      });
    }

    // Check if user is the creator or admin
    // const userEmail = ""admin@g.com"";
    // if (existingPrompt.creatorId !== userEmail && req.user.role !== "admin") {
    //   return res.status(403).json({
    //     success: false,
    //     message: "You can only update your own prompts",
    //   });
    // }

    // Fields that should not be updated directly
    const restrictedFields = [
      "_id",
      "copyCount",
      "status",
      "createdAt",
      "reviews",
      "creatorId",
    ];

    // Remove restricted fields from updateData
    restrictedFields.forEach((field) => {
      delete updateData[field];
    });

    // Automatically update the updatedAt field
    updateData.updatedAt = new Date();

    // Update the prompt in the collection
    // $set operator updates only the specified fields
    const result = await collection.updateOne(
      { _id: objectId },
      { $set: updateData },
    );

    // Get the updated prompt
    const updatedPrompt = await collection.findOne({ _id: objectId });

    // Return the updated prompt with 200 status
    res.status(200).json({
      success: true,
      message: "Prompt updated successfully",
      data: updatedPrompt,
    });
  } catch (error) {
    // Log the error for debugging
    console.error("Error updating prompt:", error);

    // Return error response with 500 status
    res.status(500).json({
      success: false,
      message: "Error updating prompt",
      error: error.message,
    });
  }
}

/**
 * Delete a prompt by ID
 * This function handles DELETE /api/prompts/:id
 */
async function deletePrompt(req, res) {
  try {
    // Get the database instance from request
    const db = req.db;

    // Get reference to the prompts collection
    const collection = db.collection("prompts");

    // Get the prompt ID from the route parameter
    const { id } = req.params;

    // Convert the string ID to MongoDB ObjectId
    const { ObjectId } = require("mongodb");
    const objectId = new ObjectId(id);

    // Check if prompt exists
    const existingPrompt = await collection.findOne({ _id: objectId });

    if (!existingPrompt) {
      // Return 404 if prompt not found
      return res.status(404).json({
        success: false,
        message: "Prompt not found",
      });
    }

    // Check if user is the creator or admin
    // const userEmail = "admin@g.com";
    // if (existingPrompt.creatorId !== userEmail && req.user.role !== "admin") {
    //   return res.status(403).json({
    //     success: false,
    //     message: "You can only delete your own prompts",
    //   });
    // }

    // Delete the prompt from the collection
    const result = await collection.deleteOne({ _id: objectId });

    // Return success message with 200 status
    res.status(200).json({
      success: true,
      message: "Prompt deleted successfully",
    });
  } catch (error) {
    // Log the error for debugging
    console.error("Error deleting prompt:", error);

    // Return error response with 500 status
    res.status(500).json({
      success: false,
      message: "Error deleting prompt",
      error: error.message,
    });
  }
}

/**
 * Increment the copyCount of a prompt
 * This function handles PATCH /api/prompts/:id/copy
 */
async function incrementCopyCount(req, res) {
  try {
    // Get the database instance from request
    const db = req.db;

    // Get reference to the prompts collection
    const collection = db.collection("prompts");

    // Get the prompt ID from the route parameter
    const { id } = req.params;

    // Convert the string ID to MongoDB ObjectId
    const { ObjectId } = require("mongodb");
    const objectId = new ObjectId(id);

    // Check if prompt exists
    const existingPrompt = await collection.findOne({ _id: objectId });

    if (!existingPrompt) {
      // Return 404 if prompt not found
      return res.status(404).json({
        success: false,
        message: "Prompt not found",
      });
    }

    // Check if prompt is private and user is not premium
    if (existingPrompt.visibility === "private") {
      const usersCollection = db.collection("user");
      const user = await usersCollection.findOne({ email: "admin@g.com" });

      if (!user || user.subscription !== "premium") {
        return res.status(403).json({
          success: false,
          message: "Premium subscription required to copy private prompts",
        });
      }
    }

    // Increment copyCount by 1 using $inc operator
    const result = await collection.updateOne(
      { _id: objectId },
      { $inc: { copyCount: 1 } },
    );

    // Get the updated prompt
    const updatedPrompt = await collection.findOne({ _id: objectId });

    // Return the updated prompt with 200 status
    res.status(200).json({
      success: true,
      message: "Copy count incremented successfully",
      data: updatedPrompt,
    });
  } catch (error) {
    // Log the error for debugging
    console.error("Error incrementing copy count:", error);

    // Return error response with 500 status
    res.status(500).json({
      success: false,
      message: "Error incrementing copy count",
      error: error.message,
    });
  }
}

/**
 * Update the status of a prompt
 * This function handles PATCH /api/prompts/:id/status
 */
async function updatePromptStatus(req, res) {
  try {
    // Get the database instance from request
    const db = req.db;

    // Get reference to the prompts collection
    const collection = db.collection("prompts");

    // Get the prompt ID from the route parameter
    const { id } = req.params;

    // Get the new status and rejection feedback from the request body
    const { status, rejectionFeedback } = req.body;

    // Validate that status is provided
    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    // Validate that status is one of the allowed values
    const allowedStatuses = ["pending", "approved", "rejected"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be pending, approved, or rejected",
      });
    }

    // Convert the string ID to MongoDB ObjectId
    const { ObjectId } = require("mongodb");
    const objectId = new ObjectId(id);

    // Check if prompt exists
    const existingPrompt = await collection.findOne({ _id: objectId });

    if (!existingPrompt) {
      // Return 404 if prompt not found
      return res.status(404).json({
        success: false,
        message: "Prompt not found",
      });
    }

    // Build update object
    const updateData = {
      status: status,
      updatedAt: new Date(),
    };

    // Add rejection feedback if status is rejected
    if (status === "rejected" && rejectionFeedback) {
      updateData.rejectionFeedback = rejectionFeedback;
    }

    // Update the status and updatedAt
    const result = await collection.updateOne(
      { _id: objectId },
      { $set: updateData },
    );

    // Get the updated prompt
    const updatedPrompt = await collection.findOne({ _id: objectId });

    // Return the updated prompt with 200 status
    res.status(200).json({
      success: true,
      message: "Status updated successfully",
      data: updatedPrompt,
    });
  } catch (error) {
    // Log the error for debugging
    console.error("Error updating status:", error);

    // Return error response with 500 status
    res.status(500).json({
      success: false,
      message: "Error updating status",
      error: error.message,
    });
  }
}

/**
 * Add a review to a prompt
 * This function handles POST /api/prompts/:id/reviews
 */
async function addReview(req, res) {
  try {
    // Get the database instance from request
    const db = req.db;

    // Get reference to the prompts collection
    const collection = db.collection("prompts");

    // Get the prompt ID from the route parameter
    const { id } = req.params;

    // Get the review data from the request body
    const reviewData = req.body;

    // Add user email from request to review data
    reviewData.userEmail = "admin@g.com";

    // Validate the review data
    const validation = validateReview(reviewData);

    // Check if validation failed
    if (!validation.isValid) {
      // Return 400 with validation errors
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.errors,
      });
    }

    // Convert the string ID to MongoDB ObjectId
    const { ObjectId } = require("mongodb");
    const objectId = new ObjectId(id);

    // Check if prompt exists
    const existingPrompt = await collection.findOne({ _id: objectId });

    if (!existingPrompt) {
      // Return 404 if prompt not found
      return res.status(404).json({
        success: false,
        message: "Prompt not found",
      });
    }

    // Check if prompt is private and user is not premium
    if (existingPrompt.visibility === "private") {
      const usersCollection = db.collection("user");
      const user = await usersCollection.findOne({ email: "admin@g.com" });

      if (!user || user.subscription !== "premium") {
        return res.status(403).json({
          success: false,
          message: "Premium subscription required to review private prompts",
        });
      }
    }

    // Check if user has already reviewed this prompt
    const alreadyReviewed = existingPrompt.reviews?.some(
      (review) => review.userEmail === "admin@g.com",
    );

    if (alreadyReviewed) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this prompt",
      });
    }

    // Add createdAt timestamp to the review
    reviewData.createdAt = new Date();

    // Add the review to the reviews array using $push operator
    const result = await collection.updateOne(
      { _id: objectId },
      {
        $push: { reviews: reviewData },
        $set: { updatedAt: new Date() },
      },
    );

    // Get the updated prompt
    const updatedPrompt = await collection.findOne({ _id: objectId });

    // Return the updated prompt with 200 status
    res.status(200).json({
      success: true,
      message: "Review added successfully",
      data: updatedPrompt,
    });
  } catch (error) {
    // Log the error for debugging
    console.error("Error adding review:", error);

    // Return error response with 500 status
    res.status(500).json({
      success: false,
      message: "Error adding review",
      error: error.message,
    });
  }
}

/**
 * Get all prompts by creator ID
 * This function handles GET /api/prompts/creator/:creatorId
 */
async function getPromptsByCreator(req, res) {
  try {
    // Get the database instance from request
    const db = req.db;

    // Get reference to the prompts collection
    const collection = db.collection("prompts");

    // Get the creator ID from the route parameter
    const { creatorId } = req.params;

    // Find all prompts with the given creatorId
    // Convert cursor to array using toArray()
    const prompts = await collection.find({ creatorId }).toArray();

    // Return the prompts with 200 status
    res.status(200).json({
      success: true,
      count: prompts.length,
      data: prompts,
    });
  } catch (error) {
    // Log the error for debugging
    console.error("Error getting prompts by creator:", error);

    // Return error response with 500 status
    res.status(500).json({
      success: false,
      message: "Error retrieving prompts by creator",
      error: error.message,
    });
  }
}

/**
 * Feature a prompt (admin only)
 * This function handles PATCH /api/prompts/:id/feature
 * Admin can feature/unfeature prompts to show them on homepage
 */
async function featurePrompt(req, res) {
  try {
    // Get the database instance from request
    const db = req.db;

    // Get reference to the prompts collection
    const collection = db.collection("prompts");

    // Get the prompt ID from the route parameter
    const { id } = req.params;

    // Get the featured status from the request body
    const { featured } = req.body;

    // Convert the string ID to MongoDB ObjectId
    const { ObjectId } = require("mongodb");
    const objectId = new ObjectId(id);

    // Check if prompt exists
    const existingPrompt = await collection.findOne({ _id: objectId });

    if (!existingPrompt) {
      // Return 404 if prompt not found
      return res.status(404).json({
        success: false,
        message: "Prompt not found",
      });
    }

    // Update the featured status
    const result = await collection.updateOne(
      { _id: objectId },
      { $set: { featured, updatedAt: new Date() } },
    );

    // Get the updated prompt
    const updatedPrompt = await collection.findOne({ _id: objectId });

    // Return the updated prompt with 200 status
    res.status(200).json({
      success: true,
      message: "Prompt featured status updated successfully",
      data: updatedPrompt,
    });
  } catch (error) {
    // Log the error for debugging
    console.error("Error featuring prompt:", error);

    // Return error response with 500 status
    res.status(500).json({
      success: false,
      message: "Error featuring prompt",
      error: error.message,
    });
  }
}

// Export all controller functions so they can be used in routes
module.exports = {
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
};
