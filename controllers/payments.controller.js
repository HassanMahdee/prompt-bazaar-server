// Import Stripe for payment processing
const stripe = require("../lib/stripe");

/**
 * Payments Controller
 * Handles all payment-related operations including:
 * - Create Stripe checkout session
 * - Handle payment success
 * - Get all payments (admin only)
 */

/**
 * Create Stripe checkout session
 * This function handles POST /payment-checkout-session
 * Creates a Stripe checkout session for premium subscription
 */

/**
 * Handle payment success
 * This function handles POST /payment-success
 * Verifies payment and updates user subscription to premium
 */
async function handlePaymentSuccess(req, res) {
  try {
    // Get the database instance from request
    const db = req.db;

    // Get reference to the payments and users collections
    const paymentsCollection = db.collection("payments");
    const usersCollection = db.collection("user");

    // Get session ID from query parameters
    const sessionId = req.query.sessionid;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: "Session ID is required",
      });
    }

    // Retrieve the Stripe session
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // Get the transaction ID (payment intent)
    const transactionId = session.payment_intent;

    // Check if payment already exists in database (prevent duplicates)
    const existingPayment = await paymentsCollection.findOne({
      transactionId,
    });

    if (existingPayment) {
      return res.json({
        success: true,
        message: "Payment already processed",
        transactionId,
      });
    }

    // Get user email from session metadata
    const userEmail = session.customer_email;
    console.log("User email from session metadata:", userEmail);

    // Find the user
    const user = await usersCollection.findOne({ email: userEmail });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update user subscription to premium
    await usersCollection.updateOne(
      { email: userEmail },
      {
        $set: {
          subscription: "premium",
          subscriptionUpdatedAt: new Date(),
        },
      },
    );

    // Save payment record
    const payment = {
      amount: session.amount_total / 100, // Convert from cents to dollars
      currency: session.currency,
      customerEmail: session.customer_email,
      transactionId: session.payment_intent,
      paymentStatus: session.payment_status,
      paidAt: new Date(),
    };

    console.log("Saving payment record:", payment);

    const paymentResult = await paymentsCollection.insertOne(payment);
    console.log("Payment record saved:", paymentResult);

    // Return success response
    res.json({
      success: true,
      message: "Payment successful",
      transactionId,
      paymentInfo: { ...payment, _id: paymentResult.insertedId },
    });
  } catch (error) {
    // Log the error for debugging
    console.error("Error handling payment success:", error);

    // Return error response
    res.status(500).json({
      success: false,
      message: "Error processing payment",
      error: error.message,
    });
  }
}

/**
 * Get all payments
 * This function handles GET /payments
 * Admin only - returns all payment records
 */
async function getAllPayments(req, res) {
  try {
    // Get the database instance from request
    const db = req.db;

    // Get reference to the payments collection
    const collection = db.collection("payments");

    // Get all payments
    const payments = await collection.find().sort({ paidAt: -1 }).toArray();

    // Return payments
    res.json(payments);
  } catch (error) {
    // Log the error for debugging
    console.error("Error getting all payments:", error);

    // Return error response
    res.status(500).json({
      success: false,
      message: "Error retrieving payments",
      error: error.message,
    });
  }
}

/**
 * Get user's payment history
 * This function handles GET /payments/history
 * Returns payment history for the logged-in user
 */
async function getUserPaymentHistory(req, res) {
  try {
    // Get the database instance from request
    const db = req.db;

    // Get reference to the payments collection
    const collection = db.collection("payments");

    // Get user email from request (set by verifyToken middleware)
    const userEmail = req.user.email;

    // Get user's payments
    const payments = await collection
      .find({ customerEmail: userEmail })
      .sort({ paidAt: -1 })
      .toArray();

    // Return payments
    res.json(payments);
  } catch (error) {
    // Log the error for debugging
    console.error("Error getting user payment history:", error);

    // Return error response
    res.status(500).json({
      success: false,
      message: "Error retrieving payment history",
      error: error.message,
    });
  }
}

// Export all controller functions
module.exports = {
  handlePaymentSuccess,
  getAllPayments,
  getUserPaymentHistory,
};
