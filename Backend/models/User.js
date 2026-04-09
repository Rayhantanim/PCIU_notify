const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ["student", "teacher", "staff"],
    required: true,
  },

  firstName: String,
  lastName: String,

  email: {
    type: String,
    required: true,
    unique: true,
  },

  phone: String,
  password: {
    type: String,
    required: true,
  },

  department: String,
  section: String,

  studentId: String,
  teacherId: String,
  staffId: String,

  shortName: String,
  dob: Date,

}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);