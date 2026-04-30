const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema({
  noticeId: { type: mongoose.Schema.Types.ObjectId, ref: "Notice" },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ["notice", "staff-notice", "alert"], default: "notice" },
  read: { type: Boolean, default: false },
  readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  createdBy: { type: String },
  role: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Notification", NotificationSchema);