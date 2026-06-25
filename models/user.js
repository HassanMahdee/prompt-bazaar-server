const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    // We name this 'image' to match Better-Auth's native field name
    image: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      enum: ["user", "creator", "admin"],
      default: "user",
    },
    subscriptionStatus: {
      type: String,
      enum: ["free", "premium"],
      default: "free",
    },
    // Better-Auth uses a default boolean field for email verification state
    emailVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    // CRITICAL: Forces Mongoose to read/write directly from Better-Auth's collection
    collection: "user",
  },
);

module.exports = mongoose.model("User", userSchema);
