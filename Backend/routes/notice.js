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


// ============ ALL ROUTES ============

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


// POST add notice for staff
router.post("/add-noticestaff",  async (req, res) => {
  try {
    console.log("📝 Adding staff notice:", req.body.title);
    console.log("🎯 Received audience:", req.body.audience);
    
    // Handle audience - ensure it's an array
    let audienceArray = req.body.audience;
    if (typeof audienceArray === 'string') {
      audienceArray = [audienceArray];
    }
    if (!audienceArray || audienceArray.length === 0) {
      audienceArray = ["all"];
    }
    
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
    const newNotice = new Notice(noticeData);
    await newNotice.save();
    console.log("✅ Staff notice saved, ID:", newNotice._id);

    // Get recipients based on multiple audiences
    const recipients = await getRecipientsByAudience(audienceArray);
    
    // Send email notifications
    let emailCount = 0;
    if (recipients.length > 0) {
      const emailResult = await sendEmailNotifications(recipients, newNotice, "Staff");
      emailCount = emailResult.count;
    }

    // Save notification for EACH audience type
    for (const singleAudience of audienceArray) {
      const notification = new Notification({
        noticeId: newNotice._id,
        title: newNotice.title,
        message: `Staff notice: ${newNotice.title}`,
        type: "staff-notice",
        audience: singleAudience,
        createdBy: newNotice.createdBy,
        role: newNotice.role,
        read: false,
        createdAt: new Date()
      });
      
      await notification.save();
      console.log(`✅ Staff notification saved for audience: ${singleAudience}`);
    }
    
    // Emit socket event
    const io = req.app.get("io");
    if (io) {
      io.emit("newNotice", {
        id: newNotice._id,
        noticeId: newNotice._id,
        title: newNotice.title,
        message: `Staff notice: ${newNotice.title}`,
        time: new Date(),
        type: "staff-notice",
        audiences: audienceArray,
        createdBy: newNotice.createdBy,
        role: newNotice.role
      });
      console.log(`📡 Socket event emitted for staff notice to audiences: ${audienceArray.join(", ")}`);
    }

    res.status(201).json({ 
      success: true, 
      notice: newNotice,
      emailsSent: emailCount
    });
  } catch (err) {
    console.error("❌ Error in /add-noticestaff:", err);
    res.status(500).json({ message: "Server error" });
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

// POST endpoint to get recipients by audience
// POST endpoint to get recipients by audience
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