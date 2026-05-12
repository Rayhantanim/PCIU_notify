
const mongoose = require('mongoose');

const sectionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  capacity: { type: Number, default: 0 },
  semester: { type: String },
  coordinator: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const departmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  description: { type: String },
  head: { type: String },
  established: { type: String },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  sections: [sectionSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Department', departmentSchema);