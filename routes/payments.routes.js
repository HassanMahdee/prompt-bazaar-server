// Import Express framework
const express = require("express");

// Import all controller functions
const {
  createCheckoutSession,
  handlePaymentSuccess,
  getAllPayments,
  getUserPaymentHistory,
} = require("../controllers/payments.controller");
const { verifyToken, verifyAdmin, verifyCreator } = require("../utils/auth");

// Create a new router instance
const router = express.Router();

/**
 * POST /payment-checkout-session
 * Create Stripe checkout session
 */
// router.post("/payment-checkout-session", createCheckoutSession);

/**
 * POST /payment-success
 * Handle payment success
 */
router.post("/payment-success", verifyToken, handlePaymentSuccess);

/**
 * GET /payments
 * Get all payments
 */
router.get("/", verifyToken, verifyAdmin, getAllPayments);

/**
 * GET /payments/history
 * Get user's payment history
 */
router.get("/history", getUserPaymentHistory);

// Export the router
module.exports = router;
