/**
 * Seed script to create the initial Sarpanch account.
 * Run: npm run seed:sarpanch
 *
 * Credentials come from environment variables — never hardcoded.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const connectDB = require('./config/db');

const seedSarpanch = async () => {
  try {
    await connectDB();

    const {
      SARPANCH_NAME,
      SARPANCH_EMAIL,
      SARPANCH_PASSWORD,
      SARPANCH_PHONE,
      SARPANCH_VILLAGE,
      SARPANCH_WARD,
    } = process.env;

    if (!SARPANCH_EMAIL || !SARPANCH_PASSWORD) {
      console.error('❌ SARPANCH_EMAIL and SARPANCH_PASSWORD must be set in .env');
      process.exit(1);
    }

    // Check if Sarpanch already exists
    const existing = await User.findOne({ email: SARPANCH_EMAIL.toLowerCase() });
    if (existing) {
      console.log('⚠️  Sarpanch account already exists:');
      console.log(`   Email: ${existing.email}`);
      console.log(`   Role:  ${existing.role}`);
      process.exit(0);
    }

    // Create Sarpanch account (password hashed by User model pre-save hook)
    const sarpanch = await User.create({
      name: SARPANCH_NAME || 'Village Sarpanch',
      email: SARPANCH_EMAIL.toLowerCase(),
      phone: SARPANCH_PHONE || '9876543210',
      password: SARPANCH_PASSWORD,
      role: 'SARPANCH',
      village: SARPANCH_VILLAGE || '',
      ward: SARPANCH_WARD || '',
    });

    console.log('✅ Sarpanch account created successfully:');
    console.log(`   Name:  ${sarpanch.name}`);
    console.log(`   Email: ${sarpanch.email}`);
    console.log(`   Phone: ${sarpanch.phone}`);
    console.log(`   Role:  ${sarpanch.role}`);
    console.log('\n🔐 Use the credentials from .env to login as Sarpanch.');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error.message);
    process.exit(1);
  }
};

seedSarpanch();
