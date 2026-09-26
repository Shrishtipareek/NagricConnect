require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');

const seedSuperAdmin = async () => {
  try {
    await connectDB();

    const email = 'superadmin@nagrikconnect.local';
    const existingAdmin = await User.findOne({ email });

    if (existingAdmin) {
      console.log('Super Admin already exists.');
      process.exit(0);
    }

    const admin = await User.create({
      name: 'Platform Super Admin',
      email: email,
      phone: '9999999999',
      password: 'SuperAdminSecure@2026',
      role: 'SUPER_ADMIN',
    });

    console.log('✅ Super Admin account created successfully:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: SuperAdminSecure@2026`);

    process.exit(0);
  } catch (error) {
    console.error('Failed to create Super Admin:', error);
    process.exit(1);
  }
};

seedSuperAdmin();
