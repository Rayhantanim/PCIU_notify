const express = require("express");
const router = express.Router();
const Notice = require("../models/Notice");


router.get("/notices", async (req, res) => {
  try {
    const notices = await Notice.find().sort({ createdAt: -1 });
    res.json(notices);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/add-notice", async (req, res) => {

  try {
    const notice = new Notice(req.body);
    await notice.save();

    res.json({ success: true, notice });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
});


module.exports = router;