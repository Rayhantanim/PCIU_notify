const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  // Authentication fields
  firebaseUid: { 
    type: String, 
    unique: true, 
    sparse: true 
  },
  firstName: { 
    type: String, 
    required: true 
  },
  lastName: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true
  },
  password: { 
    type: String 
  },
  phone: { 
    type: String 
  },
  dob: { 
    type: String 
  },
  role: { 
    type: String, 
    enum: ["student", "teacher", "staff", "admin"], 
    default: "student" 
  },
  
  // Student specific fields
  studentId: { 
    type: String, 
    unique: true, 
    sparse: true 
  },
  department: { 
    type: String 
  },
  section: { 
    type: String 
  },

  // Teacher specific fields
  teacherId: { 
    type: String, 
    unique: true, 
    sparse: true 
  },
  shortName: { 
    type: String 
  },

  // Staff specific fields
  staffId: { 
    type: String, 
    unique: true, 
    sparse: true 
  },

  // Email verification fields
  verified: { 
    type: Boolean, 
    default: false 
  },
  verifyToken: String,
  verifyExpiry: Date,
  resetToken: String,
  resetExpiry: Date,

  // Additional common fields
  profilePicture: {
    type: String,
    default: ""
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true  // This automatically manages createdAt and updatedAt
});

// ✅ Only keep compound indexes (indexes on multiple fields)
// Remove all single-field indexes as they're already created by 'unique: true'
UserSchema.index({ role: 1 });
UserSchema.index({ department: 1, section: 1 });  // Compound index for queries filtering by both

module.exports = mongoose.model("User", UserSchema);