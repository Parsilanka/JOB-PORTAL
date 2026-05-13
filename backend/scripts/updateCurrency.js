const mongoose = require('mongoose');
require('dotenv').config();

const Job = require('../models/Job');

const updateCurrency = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('Connected to MongoDB');

    // Update all jobs with USD to Ksh
    const result = await Job.updateMany(
      { 'salary.currency': 'USD' },
      { $set: { 'salary.currency': 'Ksh' } }
    );

    console.log(`Updated ${result.modifiedCount} jobs from USD to Ksh`);

    // Also set default currency for any jobs without currency
    const result2 = await Job.updateMany(
      { 'salary.currency': { $exists: false } },
      { $set: { 'salary.currency': 'Ksh' } }
    );

    console.log(`Set default currency Ksh for ${result2.modifiedCount} jobs`);

    // Disconnect
    await mongoose.connection.close();
    console.log('Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

updateCurrency();
