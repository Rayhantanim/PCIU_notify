const mongoose = require("mongoose");

const NoticeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  audience: [{ type: String, enum: ["students", "teachers", "staff", "all"] }], // Array of strings
  department: { type: String },
  section: { type: String },
  priority: { type: String, enum: ["low", "medium", "high", "urgent"], default: "medium" },
  isPinned: { type: Boolean, default: false },
  expiryDate: { type: Date },
  attachment: {
    filename: String,
    originalName: String,
    path: String,
    size: Number,
    mimetype: String,
  },

  likes: [{
     type: String,
    ref: 'User'
  }],
  
   comments: [{
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    text: { type: String, required: true },
    userId: { type: String, required: true }, // Change to String
    userName: { type: String },
    userEmail: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date }
  }],
  
  createdBy: { type: String, required: true },
  createdByRole: { type: String },
  role: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
  
}, { timestamps: true });

module.exports = mongoose.model("Notice", NoticeSchema);