const mongoose = require("mongoose");

const ReportSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  title: String,
  fileName: String,
  contentType: String,
  s3Key: String, // e.g. reports/<uuid>.pdf
  size: Number,
  status: { type: String, enum: ["pending", "uploaded"], default: "pending" },
  createdAt: { type: Date, default: Date.now },
  thumbnailKey: { type: String },
});

module.exports = mongoose.model("Report", ReportSchema);
