const mongoose = require('mongoose');

const Device = require('../models/Device');
const Shift = require('../models/Shift');
const { asyncHandler, createError } = require('../middlewares/error.middleware');

const isObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const ensureWorkerScope = (req, workerId) => {
  if (req.user.role === 'worker' && req.user._id.toString() !== workerId.toString()) {
    throw createError(403, 'Workers can only manage their own shifts');
  }
};

const startShift = asyncHandler(async (req, res) => {
  const { workerId, deviceId } = req.body;

  if (!workerId) throw createError(400, 'workerId is required');
  if (!isObjectId(workerId)) throw createError(400, 'workerId is invalid');
  if (!deviceId) throw createError(400, 'deviceId is required');
  if (!isObjectId(deviceId)) throw createError(400, 'deviceId is invalid');

  ensureWorkerScope(req, workerId);

  const device = await Device.findById(deviceId);
  if (!device) throw createError(404, 'device not found');
  if (device.workerId.toString() !== workerId.toString()) {
    throw createError(400, 'device does not belong to worker');
  }

  const activeShift = await Shift.findOne({ workerId, status: 'active' });
  if (activeShift) {
    throw createError(400, 'worker already has an active shift');
  }

  const shift = await Shift.create({
    workerId,
    deviceId,
    startTime: new Date()
  });

  const populatedShift = await Shift.findById(shift._id)
    .populate('workerId', 'name email role')
    .populate('deviceId', 'deviceCode deviceName');

  res.status(201).json({
    success: true,
    message: 'Shift started successfully',
    data: populatedShift
  });
});

const endShift = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isObjectId(id)) throw createError(400, 'shift id is invalid');

  const shift = await Shift.findById(id);
  if (!shift) throw createError(404, 'shift not found');

  ensureWorkerScope(req, shift.workerId);

  if (shift.status === 'completed') {
    throw createError(400, 'shift is already completed');
  }

  shift.status = 'completed';
  shift.endTime = new Date();
  await shift.save();

  const populatedShift = await Shift.findById(shift._id)
    .populate('workerId', 'name email role')
    .populate('deviceId', 'deviceCode deviceName');

  res.json({
    success: true,
    message: 'Shift ended successfully',
    data: populatedShift
  });
});

const getActiveShifts = asyncHandler(async (req, res) => {
  const shifts = await Shift.find({ status: 'active' })
    .populate('workerId', 'name email role')
    .populate('deviceId', 'deviceCode deviceName networkStatus batteryLevel')
    .sort({ startTime: -1 });

  res.json({
    success: true,
    message: 'Active shifts fetched successfully',
    data: shifts
  });
});

module.exports = {
  startShift,
  endShift,
  getActiveShifts
};
