const mongoose = require('mongoose');

const FeeStructureSchema = new mongoose.Schema({
  academicYearId: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicYear', required: true },
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
  feeHead: { 
    type: String, 
    required: true, 
    enum: ['Tuition Fee', 'Admission Fee', 'Exam Fee', 'Transport Fee', 'Library Fee', 'Computer / Lab Fee', 'Activity Fee', 'Other Fee'] 
  },
  amount: { type: Number, required: true, min: [0.01, 'Amount must be positive'] },
  frequency: { type: String, required: true }, // Monthly, Quarterly, Yearly
  dueDate: { type: Date },
  status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' }
}, { timestamps: true });

module.exports = mongoose.model('FeeStructure', FeeStructureSchema);