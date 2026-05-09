const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const User = require("../models/User");
const OTP = require("../models/OTP");

// ==================== EMAIL CONFIGURATION ====================
const createTransporter = () => {
  if (process.env.EMAIL_SERVICE === "gmail") {
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }
  
  if (process.env.EMAIL_SERVICE === "outlook") {
    return nodemailer.createTransport({
      service: "hotmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }
  
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Send email function
const sendEmail = async (to, subject, html) => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    
    const mailOptions = {
      from: `"PCIU Notify" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to: to,
      subject: subject,
      html: html,
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Email sending error:", error);
    return { success: false, error: error.message };
  }
};

// Send verification email function
const sendVerificationEmail = async (email, token) => {
  const verifyUrl = `${process.env.FRONTEND_URL}/verify?token=${token}`;
  return await sendEmail(
    email,
    'Verify Your Email',
    `<div style="font-family:Arial;text-align:center;padding:20px">
       <h2>Welcome!</h2>
       <p>Click the button below to verify your email:</p>
       <a href="${verifyUrl}" style="background:#4CAF50;color:white;padding:10px 20px;text-decoration:none;border-radius:5px">Verify Email</a>
       <p>This link expires in 24 hours.</p>
     </div>`
  );
};

// ==================== REGISTER ====================
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
    const existingUser = await User.findOne({ email: email?.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        message: "User already exists with this email" 
      });
    }

    // Check if ID already exists for students
    if (role === "student" && studentId) {
      const existingId = await User.findOne({ studentId });
      if (existingId) {
        return res.status(400).json({ 
          success: false,
          message: "Student ID already exists" 
        });
      }
    }

    // Check if teacher ID already exists
    if (role === "teacher" && teacherId) {
      const existingId = await User.findOne({ teacherId });
      if (existingId) {
        return res.status(400).json({ 
          success: false,
          message: "Teacher ID already exists" 
        });
      }
    }

    // Check if staff ID already exists
    if (role === "staff" && staffId) {
      const existingId = await User.findOne({ staffId });
      if (existingId) {
        return res.status(400).json({ 
          success: false,
          message: "Staff ID already exists" 
        });
      }
    }

    // Hash password if provided
    let hashedPassword = null;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(password, salt);
    }

    // Generate verification token
    const verifyToken = crypto.randomBytes(32).toString('hex');
    const verifyExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const userData = {
      email: email?.toLowerCase(),
      firstName,
      lastName,
      role: role || "student",
      phone,
      dob,
      password: hashedPassword,
      verified: firebaseUid ? true : false,
      verifyToken: firebaseUid ? null : verifyToken,
      verifyExpiry: firebaseUid ? null : verifyExpiry,
      firebaseUid: firebaseUid || null,
    };

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

    // Send verification email only for non-Firebase users
    if (!firebaseUid) {
      await sendVerificationEmail(email, verifyToken);
    }

    res.status(201).json({
      success: true,
      message: firebaseUid ? "Registration successful!" : "Registration successful! Please check your email to verify your account.",
      userId: user._id,
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
});

// ==================== VERIFY EMAIL ====================
router.get("/verify-email", async (req, res) => {
  try {
    const { token } = req.query;

    const user = await User.findOne({ 
      verifyToken: token,
      verifyExpiry: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired verification link" });
    }

    user.verified = true;
    user.verifyToken = null;
    user.verifyExpiry = null;
    await user.save();

    res.json({ message: "Email verified successfully! You can now login." });
  } catch (err) {
    console.error("Verify email error:", err);
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
      const cleanId = id.replace(/\s/g, "");
      user = await User.findOne({ 
        $or: [
          { studentId: cleanId },
          { teacherId: cleanId },
          { staffId: cleanId }
        ]
      });
    } else if (email) {
      user = await User.findOne({ email: email.toLowerCase() });
    }

    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: "Invalid credentials" 
      });
    }

    // Check if user is active
    if (user.isActive === false) {
      return res.status(401).json({ 
        success: false,
        message: "Your account has been deactivated. Please contact admin." 
      });
    }

    // Check password
    if (user.password && password) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ 
          success: false,
          message: "Invalid credentials" 
        });
      }
    } else if (!user.password && user.firebaseUid) {
      // Firebase user - no password check needed
    } else if (!password) {
      return res.status(400).json({ 
        success: false,
        message: "Password is required" 
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    res.json({
      success: true,
      user: {
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
        phone: user.phone,
        dob: user.dob,
        bio: user.bio || "",
        address: user.address || "",
        createdAt: user.createdAt,
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// ==================== UPDATE USER PROFILE ====================
// ==================== UPDATE USER PROFILE ====================
router.put("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const updates = req.body;
    
    console.log("Updating user:", userId);
    console.log("Update data:", updates);
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }
    
    // Update allowed fields
    if (updates.firstName !== undefined) user.firstName = updates.firstName;
    if (updates.lastName !== undefined) user.lastName = updates.lastName;
    if (updates.phone !== undefined) user.phone = updates.phone;
    if (updates.dob !== undefined) user.dob = updates.dob;
    if (updates.department !== undefined) user.department = updates.department;
    if (updates.section !== undefined && user.role === "student") user.section = updates.section;
    if (updates.shortName !== undefined && user.role === "teacher") user.shortName = updates.shortName;
    
    user.updatedAt = new Date();
    await user.save();
    
    // Return updated user without sensitive data
    const updatedUser = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      department: user.department,
      section: user.section,
      studentId: user.studentId,
      teacherId: user.teacherId,
      staffId: user.staffId,
      phone: user.phone,
      dob: user.dob,
      shortName: user.shortName,
    };
    
    res.json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser
    });
    
  } catch (err) {
    console.error("Update user error:", err);
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
});

// ==================== CHANGE PASSWORD ====================
// router.post("/change-password", async (req, res) => {
//   try {
//     const { userId, currentPassword, newPassword } = req.body;
    
//     console.log("Change password for user:", userId);
    
//     if (!userId || !currentPassword || !newPassword) {
//       return res.status(400).json({ 
//         success: false,
//         message: "All fields are required" 
//       });
//     }
    
//     if (newPassword.length < 6) {
//       return res.status(400).json({ 
//         success: false,
//         message: "Password must be at least 6 characters" 
//       });
//     }
    
//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(404).json({ 
//         success: false,
//         message: "User not found" 
//       });
//     }
    
//     if (!user.password) {
//       return res.status(400).json({ 
//         success: false,
//         message: "No password set for this account" 
//       });
//     }
    
//     const isMatch = await bcrypt.compare(currentPassword, user.password);
//     if (!isMatch) {
//       return res.status(401).json({ 
//         success: false,
//         message: "Current password is incorrect" 
//       });
//     }
    
//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(newPassword, salt);
    
//     user.password = hashedPassword;
//     user.updatedAt = new Date();
//     await user.save();
    
//     res.json({ 
//       success: true,
//       message: "Password changed successfully" 
//     });
    
//   } catch (err) {
//     console.error("Change password error:", err);
//     res.status(500).json({ 
//       success: false,
//       message: err.message 
//     });
//   }
// });

// ==================== CHANGE PASSWORD ====================
router.post("/change-password", async (req, res) => {
  try {
    const { userId, currentPassword, newPassword } = req.body;
    
    console.log("Change password for user:", userId);
    
    if (!userId || !currentPassword || !newPassword) {
      return res.status(400).json({ 
        success: false,
        message: "All fields are required" 
      });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ 
        success: false,
        message: "Password must be at least 6 characters" 
      });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }
    
    // Check if user has a password set
    if (!user.password) {
      return res.status(400).json({ 
        success: false,
        message: "No password set for this account. Please use Firebase or contact admin." 
      });
    }
    
    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false,
        message: "Current password is incorrect" 
      });
    }
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update password
    user.password = hashedPassword;
    user.updatedAt = new Date();
    await user.save();
    
    res.json({ 
      success: true,
      message: "Password changed successfully" 
    });
    
  } catch (err) {
    console.error("Change password error:", err);
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
});

// ==================== GET USER BY ID ====================
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId).select("-password -verifyToken -verifyExpiry");
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }
    
    res.json({
      success: true,
      user: user
    });
  } catch (err) {
    console.error("Get user error:", err);
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

// ==================== GET ALL TEACHERS ====================
router.get("/teachers", async (req, res) => {
  try {
    const teachers = await User.find({ role: "teacher" })
      .select("firstName lastName email phone department teacherId shortName verified")
      .sort({ createdAt: -1 });
    res.json(teachers);
  } catch (err) {
    console.error("Get teachers error:", err);
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
});

// ==================== GET ALL STUDENTS ====================
router.get("/students", async (req, res) => {
  try {
    const students = await User.find({ role: "student" })
      .select("firstName lastName email phone department section studentId verified")
      .sort({ createdAt: -1 });
    res.json(students);
  } catch (err) {
    console.error("Get students error:", err);
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
});

// ==================== GET ALL STAFF ====================
router.get("/staffs", async (req, res) => {
  try {
    const staffs = await User.find({ role: "staff" })
      .select("firstName lastName email phone staffId verified")
      .sort({ createdAt: -1 });
    res.json(staffs);
  } catch (err) {
    console.error("Get staff error:", err);
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
});

// ==================== GET ALL USERS ====================
router.get("/users", async (req, res) => {
  try {
    const users = await User.find().select("-password -verifyToken -verifyExpiry");
    res.json(users);
  } catch (err) {
    console.error("Get users error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;