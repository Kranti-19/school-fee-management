const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const Installment = require('../models/Installment');
const StudentFeeAssignment = require('../models/StudentFeeAssignment');
const auth = require('../middleware/auth');

// Helper function to update Parent Assignment Status
const updateAssignmentStatus = async (assignmentId) => {
  const installments = await Installment.find({ assignmentId });
  const allPaid = installments.every(inst => inst.status === 'PAID');
  const anyPaid = installments.some(inst => inst.status === 'PAID' || inst.status === 'PARTIALLY_PAID');

  let newStatus = 'PENDING';
  if (allPaid) newStatus = 'PAID';
  else if (anyPaid) newStatus = 'PARTIALLY_PAID';

  await StudentFeeAssignment.findByIdAndUpdate(assignmentId, { status: newStatus });
};

// ==========================================
// 1. COLLECT PAYMENT (Sections 9 & 10)
// ==========================================
router.post('/collect', auth, async (req, res) => {
  try {
    const { installmentId, amountPaid, paymentMode, transactionRef, remarks } = req.body;

    // Validation 1: Amount must be positive
    if (amountPaid <= 0) {
      return res.status(400).json({ message: 'Payment amount must be positive' });
    }

    const installment = await Installment.findById(installmentId).populate('assignmentId');
    if (!installment) {
      return res.status(404).json({ message: 'Installment not found' });
    }

    // Validation 2: Payment cannot exceed pending amount
    if (amountPaid > installment.pendingAmount) {
      return res.status(400).json({ 
        message: `Payment amount cannot exceed pending balance of ${installment.pendingAmount}` 
      });
    }

    // Calculate new amounts
    const newPaidAmount = +(installment.paidAmount + amountPaid).toFixed(2);
    const newPendingAmount = +(installment.pendingAmount - amountPaid).toFixed(2);

    // Determine status
    let newStatus = 'PARTIALLY_PAID';
    if (newPendingAmount === 0) {
      newStatus = 'PAID';
    }

    // Update Installment
    installment.paidAmount = newPaidAmount;
    installment.pendingAmount = newPendingAmount;
    installment.status = newStatus;
    await installment.save();

    // Generate Unique Receipt Number (REC-YYYYMMDD-XXXX)
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const count = await Payment.countDocuments();
    const receiptNumber = `REC-${dateStr}-${(count + 1).toString().padStart(4, '0')}`;

    // Create Payment Record
    const payment = new Payment({
      receiptNumber,
      studentId: installment.assignmentId.studentId,
      installmentId: installment._id,
      amountPaid,
      paymentMode,
      transactionRef,
      collectedBy: req.user.id,
      remarks,
      remainingBalance: newPendingAmount
    });

    await payment.save();

    // Cascade update to Assignment status
    await updateAssignmentStatus(installment.assignmentId._id);

    res.status(201).json({
      message: 'Payment recorded successfully',
      payment,
      receiptNumber
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==========================================
// 2. GET RECEIPT DETAILS (Section 11)
// ==========================================
router.get('/receipt/:receiptNumber', auth, async (req, res) => {
  try {
    const payment = await Payment.findOne({ receiptNumber: req.params.receiptNumber })
      .populate({
        path: 'studentId',
        populate: { path: 'classId' }
      })
      .populate({
        path: 'installmentId',
        populate: {
          path: 'assignmentId',
          populate: { path: 'feeStructureId' }
        }
      })
      .populate('collectedBy', 'username email');

    if (!payment) {
      return res.status(404).json({ message: 'Receipt not found' });
    }

    res.json(payment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==========================================
// 3. PAYMENT HISTORY / REPORTS (Sections 13 & 14)
// ==========================================
router.get('/history', auth, async (req, res) => {
  try {
    const { studentId, paymentMode, startDate, endDate } = req.query;
    let query = {};

    if (studentId) query.studentId = studentId;
    if (paymentMode) query.paymentMode = paymentMode;
    if (startDate && endDate) {
      query.paymentDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const payments = await Payment.find(query)
      .populate('studentId', 'firstName lastName grNumber')
      .populate('installmentId', 'installmentName')
      .populate('collectedBy', 'username')
      .sort({ createdAt: -1 });

    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;