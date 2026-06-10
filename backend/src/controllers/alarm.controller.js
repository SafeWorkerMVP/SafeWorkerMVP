const mongoose = require('mongoose');

const Alarm = require('../models/Alarm');
const { ALARM_TYPE_VALUES } = require('../constants/alarmTypes');
const { populateAlarm } = require('../services/alarm.service');
const { asyncHandler, createError } = require('../middlewares/error.middleware');

const isObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const buildAlarmFilter = (query) => {
  const { status, type, minRisk } = query;
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

  if (minRisk !== undefined) {
    const parsedRisk = Number(minRisk);

    if (Number.isNaN(parsedRisk) || parsedRisk < 0 || parsedRisk > 100) {
      throw createError(400, 'minRisk must be a number between 0 and 100');
    }

    filter.riskScore = { $gte: parsedRisk };
  }

  return filter;
};

const escapeCsv = (value) => {
  if (value === undefined || value === null) return '';

  const stringValue = String(value).replace(/"/g, '""');

  return /[",\n]/.test(stringValue) ? `"${stringValue}"` : stringValue;
};

const getAlarms = asyncHandler(async (req, res) => {
  const filter = buildAlarmFilter(req.query);

  const alarms = await populateAlarm(Alarm.find(filter)).sort({ createdAt: -1 });

  res.json({
    success: true,
    message: 'Alarms fetched successfully',
    data: alarms
  });
});

const getActiveAlarms = asyncHandler(async (req, res) => {
  const alarms = await populateAlarm(Alarm.find({ status: 'active' })).sort({
    createdAt: -1
  });

  res.json({
    success: true,
    message: 'Active alarms fetched successfully',
    data: alarms
  });
});

const exportAlarmsCsv = asyncHandler(async (req, res) => {
  const filter = buildAlarmFilter(req.query);

  const alarms = await populateAlarm(Alarm.find(filter))
    .sort({ createdAt: -1 })
    .limit(1000);

  const rows = [
    ['type', 'worker', 'device', 'message', 'riskScore', 'status', 'createdAt'],
    ...alarms.map((alarm) => [
      alarm.type,
      alarm.workerId?.name || '',
      alarm.deviceId?.deviceName || '',
      alarm.message,
      alarm.riskScore,
      alarm.status,
      alarm.createdAt ? alarm.createdAt.toISOString() : ''
    ])
  ];

  const csv = rows.map((row) => row.map(escapeCsv).join(',')).join('\n');

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="safeworker-alarms.csv"');
  res.send(`\uFEFF${csv}`);
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
  exportAlarmsCsv,
  resolveAlarm
};