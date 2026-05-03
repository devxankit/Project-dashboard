const mongoose = require('mongoose');
const User = require('../models/User');

const seedMasterAdmin = async () => {
  try {
    const masterEmail = 'devxankit@gmial.com';
    const masterPassword = '123456';

    let existingMaster = await User.findOne({ email: masterEmail });

    if (!existingMaster) {
      const newMaster = await User.create({
        name: 'Master Admin',
        email: masterEmail,
        password: masterPassword,
        role: 'MASTER_ADMIN',
        permissions: ['read', 'write', 'admin'],
      });
      newMaster.tenantId = newMaster._id;
      await newMaster.save();
      existingMaster = newMaster;
      console.log('✅ Master Admin created successfully');
    } else {
      existingMaster.role = 'MASTER_ADMIN';
      if (!existingMaster.permissions.includes('admin')) {
        existingMaster.permissions = ['read', 'write', 'admin'];
      }
      if (!existingMaster.tenantId) {
        existingMaster.tenantId = existingMaster._id;
      }
      await existingMaster.save();
      console.log('ℹ️  Master Admin already exists');
    }

    // Drop old single-field unique indexes before re-creating compound ones
    await dropOldIndexes();

    // Migrate all existing data (no tenantId) to this master admin's tenant
    await migrateExistingData(existingMaster._id);
  } catch (err) {
    console.error('❌ Error seeding Master Admin:', err.message);
  }
};

const dropOldIndexes = async () => {
  const drops = [
    { collection: 'statuses', index: 'name_1' },
    { collection: 'projecttypes', index: 'name_1' },
    { collection: 'teammembers', index: 'email_1' },
  ];
  for (const { collection, index } of drops) {
    try {
      await mongoose.connection.collection(collection).dropIndex(index);
      console.log(`✅ Dropped old index ${index} from ${collection}`);
    } catch {
      // Index may not exist — safe to ignore
    }
  }
};

const migrateExistingData = async (tenantId) => {
  try {
    const Project = require('../models/Project');
    const Status = require('../models/Status');
    const ProjectType = require('../models/ProjectType');
    const TeamMember = require('../models/TeamMember');
    const ActivityLog = require('../models/ActivityLog');

    const [pRes, sRes, ptRes, tmRes, alRes] = await Promise.all([
      Project.updateMany({ tenantId: null }, { $set: { tenantId } }),
      Status.updateMany({ tenantId: null }, { $set: { tenantId } }),
      ProjectType.updateMany({ tenantId: null }, { $set: { tenantId } }),
      TeamMember.updateMany({ tenantId: null }, { $set: { tenantId } }),
      ActivityLog.updateMany({ tenantId: null }, { $set: { tenantId } }),
    ]);

    // Also assign tenantId to all sub-admins that don't have one yet
    await User.updateMany(
      { tenantId: null, role: { $ne: 'MASTER_ADMIN' } },
      { $set: { tenantId } }
    );

    const total =
      pRes.modifiedCount +
      sRes.modifiedCount +
      ptRes.modifiedCount +
      tmRes.modifiedCount +
      alRes.modifiedCount;

    if (total > 0) {
      console.log(`✅ Migrated ${total} existing records to tenant: ${tenantId}`);
    }
  } catch (err) {
    console.error('❌ Data migration error:', err.message);
  }
};

module.exports = { seedMasterAdmin };
