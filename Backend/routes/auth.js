const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const OTP = require("../models/OTP"); // You'll need to create this model

// ==================== REGISTER ====================
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

    // Check if ID already exists for students
    if (role === "student" && studentId) {
      const existingId = await User.findOne({ studentId });
      if (existingId) {
        return res.status(400).json({ message: "Student ID already exists" });
      }
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

// ==================== LOGIN ====================
router.post("/login", async (req, res) => {
  try {
    const { email, password, id } = req.body;

    let user;
    
    // Find user by email or ID
    if (id) {
      // Remove spaces from ID for comparison
      const cleanId = id.replace(/\s/g, "");
      user = await User.findOne({ 
        $or: [
          { studentId: cleanId },
          { teacherId: cleanId },
          { staffId: cleanId }
        ]
      });
    } else if (email) {
      user = await User.findOne({ email });
    }

    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: "Invalid credentials" 
      });
    }

    // Check password
    if (user.password) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ 
          success: false,
          message: "Invalid credentials" 
        });
      }
    } else if (!user.password && user.firebaseUid) {
      // User exists in Firebase but not in MongoDB
      return res.status(400).json({ 
        success: false,
        message: "Please use Firebase authentication" 
      });
    }

    // Generate simple token (you can use JWT here)
    const token = Buffer.from(`${user._id}:${Date.now()}`).toString('base64');

    res.json({
      success: true,
      token: token,
      user: {
        userId: user._id,
        _id: user._id,
        firebaseUid: user.firebaseUid,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        department: user.department,
        section: user.section,
        studentId: user.studentId,
        teacherId: user.teacherId,
        staffId: user.staffId,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
});

// ==================== CHECK EMAIL EXISTS ====================
router.post("/check-email", async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ exists: false });
    }
    
    const user = await User.findOne({ email: email.toLowerCase() });
    res.json({ exists: !!user });
  } catch (err) {
    console.error("Check email error:", err);
    res.status(500).json({ exists: false });
  }
});

// ==================== CHECK ID EXISTS ====================
router.post("/check-id", async (req, res) => {
  try {
    const { id } = req.body;
    
    if (!id) {
      return res.status(400).json({ exists: false });
    }
    
    const cleanId = id.replace(/\s/g, "");
    const user = await User.findOne({ 
      $or: [
        { studentId: cleanId },
        { teacherId: cleanId },
        { staffId: cleanId }
      ]
    });
    
    res.json({ exists: !!user });
  } catch (err) {
    console.error("Check ID error:", err);
    res.status(500).json({ exists: false });
  }
});

// ==================== FORGOT PASSWORD - SEND OTP ====================
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: "Email is required" 
      });
    }
    
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "Email not found" 
      });
    }
    
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP in database with expiration (10 minutes)
    await OTP.findOneAndUpdate(
      { email: email.toLowerCase() },
      { 
        otp, 
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        createdAt: new Date()
      },
      { upsert: true, new: true }
    );
    
    // TODO: Send email with OTP using nodemailer
    // For now, log the OTP for testing
    console.log(`OTP for ${email}: ${otp}`);
    
    // In production, uncomment and configure nodemailer:
    
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    
    await transporter.sendMail({
      from: '"PCIU Notify" <noreply@pciuniversity.com>',
      to: email,
      subject: 'Password Reset OTP',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Password Reset Request</h2>
          <p>You requested to reset your password. Use the following OTP to proceed:</p>
          <div style="background: #f3f4f6; padding: 15px; text-align: center; font-size: 24px; letter-spacing: 5px; font-weight: bold; border-radius: 8px;">
            ${otp}
          </div>
          <p style="color: #6b7280; font-size: 14px;">This OTP is valid for 10 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
          <hr style="margin: 20px 0;" />
          <p style="color: #9ca3af; font-size: 12px;">PCI University Notification System</p>
        </div>
      `
    });
    
    res.json({ 
      success: true, 
      message: "OTP sent to your email" 
    });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ 
      success: false, 
      message: "Failed to send OTP" 
    });
  }
});

// ==================== VERIFY OTP ====================
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    if (!email || !otp) {
      return res.status(400).json({ 
        success: false, 
        message: "Email and OTP are required" 
      });
    }
    
    const otpRecord = await OTP.findOne({ 
      email: email.toLowerCase(), 
      otp: otp 
    });
    
    if (!otpRecord) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid OTP" 
      });
    }
    
    if (otpRecord.expiresAt < new Date()) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({ 
        success: false, 
        message: "OTP has expired. Please request a new one." 
      });
    }
    
    res.json({ 
      success: true, 
      message: "OTP verified successfully" 
    });
  } catch (err) {
    console.error("Verify OTP error:", err);
    res.status(500).json({ 
      success: false, 
      message: "Failed to verify OTP" 
    });
  }
});

// ==================== RESET PASSWORD ====================
router.post("/reset-password", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ 
        success: false, 
        message: "Email, OTP, and new password are required" 
      });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: "Password must be at least 6 characters" 
      });
    }
    
    // Verify OTP
    const otpRecord = await OTP.findOne({ 
      email: email.toLowerCase(), 
      otp: otp 
    });
    
    if (!otpRecord) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid OTP" 
      });
    }
    
    if (otpRecord.expiresAt < new Date()) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({ 
        success: false, 
        message: "OTP has expired. Please request a new one." 
      });
    }
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update user password
    await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      { password: hashedPassword }
    );
    
    // Delete used OTP
    await OTP.deleteOne({ _id: otpRecord._id });
    
    res.json({ 
      success: true, 
      message: "Password reset successfully" 
    });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ 
      success: false, 
      message: "Failed to reset password" 
    });
  }
});

// ==================== GET USER BY ID ====================
router.get("/user/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select("-password");
    
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
        section: user.section,
        studentId: user.studentId,
        teacherId: user.teacherId,
        staffId: user.staffId,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==================== GET USER BY FIREBASE UID ====================
router.get("/user/firebase/:firebaseUid", async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUid: req.params.firebaseUid }).select("-password");
    
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
        section: user.section,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==================== GET ALL TEACHERS ====================
router.get("/teachers", async (req, res) => {
  try {
    const teachers = await User.find({ role: "teacher" })
      .select("firstName lastName email department shortName teacherId");
    res.json(teachers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==================== GET ALL STUDENTS ====================
router.get("/students", async (req, res) => {
  try {
    const students = await User.find({ role: "student" })
      .select("firstName lastName email department section studentId");
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==================== GET ALL STAFF ====================
router.get("/staff", async (req, res) => {
  try {
    const staff = await User.find({ role: "staff" })
      .select("firstName lastName email staffId");
    res.json(staff);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==================== UPDATE USER PROFILE ====================
router.put("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const updates = req.body;
    
    // Remove sensitive fields that shouldn't be updated directly
    delete updates.password;
    delete updates._id;
    delete updates.firebaseUid;
    
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-password");
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json({
      success: true,
      user: user
    });
  } catch (err) {
    console.error("Update user error:", err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

















// const express = require("express");
// const router = express.Router();
// const bcrypt = require("bcryptjs");
// const User = require("../models/User");

// // Register new user (firebaseUid is optional now)
// router.post("/register", async (req, res) => {
//   try {
//     const { 
//       firebaseUid, 
//       email, 
//       firstName, 
//       lastName, 
//       role, 
//       password,
//       phone,
//       dob,
//       department,
//       section,
//       studentId,
//       teacherId,
//       staffId,
//       shortName
//     } = req.body;

//     // Check if user already exists
//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res.status(400).json({ message: "User already exists" });
//     }

//     // Hash password if provided
//     let hashedPassword;
//     if (password) {
//       const salt = await bcrypt.genSalt(10);
//       hashedPassword = await bcrypt.hash(password, salt);
//     }

//     // Create user data object
//     const userData = {
//       email,
//       firstName,
//       lastName,
//       role: role || "student",
//       phone,
//       dob,
//       password: hashedPassword,
//     };

//     // Add firebaseUid only if provided
//     if (firebaseUid) {
//       userData.firebaseUid = firebaseUid;
//     }

//     // Add role-specific fields
//     if (role === "student") {
//       userData.studentId = studentId;
//       userData.department = department;
//       userData.section = section;
//     } else if (role === "teacher") {
//       userData.teacherId = teacherId;
//       userData.shortName = shortName;
//       userData.department = department;
//     } else if (role === "staff") {
//       userData.staffId = staffId;
//     }

//     const user = new User(userData);
//     await user.save();

//     res.status(201).json({
//       success: true,
//       message: "User registered successfully",
//       userId: user._id,
//       user: {
//         _id: user._id,
//         email: user.email,
//         firstName: user.firstName,
//         lastName: user.lastName,
//         role: user.role,
//       },
//     });
//   } catch (err) {
//     console.error("Register error:", err);
//     res.status(500).json({ message: err.message });
//   }
// });

// // Get user by Firebase UID (optional)
// router.get("/user/:firebaseUid", async (req, res) => {
//   try {
//     const user = await User.findOne({ firebaseUid: req.params.firebaseUid });
    
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     res.json({
//       user: {
//         _id: user._id,
//         firebaseUid: user.firebaseUid,
//         email: user.email,
//         firstName: user.firstName,
//         lastName: user.lastName,
//         role: user.role,
//         department: user.department,
//       },
//     });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// // Login with email/password
// router.post("/login", async (req, res) => {
//   try {
//     const { email, password, id } = req.body;

//     let user;
    
//     // Find user by email or ID
//     if (id) {
//       user = await User.findOne({ studentId: id });
//     } else if (email) {
//       user = await User.findOne({ email });
//     }

//     if (!user) {
//       return res.status(401).json({ message: "Invalid credentials" });
//     }

//     // Check password
//     if (user.password) {
//       const isMatch = await bcrypt.compare(password, user.password);
//       if (!isMatch) {
//         return res.status(401).json({ message: "Invalid credentials" });
//       }
//     } else if (!user.password && user.firebaseUid) {
//       // User exists in Firebase but not in MongoDB
//       return res.status(400).json({ message: "Please use Firebase authentication" });
//     }

//     res.json({
//       success: true,
//       user: {
//         userId: user._id,
//         firebaseUid: user.firebaseUid,
//         firstName: user.firstName,
//         lastName: user.lastName,
//         email: user.email,
//         role: user.role,
//       },
//     });
//   } catch (err) {
//     console.error("Login error:", err);
//     res.status(500).json({ message: err.message });
//   }
// });

// // Check email availability
// router.post("/check-email", async (req, res) => {
//   try {
//     const { email } = req.body;
//     const user = await User.findOne({ email });
//     res.json({ available: !user });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// // Get all teachers
// router.get("/teachers", async (req, res) => {
//   try {
//     const teachers = await User.find({ role: "teacher" }).select("firstName lastName email");
//     res.json(teachers);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// module.exports = router;