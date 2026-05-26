const mongoose = require('mongoose');
const { ALARM_TYPE_VALUES } = require('../constants/alarmTypes');

const alarmSchema = new mongoose.Schema(
  {
    workerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    deviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Device'
    },
    shiftId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shift'
    },
    type: {
      type: String,
      enum: ALARM_TYPE_VALUES,
      required: true
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    riskScore: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ['active', 'resolved'],
      default: 'active'
    },
    resolvedAt: {
      type: Date
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Alarm', alarmSchema);
