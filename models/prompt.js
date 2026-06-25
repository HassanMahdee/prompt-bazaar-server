// models/Prompt.js (Corrected Type Mapping)
const mongoose = require("mongoose");

const promptSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    category: { type: String, required: true, trim: true },
    aiTool: { type: String, required: true, trim: true },
    tags: { type: [String], default: [] },
    difficulty: {
      type: String,
      enum: ["Beginner", "Intermediate", "Pro"],
      required: true,
    },
    thumbnailImage: { type: String, required: true },
    visibility: {
      type: String,
      enum: ["public", "private"],
      default: "public",
    },
    copyCount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    // 🔍 AUDIT FIX: Changed from ObjectId to String to stay perfectly compatible with Better-Auth
    creatorId: {
      type: String,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Prompt", promptSchema);
