require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Village = require('./models/Village');
const User = require('./models/User');
const Complaint = require('./models/Complaint');
const Notice = require('./models/Notice');

const migrate = async () => {
  try {
    await connectDB();
    console.log('Starting data migration to Multi-Village Architecture...');

    // 1. Create a Default Village if none exists
    let defaultVillage = await Village.findOne({ villageCode: 'DEFAULT-001' });
    if (!defaultVillage) {
      defaultVillage = await Village.create({
        name: 'Default Village',
        district: 'Default District',
        state: 'Default State',
        pincode: '000000',
        villageCode: 'DEFAULT-001',
      });
      console.log('Created default village:', defaultVillage._id);
    } else {
      console.log('Default village already exists:', defaultVillage._id);
    }

    const villageId = defaultVillage._id;

    // 2. Update Users
    const userRes = await User.updateMany(
      { villageId: { $exists: false } },
      { $set: { villageId: villageId } }
    );
    console.log(`Updated ${userRes.modifiedCount} users with villageId.`);

    // Set existing Sarpanchs to APPROVED
    const sarpanchRes = await User.updateMany(
      { role: 'SARPANCH', sarpanchStatus: { $exists: false } },
      { $set: { sarpanchStatus: 'APPROVED' } }
    );
    console.log(`Updated ${sarpanchRes.modifiedCount} sarpanchs to APPROVED status.`);
    
    // Set citizens to NOT_APPLICABLE
    const citizenRes = await User.updateMany(
      { role: 'CITIZEN', sarpanchStatus: { $exists: false } },
      { $set: { sarpanchStatus: 'NOT_APPLICABLE' } }
    );
    console.log(`Updated ${citizenRes.modifiedCount} citizens with NOT_APPLICABLE status.`);

    // 3. Update Complaints
    const complaintRes = await Complaint.updateMany(
      { villageId: { $exists: false } },
      { $set: { villageId: villageId } }
    );
    console.log(`Updated ${complaintRes.modifiedCount} complaints with villageId.`);

    // 4. Update Notices
    const noticeRes = await Notice.updateMany(
      { villageId: { $exists: false } },
      { $set: { villageId: villageId } }
    );
    console.log(`Updated ${noticeRes.modifiedCount} notices with villageId.`);

    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

migrate();
