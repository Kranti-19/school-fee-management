const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Upsert admin user to ensure password and credentials are correct
    await User.findOneAndUpdate(
      { email: 'admin@school.com' },
      {
        username: 'admin',
        email: 'admin@school.com',
        password: hashedPassword,
        role: 'ADMIN'
      },
      { upsert: true, new: true }
    );

    console.log('Admin user updated/created successfully!');
    console.log('Username: admin | Email: admin@school.com | Password: admin123');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();