const mongoose = require("mongoose");

const bookmarkSchema = new mongoose.Schema(
  {
    // Reference to Better-Auth custom User string ID
    userId: {
      type: String,
      ref: "User",
      required: true,
    },
    // Reference to standard MongoDB Prompt ObjectId
    promptId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Prompt",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// 🔍 AUDIT FIX: Compound unique index prevents duplicate bookmark rows in the collection
bookmarkSchema.index({ userId: 1, promptId: 1 }, { unique: true });

module.exports = mongoose.model("Bookmark", bookmarkSchema);
