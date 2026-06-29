// Import Express framework
const express = require("express");

// Import all controller functions
const {
  createOrUpdateUser,
  getAllUsers,
  getUserRole,
  updateUserRole,
  deleteUser,
  getUserProfile,
  updateUserSubscription,
} = require("../controllers/users.controller");
const { verifyToken, verifyAdmin, verifyCreator } = require("../utils/auth");

// Create a new router instance
const router = express.Router();

/**
 * POST /users
 * Create or update a user
 */
router.post("/", verifyToken, verifyAdmin, createOrUpdateUser);

/**
 * GET /users
 * Get all users
 */
router.get("/", verifyToken, verifyAdmin, getAllUsers);

/**
 * GET /users/:email/role
 * Get user role by email
 */
router.get("/:email/role", verifyToken, getUserRole);

/**
 * GET /users/profile/:email
 * Get user profile
 */
router.get("/profile/:email", getUserProfile);

/**
 * PATCH /users/:id/role
 * Update user role
 */
router.patch("/:id/role", verifyToken, verifyAdmin, updateUserRole);

/**
 * PATCH /users/:email/subscription
 * Update user subscription
 */
router.patch("/:email/subscription", updateUserSubscription);

/**
 * DELETE /users/:id
 * Delete a user
 */
router.delete("/:id", verifyToken, verifyAdmin, deleteUser);

// Export the router
module.exports = router;
