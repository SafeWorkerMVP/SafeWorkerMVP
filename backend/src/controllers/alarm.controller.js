const mongoose = require('mongoose');

const Alarm = require('../models/Alarm');
const { ALARM_TYPE_VALUES } = require('../constants/alarmTypes');
const { populateAlarm } = require('../services/alarm.service');
const { asyncHandler, createError } = require('../middlewares/error.middleware');

const isObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const getAlarms = asyncHandler(async (req, res) => {
  const { status, type } = req.query;
  const filter = {};

  if (status) {
    if (!['active', 'resolved'].includes(status)) {
      throw createError(400, 'status must be active or resolved');
    }
    filter.status = status;
  }

  if (type) {
    if (!ALARM_TYPE_VALUES.includes(type)) {
      throw createError(400, 'invalid alarm type');
    }
    filter.type = type;
  }

  const alarms = await populateAlarm(Alarm.find(filter)).sort({ createdAt: -1 });

  res.json({
    success: true,
    message: 'Alarms fetched successfully',
    data: alarms
  });
});

const getActiveAlarms = asyncHandler(async (req, res) => {
  const alarms = await populateAlarm(Alarm.find({ status: 'active' })).sort({ createdAt: -1 });

  res.json({
    success: true,
    message: 'Active alarms fetched successfully',
    data: alarms
  });
});

const resolveAlarm = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isObjectId(id)) throw createError(400, 'alarm id is invalid');

  const alarm = await Alarm.findByIdAndUpdate(
    id,
    {
      status: 'resolved',
      resolvedAt: new Date()
    },
    {
      new: true,
      runValidators: true
    }
  );

  if (!alarm) throw createError(404, 'alarm not found');

  const populatedAlarm = await populateAlarm(Alarm.findById(alarm._id));

  res.json({
    success: true,
    message: 'Alarm resolved successfully',
    data: populatedAlarm
  });
});

module.exports = {
  getAlarms,
  getActiveAlarms,
  resolveAlarm
};
