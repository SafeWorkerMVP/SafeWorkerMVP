const mongoose = require('mongoose');

const User = require('../models/User');
const Device = require('../models/Device');
const Shift = require('../models/Shift');
const SensorData = require('../models/SensorData');
const Alarm = require('../models/Alarm');
const { populateAlarm } = require('../services/alarm.service');
const { asyncHandler, createError } = require('../middlewares/error.middleware');

const isObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const getSummary = asyncHandler(async (req, res) => {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [
    totalWorkers,
    activeWorkerIds,
    totalDevices,
    activeAlarms,
    todayAlarms,
    averageRisk,
    lastAlarms
  ] = await Promise.all([
    User.countDocuments({ role: 'worker' }),
    Shift.distinct('workerId', { status: 'active' }),
    Device.countDocuments(),
    Alarm.countDocuments({ status: 'active' }),
    Alarm.countDocuments({ createdAt: { $gte: startOfToday } }),
    SensorData.aggregate([
      {
        $group: {
          _id: null,
          averageRiskScore: { $avg: '$riskScore' }
        }
      }
    ]),
    populateAlarm(Alarm.find()).sort({ createdAt: -1 }).limit(5)
  ]);

  res.json({
    success: true,
    message: 'Dashboard summary fetched successfully',
    data: {
      totalWorkers,
      activeWorkers: activeWorkerIds.length,
      totalDevices,
      activeAlarms,
      todayAlarms,
      averageRiskScore: averageRisk[0]
        ? Math.round(averageRisk[0].averageRiskScore)
        : 0,
      lastAlarms
    }
  });
});

const getLiveWorkers = asyncHandler(async (req, res) => {
  const workers = await User.find({ role: 'worker' }).sort({ name: 1 });

  const liveWorkers = await Promise.all(
    workers.map(async (worker) => {
      const device = await Device.findOne({
        workerId: worker._id,
        isActive: true
      }).sort({ lastSeen: -1, createdAt: -1 });

      const sensorFilter = { workerId: worker._id };
      if (device) {
        sensorFilter.deviceId = device._id;
      }

      const latestSensor = await SensorData.findOne(sensorFilter).sort({
        timestamp: -1,
        createdAt: -1
      });

      const latestAlarm = await Alarm.findOne({
        workerId: worker._id,
        status: 'active'
      })
        .sort({ createdAt: -1 })
        .select('type message riskScore status createdAt');

      return {
        workerName: worker.name,
        workerId: worker._id,
        deviceName: device ? device.deviceName : null,
        deviceId: device ? device._id : null,
        lastSeen: device ? device.lastSeen : null,
        batteryLevel: device ? device.batteryLevel : null,
        networkStatus: device ? device.networkStatus : null,
        latestRiskScore: latestSensor ? latestSensor.riskScore : null,
        latestRiskLevel: latestSensor ? latestSensor.riskLevel : null,
        latestAlarm
      };
    })
  );

  res.json({
    success: true,
    message: 'Live workers fetched successfully',
    data: liveWorkers
  });
});

const getRiskChart = asyncHandler(async (req, res) => {
  const { workerId } = req.params;

  if (!isObjectId(workerId)) throw createError(400, 'workerId is invalid');

  const records = await SensorData.find({ workerId })
    .sort({ timestamp: -1, createdAt: -1 })
    .limit(50)
    .select('timestamp riskScore riskLevel');

  const chartData = records.reverse().map((record) => ({
    timestamp: record.timestamp,
    riskScore: record.riskScore,
    riskLevel: record.riskLevel
  }));

  res.json({
    success: true,
    message: 'Risk chart fetched successfully',
    data: chartData
  });
});

module.exports = {
  getSummary,
  getLiveWorkers,
  getRiskChart
};
