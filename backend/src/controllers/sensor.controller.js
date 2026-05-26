const mongoose = require('mongoose');

const Device = require('../models/Device');
const Shift = require('../models/Shift');
const SensorData = require('../models/SensorData');
const { calculateRisk } = require('../services/riskAnalysis.service');
const { createAlarm } = require('../services/alarm.service');
const { emitEvent } = require('../services/socket.service');
const { asyncHandler, createError } = require('../middlewares/error.middleware');

const isObjectId = (id) => mongoose.Types.ObjectId.isValid(id);
const SENSOR_REQUIRED_NUMBERS = [
  'accelerometer.x',
  'accelerometer.y',
  'accelerometer.z',
  'gyroscope.x',
  'gyroscope.y',
  'gyroscope.z'
];

const getNestedValue = (object, path) => {
  return path.split('.').reduce((current, key) => current && current[key], object);
};

const requireNumber = (body, path) => {
  const value = getNestedValue(body, path);
  if (value === undefined || value === null) {
    throw createError(400, `${path} is required`);
  }
  if (typeof value !== 'number' || Number.isNaN(value)) {
    throw createError(400, `${path} must be a number`);
  }
};

const ensureWorkerScope = (req, workerId) => {
  if (req.user.role === 'worker' && req.user._id.toString() !== workerId.toString()) {
    throw createError(403, 'Workers can only access their own sensor data');
  }
};

const validateSensorBody = (body) => {
  if (!body.workerId) throw createError(400, 'workerId is required');
  if (!isObjectId(body.workerId)) throw createError(400, 'workerId is invalid');
  if (!body.deviceId) throw createError(400, 'deviceId is required');
  if (!isObjectId(body.deviceId)) throw createError(400, 'deviceId is invalid');
  if (body.shiftId && !isObjectId(body.shiftId)) throw createError(400, 'shiftId is invalid');
  if (!body.timestamp) throw createError(400, 'timestamp is required');
  if (Number.isNaN(Date.parse(body.timestamp))) throw createError(400, 'timestamp is invalid');
  if (!body.accelerometer) throw createError(400, 'accelerometer is required');
  if (!body.gyroscope) throw createError(400, 'gyroscope is required');

  SENSOR_REQUIRED_NUMBERS.forEach((path) => requireNumber(body, path));

  if (body.batteryLevel === undefined || body.batteryLevel === null) {
    throw createError(400, 'batteryLevel is required');
  }
  if (typeof body.batteryLevel !== 'number' || Number.isNaN(body.batteryLevel)) {
    throw createError(400, 'batteryLevel must be a number');
  }
  if (!body.networkStatus) throw createError(400, 'networkStatus is required');
  if (!['online', 'offline'].includes(body.networkStatus)) {
    throw createError(400, 'networkStatus must be online or offline');
  }
};

const getAlarmCandidatesForPersist = (riskResult) => {
  return riskResult.alarmCandidates;
};

const createSensorData = asyncHandler(async (req, res) => {
  validateSensorBody(req.body);

  const {
    workerId,
    deviceId,
    shiftId,
    timestamp,
    accelerometer,
    gyroscope,
    batteryLevel,
    networkStatus,
    inactivity
  } = req.body;

  ensureWorkerScope(req, workerId);

  const device = await Device.findById(deviceId);
  if (!device) throw createError(404, 'device not found');
  if (device.workerId.toString() !== workerId.toString()) {
    throw createError(400, 'device does not belong to worker');
  }

  if (shiftId) {
    const shift = await Shift.findById(shiftId);
    if (!shift) throw createError(404, 'shift not found');
    if (shift.workerId.toString() !== workerId.toString()) {
      throw createError(400, 'shift does not belong to worker');
    }
  }

  const riskResult = calculateRisk({
    accelerometer,
    gyroscope,
    batteryLevel,
    networkStatus,
    inactivity
  });

  const sensorData = await SensorData.create({
    workerId,
    deviceId,
    shiftId,
    timestamp: new Date(timestamp),
    accelerometer: {
      ...accelerometer,
      magnitude: riskResult.metrics.accelerationMagnitude
    },
    gyroscope: {
      ...gyroscope,
      rotationMagnitude: riskResult.metrics.rotationMagnitude
    },
    batteryLevel,
    networkStatus,
    riskScore: riskResult.riskScore,
    riskLevel: riskResult.riskLevel
  });

  await Device.findByIdAndUpdate(deviceId, {
    lastSeen: new Date(timestamp),
    batteryLevel,
    networkStatus
  });

  emitEvent('sensor:new', sensorData);

  const createdAlarms = [];
  const candidates = getAlarmCandidatesForPersist(riskResult);

  for (const candidate of candidates) {
    const alarm = await createAlarm({
      workerId,
      deviceId,
      shiftId,
      type: candidate.type,
      message: candidate.message,
      riskScore: candidate.riskScore
    });
    createdAlarms.push(alarm);
  }

  res.status(201).json({
    success: true,
    message: 'Sensor data saved successfully',
    data: {
      sensorData,
      riskAnalysis: riskResult,
      alarms: createdAlarms
    }
  });
});

const getSensorDataByWorker = asyncHandler(async (req, res) => {
  const { workerId } = req.params;

  if (!isObjectId(workerId)) throw createError(400, 'workerId is invalid');
  ensureWorkerScope(req, workerId);

  const sensorData = await SensorData.find({ workerId })
    .populate('deviceId', 'deviceCode deviceName')
    .populate('shiftId', 'startTime endTime status')
    .sort({ timestamp: -1, createdAt: -1 })
    .limit(100);

  res.json({
    success: true,
    message: 'Sensor data fetched successfully',
    data: sensorData
  });
});

const getLatestSensorData = asyncHandler(async (req, res) => {
  const { workerId } = req.params;

  if (!isObjectId(workerId)) throw createError(400, 'workerId is invalid');
  ensureWorkerScope(req, workerId);

  const sensorData = await SensorData.findOne({ workerId })
    .populate('deviceId', 'deviceCode deviceName')
    .populate('shiftId', 'startTime endTime status')
    .sort({ timestamp: -1, createdAt: -1 });

  res.json({
    success: true,
    message: 'Latest sensor data fetched successfully',
    data: sensorData
  });
});

module.exports = {
  createSensorData,
  getSensorDataByWorker,
  getLatestSensorData
};
