const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const AcademicYear = require('./models/AcademicYear');
const Class = require('./models/Class');
const Student = require('./models/Student');
const User = require('./models/User');

dotenv.config();

const seedMasterData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    // Clear existing collections
    await AcademicYear.deleteMany({});
    await Class.deleteMany({});
    await Student.deleteMany({});
    await User.deleteMany({});

    // Seed Admin User
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await User.create({
      username: 'admin',
      email: 'admin@school.com',
      password: hashedPassword,
      role: 'ADMIN'
    });
    console.log('Admin user seeded (admin / admin123)');

    // Seed Master Data
    const ay = await AcademicYear.create({ yearName: '2025-2026', isActive: true });

    const cls10A = await Class.create({ className: 'Class 10', section: 'A' });
    const cls10B = await Class.create({ className: 'Class 10', section: 'B' });

    await Student.create([
      { grNumber: 'GR2025001', firstName: 'Aarav', lastName: 'Sharma', classId: cls10A._id, academicYearId: ay._id },
      { grNumber: 'GR2025002', firstName: 'Ananya', lastName: 'Patel', classId: cls10A._id, academicYearId: ay._id },
      { grNumber: 'GR2025003', firstName: 'Rohan', lastName: 'Verma', classId: cls10B._id, academicYearId: ay._id }
    ]);

    console.log('Sample master data seeded successfully!');
    process.exit();
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
};

seedMasterData();