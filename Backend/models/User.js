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
  // Add these fields to your existing user schema
resetPasswordToken: {
  type: String,
  default: null
},
resetPasswordExpiry: {
  type: Date,
  default: null
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
  },
isActive: {
  type: Boolean,
  default: true
},
deactivatedAt: {
  type: Date,
  default: null
},
resetToken: {
  type: String,
  default: null
},
resetExpiry: {
  type: Date,
  default: null
}
}, {
  timestamps: true  // Automatically adds createdAt and updatedAt
});

// Indexes for better query performance
// UserSchema.index({ role: 1 });
// UserSchema.index({ department: 1, section: 1 });
// UserSchema.index({ email: 1 });
// UserSchema.index({ studentId: 1 });
// UserSchema.index({ teacherId: 1 });
// UserSchema.index({ staffId: 1 });

module.exports = mongoose.model("User", UserSchema);