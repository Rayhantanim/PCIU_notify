const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const User = require("../models/User");
const OTP = require("../models/OTP");

// ==================== EMAIL CONFIGURATION ====================
// Configure nodemailer transporter
const createTransporter = () => {
  // For Gmail
  if (process.env.EMAIL_SERVICE === "gmail") {
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }
  
  // For Outlook/Hotmail
  if (process.env.EMAIL_SERVICE === "outlook") {
    return nodemailer.createTransport({
      service: "hotmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }
  
  // For custom SMTP
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
    const existingUser = await User.findOne({ email: email.toLowerCase() });
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
    let hashedPassword;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(password, salt);
    }

    // Create user data object
    const userData = {
      email: email.toLowerCase(),
      firstName,
      lastName,
      role: role || "student",
      phone: phone || "",
      dob: dob || "",
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

    // Generate token
    const token = Buffer.from(`${user._id}:${Date.now()}`).toString('base64');

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token: token,
      user: {
        _id: user._id,
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
    console.error("Register error:", err);
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
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
    if (user.password) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ 
          success: false,
          message: "Invalid credentials" 
        });
      }
    } else if (!user.password && user.firebaseUid) {
      return res.status(400).json({ 
        success: false,
        message: "Please use Firebase authentication" 
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
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
        phone: user.phone,
        dob: user.dob,
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
        message: "No account found with this email address" 
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
    
    // Send email with OTP
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset OTP</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 500px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
            border-radius: 10px 10px 0 0;
            color: white;
            text-align: center;
          }
          .content {
            background: white;
            padding: 30px;
            border: 1px solid #e0e0e0;
            border-top: none;
            border-radius: 0 0 10px 10px;
          }
          .otp-code {
            background: #f4f4f4;
            padding: 15px;
            text-align: center;
            font-size: 32px;
            letter-spacing: 5px;
            font-weight: bold;
            border-radius: 8px;
            margin: 20px 0;
            font-family: monospace;
          }
          .warning {
            background: #fff3cd;
            padding: 10px;
            border-radius: 5px;
            color: #856404;
            font-size: 12px;
            margin-top: 20px;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            font-size: 12px;
            color: #999;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2 style="margin: 0;">🔐 Password Reset Request</h2>
          </div>
          <div class="content">
            <p>Hello <strong>${user.firstName} ${user.lastName}</strong>,</p>
            <p>We received a request to reset your password for your PCI University account.</p>
            <p>Use the following OTP (One-Time Password) to reset your password:</p>
            <div class="otp-code">
              ${otp}
            </div>
            <p>This OTP is valid for <strong>10 minutes</strong>.</p>
            <p>If you didn't request this, please ignore this email.</p>
            <div class="warning">
              ⚠️ <strong>Security Alert:</strong> Never share this OTP with anyone.
            </div>
            <div class="footer">
              <p>PCI University Notification System</p>
              <p>This is an automated message, please do not reply.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
    
    const emailResult = await sendEmail(
      email,
      "Password Reset OTP - PCI University",
      emailHtml
    );
    
    if (!emailResult.success) {
      console.error("Failed to send email:", emailResult.error);
      // Still return success to user, but log error
      // You might want to still return the OTP in development for testing
      if (process.env.NODE_ENV === "development") {
        return res.json({ 
          success: true, 
          message: "OTP generated (email failed - check logs)",
          otp: otp // Only for development
        });
      }
    }
    
    console.log(`=================================`);
    console.log(`OTP for ${email}: ${otp}`);
    console.log(`Valid until: ${new Date(Date.now() + 10 * 60 * 1000)}`);
    console.log(`=================================`);
    
    res.json({ 
      success: true, 
      message: "OTP sent to your email address" 
    });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ 
      success: false, 
      message: "Failed to send OTP. Please try again later." 
    });
  }
});

// ==================== RESEND OTP ====================
router.post("/resend-otp", async (req, res) => {
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
        message: "No account found with this email address" 
      });
    }
    
    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Update OTP in database
    await OTP.findOneAndUpdate(
      { email: email.toLowerCase() },
      { 
        otp, 
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        createdAt: new Date()
      },
      { upsert: true, new: true }
    );
    
    // Send email with new OTP
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
        <h2 style="color: #2563eb;">New Password Reset OTP</h2>
        <p>You requested a new OTP to reset your password.</p>
        <div style="background: #f3f4f6; padding: 15px; text-align: center; font-size: 24px; letter-spacing: 5px; font-weight: bold; border-radius: 8px;">
          ${otp}
        </div>
        <p style="color: #6b7280; font-size: 14px;">This OTP is valid for 10 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <hr style="margin: 20px 0;" />
        <p style="color: #9ca3af; font-size: 12px;">PCI University Notification System</p>
      </div>
    `;
    
    await sendEmail(email, "New Password Reset OTP - PCI University", emailHtml);
    
    console.log(`New OTP for ${email}: ${otp}`);
    
    res.json({ 
      success: true, 
      message: "New OTP sent to your email address" 
    });
  } catch (err) {
    console.error("Resend OTP error:", err);
    res.status(500).json({ 
      success: false, 
      message: "Failed to resend OTP" 
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
    
    // Get user for success email
    const user = await User.findOne({ email: email.toLowerCase() });
    
    // Update user password
    await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      { 
        password: hashedPassword,
        updatedAt: new Date()
      }
    );
    
    // Delete used OTP
    await OTP.deleteOne({ _id: otpRecord._id });
    
    // Send success email
    const successHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
        <h2 style="color: #28a745;">Password Reset Successful</h2>
        <p>Hello <strong>${user.firstName} ${user.lastName}</strong>,</p>
        <p>Your password has been successfully reset.</p>
        <p>If you did not perform this action, please contact our support team immediately.</p>
        <p>You can now login with your new password.</p>
        <hr style="margin: 20px 0;" />
        <p style="color: #9ca3af; font-size: 12px;">PCI University Notification System</p>
      </div>
    `;
    
    await sendEmail(email, "Password Reset Successful - PCI University", successHtml);
    
    res.json({ 
      success: true, 
      message: "Password reset successfully. You can now login with your new password." 
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
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }
    
    res.json({
      success: true,
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
        phone: user.phone,
        dob: user.dob,
        isActive: user.isActive,
        lastLogin: user.lastLogin,
      },
    });
  } catch (err) {
    console.error("Get user error:", err);
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
});

// ==================== GET USER BY FIREBASE UID ====================
router.get("/user/firebase/:firebaseUid", async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUid: req.params.firebaseUid }).select("-password");
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }

    res.json({
      success: true,
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
    console.error("Get user by firebase error:", err);
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
});

// ==================== GET ALL TEACHERS ====================
router.get("/teachers", async (req, res) => {
  try {
    const teachers = await User.find({ role: "teacher", isActive: true })
      .select("firstName lastName email department shortName teacherId phone");
    res.json({ 
      success: true, 
      teachers 
    });
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
    const students = await User.find({ role: "student", isActive: true })
      .select("firstName lastName email department section studentId phone");
    res.json({ 
      success: true, 
      students 
    });
  } catch (err) {
    console.error("Get students error:", err);
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
});

// ==================== GET ALL STAFF ====================
router.get("/staff", async (req, res) => {
  try {
    const staff = await User.find({ role: "staff", isActive: true })
      .select("firstName lastName email staffId phone");
    res.json({ 
      success: true, 
      staff 
    });
  } catch (err) {
    console.error("Get staff error:", err);
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
});

// ==================== UPDATE USER PROFILE ====================
router.put("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const updates = req.body;
    
    // Remove sensitive fields that shouldn't be updated directly
    const allowedUpdates = [
      'firstName', 'lastName', 'phone', 'dob', 
      'department', 'section', 'profilePicture'
    ];
    
    const filteredUpdates = {};
    for (const key of allowedUpdates) {
      if (updates[key] !== undefined) {
        filteredUpdates[key] = updates[key];
      }
    }
    
    filteredUpdates.updatedAt = new Date();
    
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: filteredUpdates },
      { new: true, runValidators: true }
    ).select("-password");
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }
    
    res.json({
      success: true,
      message: "Profile updated successfully",
      user: user
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
router.post("/change-password", async (req, res) => {
  try {
    const { userId, currentPassword, newPassword } = req.body;
    
    if (!userId || !currentPassword || !newPassword) {
      return res.status(400).json({ 
        success: false,
        message: "User ID, current password, and new password are required" 
      });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ 
        success: false,
        message: "New password must be at least 6 characters" 
      });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
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

module.exports = router;