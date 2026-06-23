require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function makeAdmin(email) {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/job_portal');
    
    const user = await User.findOneAndUpdate(
      { email },
      { accountType: 'admin', canPostJobs: true, canApplyJobs: true },
      { new: true }
    );
    
    if (user) {
      console.log(`✅ User updated to admin:`, {
        email: user.email,
        fullName: user.fullName,
        accountType: user.accountType
      });
    } else {
      console.log(`❌ User not found: ${email}`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

const email = process.argv[2] || 'admin@jobportal.com';
makeAdmin(email);
