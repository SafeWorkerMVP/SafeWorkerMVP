const mongoose = require('mongoose');

const zoneEntrySchema = new mongoose.Schema(
  {
    workerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    zoneId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DangerZone',
      required: true
    },
    entryTime: {
      type: Date,
      default: Date.now
    },
    exitTime: {
      type: Date
    },
    status: {
      type: String,
      enum: ['inside', 'exited'],
      default: 'inside'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('ZoneEntry', zoneEntrySchema);
