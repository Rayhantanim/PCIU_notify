
const mongoose = require("mongoose");

const noticeSchema = new mongoose.Schema({
  title: String,
  description: String,
  category: String,
  audience: [String],
  department: String,
  section: String,
  priority: String,
  isPinned: Boolean,
  expiryDate: Date,
  attachment: String, // for now
}, { timestamps: true });

module.exports = mongoose.model("Notice", noticeSchema);