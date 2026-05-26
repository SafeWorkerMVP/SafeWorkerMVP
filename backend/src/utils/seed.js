const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

const connectDB = require('../config/db');
const User = require('../models/User');
const Device = require('../models/Device');
const Shift = require('../models/Shift');
const SensorData = require('../models/SensorData');
const Alarm = require('../models/Alarm');
const DangerZone = require('../models/DangerZone');
const ZoneEntry = require('../models/ZoneEntry');

dotenv.config();

const dropCollectionIfExists = async (collectionName) => {
  const collections = await mongoose.connection.db
    .listCollections({ name: collectionName })
    .toArray();

  if (collections.length > 0) {
    await mongoose.connection.db.dropCollection(collectionName);
  }
};

const seed = async () => {
  try {
    await connectDB();

    await Promise.all([
      User.deleteMany({}),
      Device.deleteMany({}),
      Shift.deleteMany({}),
      SensorData.deleteMany({}),
      Alarm.deleteMany({}),
      DangerZone.deleteMany({}),
      ZoneEntry.deleteMany({})
    ]);
    await dropCollectionIfExists('sensordatas');

    const passwordHash = await bcrypt.hash('123456', 10);

    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@safeworker.com',
      passwordHash,
      role: 'admin'
    });

    const worker = await User.create({
      name: 'Worker User',
      email: 'worker@safeworker.com',
      passwordHash,
      role: 'worker'
    });

    const device = await Device.create({
      workerId: worker._id,
      deviceCode: 'DEVICE-001',
      deviceName: 'Worker Phone',
      networkStatus: 'online',
      batteryLevel: 80,
      isActive: true,
      lastSeen: new Date()
    });

    await DangerZone.insertMany([
      {
        zoneName: 'Kimyasal Depo',
        qrCode: 'ZONE-CHEM-001',
        riskLevel: 'high',
        description: 'Kimyasal maddelerin bulunduğu riskli alan'
      },
      {
        zoneName: 'Forklift Geçiş Alanı',
        qrCode: 'ZONE-FORK-001',
        riskLevel: 'medium',
        description: 'Forklift trafiğinin yoğun olduğu alan'
      },
      {
        zoneName: 'Bakım Alanı',
        qrCode: 'ZONE-MAINT-001',
        riskLevel: 'high',
        description: 'Bakım ve onarım çalışmalarının yapıldığı riskli alan'
      }
    ]);

    console.log('SafeWorker seed completed');
    console.log('Admin login: admin@safeworker.com / 123456');
    console.log('Worker login: worker@safeworker.com / 123456');
    console.log(`SEED_ADMIN_ID=${admin._id}`);
    console.log(`SEED_WORKER_ID=${worker._id}`);
    console.log(`SEED_DEVICE_ID=${device._id}`);
  } catch (error) {
    console.error('Seed failed:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

seed();
