const mongoose = require('mongoose');

const AcademicYearSchema = new mongoose.Schema({
  yearName: { type: String, required: true, unique: true }, // e.g. "2025-2026"
  isActive: { type: Boolean, default: true }
});

module.exports = mongoose.model('AcademicYear', AcademicYearSchema);