const Alarm = require('../models/Alarm');
const { emitEvent } = require('./socket.service');

const populateAlarm = (query) => {
  return query
    .populate('workerId', 'name email role')
    .populate('deviceId', 'deviceCode deviceName networkStatus batteryLevel')
    .populate('shiftId', 'startTime endTime status');
};

const createAlarm = async (alarmPayload, options = {}) => {
  const shouldEmit = options.emit !== false;
  const alarm = await Alarm.create({
    workerId: alarmPayload.workerId,
    deviceId: alarmPayload.deviceId,
    shiftId: alarmPayload.shiftId,
    type: alarmPayload.type,
    message: alarmPayload.message,
    riskScore: alarmPayload.riskScore,
    status: alarmPayload.status || 'active'
  });

  const populatedAlarm = await populateAlarm(Alarm.findById(alarm._id));

  if (shouldEmit) {
    emitEvent(options.eventName || 'alarm:new', populatedAlarm);
  }

  return populatedAlarm;
};

module.exports = {
  createAlarm,
  populateAlarm
};
