const mongoose = require('mongoose');

const User = require('../models/User');
const { ALARM_TYPES } = require('../constants/alarmTypes');
const { createAlarm } = require('../services/alarm.service');
const { asyncHandler, createError } = require('../middlewares/error.middleware');

const isObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const ensureWorkerScope = (req, workerId) => {
  if (req.user.role === 'worker' && req.user._id.toString() !== workerId.toString()) {
    throw createError(403, 'Workers can only send emergency alarms for themselves');
  }
};

const createEmergency = asyncHandler(async (req, res) => {
  const { workerId, deviceId, shiftId, message } = req.body;

  if (!workerId) throw createError(400, 'workerId is required');
  if (!isObjectId(workerId)) throw createError(400, 'workerId is invalid');
  if (deviceId && !isObjectId(deviceId)) throw createError(400, 'deviceId is invalid');
  if (shiftId && !isObjectId(shiftId)) throw createError(400, 'shiftId is invalid');

  ensureWorkerScope(req, workerId);

  const worker = await User.findById(workerId);
  if (!worker) throw createError(404, 'worker not found');
  if (worker.role !== 'worker') throw createError(400, 'workerId must belong to a worker user');

  const alarm = await createAlarm({
    workerId,
    deviceId,
    shiftId,
    type: ALARM_TYPES.EMERGENCY_BUTTON,
    message: message || 'Acil durum bildirimi',
    riskScore: 100,
    status: 'active'
  });

  res.status(201).json({
    success: true,
    message: 'Emergency alarm created successfully',
    data: alarm
  });
});

module.exports = {
  createEmergency
};
