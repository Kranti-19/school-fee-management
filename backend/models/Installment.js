const mongoose = require('mongoose');

const InstallmentSchema = new mongoose.Schema({
  assignmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'StudentFeeAssignment', required: true },
  installmentName: { type: String, required: true }, // e.g. "Installment 1"
  amount: { type: Number, required: true, min: 0.01 },
  dueDate: { type: Date, required: true },
  paidAmount: { type: Number, default: 0, min: 0 },
  pendingAmount: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ['PENDING', 'PARTIALLY_PAID', 'PAID', 'OVERDUE'], default: 'PENDING' }
}, { timestamps: true });

module.exports = mongoose.model('Installment', InstallmentSchema);