const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema(
  {
    workerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    deviceCode: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    deviceName: {
      type: String,
      required: true,
      trim: true
    },
    lastSeen: {
      type: Date
    },
    batteryLevel: {
      type: Number
    },
    networkStatus: {
      type: String,
      enum: ['online', 'offline'],
      default: 'offline'
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Device', deviceSchema);
