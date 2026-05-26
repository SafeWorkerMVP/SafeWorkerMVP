const mongoose = require('mongoose');

const dangerZoneSchema = new mongoose.Schema(
  {
    zoneName: {
      type: String,
      required: true,
      trim: true
    },
    qrCode: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    riskLevel: {
      type: String,
      enum: ['low', 'medium', 'high'],
      required: true
    },
    description: {
      type: String,
      trim: true
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('DangerZone', dangerZoneSchema);
