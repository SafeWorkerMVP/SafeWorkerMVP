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
const { ALARM_TYPES } = require('../constants/alarmTypes');

dotenv.config();

const dropCollectionIfExists = async (collectionName) => {
  const collections = await mongoose.connection.db
    .listCollections({ name: collectionName })
    .toArray();

  if (collections.length > 0) {
    await mongoose.connection.db.dropCollection(collectionName);
  }
};

const createSensorRecord = ({
  workerId,
  deviceId,
  shiftId,
  minutesAgo,
  accelerometer,
  gyroscope,
  batteryLevel,
  networkStatus,
  location,
  inactivity,
  riskScore,
  riskLevel,
  riskFactors
}) => {
  const timestamp = new Date(Date.now() - minutesAgo * 60 * 1000);

  return {
    workerId,
    deviceId,
    shiftId,
    timestamp,
    accelerometer: {
      x: accelerometer.x,
      y: accelerometer.y,
      z: accelerometer.z,
      magnitude: accelerometer.magnitude
    },
    gyroscope: {
      x: gyroscope.x,
      y: gyroscope.y,
      z: gyroscope.z,
      rotationMagnitude: gyroscope.rotationMagnitude
    },
    batteryLevel,
    networkStatus,
    location,
    inactivity,
    riskScore,
    riskLevel,
    riskFactors
  };
};

const seedTestData = async () => {
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

    const workerNames = [
      'Ahmet Yılmaz',
      'Zeynep Demir',
      'Mehmet Kaya',
      'Elif Şahin',
      'Burak Arslan',
      'Ayşe Çelik',
      'Mert Koç',
      'Derya Aydın',
      'Can Polat',
      'Selin Yıldız'
    ];

    const workers = [];

    for (let index = 0; index < workerNames.length; index += 1) {
      const workerNumber = index + 1;

      const worker = await User.create({
        name: workerNames[index],
        email: `worker${workerNumber}@safeworker.com`,
        passwordHash,
        role: 'worker'
      });

      workers.push(worker);
    }

    const devices = [];

    for (let index = 0; index < workers.length; index += 1) {
      const workerNumber = index + 1;

      const device = await Device.create({
        workerId: workers[index]._id,
        deviceCode: `DEVICE-${String(workerNumber).padStart(3, '0')}`,
        deviceName: `${workers[index].name} Telefonu`,
        networkStatus: index === 6 ? 'offline' : 'online',
        batteryLevel: index === 5 ? 12 : 75 - index * 3,
        isActive: true,
        lastSeen: new Date(Date.now() - index * 2 * 60 * 1000)
      });

      devices.push(device);
    }

    const shifts = [];

    for (let index = 0; index < workers.length; index += 1) {
      const isOfflineWorker = index === 6;

      const shift = await Shift.create({
        workerId: workers[index]._id,
        deviceId: devices[index]._id,
        startTime: new Date(Date.now() - (120 - index * 5) * 60 * 1000),
        endTime: isOfflineWorker ? new Date(Date.now() - 20 * 60 * 1000) : undefined,
        status: isOfflineWorker ? 'completed' : 'active'
      });

      shifts.push(shift);
    }

    const zones = await DangerZone.insertMany([
      {
        zoneName: 'Kimyasal Depo',
        qrCode: 'ZONE-CHEM-001',
        riskLevel: 'high',
        description: 'Kimyasal maddelerin bulunduğu yüksek riskli alan',
        isActive: true
      },
      {
        zoneName: 'Forklift Geçiş Alanı',
        qrCode: 'ZONE-FORK-001',
        riskLevel: 'medium',
        description: 'Forklift trafiğinin yoğun olduğu alan',
        isActive: true
      },
      {
        zoneName: 'Bakım Alanı',
        qrCode: 'ZONE-MAINT-001',
        riskLevel: 'high',
        description: 'Bakım ve onarım çalışmalarının yapıldığı riskli alan',
        isActive: true
      }
    ]);

    await ZoneEntry.insertMany([
      {
        workerId: workers[1]._id,
        zoneId: zones[0]._id,
        createdAt: new Date(Date.now() - 22 * 60 * 1000)
      },
      {
        workerId: workers[3]._id,
        zoneId: zones[1]._id,
        createdAt: new Date(Date.now() - 18 * 60 * 1000)
      },
      {
        workerId: workers[4]._id,
        zoneId: zones[2]._id,
        createdAt: new Date(Date.now() - 12 * 60 * 1000)
      }
    ]);

    const baseLatitude = 40.1885;
    const baseLongitude = 29.0610;

    const sensorRecords = [];

    for (let index = 0; index < workers.length; index += 1) {
      const worker = workers[index];
      const device = devices[index];
      const shift = shifts[index];

      const location = {
        latitude: baseLatitude + index * 0.001,
        longitude: baseLongitude + index * 0.001,
        accuracy: 8 + index
      };

      sensorRecords.push(
        createSensorRecord({
          workerId: worker._id,
          deviceId: device._id,
          shiftId: shift._id,
          minutesAgo: 30 - index,
          accelerometer: {
            x: 0.8 + index * 0.1,
            y: 0.3,
            z: 9.6,
            magnitude: 9.7 + index * 0.1
          },
          gyroscope: {
            x: 0.1,
            y: 0.2,
            z: 0.1,
            rotationMagnitude: 0.24
          },
          batteryLevel: device.batteryLevel,
          networkStatus: device.networkStatus,
          location,
          inactivity: false,
          riskScore: index < 4 ? 12 : 25,
          riskLevel: 'normal',
          riskFactors: []
        })
      );

      sensorRecords.push(
        createSensorRecord({
          workerId: worker._id,
          deviceId: device._id,
          shiftId: shift._id,
          minutesAgo: 15 - Math.min(index, 9),
          accelerometer: {
            x: index === 1 ? 18.5 : 1.3 + index * 0.2,
            y: index === 1 ? 4.2 : 0.5,
            z: index === 1 ? 13.1 : 9.4,
            magnitude: index === 1 ? 23.1 : 10.0 + index * 0.2
          },
          gyroscope: {
            x: index === 2 ? 5.1 : 0.2,
            y: index === 2 ? 4.6 : 0.2,
            z: index === 2 ? 3.8 : 0.1,
            rotationMagnitude: index === 2 ? 7.8 : 0.3
          },
          batteryLevel: device.batteryLevel,
          networkStatus: device.networkStatus,
          location,
          inactivity: index === 2,
          riskScore: index === 1 ? 68 : index === 2 ? 82 : index === 5 ? 45 : 20,
          riskLevel:
            index === 1 || index === 2
              ? 'danger'
              : index === 5
                ? 'warning'
                : 'normal',
          riskFactors:
            index === 1
              ? [
                  {
                    name: 'Sert Darbe',
                    score: 40,
                    description: 'İvme büyüklüğü eşik değerini aştı.'
                  }
                ]
              : index === 2
                ? [
                    {
                      name: 'Düşme Riski',
                      score: 35,
                      description: 'İvme ve jiroskop hareketi düşme riskine işaret ediyor.'
                    },
                    {
                      name: 'Olay Sonrası Hareketsizlik',
                      score: 10,
                      description: 'Riskli hareket sonrası belirli süre hareket algılanmadı.'
                    }
                  ]
                : index === 5
                  ? [
                      {
                        name: 'Düşük Pil',
                        score: 10,
                        description: 'Cihaz pil seviyesi kritik seviyeye yaklaştı.'
                      }
                    ]
                  : []
        })
      );
    }

    await SensorData.insertMany(sensorRecords);

    await Alarm.insertMany([
      {
        workerId: workers[1]._id,
        deviceId: devices[1]._id,
        shiftId: shifts[1]._id,
        type: ALARM_TYPES.HARD_IMPACT,
        message: 'Sert darbe algılandı.',
        riskScore: 68,
        status: 'active',
        createdAt: new Date(Date.now() - 14 * 60 * 1000)
      },
      {
        workerId: workers[2]._id,
        deviceId: devices[2]._id,
        shiftId: shifts[2]._id,
        type: ALARM_TYPES.FALL_RISK,
        message: 'Düşme riski algılandı.',
        riskScore: 82,
        status: 'active',
        createdAt: new Date(Date.now() - 12 * 60 * 1000)
      },
      {
        workerId: workers[2]._id,
        deviceId: devices[2]._id,
        shiftId: shifts[2]._id,
        type: ALARM_TYPES.INACTIVITY,
        message: 'Riskli olay sonrası hareketsizlik algılandı.',
        riskScore: 92,
        status: 'active',
        createdAt: new Date(Date.now() - 10 * 60 * 1000)
      },
      {
        workerId: workers[3]._id,
        deviceId: devices[3]._id,
        shiftId: shifts[3]._id,
        type: ALARM_TYPES.EMERGENCY_BUTTON,
        message: 'Çalışan manuel acil durum bildirimi gönderdi.',
        riskScore: 100,
        status: 'active',
        createdAt: new Date(Date.now() - 8 * 60 * 1000)
      },
      {
        workerId: workers[4]._id,
        deviceId: devices[4]._id,
        shiftId: shifts[4]._id,
        type: ALARM_TYPES.DANGER_ZONE_ENTRY,
        message: 'Bakım Alanı tehlikeli bölgesine giriş yapıldı.',
        riskScore: 85,
        status: 'active',
        createdAt: new Date(Date.now() - 6 * 60 * 1000)
      },
      {
        workerId: workers[5]._id,
        deviceId: devices[5]._id,
        shiftId: shifts[5]._id,
        type: ALARM_TYPES.LOW_BATTERY,
        message: 'Cihaz pil seviyesi düşük.',
        riskScore: 45,
        status: 'resolved',
        resolvedAt: new Date(Date.now() - 2 * 60 * 1000),
        createdAt: new Date(Date.now() - 20 * 60 * 1000)
      },
      {
        workerId: workers[6]._id,
        deviceId: devices[6]._id,
        shiftId: shifts[6]._id,
        type: ALARM_TYPES.CONNECTION_LOST,
        message: 'Cihaz bağlantısı kaybedildi.',
        riskScore: 60,
        status: 'resolved',
        resolvedAt: new Date(Date.now() - 1 * 60 * 1000),
        createdAt: new Date(Date.now() - 25 * 60 * 1000)
      }
    ]);

    console.log('SafeWorker test data seed completed');
    console.log('Admin login: admin@safeworker.com / 123456');
    console.log('Worker test logins:');

    workers.forEach((worker, index) => {
      console.log(
        `worker${index + 1}@safeworker.com / 123456 | ${worker.name} | ${devices[index].deviceCode} | shift=${shifts[index].status}`
      );
    });

    console.log(`ADMIN_ID=${admin._id}`);
    console.log(`TOTAL_WORKERS=${workers.length}`);
    console.log(`TOTAL_DEVICES=${devices.length}`);
    console.log(`TOTAL_SHIFTS=${shifts.length}`);
    console.log(`ACTIVE_SHIFTS=${shifts.filter((shift) => shift.status === 'active').length}`);
    console.log(`TOTAL_SENSOR_RECORDS=${sensorRecords.length}`);
  } catch (error) {
    console.error('Test data seed failed:', error);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

seedTestData();