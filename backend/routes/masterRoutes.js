const express = require('express');
const router = express.Router();
const AcademicYear = require('../models/AcademicYear');
const Class = require('../models/Class');
const Student = require('../models/Student');
const auth = require('../middleware/auth');

// --- ACADEMIC YEARS ---
router.post('/academic-years', auth, async (req, res) => {
  try {
    const year = new AcademicYear(req.body);
    await year.save();
    res.status(201).json(year);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.get('/academic-years', auth, async (req, res) => {
  try {
    const years = await AcademicYear.find();
    res.json(years);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- CLASSES ---
router.post('/classes', auth, async (req, res) => {
  try {
    const newClass = new Class(req.body);
    await newClass.save();
    res.status(201).json(newClass);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.get('/classes', auth, async (req, res) => {
  try {
    const classes = await Class.find();
    res.json(classes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- STUDENTS ---
router.post('/students', auth, async (req, res) => {
  try {
    const student = new Student(req.body);
    await student.save();
    res.status(201).json(student);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.get('/students', auth, async (req, res) => {
  try {
    const { search, classId } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { grNumber: { $regex: search, $options: 'i' } }
      ];
    }

    if (classId) query.classId = classId;

    const students = await Student.find(query)
      .populate('classId')
      .populate('academicYearId');
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;