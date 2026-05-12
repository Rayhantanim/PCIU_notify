const express = require("express");
const router = express.Router();
// const multer = require("multer");
const path = require("path");
const mongoose = require("mongoose");
const Notice = require("../models/Notice");
const User = require("../models/User");
const Notification = require("../models/Notification");

// Helper function to get recipients based on MULTIPLE audiences (array)
const getRecipientsByAudience = async (audiences) => {
  // Handle both string and array cases
  let audienceArray = audiences;
  if (typeof audiences === 'string') {
    audienceArray = [audiences];
  }
  
  if (!audienceArray || audienceArray.length === 0) {
    console.log("⚠️ No audiences specified");
    return [];
  }
  
  // Build query for multiple roles
  let query = { role: { $in: audienceArray } };
  
  const users = await User.find(query).select("email firstName lastName role");
  console.log(`📊 Found ${users.length} recipients for audiences: ${audienceArray.join(", ")}`);
  
  return users.map(user => ({
    email: user.email,
    name: `${user.firstName} ${user.lastName}`,
    role: user.role
  }));
};

// GET all notices (with role-based filtering)
router.get("/notices", async (req, res) => {
  try {
    const userRole = req.headers['user-role'];
    let query = {};
    
    // Filter notices based on user's role
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

// POST add notice (with MULTI-AUDIENCE support)
router.post("/add-notice", async (req, res) => {
  try {
    console.log("📝 Adding notice:", req.body.title);
    console.log("🎯 Received audience:", req.body.audience);
    console.log("🎯 Type of audience:", typeof req.body.audience);
    
    // Handle audience - ensure it's an array
    let audienceArray = req.body.audience;
    if (typeof audienceArray === 'string') {
      audienceArray = [audienceArray];
    }
    if (!audienceArray || audienceArray.length === 0) {
      audienceArray = ["all"];
    }
    
    console.log("🎯 Processed audience array:", audienceArray);
    
    const noticeData = {
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      audience: audienceArray, // Store as array
      department: req.body.department,
      section: req.body.section,
      priority: req.body.priority,
      isPinned: req.body.isPinned || false,
      expiryDate: req.body.expiryDate,
      createdBy: req.body.createdBy,
      createdByRole: req.body.role,
      role: req.body.role,
    };
    // if (req.file) {
    //   noticeData.attachment = {
    //     filename: req.file.filename,
    //     originalName: req.file.originalname,
    //     path: `/uploads/${req.file.filename}`,
    //     size: req.file.size,
    //     mimetype: req.file.mimetype,
    //   };
    // }
    const notice = new Notice(noticeData);
    await notice.save();
    console.log("✅ Notice saved, ID:", notice._id);

    // Get recipients based on multiple audiences
    const recipients = await getRecipientsByAudience(audienceArray);
    
    // Send email notifications
    let emailCount = 0;
    if (recipients.length > 0) {
      const emailResult = await sendEmailNotifications(recipients, notice, noticeData.category);
      emailCount = emailResult.count;
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
      console.log(`✅ Notification saved for audience: ${singleAudience}`);
    }
    
    // Emit socket event with ALL audiences
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
      console.log(`📡 Socket event emitted for audiences: ${audienceArray.join(", ")}`);
    }

    res.status(201).json({ 
      success: true, 
      notice,
      emailsSent: emailCount,
      recipientsCount: recipients.length
    });
  } catch (err) {
    console.error("❌ Error in /add-notice:", err);
    res.status(500).json({ message: err.message, stack: err.stack });
  }
});


// Backend route - make sure it returns whether user liked or unliked
router.post("/notice/:id/like", async (req, res) => {
  try {
    const { userId } = req.body;
    const noticeId = req.params.id;
    
    const notice = await Notice.findById(noticeId);
    if (!notice) {
      return res.status(404).json({ message: "Notice not found" });
    }
    
    if (!notice.likes) {
      notice.likes = [];
    }
    
    const userIdStr = userId.toString();
    const alreadyLiked = notice.likes.some(id => id.toString() === userIdStr);
    
    if (alreadyLiked) {
      // Unlike
      notice.likes = notice.likes.filter(id => id.toString() !== userIdStr);
      await notice.save();
      return res.json({ 
        success: true, 
        message: "Unliked successfully",
        liked: false,
        likesCount: notice.likes.length 
      });
    } else {
      // Like
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

// In your backend routes file

// LIKE a notice (toggle like) - Modified to handle string IDs
router.post("/notice/:id/like", async (req, res) => {
  try {
    const { userId } = req.body;
    const noticeId = req.params.id;
    
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }
    
    // Try to find by ObjectId first, if invalid format, try to find by custom ID
    let notice;
    if (mongoose.Types.ObjectId.isValid(noticeId)) {
      notice = await Notice.findById(noticeId);
    }
    
    // If not found by ObjectId, try to find by a custom field (if you have one)
    if (!notice) {
      // If you're using custom IDs, try to find by a different field
      notice = await Notice.findOne({ _id: noticeId });
      
      // If still not found, return error
      if (!notice) {
        return res.status(404).json({ message: `Notice not found with ID: ${noticeId}` });
      }
    }
    
    // Convert IDs to strings for comparison
    const userIdStr = userId.toString();
    
    // Check if user already liked
    const alreadyLiked = notice.likes && notice.likes.some(likeId => 
      likeId.toString() === userIdStr
    );
    
    if (alreadyLiked) {
      // Unlike: remove user from likes array
      notice.likes = notice.likes.filter(likeId => likeId.toString() !== userIdStr);
      await notice.save();
      return res.json({ 
        success: true, 
        message: "Notice unliked",
        likesCount: notice.likes.length 
      });
    } else {
      // Like: add user to likes array
      if (!notice.likes) notice.likes = [];
      notice.likes.push(userId);
      await notice.save();
      return res.json({ 
        success: true, 
        message: "Notice liked",
        likesCount: notice.likes.length 
      });
    }
  } catch (err) {
    console.error("Error in like notice:", err);
    res.status(500).json({ message: err.message });
  }
});

// ADD COMMENT - Modified to handle string IDs
router.post("/notice/:id/comment", async (req, res) => {
  try {
    const noticeId = req.params.id;
    const { text, userId, userName, userEmail } = req.body;
    
    if (!text || !userId) {
      return res.status(400).json({ message: "Text and userId are required" });
    }
    
    // Find by ObjectId or custom ID
    let notice;
    if (mongoose.Types.ObjectId.isValid(noticeId)) {
      notice = await Notice.findById(noticeId);
    }
    
    if (!notice) {
      notice = await Notice.findOne({ _id: noticeId });
      if (!notice) {
        return res.status(404).json({ message: `Notice not found with ID: ${noticeId}` });
      }
    }
    
    const newComment = {
      _id: new mongoose.Types.ObjectId(),
      text,
      userId: userId.toString(), // Store as string
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

// EDIT COMMENT - Modified
router.put("/notice/:noticeId/comment/:commentId", async (req, res) => {
  try {
    const { noticeId, commentId } = req.params;
    const { text, userId } = req.body;
    
    if (!text || !userId) {
      return res.status(400).json({ message: "Text and userId are required" });
    }
    
    let notice;
    if (mongoose.Types.ObjectId.isValid(noticeId)) {
      notice = await Notice.findById(noticeId);
    }
    
    if (!notice) {
      notice = await Notice.findOne({ _id: noticeId });
      if (!notice) {
        return res.status(404).json({ message: "Notice not found" });
      }
    }
    
    const comment = notice.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }
    
    // Check if user owns the comment
    if (comment.userId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "You can only edit your own comments" });
    }
    
    comment.text = text;
    comment.updatedAt = new Date();
    await notice.save();
    
    res.json({ 
      success: true, 
      message: "Comment updated successfully",
      comment
    });
  } catch (err) {
    console.error("Error editing comment:", err);
    res.status(500).json({ message: err.message });
  }
});

// DELETE COMMENT - Modified
router.delete("/notice/:noticeId/comment/:commentId", async (req, res) => {
  try {
    const { noticeId, commentId } = req.params;
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }
    
    let notice;
    if (mongoose.Types.ObjectId.isValid(noticeId)) {
      notice = await Notice.findById(noticeId);
    }
    
    if (!notice) {
      notice = await Notice.findOne({ _id: noticeId });
      if (!notice) {
        return res.status(404).json({ message: "Notice not found" });
      }
    }
    
    const comment = notice.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }
    
    // Check if user owns the comment OR is admin
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