const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    // Reference to standard MongoDB Prompt ObjectId
    promptId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Prompt",
      required: true,
    },
    // Reference to Better-Auth custom User string ID
    reportedBy: {
      type: String,
      ref: "User",
      required: true,
    },
    reason: {
      type: String,
      enum: ["Inappropriate Content", "Spam", "Copyright Violation"],
      required: true,
    },
    description: {
      type: String,
      trim: true,
      default: "", // Makes field safe and optional if omitted from the API payload
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Report", reportSchema);
