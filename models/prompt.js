const mongoose = require("mongoose");

const promptSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true, // This holds the actual AI prompt text strings
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    aiTool: {
      type: String,
      required: true, // e.g., 'ChatGPT', 'Midjourney', 'Claude'
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    difficulty: {
      type: String,
      enum: ["Beginner", "Intermediate", "Pro"],
      required: true,
    },
    thumbnailImage: {
      type: String,
      required: true,
    },
    visibility: {
      type: String,
      enum: ["public", "private"],
      default: "public",
    },
    copyCount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // References the User model overlaying Better-Auth's collection
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Prompt", promptSchema);
