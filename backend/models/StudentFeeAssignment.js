const mongoose = require('mongoose');

const StudentFeeAssignmentSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  feeStructureId: { type: mongoose.Schema.Types.ObjectId, ref: 'FeeStructure', required: true },
  totalAmount: { type: Number, required: true },
  discountAmount: { type: Number, default: 0, min: 0 },
  netPayable: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ['PENDING', 'PARTIALLY_PAID', 'PAID', 'OVERDUE'], default: 'PENDING' }
}, { timestamps: true });

module.exports = mongoose.model('StudentFeeAssignment', StudentFeeAssignmentSchema);