const mongoose = require('mongoose');

const sensorDataSchema = new mongoose.Schema(
  {
    workerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    deviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Device',
      required: true
    },
    shiftId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shift'
    },
    timestamp: {
      type: Date,
      required: true
    },
    accelerometer: {
      x: { type: Number, required: true },
      y: { type: Number, required: true },
      z: { type: Number, required: true },
      magnitude: { type: Number }
    },
    gyroscope: {
      x: { type: Number, required: true },
      y: { type: Number, required: true },
      z: { type: Number, required: true },
      rotationMagnitude: { type: Number }
    },
    batteryLevel: {
      type: Number,
      required: true
    },
    networkStatus: {
      type: String,
      enum: ['online', 'offline'],
      required: true
    },
    riskScore: {
      type: Number
    },
    riskLevel: {
      type: String,
      enum: ['normal', 'warning', 'danger']
    },
    inactivity: {
      type: Boolean,
      default: false
    },
    riskFactors: [
      {
        name: { type: String },
        score: { type: Number },
        description: { type: String }
      }
    ]
  },
  {
    timestamps: true,
    collection: 'sensor_data'
  }
);

module.exports = mongoose.model('SensorData', sensorDataSchema);