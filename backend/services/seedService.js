const User = require('../models/User');

const seedMasterAdmin = async () => {
  try {
    const masterEmail = 'devxankit@gmial.com';
    const masterPassword = '123456';

    const existingMaster = await User.findOne({ email: masterEmail });

    if (!existingMaster) {
      await User.create({
        name: 'Master Admin',
        email: masterEmail,
        password: masterPassword,
        role: 'MASTER_ADMIN',
        permissions: ['read', 'write', 'admin'],
      });
      console.log('✅ Master Admin created successfully');
    } else {
      // Ensure existing master has the correct role and permissions
      existingMaster.role = 'MASTER_ADMIN';
      if (!existingMaster.permissions.includes('admin')) {
        existingMaster.permissions = ['read', 'write', 'admin'];
      }
      await existingMaster.save();
      console.log('ℹ️ Master Admin already exists');
    }
  } catch (err) {
    console.error('❌ Error seeding Master Admin:', err.message);
  }
};

module.exports = { seedMasterAdmin };
