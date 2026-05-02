const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification");

// Get all notifications
router.get("/notifications", async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 }).limit(50);
    console.log(`📋 Fetching ${notifications.length} notifications`);
    res.json(notifications);
  } catch (err) {
    console.error("Error fetching notifications:", err);
    res.status(500).json({ message: err.message });
  }
});

// Mark notification as read
router.put("/notifications/:id/read", async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );
    res.json(notification);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Mark all as read
router.post("/notifications/mark-all-read", async (req, res) => {
  try {
    await Notification.updateMany({}, { read: true });
    res.json({ message: "All notifications marked as read" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete notification
router.delete("/notifications/:id", async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    res.json({ message: "Notification deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Test endpoint to check notifications
router.get("/notifications-check", async (req, res) => {
  try {
    const count = await Notification.countDocuments();
    const all = await Notification.find().sort({ createdAt: -1 }).limit(10);
    res.json({ 
      count, 
      notifications: all,
      message: count > 0 ? "Notifications exist" : "No notifications in DB"
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;