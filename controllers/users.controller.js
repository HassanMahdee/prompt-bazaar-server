/**
 * Users Controller
 * Handles all user-related operations including:
 * - User registration
 * - Getting user role
 * - Updating user role (admin only)
 * - Getting all users (admin only)
 * - Deleting user (admin only)
 */

/**
 * Create or update user
 * This function handles POST /users
 * It creates a new user or returns existing user if email already exists
 * Default role is 'user' for new registrations
 */
async function createOrUpdateUser(req, res) {
  try {
    // Get the users collection from the database
    const db = req.db;
    const usersCollection = db.collection('user');
    
    // Get user data from request body
    const user = req.body;
    
    // Set default role to 'user' if not provided
    user.role = user.role || 'user';
    
    // Set default subscription to 'free' if not provided
    user.subscription = user.subscription || 'free';
    
    // Set creation timestamp if new user
    user.createdAt = new Date();
    
    // Check if user already exists by email
    const existingUser = await usersCollection.findOne({ email: user.email });
    
    if (existingUser) {
      // Return existing user without modifying
      return res.json({ 
        message: 'User already exists', 
        user: existingUser 
      });
    }
    
    // Insert new user into database
    const result = await usersCollection.insertOne(user);
    
    // Return success response with the created user
    res.json({ 
      message: 'User created successfully', 
      user: { ...user, _id: result.insertedId } 
    });
  } catch (error) {
    // Log the error for debugging
    console.error('Error creating/updating user:', error);
    
    // Return error response
    res.status(500).json({ message: 'Error creating user', error: error.message });
  }
}

/**
 * Get all users
 * This function handles GET /users
 * Admin only - returns all users in the database
 */
async function getAllUsers(req, res) {
  try {
    // Get the users collection from the database
    const db = req.db;
    const usersCollection = db.collection('user');
    
    // Get all users from database
    const users = await usersCollection.find().toArray();
    
    // Return users array
    res.json(users);
  } catch (error) {
    // Log the error for debugging
    console.error('Error getting all users:', error);
    
    // Return error response
    res.status(500).json({ message: 'Error retrieving users', error: error.message });
  }
}

/**
 * Get user role by email
 * This function handles GET /users/:email/role
 * Returns the role of a specific user
 */
async function getUserRole(req, res) {
  try {
    // Get the users collection from the database
    const db = req.db;
    const usersCollection = db.collection('user');
    
    // Get email from route parameters
    const { email } = req.params;
    
    // Find user by email and return only the role field
    const user = await usersCollection.findOne(
      { email },
      { projection: { role: 1, subscription: 1, _id: 0 } }
    );
    
    // Return user role
    res.json(user);
  } catch (error) {
    // Log the error for debugging
    console.error('Error getting user role:', error);
    
    // Return error response
    res.status(500).json({ message: 'Error retrieving user role', error: error.message });
  }
}

/**
 * Update user role
 * This function handles PATCH /users/:id/role
 * Admin only - updates the role of a specific user
 */
async function updateUserRole(req, res) {
  try {
    // Get the users collection from the database
    const db = req.db;
    const usersCollection = db.collection('user');
    
    // Get user ID from route parameters
    const { id } = req.params;
    
    // Get new role from request body
    const { role } = req.body;
    
    // Convert string ID to MongoDB ObjectId
    const { ObjectId } = require('mongodb');
    const objectId = new ObjectId(id);
    
    // Update user role in database
    const result = await usersCollection.updateOne(
      { _id: objectId },
      { $set: { role } }
    );
    
    // Return update result
    res.json(result);
  } catch (error) {
    // Log the error for debugging
    console.error('Error updating user role:', error);
    
    // Return error response
    res.status(500).json({ message: 'Error updating user role', error: error.message });
  }
}

/**
 * Delete user
 * This function handles DELETE /users/:id
 * Admin only - deletes a user from the database
 */
async function deleteUser(req, res) {
  try {
    // Get the users collection from the database
    const db = req.db;
    const usersCollection = db.collection('user');
    
    // Get user ID from route parameters
    const { id } = req.params;
    
    // Convert string ID to MongoDB ObjectId
    const { ObjectId } = require('mongodb');
    const objectId = new ObjectId(id);
    
    // Delete user from database
    const result = await usersCollection.deleteOne({ _id: objectId });
    
    // Return delete result
    res.json({ message: 'User deleted successfully', result });
  } catch (error) {
    // Log the error for debugging
    console.error('Error deleting user:', error);
    
    // Return error response
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
}

/**
 * Get user profile
 * This function handles GET /users/profile/:email
 * Returns the profile information of a specific user
 */
async function getUserProfile(req, res) {
  try {
    // Get the users collection from the database
    const db = req.db;
    const usersCollection = db.collection('user');
    
    // Get email from route parameters
    const { email } = req.params;
    
    // Find user by email
    const user = await usersCollection.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Count total prompts created by this user
    const promptsCollection = db.collection('prompts');
    const totalPrompts = await promptsCollection.countDocuments({ creatorId: email });
    
    // Return user profile with prompt count
    res.json({
      ...user,
      totalPrompts
    });
  } catch (error) {
    // Log the error for debugging
    console.error('Error getting user profile:', error);
    
    // Return error response
    res.status(500).json({ message: 'Error retrieving user profile', error: error.message });
  }
}

/**
 * Update user subscription
 * This function handles PATCH /users/:email/subscription
 * Updates the subscription status of a user (free/premium)
 * Called after successful Stripe payment
 */
async function updateUserSubscription(req, res) {
  try {
    // Get the users collection from the database
    const db = req.db;
    const usersCollection = db.collection('user');
    
    // Get email from route parameters
    const { email } = req.params;
    
    // Get subscription status from request body
    const { subscription } = req.body;
    
    // Update user subscription in database
    const result = await usersCollection.updateOne(
      { email },
      { $set: { subscription, subscriptionUpdatedAt: new Date() } }
    );
    
    // Return update result
    res.json({ message: 'Subscription updated successfully', result });
  } catch (error) {
    // Log the error for debugging
    console.error('Error updating user subscription:', error);
    
    // Return error response
    res.status(500).json({ message: 'Error updating subscription', error: error.message });
  }
}

// Export all controller functions
module.exports = {
  createOrUpdateUser,
  getAllUsers,
  getUserRole,
  updateUserRole,
  deleteUser,
  getUserProfile,
  updateUserSubscription
};
