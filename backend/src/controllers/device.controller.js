const mongoose = require('mongoose');

const Device = require('../models/Device');
const User = require('../models/User');
const { asyncHandler, createError } = require('../middlewares/error.middleware');

const isObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const getDevices = asyncHandler(async (req, res) => {
  const devices = await Device.find()
    .populate('workerId', 'name email role')
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    message: 'Devices fetched successfully',
    data: devices
  });
});

const createDevice = asyncHandler(async (req, res) => {
  const { workerId, deviceCode, deviceName } = req.body;

  if (!workerId) throw createError(400, 'workerId is required');
  if (!isObjectId(workerId)) throw createError(400, 'workerId is invalid');
  if (!deviceCode) throw createError(400, 'deviceCode is required');
  if (!deviceName) throw createError(400, 'deviceName is required');

  const worker = await User.findById(workerId);
  if (!worker) throw createError(404, 'worker not found');
  if (worker.role !== 'worker') throw createError(400, 'workerId must belong to a worker user');

  const device = await Device.create({
    workerId,
    deviceCode,
    deviceName
  });

  const populatedDevice = await Device.findById(device._id).populate('workerId', 'name email role');

  res.status(201).json({
    success: true,
    message: 'Device created successfully',
    data: populatedDevice
  });
});

const updateDeviceStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { batteryLevel, networkStatus, isActive } = req.body;

  if (!isObjectId(id)) throw createError(400, 'device id is invalid');

  const update = {};

  if (batteryLevel !== undefined) update.batteryLevel = batteryLevel;
  if (networkStatus !== undefined) {
    if (!['online', 'offline'].includes(networkStatus)) {
      throw createError(400, 'networkStatus must be online or offline');
    }
    update.networkStatus = networkStatus;
  }
  if (isActive !== undefined) update.isActive = isActive;

  const device = await Device.findByIdAndUpdate(id, update, {
    new: true,
    runValidators: true
  }).populate('workerId', 'name email role');

  if (!device) throw createError(404, 'device not found');

  res.json({
    success: true,
    message: 'Device status updated successfully',
    data: device
  });
});

module.exports = {
  getDevices,
  createDevice,
  updateDeviceStatus
};
