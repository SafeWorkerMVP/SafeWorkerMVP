const mongoose = require('mongoose');

const User = require('../models/User');
const DangerZone = require('../models/DangerZone');
const ZoneEntry = require('../models/ZoneEntry');
const { ALARM_TYPES } = require('../constants/alarmTypes');
const { createAlarm } = require('../services/alarm.service');
const { asyncHandler, createError } = require('../middlewares/error.middleware');

const isObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const ensureWorkerScope = (req, workerId) => {
  if (req.user.role === 'worker' && req.user._id.toString() !== workerId.toString()) {
    throw createError(403, 'Workers can only scan zones for themselves');
  }
};

const createZone = asyncHandler(async (req, res) => {
  const { zoneName, qrCode, riskLevel, description } = req.body;

  if (!zoneName) throw createError(400, 'zoneName is required');
  if (!qrCode) throw createError(400, 'qrCode is required');
  if (!riskLevel) throw createError(400, 'riskLevel is required');
  if (!['low', 'medium', 'high'].includes(riskLevel)) {
    throw createError(400, 'riskLevel must be low, medium or high');
  }

  const zone = await DangerZone.create({
    zoneName,
    qrCode,
    riskLevel,
    description
  });

  res.status(201).json({
    success: true,
    message: 'Danger zone created successfully',
    data: zone
  });
});

const getZones = asyncHandler(async (req, res) => {
  const zones = await DangerZone.find({ isActive: true }).sort({ createdAt: -1 });

  res.json({
    success: true,
    message: 'Danger zones fetched successfully',
    data: zones
  });
});

const scanZone = asyncHandler(async (req, res) => {
  const { workerId, qrCode } = req.body;

  if (!workerId) throw createError(400, 'workerId is required');
  if (!isObjectId(workerId)) throw createError(400, 'workerId is invalid');
  if (!qrCode) throw createError(400, 'qrCode is required');

  ensureWorkerScope(req, workerId);

  const worker = await User.findById(workerId);
  if (!worker) throw createError(404, 'worker not found');
  if (worker.role !== 'worker') throw createError(400, 'workerId must belong to a worker user');

  const zone = await DangerZone.findOne({ qrCode, isActive: true });
  if (!zone) throw createError(404, 'danger zone not found');

  const entry = await ZoneEntry.create({
    workerId,
    zoneId: zone._id
  });

  const populatedEntry = await ZoneEntry.findById(entry._id)
    .populate('workerId', 'name email role')
    .populate('zoneId', 'zoneName qrCode riskLevel description');

  let alarm = null;
  if (zone.riskLevel === 'high') {
    alarm = await createAlarm({
      workerId,
      type: ALARM_TYPES.DANGER_ZONE_ENTRY,
      message: `${zone.zoneName} tehlikeli bölgesine giriş yapıldı`,
      riskScore: 85
    });
  }

  res.status(201).json({
    success: true,
    message: 'Zone scan saved successfully',
    data: {
      entry: populatedEntry,
      zone,
      alarm
    }
  });
});

module.exports = {
  createZone,
  getZones,
  scanZone
};
