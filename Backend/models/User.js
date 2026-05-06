const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  firebaseUid: { type: String, unique: true, sparse: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true }, // Only declare once!
  password: { type: String },
  phone: { type: String },
  dob: { type: String },
  role: { type: String, enum: ["student", "teacher", "staff"], default: "student" },
  
  // Student specific
  studentId: { type: String, unique: true, sparse: true },
  department: { type: String },
  section: { type: String },
  
  // Teacher specific
  teacherId: { type: String, unique: true, sparse: true },
  shortName: { type: String },
  
  // Staff specific
  staffId: { type: String, unique: true, sparse: true },
  
  // Email verification fields
  verified: { type: Boolean, default: false },
  verifyToken: String,
  verifyExpiry: Date,
  resetToken: String,
  resetExpiry: Date,
  
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", UserSchema);