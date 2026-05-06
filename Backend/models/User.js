const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
<<<<<<< HEAD
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
=======
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
  
  // Student specific
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
>>>>>>> 6df186236f605aea63b8a2fe8ad4d9c89714729b
  
  // Teacher specific
  teacherId: { 
    type: String, 
    unique: true, 
    sparse: true 
  },
  shortName: { 
    type: String 
  },
  
  // Staff specific
  staffId: { 
    type: String, 
    unique: true, 
    sparse: true 
  },
  
<<<<<<< HEAD
  // Email verification fields
  verified: { type: Boolean, default: false },
  verifyToken: String,
  verifyExpiry: Date,
  resetToken: String,
  resetExpiry: Date,
  
  createdAt: { type: Date, default: Date.now },
=======
  // Common fields
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
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true // This automatically manages createdAt and updatedAt
>>>>>>> 6df186236f605aea63b8a2fe8ad4d9c89714729b
});

// Remove duplicate email field (line 27 had duplicate)
// Index for better query performance
UserSchema.index({ role: 1 });
UserSchema.index({ department: 1, section: 1 });
UserSchema.index({ studentId: 1 });
UserSchema.index({ teacherId: 1 });
UserSchema.index({ staffId: 1 });

module.exports = mongoose.model("User", UserSchema);





// const mongoose = require("mongoose");

// const UserSchema = new mongoose.Schema({
//   firebaseUid: { type: String, unique: true, sparse: true },
//   firstName: { type: String, required: true },
//   lastName: { type: String, required: true },
//   email: { type: String, required: true, unique: true },
//   password: { type: String },
//   phone: { type: String },
//   dob: { type: String },
//   role: { type: String, enum: ["student", "teacher", "staff"], default: "student" },
  
//   // Student specific
//   studentId: { type: String, unique: true, sparse: true },
//   department: { type: String },
//   section: { type: String },
//     email: { type: String, required: true },
  
//   // Teacher specific
//   teacherId: { type: String, unique: true, sparse: true },
//   shortName: { type: String },
  
//   // Staff specific
//   staffId: { type: String, unique: true, sparse: true },
  
//   createdAt: { type: Date, default: Date.now },
// });

// module.exports = mongoose.model("User", UserSchema);