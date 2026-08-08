const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const StudentFeeAssignment = require('../models/StudentFeeAssignment');
const Installment = require('../models/Installment');
const Payment = require('../models/Payment');
const auth = require('../middleware/auth');

router.get('/stats', auth, async (req, res) => {
  try {
    // 1. Total Active Students
    const totalStudents = await Student.countDocuments({ status: 'ACTIVE' });

    // 2. Fee Assignment Totals
    const assignments = await StudentFeeAssignment.find();
    const totalAssigned = assignments.reduce((acc, curr) => acc + (curr.netPayable || 0), 0);

    // 3. Installment Aggregations
    const installments = await Installment.find();
    const totalCollected = installments.reduce((acc, curr) => acc + (curr.paidAmount || 0), 0);
    const totalPending = installments.reduce((acc, curr) => acc + (curr.pendingAmount || 0), 0);

    // 4. Overdue Fees Calculation (dueDate < now AND pendingAmount > 0)
    const now = new Date();
    const overdueInstallments = installments.filter(inst => {
      const isPastDue = new Date(inst.dueDate) < now;
      const hasBalance = Number(inst.pendingAmount) > 0;
      return isPastDue && hasBalance;
    });
    const overdueAmount = overdueInstallments.reduce((acc, curr) => acc + (curr.pendingAmount || 0), 0);

    // 5. Today's Collection (Local Midnight Boundaries)
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const todaysPayments = await Payment.find({
      paymentDate: { $gte: startOfDay, $lte: endOfDay }
    });
    const todayCollection = todaysPayments.reduce((acc, curr) => acc + (curr.amountPaid || 0), 0);

    // 6. Recent Payments (Last 5)
    const recentPayments = await Payment.find()
      .populate('studentId', 'firstName lastName grNumber')
      .sort({ createdAt: -1 })
      .limit(5);

    // Return exact keys expected by Dashboard.jsx
    res.json({
      totalStudents,
      totalAssigned,
      totalCollected,
      totalPending,
      todayCollection,
      currentInstallmentsDue: overdueInstallments.length,
      overdueAmount,
      recentPayments
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;