
const express = require('express');
const router = express.Router();
const Department = require('../models/Department');

// Get all departments
router.get('/departments', async (req, res) => {
  try {
    const departments = await Department.find();
    res.json({ success: true, departments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Create department
router.post('/departments', async (req, res) => {
  try {
    const department = new Department(req.body);
    await department.save();
    res.json({ success: true, department });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update department
router.put('/departments/:id', async (req, res) => {
  try {
    const department = await Department.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, department });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Delete department
router.delete('/departments/:id', async (req, res) => {
  try {
    await Department.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Add section to department
router.post('/departments/:id/sections', async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);
    department.sections.push(req.body);
    await department.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Delete section from department
router.delete('/departments/:id/sections/:sectionId', async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);
    department.sections = department.sections.filter(s => s._id.toString() !== req.params.sectionId);
    await department.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;