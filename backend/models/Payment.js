const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  receiptNumber: { type: String, required: true, unique: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  installmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Installment', required: true },
  paymentDate: { type: Date, default: Date.now },
  amountPaid: { type: Number, required: true, min: 0.01 },
  paymentMode: { type: String, enum: ['Cash', 'UPI', 'Card', 'Bank Transfer', 'Cheque', 'Other'], required: true },
  transactionRef: { type: String },
  collectedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  remarks: { type: String },
  remainingBalance: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Payment', PaymentSchema);