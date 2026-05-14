const express = require("express");
const router = express.Router();
const path = require("path");
const mongoose = require("mongoose");
const Notice = require("../models/Notice");
const User = require("../models/User");
const Notification = require("../models/Notification");
const nodemailer = require("nodemailer");

// Debug: Check if email credentials are loaded
console.log("📧 Email Configuration Check:");
console.log("EMAIL_USER:", process.env.EMAIL_USER ? "✅ Present" : "❌ MISSING");
console.log("EMAIL_PASS:", process.env.EMAIL_PASS ? "✅ Present" : "❌ MISSING");

// Create transporter if not available from app
let transporter;
try {
  // Try to get from app first
  const app = require('../server');
  transporter = app.transporter;
} catch (e) {
  // Create new transporter
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
}

// Verify transporter
if (transporter) {
  transporter.verify((error, success) => {
    if (error) {
      console.error("❌ Email transporter verification failed:", error);
    } else {
      console.log("✅ Email transporter verified and ready");
    }
  });
}

// Helper function to get recipients based on MULTIPLE audiences (array)
// Helper function to get recipients based on MULTIPLE audiences (array)
const getRecipientsByAudience = async (audiences) => {
  let audienceArray = audiences;
  if (typeof audiences === 'string') {
    audienceArray = [audiences];
  }
  
  if (!audienceArray || audienceArray.length === 0) {
    console.log("⚠️ No audiences specified");
    return [];
  }
  
  // Convert plural to singular for database query
  const roleMapping = {
    "students": "student",
    "teachers": "teacher", 
    "staff": "staff",
    "all": "all"
  };
  
  let dbRoles = [];
  for (const audience of audienceArray) {
    if (roleMapping[audience]) {
      dbRoles.push(roleMapping[audience]);
    } else {
      dbRoles.push(audience);
    }
  }
  
  dbRoles = [...new Set(dbRoles)];
  
  let query = {};
  if (audienceArray.includes("all")) {
    query = { role: { $nin: ["admin"] } };
  } else {
    query = { role: { $in: dbRoles } };
  }
  
  console.log(`📊 Searching for users with roles: ${dbRoles.join(", ")}`);
  
  const users = await User.find(query).select("email firstName lastName role");
  console.log(`📊 Found ${users.length} recipients for audiences: ${audienceArray.join(", ")}`);
  
  if (users.length === 0) {
    console.log(`⚠️ WARNING: No users found with roles: ${dbRoles.join(", ")}`);
    console.log(`💡 Tip: Register some users or create test users with these roles`);
  }
  
  if (users.length > 0) {
    console.log(`📊 Sample recipients:`, users.slice(0, 3).map(u => ({ email: u.email, role: u.role })));
  }
  
  return users.map(user => ({
    email: user.email,
    name: `${user.firstName} ${user.lastName}`,
    role: user.role
  }));
};

// Helper function to send a single email
const sendSingleEmail = async (transporter, recipient, notice, category, frontendUrl) => {
  const audienceLabel = notice.audience && notice.audience.length > 0 
    ? notice.audience.map(a => a.charAt(0).toUpperCase() + a.slice(1)).join(', ')
    : 'All Users';

  // Clean and escape HTML content
  const cleanDescription = (notice.description || 'No description provided')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br>');

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Notice: ${notice.title}</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 10px 10px 0 0; color: white; text-align: center; }
        .content { background: white; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px; }
        .notice-title { color: #333; margin-top: 0; font-size: 24px; }
        .notice-description { color: #666; line-height: 1.8; margin: 20px 0; }
        .info-box { background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0; }
        .info-item { margin: 8px 0; }
        .btn { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin-top: 20px; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #999; }
        ul, ol { margin: 10px 0; padding-left: 20px; }
        li { margin: 5px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2 style="margin: 0;">📢 PCIU Notice Board</h2>
          <p style="margin: 5px 0 0;">New Notice Published for ${audienceLabel}</p>
        </div>
        <div class="content">
          <h3 class="notice-title">${notice.title.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</h3>
          <div class="notice-description">${cleanDescription}</div>
          <div class="info-box">
            <div class="info-item"><strong>📂 Category:</strong> ${category || notice.category || 'General'}</div>
            <div class="info-item"><strong>⚡ Priority:</strong> ${notice.priority || 'Normal'}</div>
            <div class="info-item"><strong>👤 Posted by:</strong> ${notice.createdBy || 'Admin'}</div>
            <div class="info-item"><strong>📅 Date:</strong> ${new Date().toLocaleString()}</div>
          </div>
          <div style="text-align: center;">
            <a href="${frontendUrl}/dashboard/notices" class="btn">View Notice</a>
          </div>
        </div>
        <div class="footer">
          <p>This is an automated notification from PCIU Notice Board.</p>
          <p>Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: `"PCIU Notice Board" <${process.env.EMAIL_USER}>`,
    to: recipient.email,
    subject: `📢 New ${category || 'Notice'}: ${notice.title}`,
    html: emailHtml
  };

  return await transporter.sendMail(mailOptions);
};

// Helper function to send email notifications to all recipients
const sendEmailNotifications = async (req, recipients, notice, category) => {
  const transporter = req.app.get("transporter");
  const frontendUrl = process.env.FRONTEND_URL || 'https://pciunotify.vercel.app';
  
  if (!transporter) {
    console.error("❌ Transporter not available in request app");
    return { count: 0, failed: recipients.length, total: recipients.length, failedEmails: recipients.map(r => r.email) };
  }
  
  if (!recipients || recipients.length === 0) {
    console.log("⚠️ No recipients to send emails to");
    return { count: 0, failed: 0, total: 0, failedEmails: [] };
  }
  
  let successCount = 0;
  let failedCount = 0;
  const failedEmails = [];

  console.log(`📧 Starting to send ${recipients.length} emails...`);

  for (let i = 0; i < recipients.length; i++) {
    const recipient = recipients[i];
    try {
      console.log(`📧 Sending email to ${recipient.email} (${i + 1}/${recipients.length})...`);
      await sendSingleEmail(transporter, recipient, notice, category, frontendUrl);
      successCount++;
      console.log(`✅ Email sent to ${recipient.email}`);
    } catch (error) {
      failedCount++;
      failedEmails.push(recipient.email);
      console.error(`❌ Failed to send email to ${recipient.email}:`, error.message);
    }
    
    // Add small delay between emails to avoid rate limiting
    if (i < recipients.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  console.log(`📧 Email sending complete: ${successCount} succeeded, ${failedCount} failed`);
  
  return { 
    count: successCount, 
    failed: failedCount, 
    total: recipients.length,
    failedEmails 
  };
};

// Add this temporary endpoint to check users in database
router.get("/debug-users", async (req, res) => {
  try {
    const users = await User.find({}).select("email firstName lastName role");
    const roles = [...new Set(users.map(u => u.role))];
    
    res.json({
      totalUsers: users.length,
      roles: roles,
      users: users.map(u => ({ 
        email: u.email, 
        role: u.role, 
        name: `${u.firstName} ${u.lastName}` 
      }))
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add this temporary endpoint to create a test student
router.post("/create-test-student", async (req, res) => {
  try {
    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(10);
    
    const testStudent = {
      email: "teststudent@example.com",
      firstName: "Test",
      lastName: "Student",
      role: "student",
      password: await bcrypt.hash("password123", salt),
      department: "CSE",
      section: "31C"
    };
    
    const existing = await User.findOne({ email: testStudent.email });
    if (existing) {
      return res.json({ message: "Test student already exists", user: existing });
    }
    
    const newUser = await User.create(testStudent);
    res.json({ message: "Test student created successfully", user: newUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// GET all notices (with role-based filtering)
router.get("/notices", async (req, res) => {
  try {
    const userRole = req.headers['user-role'];
    let query = {};
    
    if (userRole === "student") {
      query = { audience: { $in: ["students", "all"] } };
    } else if (userRole === "teacher") {
      query = { audience: { $in: ["teachers", "all"] } };
    } else if (userRole === "staff") {
      query = { audience: { $in: ["staff", "all"] } };
    }
    
    const notices = await Notice.find(query).sort({ createdAt: -1 });
    res.json(notices);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE a notice
router.delete("/notice/:id", async (req, res) => {
  try {
    const notice = await Notice.findByIdAndDelete(req.params.id);
    if (!notice) {
      return res.status(404).json({ message: "Notice not found" });
    }
    res.json({ success: true, message: "Notice deleted successfully" });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ message: err.message });
  }
});

// UPDATE a notice
router.put("/notice/:id", async (req, res) => {
  try {
    const notice = await Notice.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!notice) {
      return res.status(404).json({ message: "Notice not found" });
    }
    res.json({ success: true, notice });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ message: err.message });
  }
});

// POST add notice (with MULTI-AUDIENCE support and email notifications)
router.post("/add-notice", async (req, res) => {
  try {
    console.log("📝 Adding notice:", req.body.title);
    
    // Handle audience - ensure it's an array
    let audienceArray = req.body.audience;
    if (typeof audienceArray === 'string') {
      audienceArray = [audienceArray];
    }
    if (!audienceArray || audienceArray.length === 0) {
      audienceArray = ["all"];
    }
    
    console.log("🎯 Audience:", audienceArray);
    
    const noticeData = {
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      audience: audienceArray,
      department: req.body.department,
      section: req.body.section,
      priority: req.body.priority,
      isPinned: req.body.isPinned || false,
      expiryDate: req.body.expiryDate,
      createdBy: req.body.createdBy,
      createdByRole: req.body.role,
      role: req.body.role,
    };
    
    const notice = new Notice(noticeData);
    await notice.save();
    console.log("✅ Notice saved, ID:", notice._id);

    // Get recipients based on multiple audiences
    const recipients = await getRecipientsByAudience(audienceArray);
    console.log(`📊 Found ${recipients.length} recipients to notify`);
    
    // Send email notifications
    let emailResult = { count: 0, failed: 0, total: 0, failedEmails: [] };
    if (recipients.length > 0) {
      console.log(`📧 Sending emails to ${recipients.length} recipients...`);
      emailResult = await sendEmailNotifications(req, recipients, noticeData, noticeData.category);
      console.log(`✅ Email results: ${emailResult.count} sent, ${emailResult.failed} failed`);
    } else {
      console.log("⚠️ No recipients found for the selected audience");
    }

    // Save notification for EACH audience type
    for (const singleAudience of audienceArray) {
      const notification = new Notification({
        noticeId: notice._id,
        title: notice.title,
        message: `New ${notice.category} notice: ${notice.title}`,
        type: "notice",
        audience: singleAudience,
        createdBy: notice.createdBy,
        role: notice.role,
        read: false,
        createdAt: new Date()
      });
      await notification.save();
    }
    
    // Emit socket event
    const io = req.app.get("io");
    if (io) {
      io.emit("newNotice", {
        id: notice._id,
        noticeId: notice._id,
        title: notice.title,
        message: `New ${notice.category} notice: ${notice.title}`,
        time: new Date(),
        type: "notice",
        audiences: audienceArray,
        createdBy: notice.createdBy,
        role: notice.role
      });
    }

    res.status(201).json({ 
      success: true, 
      notice,
      emailsSent: emailResult.count,
      emailsFailed: emailResult.failed,
      recipientsCount: recipients.length,
      failedEmails: emailResult.failedEmails
    });
  } catch (err) {
    console.error("❌ Error in /add-notice:", err);
    res.status(500).json({ message: err.message, stack: err.stack });
  }
});

// Test email endpoint
router.post("/test-email", async (req, res) => {
  try {
    const transporter = req.app.get("transporter");
    
    if (!transporter) {
      return res.status(500).json({ error: "Transporter not configured" });
    }
    
    const testResult = await transporter.sendMail({
      from: `"PCIU Notice Board" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, // Send to yourself
      subject: "Test Email from PCIU Notice Board",
      html: "<h1>Test Successful!</h1><p>Your email configuration is working correctly.</p>"
    });
    
    res.json({ 
      success: true, 
      message: "Test email sent successfully",
      response: testResult
    });
  } catch (error) {
    console.error("Test email failed:", error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      stack: error.stack
    });
  }
});

// LIKE a notice
router.post("/notice/:id/like", async (req, res) => {
  try {
    const { userId } = req.body;
    const noticeId = req.params.id;
    
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }
    
    const notice = await Notice.findById(noticeId);
    if (!notice) {
      return res.status(404).json({ message: "Notice not found" });
    }
    
    if (!notice.likes) notice.likes = [];
    
    const userIdStr = userId.toString();
    const alreadyLiked = notice.likes.some(id => id.toString() === userIdStr);
    
    if (alreadyLiked) {
      notice.likes = notice.likes.filter(id => id.toString() !== userIdStr);
      await notice.save();
      return res.json({ 
        success: true, 
        message: "Unliked successfully",
        liked: false,
        likesCount: notice.likes.length 
      });
    } else {
      notice.likes.push(userId);
      await notice.save();
      return res.json({ 
        success: true, 
        message: "Liked successfully",
        liked: true,
        likesCount: notice.likes.length 
      });
    }
  } catch (err) {
    console.error("Error in like notice:", err);
    res.status(500).json({ message: err.message });
  }
});

// ADD COMMENT
router.post("/notice/:id/comment", async (req, res) => {
  try {
    const noticeId = req.params.id;
    const { text, userId, userName, userEmail } = req.body;
    
    if (!text || !userId) {
      return res.status(400).json({ message: "Text and userId are required" });
    }
    
    const notice = await Notice.findById(noticeId);
    if (!notice) {
      return res.status(404).json({ message: "Notice not found" });
    }
    
    const newComment = {
      _id: new mongoose.Types.ObjectId(),
      text,
      userId: userId.toString(),
      userName: userName || "Anonymous",
      userEmail: userEmail || "",
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    if (!notice.comments) notice.comments = [];
    notice.comments.push(newComment);
    await notice.save();
    
    res.json({ 
      success: true, 
      message: "Comment added successfully",
      comment: newComment,
      commentsCount: notice.comments.length
    });
  } catch (err) {
    console.error("Error adding comment:", err);
    res.status(500).json({ message: err.message });
  }
});

// EDIT COMMENT
router.put("/notice/:noticeId/comment/:commentId", async (req, res) => {
  try {
    const { noticeId, commentId } = req.params;
    const { text, userId } = req.body;
    
    if (!text || !userId) {
      return res.status(400).json({ message: "Text and userId are required" });
    }
    
    const notice = await Notice.findById(noticeId);
    if (!notice) {
      return res.status(404).json({ message: "Notice not found" });
    }
    
    const comment = notice.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }
    
    if (comment.userId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "You can only edit your own comments" });
    }
    
    comment.text = text;
    comment.updatedAt = new Date();
    await notice.save();
    
    res.json({ 
      success: true, 
      message: "Comment updated successfully"
    });
  } catch (err) {
    console.error("Error editing comment:", err);
    res.status(500).json({ message: err.message });
  }
});

// DELETE COMMENT
router.delete("/notice/:noticeId/comment/:commentId", async (req, res) => {
  try {
    const { noticeId, commentId } = req.params;
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }
    
    const notice = await Notice.findById(noticeId);
    if (!notice) {
      return res.status(404).json({ message: "Notice not found" });
    }
    
    const comment = notice.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }
    
    const user = await User.findById(userId);
    const isAdmin = user && user.role === "admin";
    
    if (comment.userId.toString() !== userId.toString() && !isAdmin) {
      return res.status(403).json({ message: "You can only delete your own comments" });
    }
    
    notice.comments.pull(commentId);
    await notice.save();
    
    res.json({ 
      success: true, 
      message: "Comment deleted successfully"
    });
  } catch (err) {
    console.error("Error deleting comment:", err);
    res.status(500).json({ message: err.message });
  }
});

// GET dashboard stats
router.get("/dashboard-stats", async (req, res) => {
  try {
    const totalNotices = await Notice.countDocuments();
    const totalStudents = await User.countDocuments({ role: "student" });
    const totalTeachers = await User.countDocuments({ role: "teacher" });
    const totalStaff = await User.countDocuments({ role: "staff" });
    res.json({ totalNotices, totalStudents, totalTeachers, totalStaff });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET recipients by audience
router.post("/recipients", async (req, res) => {
  try {
    const { audiences } = req.body;
    
    let query = {};
    if (audiences && audiences.length > 0 && !audiences.includes("all")) {
      query = { role: { $in: audiences } };
    }
    
    const users = await User.find(query).select("email firstName lastName role");
    
    const recipients = users.map(user => ({
      email: user.email,
      name: `${user.firstName} ${user.lastName}`,
      role: user.role
    }));
    
    res.json({ success: true, recipients, count: recipients.length });
  } catch (err) {
    console.error("Error fetching recipients:", err);
    res.status(500).json({ message: err.message });
  }
});

// ============ STATIC FILES - MUST BE LAST ============
router.use("/uploads", express.static(path.join(__dirname, "../uploads")));

module.exports = router;

// const express = require("express");
// const router = express.Router();
// // const multer = require("multer");
// const path = require("path");
// const mongoose = require("mongoose");
// const Notice = require("../models/Notice");
// const User = require("../models/User");
// const Notification = require("../models/Notification");

// // Helper function to get recipients based on MULTIPLE audiences (array)
// const getRecipientsByAudience = async (audiences) => {
//   // Handle both string and array cases
//   let audienceArray = audiences;
//   if (typeof audiences === 'string') {
//     audienceArray = [audiences];
//   }
  
//   if (!audienceArray || audienceArray.length === 0) {
//     console.log("⚠️ No audiences specified");
//     return [];
//   }
  
//   // Build query for multiple roles
//   let query = { role: { $in: audienceArray } };
  
//   const users = await User.find(query).select("email firstName lastName role");
//   console.log(`📊 Found ${users.length} recipients for audiences: ${audienceArray.join(", ")}`);
  
//   return users.map(user => ({
//     email: user.email,
//     name: `${user.firstName} ${user.lastName}`,
//     role: user.role
//   }));
// };

// // GET all notices (with role-based filtering)
// router.get("/notices", async (req, res) => {
//   try {
//     const userRole = req.headers['user-role'];
//     let query = {};
    
//     // Filter notices based on user's role
//     if (userRole === "student") {
//       query = { audience: { $in: ["students", "all"] } };
//     } else if (userRole === "teacher") {
//       query = { audience: { $in: ["teachers", "all"] } };
//     } else if (userRole === "staff") {
//       query = { audience: { $in: ["staff", "all"] } };
//     }
    
//     const notices = await Notice.find(query).sort({ createdAt: -1 });
//     res.json(notices);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// // DELETE a notice
// router.delete("/notice/:id", async (req, res) => {
//   try {
//     const notice = await Notice.findByIdAndDelete(req.params.id);
//     if (!notice) {
//       return res.status(404).json({ message: "Notice not found" });
//     }
//     res.json({ success: true, message: "Notice deleted successfully" });
//   } catch (err) {
//     console.error("Delete error:", err);
//     res.status(500).json({ message: err.message });
//   }
// });

// // UPDATE a notice
// router.put("/notice/:id", async (req, res) => {
//   try {
//     const notice = await Notice.findByIdAndUpdate(
//       req.params.id,
//       { $set: req.body },
//       { new: true, runValidators: true }
//     );
//     if (!notice) {
//       return res.status(404).json({ message: "Notice not found" });
//     }
//     res.json({ success: true, notice });
//   } catch (err) {
//     console.error("Update error:", err);
//     res.status(500).json({ message: err.message });
//   }
// });

// // POST add notice (with MULTI-AUDIENCE support)
// router.post("/add-notice", async (req, res) => {
//   try {
//     console.log("📝 Adding notice:", req.body.title);
//     console.log("🎯 Received audience:", req.body.audience);
//     console.log("🎯 Type of audience:", typeof req.body.audience);
    
//     // Handle audience - ensure it's an array
//     let audienceArray = req.body.audience;
//     if (typeof audienceArray === 'string') {
//       audienceArray = [audienceArray];
//     }
//     if (!audienceArray || audienceArray.length === 0) {
//       audienceArray = ["all"];
//     }
    
//     console.log("🎯 Processed audience array:", audienceArray);
    
//     const noticeData = {
//       title: req.body.title,
//       description: req.body.description,
//       category: req.body.category,
//       audience: audienceArray, // Store as array
//       department: req.body.department,
//       section: req.body.section,
//       priority: req.body.priority,
//       isPinned: req.body.isPinned || false,
//       expiryDate: req.body.expiryDate,
//       createdBy: req.body.createdBy,
//       createdByRole: req.body.role,
//       role: req.body.role,
//     };
//     // if (req.file) {
//     //   noticeData.attachment = {
//     //     filename: req.file.filename,
//     //     originalName: req.file.originalname,
//     //     path: `/uploads/${req.file.filename}`,
//     //     size: req.file.size,
//     //     mimetype: req.file.mimetype,
//     //   };
//     // }
//     const notice = new Notice(noticeData);
//     await notice.save();
//     console.log("✅ Notice saved, ID:", notice._id);

//     // Get recipients based on multiple audiences
//     const recipients = await getRecipientsByAudience(audienceArray);
    
//     // Send email notifications
//     let emailCount = 0;
//     if (recipients.length > 0) {
//       const emailResult = await sendEmailNotifications(recipients, notice, noticeData.category);
//       emailCount = emailResult.count;
//     }

//     // Save notification for EACH audience type
//     for (const singleAudience of audienceArray) {
//       const notification = new Notification({
//         noticeId: notice._id,
//         title: notice.title,
//         message: `New ${notice.category} notice: ${notice.title}`,
//         type: "notice",
//         audience: singleAudience,
//         createdBy: notice.createdBy,
//         role: notice.role,
//         read: false,
//         createdAt: new Date()
//       });
      
//       await notification.save();
//       console.log(`✅ Notification saved for audience: ${singleAudience}`);
//     }
    
//     // Emit socket event with ALL audiences
//     const io = req.app.get("io");
//     if (io) {
//       io.emit("newNotice", {
//         id: notice._id,
//         noticeId: notice._id,
//         title: notice.title,
//         message: `New ${notice.category} notice: ${notice.title}`,
//         time: new Date(),
//         type: "notice",
//         audiences: audienceArray,
//         createdBy: notice.createdBy,
//         role: notice.role
//       });
//       console.log(`📡 Socket event emitted for audiences: ${audienceArray.join(", ")}`);
//     }

//     res.status(201).json({ 
//       success: true, 
//       notice,
//       emailsSent: emailCount,
//       recipientsCount: recipients.length
//     });
//   } catch (err) {
//     console.error("❌ Error in /add-notice:", err);
//     res.status(500).json({ message: err.message, stack: err.stack });
//   }
// });


// // Backend route - make sure it returns whether user liked or unliked
// router.post("/notice/:id/like", async (req, res) => {
//   try {
//     const { userId } = req.body;
//     const noticeId = req.params.id;
    
//     const notice = await Notice.findById(noticeId);
//     if (!notice) {
//       return res.status(404).json({ message: "Notice not found" });
//     }
    
//     if (!notice.likes) {
//       notice.likes = [];
//     }
    
//     const userIdStr = userId.toString();
//     const alreadyLiked = notice.likes.some(id => id.toString() === userIdStr);
    
//     if (alreadyLiked) {
//       // Unlike
//       notice.likes = notice.likes.filter(id => id.toString() !== userIdStr);
//       await notice.save();
//       return res.json({ 
//         success: true, 
//         message: "Unliked successfully",
//         liked: false,
//         likesCount: notice.likes.length 
//       });
//     } else {
//       // Like
//       notice.likes.push(userId);
//       await notice.save();
//       return res.json({ 
//         success: true, 
//         message: "Liked successfully",
//         liked: true,
//         likesCount: notice.likes.length 
//       });
//     }
//   } catch (err) {
//     console.error("Error in like notice:", err);
//     res.status(500).json({ message: err.message });
//   }
// });
// // GET dashboard stats
// router.get("/dashboard-stats", async (req, res) => {
//   try {
//     const totalNotices = await Notice.countDocuments();
//     const totalStudents = await User.countDocuments({ role: "student" });
//     const totalTeachers = await User.countDocuments({ role: "teacher" });
//     const totalStaff = await User.countDocuments({ role: "staff" });
//     res.json({ totalNotices, totalStudents, totalTeachers, totalStaff });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// // In your backend routes file

// // LIKE a notice (toggle like) - Modified to handle string IDs
// router.post("/notice/:id/like", async (req, res) => {
//   try {
//     const { userId } = req.body;
//     const noticeId = req.params.id;
    
//     if (!userId) {
//       return res.status(400).json({ message: "User ID is required" });
//     }
    
//     // Try to find by ObjectId first, if invalid format, try to find by custom ID
//     let notice;
//     if (mongoose.Types.ObjectId.isValid(noticeId)) {
//       notice = await Notice.findById(noticeId);
//     }
    
//     // If not found by ObjectId, try to find by a custom field (if you have one)
//     if (!notice) {
//       // If you're using custom IDs, try to find by a different field
//       notice = await Notice.findOne({ _id: noticeId });
      
//       // If still not found, return error
//       if (!notice) {
//         return res.status(404).json({ message: `Notice not found with ID: ${noticeId}` });
//       }
//     }
    
//     // Convert IDs to strings for comparison
//     const userIdStr = userId.toString();
    
//     // Check if user already liked
//     const alreadyLiked = notice.likes && notice.likes.some(likeId => 
//       likeId.toString() === userIdStr
//     );
    
//     if (alreadyLiked) {
//       // Unlike: remove user from likes array
//       notice.likes = notice.likes.filter(likeId => likeId.toString() !== userIdStr);
//       await notice.save();
//       return res.json({ 
//         success: true, 
//         message: "Notice unliked",
//         likesCount: notice.likes.length 
//       });
//     } else {
//       // Like: add user to likes array
//       if (!notice.likes) notice.likes = [];
//       notice.likes.push(userId);
//       await notice.save();
//       return res.json({ 
//         success: true, 
//         message: "Notice liked",
//         likesCount: notice.likes.length 
//       });
//     }
//   } catch (err) {
//     console.error("Error in like notice:", err);
//     res.status(500).json({ message: err.message });
//   }
// });

// // ADD COMMENT - Modified to handle string IDs
// router.post("/notice/:id/comment", async (req, res) => {
//   try {
//     const noticeId = req.params.id;
//     const { text, userId, userName, userEmail } = req.body;
    
//     if (!text || !userId) {
//       return res.status(400).json({ message: "Text and userId are required" });
//     }
    
//     // Find by ObjectId or custom ID
//     let notice;
//     if (mongoose.Types.ObjectId.isValid(noticeId)) {
//       notice = await Notice.findById(noticeId);
//     }
    
//     if (!notice) {
//       notice = await Notice.findOne({ _id: noticeId });
//       if (!notice) {
//         return res.status(404).json({ message: `Notice not found with ID: ${noticeId}` });
//       }
//     }
    
//     const newComment = {
//       _id: new mongoose.Types.ObjectId(),
//       text,
//       userId: userId.toString(), // Store as string
//       userName: userName || "Anonymous",
//       userEmail: userEmail || "",
//       createdAt: new Date(),
//       updatedAt: new Date()
//     };
    
//     if (!notice.comments) notice.comments = [];
//     notice.comments.push(newComment);
//     await notice.save();
    
//     res.json({ 
//       success: true, 
//       message: "Comment added successfully",
//       comment: newComment,
//       commentsCount: notice.comments.length
//     });
//   } catch (err) {
//     console.error("Error adding comment:", err);
//     res.status(500).json({ message: err.message });
//   }
// });

// // EDIT COMMENT - Modified
// router.put("/notice/:noticeId/comment/:commentId", async (req, res) => {
//   try {
//     const { noticeId, commentId } = req.params;
//     const { text, userId } = req.body;
    
//     if (!text || !userId) {
//       return res.status(400).json({ message: "Text and userId are required" });
//     }
    
//     let notice;
//     if (mongoose.Types.ObjectId.isValid(noticeId)) {
//       notice = await Notice.findById(noticeId);
//     }
    
//     if (!notice) {
//       notice = await Notice.findOne({ _id: noticeId });
//       if (!notice) {
//         return res.status(404).json({ message: "Notice not found" });
//       }
//     }
    
//     const comment = notice.comments.id(commentId);
//     if (!comment) {
//       return res.status(404).json({ message: "Comment not found" });
//     }
    
//     // Check if user owns the comment
//     if (comment.userId.toString() !== userId.toString()) {
//       return res.status(403).json({ message: "You can only edit your own comments" });
//     }
    
//     comment.text = text;
//     comment.updatedAt = new Date();
//     await notice.save();
    
//     res.json({ 
//       success: true, 
//       message: "Comment updated successfully",
//       comment
//     });
//   } catch (err) {
//     console.error("Error editing comment:", err);
//     res.status(500).json({ message: err.message });
//   }
// });

// // DELETE COMMENT - Modified
// router.delete("/notice/:noticeId/comment/:commentId", async (req, res) => {
//   try {
//     const { noticeId, commentId } = req.params;
//     const { userId } = req.body;
    
//     if (!userId) {
//       return res.status(400).json({ message: "User ID is required" });
//     }
    
//     let notice;
//     if (mongoose.Types.ObjectId.isValid(noticeId)) {
//       notice = await Notice.findById(noticeId);
//     }
    
//     if (!notice) {
//       notice = await Notice.findOne({ _id: noticeId });
//       if (!notice) {
//         return res.status(404).json({ message: "Notice not found" });
//       }
//     }
    
//     const comment = notice.comments.id(commentId);
//     if (!comment) {
//       return res.status(404).json({ message: "Comment not found" });
//     }
    
//     // Check if user owns the comment OR is admin
//     const user = await User.findById(userId);
//     const isAdmin = user && user.role === "admin";
    
//     if (comment.userId.toString() !== userId.toString() && !isAdmin) {
//       return res.status(403).json({ message: "You can only delete your own comments" });
//     }
    
//     notice.comments.pull(commentId);
//     await notice.save();
    
//     res.json({ 
//       success: true, 
//       message: "Comment deleted successfully"
//     });
//   } catch (err) {
//     console.error("Error deleting comment:", err);
//     res.status(500).json({ message: err.message });
//   }
// });
// router.post("/recipients", async (req, res) => {
//   try {
//     const { audiences } = req.body;
    
//     let query = {};
//     if (audiences && audiences.length > 0 && !audiences.includes("all")) {
//       query = { role: { $in: audiences } };
//     }
    
//     const users = await User.find(query).select("email firstName lastName role");
    
//     const recipients = users.map(user => ({
//       email: user.email,
//       name: `${user.firstName} ${user.lastName}`,
//       role: user.role
//     }));
    
//     res.json({ success: true, recipients, count: recipients.length });
//   } catch (err) {
//     console.error("Error fetching recipients:", err);
//     res.status(500).json({ message: err.message });
//   }
// });


// // ============ STATIC FILES - MUST BE LAST ============
// router.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// module.exports = router;