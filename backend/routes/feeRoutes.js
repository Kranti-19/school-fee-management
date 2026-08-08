const express = require('express');
const router = express.Router();
const FeeStructure = require('../models/FeeStructure');
const StudentFeeAssignment = require('../models/StudentFeeAssignment');
const Installment = require('../models/Installment');
const auth = require('../middleware/auth');

// ==========================================
// 1. FEE STRUCTURE CRUD (Section 6)
// ==========================================

// Create Fee Structure
router.post('/structures', auth, async (req, res) => {
  try {
    const { academicYearId, classId, feeHead, amount, frequency, dueDate } = req.body;

    if (amount <= 0) {
      return res.status(400).json({ message: 'Fee amount must be positive' });
    }

    const structure = new FeeStructure({
      academicYearId,
      classId,
      feeHead,
      amount,
      frequency,
      dueDate
    });

    await structure.save();
    res.status(201).json(structure);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get All Fee Structures (with Filters)
router.get('/structures', auth, async (req, res) => {
  try {
    const { academicYearId, classId } = req.query;
    let query = {};

    if (academicYearId) query.academicYearId = academicYearId;
    if (classId) query.classId = classId;

    const structures = await FeeStructure.find(query)
      .populate('academicYearId')
      .populate('classId');
    res.json(structures);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update Fee Structure
router.put('/structures/:id', auth, async (req, res) => {
  try {
    if (req.body.amount && req.body.amount <= 0) {
      return res.status(400).json({ message: 'Fee amount must be positive' });
    }

    const structure = await FeeStructure.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!structure) return res.status(404).json({ message: 'Fee Structure not found' });

    res.json(structure);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete / Deactivate Fee Structure
router.delete('/structures/:id', auth, async (req, res) => {
  try {
    const structure = await FeeStructure.findByIdAndUpdate(
      req.params.id, 
      { status: 'INACTIVE' }, 
      { new: true }
    );
    if (!structure) return res.status(404).json({ message: 'Fee Structure not found' });

    res.json({ message: 'Fee Structure deactivated successfully', structure });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==========================================
// 2. STUDENT FEE ASSIGNMENT & INSTALLMENTS (Section 7 & 8)
// ==========================================

// Assign Fee to Student & Auto-generate Installments
router.post('/assign', auth, async (req, res) => {
  try {
    const { studentId, feeStructureId, discountAmount = 0, installmentsCount = 1 } = req.body;

    const feeStructure = await FeeStructure.findById(feeStructureId);
    if (!feeStructure) {
      return res.status(404).json({ message: 'Fee Structure not found' });
    }

    const totalAmount = feeStructure.amount;

    // Business Rule Validation
    if (discountAmount < 0) {
      return res.status(400).json({ message: 'Discount cannot be negative' });
    }
    if (discountAmount > totalAmount) {
      return res.status(400).json({ message: 'Discount cannot exceed applicable fee amount' });
    }

    const netPayable = totalAmount - discountAmount;

    // Create Fee Assignment
    const assignment = new StudentFeeAssignment({
      studentId,
      feeStructureId,
      totalAmount,
      discountAmount,
      netPayable,
      status: 'PENDING'
    });

    await assignment.save();

    // Auto-Generate Installments evenly
    const installmentAmount = +(netPayable / installmentsCount).toFixed(2);
    let remainingNet = netPayable;
    const installments = [];

    const baseDueDate = feeStructure.dueDate ? new Date(feeStructure.dueDate) : new Date();

    for (let i = 1; i <= installmentsCount; i++) {
      const isLast = i === installmentsCount;
      const currentAmount = isLast ? remainingNet : installmentAmount;
      remainingNet = +(remainingNet - currentAmount).toFixed(2);

      const dueDate = new Date(baseDueDate);
      dueDate.setMonth(dueDate.getMonth() + (i - 1));

      installments.push({
        assignmentId: assignment._id,
        installmentName: `Installment ${i}`,
        amount: currentAmount,
        dueDate: dueDate,
        paidAmount: 0,
        pendingAmount: currentAmount,
        status: 'PENDING'
      });
    }

    await Installment.insertMany(installments);

    res.status(201).json({
      message: 'Fee assigned and installments generated successfully',
      assignment,
      installmentsCount: installments.length
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get Assignments with Installments for a Student
router.get('/student/:studentId', auth, async (req, res) => {
  try {
    const assignments = await StudentFeeAssignment.find({ studentId: req.params.studentId })
      .populate('feeStructureId')
      .populate('studentId');

    const result = await Promise.all(
      assignments.map(async (assignment) => {
        const installments = await Installment.find({ assignmentId: assignment._id });
        return {
          ...assignment.toObject(),
          installments
        };
      })
    );

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;