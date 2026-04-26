const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const Notice = require("../models/Notice");
const User = require("../models/User"); // Make sure you import User model

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Ensure this folder exists in root
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/plain",
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Allowed: images, PDF, Word, Excel, text files"), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  },
  fileFilter: fileFilter,
});

// GET all notices
router.get("/notices", async (req, res) => {
  try {
    const notices = await Notice.find().sort({ createdAt: -1 });
    res.json(notices);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST add notice (with file upload)
router.post("/add-notice", upload.single("attachment"), async (req, res) => {
  try {
    const noticeData = {
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      audience: typeof req.body.audience === 'string' 
        ? JSON.parse(req.body.audience) 
        : req.body.audience,
      department: req.body.department,
      section: req.body.section,
      priority: req.body.priority,
      isPinned: req.body.isPinned === "true" || req.body.isPinned === true,
      expiryDate: req.body.expiryDate,
      createdBy: req.body.createdBy,
      role: req.body.role,
    };

    // Add attachment if file was uploaded
    if (req.file) {
      noticeData.attachment = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        path: `/uploads/${req.file.filename}`,
        size: req.file.size,
        mimetype: req.file.mimetype,
      };
    }

    const notice = new Notice(noticeData);
    await notice.save();

    res.status(201).json({ success: true, notice });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
});

// POST add notice for staff (with file upload)
router.post("/add-noticestaff", upload.single("attachment"), async (req, res) => {
  try {
    const noticeData = {
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      audience: typeof req.body.audience === 'string' 
        ? JSON.parse(req.body.audience) 
        : req.body.audience,
      department: req.body.department,
      section: req.body.section,
      priority: req.body.priority,
      isPinned: req.body.isPinned === "true" || req.body.isPinned === true,
      expiryDate: req.body.expiryDate,
      createdBy: req.body.createdBy,
      role: req.body.role,
    };

    if (req.file) {
      noticeData.attachment = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        path: `/uploads/${req.file.filename}`,
        size: req.file.size,
        mimetype: req.file.mimetype,
      };
    }

    const newNotice = new Notice(noticeData);
    await newNotice.save();

    res.status(201).json({ success: true, notice: newNotice });
  } catch (err) {
    console.log(err);
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

    res.json({
      totalNotices,
      totalStudents,
      totalTeachers,
      totalStaff,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Serve static files from uploads folder
router.use("/uploads", express.static(path.join(__dirname, "../uploads")));

module.exports = router;



// const express = require("express");
// const router = express.Router();
// const Notice = require("../models/Notice");


// router.get("/notices", async (req, res) => {
//   try {
//     const notices = await Notice.find().sort({ createdAt: -1 });
//     res.json(notices);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// router.post("/add-notice", async (req, res) => {

//   try {
//     const notice = new Notice(req.body);
//     await notice.save();

//     res.json({ success: true, notice });

//   } catch (err) {
//     console.log(err);
//     res.status(500).json({ message: err.message });
//   }
// });


// router.post("/add-noticestaff", async (req, res) => {
//   try {
//     const newNotice = new Notice(req.body);
//     await newNotice.save();

//    res.status(201).json(newNotice);

//   } catch (err) {
//     res.status(500).json({ message: "Server error" });
//   }
// });


// // GET /api/dashboard-stats
// router.get("/dashboard-stats", async (req, res) => {
//   try {
//     const totalNotices = await Notice.countDocuments();
//     const totalStudents = await User.countDocuments({ role: "student" });
//     const totalTeachers = await User.countDocuments({ role: "teacher" });
//     const totalStaff = await User.countDocuments({ role: "staff" });

//     res.json({
//       totalNotices,
//       totalStudents,
//       totalTeachers,
//       totalStaff,
//     });
//     console.log(totalNotices)
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// module.exports = router;