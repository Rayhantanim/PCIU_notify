const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const User = require("../models/User");

// EMAIL SETUP (Add this at the top)
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});


const sendVerificationEmail = async (email, token) => {
  const verifyUrl = `${process.env.FRONTEND_URL}/verify?token=${token}`;
  await transporter.sendMail({
    to: email,
    subject: 'Verify Your Email',
    html: `<div style="font-family:Arial;text-align:center;padding:20px">
             <h2>Welcome!</h2>
             <p>Click the button below to verify your email:</p>
             <a href="${verifyUrl}" style="background:#4CAF50;color:white;padding:10px 20px;text-decoration:none;border-radius:5px">Verify Email</a>
             <p>This link expires in 24 hours.</p>
           </div>`
  });
};

// 2. Modified Register (adds verification)
router.post("/register", async (req, res) => {
  try {
    const { email, firstName, lastName, role, password, phone, dob,
        department, section, studentId, teacherId, staffId, shortName,
        firebaseUid } = req.body; 
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate verification token
    const verifyToken = crypto.randomBytes(32).toString('hex');
    const verifyExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  const userData = {
  email,
  firstName,
  lastName,
  role: role || "student",
  phone,
  dob,
  password: hashedPassword,
  verified: firebaseUid ? true : false,  
  verifyToken,
  verifyExpiry,
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

    // Send verification email
    await sendVerificationEmail(email, verifyToken);

    res.status(201).json({
      success: true,
      message: "Registration successful! Please check your email to verify your account.",
      userId: user._id
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: err.message });
  }
});

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
    res.status(500).json({ message: err.message });
  }
});

// 4. Forgot Password - Send reset link
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.json({ message: "If email exists, reset link will be sent" });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetToken = resetToken;
    user.resetExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    await transporter.sendMail({
      to: email,
      subject: 'Reset Your Password',
      html: `<div style="font-family:Arial;text-align:center;padding:20px">
               <h2>Reset Password</h2>
               <p>Click the button below to reset your password:</p>
               <a href="${resetUrl}" style="background:#2196F3;color:white;padding:10px 20px;text-decoration:none;border-radius:5px">Reset Password</a>
               <p>This link expires in 1 hour.</p>
               <p>If you didn't request this, ignore this email.</p>
             </div>`
    });

    res.json({ message: "Password reset link sent to your email" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 5. Reset Password
router.post("/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    const user = await User.findOne({
      resetToken: token,
      resetExpiry: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.resetToken = null;
    user.resetExpiry = null;
    await user.save();

    res.json({ message: "Password reset successful! You can now login." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 6. Resend Verification Email
router.post("/resend-verification", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.verified) {
      return res.status(400).json({ message: "Email already verified" });
    }

    const verifyToken = crypto.randomBytes(32).toString('hex');
    user.verifyToken = verifyToken;
    user.verifyExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await user.save();

    await sendVerificationEmail(email, verifyToken);
    res.json({ message: "Verification email sent!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 7. Modified Login (check verification)
// router.post("/login", async (req, res) => {
//   try {
//     const { email, password, id } = req.body;

//     let user;
//     if (id) {
//       user = await User.findOne({ studentId: id });
//     } else if (email) {
//       user = await User.findOne({ email });
//     }

//     if (!user) {
//       return res.status(401).json({ message: "Invalid credentials" });
//     }

//     // Check if email is verified
//     if (!user.verified) {
//       return res.status(403).json({ 
//         message: "Please verify your email before logging in",
//         needsVerification: true,
//         email: user.email
//       });
//     }

//     // Check password
//     if (user.password) {
//       const isMatch = await bcrypt.compare(password, user.password);
//       if (!isMatch) {
//         return res.status(401).json({ message: "Invalid credentials" });
//       }
//     }

//     res.json({
//       success: true,
//       user: {
//         userId: user._id,
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
// Login endpoint - simple version
router.post("/login", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      console.log("No email provided");
      return res.status(400).json({ message: "Email is required" });
    }

    // Find user by email
    const user = await User.findOne({ email });
    
    console.log("Database query result:", user);
    
    if (!user) {
      console.log("User not found for email:", email);
      return res.status(404).json({ message: "User not found" });
    }

    console.log("User found:", {
      _id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role
    });

    // Return user data
    res.json({
      success: true,
      user: {
        _id: user._id,
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
// Keep your existing routes below...
router.post("/check-email", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    res.json({ available: !user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/users", async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/students", async (req, res) => {
  try {
    const students = await User.find({ role: "student" })
      .select("firstName lastName email phone department section studentId verified")
      .sort({ createdAt: -1 });
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/teachers", async (req, res) => {
  try {
    const teachers = await User.find({ role: "teacher" })
      .select("firstName lastName email phone department teacherId shortName verified")
      .sort({ createdAt: -1 });
    res.json(teachers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/staffs", async (req, res) => {
  try {
    const staffs = await User.find({ role: "staff" })
      .select("firstName lastName email phone staffId verified")
      .sort({ createdAt: -1 });
    res.json(staffs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;