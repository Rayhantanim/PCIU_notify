const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
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