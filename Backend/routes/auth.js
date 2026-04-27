const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("../models/User");

// Register new user (firebaseUid is optional now)
router.post("/register", async (req, res) => {
  try {
    const { 
      firebaseUid, 
      email, 
      firstName, 
      lastName, 
      role, 
      password,
      phone,
      dob,
      department,
      section,
      studentId,
      teacherId,
      staffId,
      shortName
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password if provided
    let hashedPassword;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(password, salt);
    }

    // Create user data object
    const userData = {
      email,
      firstName,
      lastName,
      role: role || "student",
      phone,
      dob,
      password: hashedPassword,
    };

    // Add firebaseUid only if provided
    if (firebaseUid) {
      userData.firebaseUid = firebaseUid;
    }

    // Add role-specific fields
    if (role === "student") {
      userData.studentId = studentId;
      userData.department = department;
      userData.section = section;
    } else if (role === "teacher") {
      userData.teacherId = teacherId;
      userData.shortName = shortName;
      userData.department = department;
    } else if (role === "staff") {
      userData.staffId = staffId;
    }

    const user = new User(userData);
    await user.save();

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      userId: user._id,
      user: {
        _id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: err.message });
  }
});

// Get user by Firebase UID (optional)
router.get("/user/:firebaseUid", async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUid: req.params.firebaseUid });
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      user: {
        _id: user._id,
        firebaseUid: user.firebaseUid,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        department: user.department,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Login with email/password
router.post("/login", async (req, res) => {
  try {
    const { email, password, id } = req.body;

    let user;
    
    // Find user by email or ID
    if (id) {
      user = await User.findOne({ studentId: id });
    } else if (email) {
      user = await User.findOne({ email });
    }

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check password
    if (user.password) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
    } else if (!user.password && user.firebaseUid) {
      // User exists in Firebase but not in MongoDB
      return res.status(400).json({ message: "Please use Firebase authentication" });
    }

    res.json({
      success: true,
      user: {
        userId: user._id,
        firebaseUid: user.firebaseUid,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: err.message });
  }
});

// Check email availability
router.post("/check-email", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    res.json({ available: !user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all teachers
router.get("/teachers", async (req, res) => {
  try {
    const teachers = await User.find({ role: "teacher" }).select("firstName lastName email");
    res.json(teachers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;