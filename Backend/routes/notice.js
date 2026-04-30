const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const mongoose = require("mongoose");
const Notice = require("../models/Notice");
const User = require("../models/User");
const Notification = require("../models/Notification");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg", "image/png", "image/gif",
    "application/pdf", "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/plain",
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type"), false);
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: fileFilter,
});

// ============ ALL ROUTES ============

// GET all notices
router.get("/notices", async (req, res) => {
  try {
    const notices = await Notice.find().sort({ createdAt: -1 });
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



// POST add notice (with notification)
router.post("/add-notice", async (req, res) => {
  try {
    console.log("📝 Adding notice:", req.body.title);
    
    const noticeData = {
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      audience: req.body.audience,
      department: req.body.department,
      section: req.body.section,
      priority: req.body.priority,
      isPinned: req.body.isPinned,
      expiryDate: req.body.expiryDate,
      createdBy: req.body.createdBy,
      role: req.body.role,
    };

    const notice = new Notice(noticeData);
    await notice.save();
    console.log("✅ Notice saved, ID:", notice._id);

    // SAVE NOTIFICATION TO DATABASE
    try {
      const notification = new Notification({
        noticeId: notice._id,
        title: notice.title,
        message: `New ${notice.category} notice: ${notice.title}`,
        type: "notice",
        createdBy: notice.createdBy,
        role: notice.role,
        read: false,
        createdAt: new Date()
      });
      
      const savedNotification = await notification.save();
      console.log("✅ NOTIFICATION SAVED TO DB! ID:", savedNotification._id);
      console.log("📊 Total notifications:", await Notification.countDocuments());
      
      // Emit socket event
      const io = req.app.get("io");
      if (io) {
        io.emit("newNotice", {
          id: savedNotification._id,
          noticeId: notice._id,
          title: notice.title,
          message: `New ${notice.category} notice: ${notice.title}`,
          time: new Date(),
          type: "notice",
          createdBy: notice.createdBy,
          role: notice.role
        });
        console.log("📡 Socket event emitted");
      }
    } catch (notifError) {
      console.error("❌ Error saving notification:", notifError);
    }

    res.status(201).json({ success: true, notice });
  } catch (err) {
    console.error("❌ Error:", err);
    res.status(500).json({ message: err.message });
  }
});


// POST add notice for staff
router.post("/add-noticestaff", async (req, res) => {
  try {
    console.log("📝 Adding staff notice:", req.body.title);
    
    const noticeData = {
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      audience: req.body.audience,
      department: req.body.department,
      section: req.body.section,
      priority: req.body.priority,
      isPinned: req.body.isPinned,
      expiryDate: req.body.expiryDate,
      createdBy: req.body.createdBy,
      role: req.body.role,
    };

    const newNotice = new Notice(noticeData);
    await newNotice.save();
    console.log("✅ Staff notice saved, ID:", newNotice._id);

    // SAVE NOTIFICATION TO DATABASE
    try {
      const notification = new Notification({
        noticeId: newNotice._id,
        title: newNotice.title,
        message: `Staff notice: ${newNotice.title}`,
        type: "staff-notice",
        createdBy: newNotice.createdBy,
        role: newNotice.role,
        read: false,
        createdAt: new Date()
      });
      
      const savedNotification = await notification.save();
      console.log("✅ STAFF NOTIFICATION SAVED TO DB! ID:", savedNotification._id);
      
      // Emit socket event
      const io = req.app.get("io");
      if (io) {
        io.emit("newNotice", {
          id: savedNotification._id,
          noticeId: newNotice._id,
          title: newNotice.title,
          message: `Staff notice: ${newNotice.title}`,
          time: new Date(),
          type: "staff-notice",
          createdBy: newNotice.createdBy,
          role: newNotice.role
        });
        console.log("📡 Socket event emitted for staff notice");
      }
    } catch (notifError) {
      console.error("❌ Error saving staff notification:", notifError);
    }

    res.status(201).json({ success: true, notice: newNotice });
  } catch (err) {
    console.error("❌ Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});






// router.post("/add-notice", upload.single("attachment"), async (req, res) => {
//   try {
//     const noticeData = {
//       title: req.body.title,
//       description: req.body.description,
//       category: req.body.category,
//       audience: typeof req.body.audience === 'string' ? JSON.parse(req.body.audience) : req.body.audience,
//       department: req.body.department,
//       section: req.body.section,
//       priority: req.body.priority,
//       isPinned: req.body.isPinned === "true" || req.body.isPinned === true,
//       expiryDate: req.body.expiryDate,
//       createdBy: req.body.createdBy,
//       role: req.body.role,
//     };
//     if (req.file) {
//       noticeData.attachment = {
//         filename: req.file.filename,
//         originalName: req.file.originalname,
//         path: `/uploads/${req.file.filename}`,
//         size: req.file.size,
//         mimetype: req.file.mimetype,
//       };
//     }
//     const notice = new Notice(noticeData);
//     await notice.save();
//     res.status(201).json({ success: true, notice });
//   } catch (err) {
//     console.log(err);
//     res.status(500).json({ message: err.message });
//   }
// });

// POST add notice for staff
// router.post("/add-noticestaff", upload.single("attachment"), async (req, res) => {
//   try {
//     const noticeData = {
//       title: req.body.title,
//       description: req.body.description,
//       category: req.body.category,
//       audience: typeof req.body.audience === 'string' ? JSON.parse(req.body.audience) : req.body.audience,
//       department: req.body.department,
//       section: req.body.section,
//       priority: req.body.priority,
//       isPinned: req.body.isPinned === "true" || req.body.isPinned === true,
//       expiryDate: req.body.expiryDate,
//       createdBy: req.body.createdBy,
//       role: req.body.role,
//     };
//     if (req.file) {
//       noticeData.attachment = {
//         filename: req.file.filename,
//         originalName: req.file.originalname,
//         path: `/uploads/${req.file.filename}`,
//         size: req.file.size,
//         mimetype: req.file.mimetype,
//       };
//     }
//     const newNotice = new Notice(noticeData);
//     await newNotice.save();
//     res.status(201).json({ success: true, notice: newNotice });
//   } catch (err) {
//     console.log(err);
//     res.status(500).json({ message: "Server error" });
//   }
// });

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

// ============ STATIC FILES - MUST BE LAST ============
router.use("/uploads", express.static(path.join(__dirname, "../uploads")));

module.exports = router;