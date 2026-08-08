const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
  grNumber: { type: String, required: true, unique: true }, // Admission / GR Number
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
  academicYearId: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicYear', required: true },
  status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' }
}, { timestamps: true });

module.exports = mongoose.model('Student', StudentSchema);