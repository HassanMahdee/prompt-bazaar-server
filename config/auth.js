// config/auth.js
import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Connect to MongoDB using the native client
const client = new MongoClient(process.env.MONGODB_URI);
const db = client.db();

export const auth = betterAuth({
  // 1. Connect Better Auth to MongoDB
  database: mongodbAdapter(db, {
    client: client, // Providing the client automatically enables secure database transactions
  }),

  // 2. Enable Email & Password Sign Up / Sign In
  emailAndPassword: {
    enabled: true,
    autoSignIn: true, // Automatically logs the user in right after signing up
  },

  // 3. Configure Google Social Login
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
  },

  // 4. Enforce Custom Role Rule for All Users (Including Social Login)
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "user", // Automatically assigns 'user' role to every new sign up
        input: false, // CRITICAL: Prevents attackers from forging a custom role during requests
      },
    },
  },

  // Optional: Boosts database speed by optimizing queries across multiple collections
  experimental: {
    joins: true,
  },
});
