const { ALARM_TYPES } = require('../constants/alarmTypes');

const roundMetric = (value) => Number(value.toFixed(2));

const calculateMagnitude = (x, y, z) => {
  return roundMetric(Math.sqrt(x * x + y * y + z * z));
};

const calculateRisk = (payload) => {
  const accelerationMagnitude = calculateMagnitude(
    payload.accelerometer.x,
    payload.accelerometer.y,
    payload.accelerometer.z
  );
  const rotationMagnitude = calculateMagnitude(
    payload.gyroscope.x,
    payload.gyroscope.y,
    payload.gyroscope.z
  );

  let riskScore = 0;
  const alarmCandidates = [];

  if (accelerationMagnitude > 25) {
    riskScore += 40;
    alarmCandidates.push({
      type: ALARM_TYPES.HARD_IMPACT,
      message: 'Sert darbe algılandı',
      riskScore: 80
    });
  }

  if (accelerationMagnitude > 20 && rotationMagnitude > 8) {
    riskScore += 35;
    alarmCandidates.push({
      type: ALARM_TYPES.FALL_RISK,
      message: 'Düşme riski algılandı',
      riskScore: 75
    });
  }

  if (payload.inactivity === true) {
    riskScore += 25;
    alarmCandidates.push({
      type: ALARM_TYPES.INACTIVITY,
      message: 'Hareketsizlik algılandı',
      riskScore: 55
    });
  }

  if (payload.batteryLevel < 15) {
    riskScore += 10;
    alarmCandidates.push({
      type: ALARM_TYPES.LOW_BATTERY,
      message: 'Düşük pil seviyesi algılandı',
      riskScore: 40
    });
  }

  if (payload.networkStatus === 'offline') {
    riskScore += 30;
    alarmCandidates.push({
      type: ALARM_TYPES.CONNECTION_LOST,
      message: 'Bağlantı kaybı algılandı',
      riskScore: 60
    });
  }

  riskScore = Math.min(riskScore, 100);

  let riskLevel = 'normal';
  if (riskScore >= 31 && riskScore <= 60) {
    riskLevel = 'warning';
  }
  if (riskScore >= 61) {
    riskLevel = 'danger';
  }

  return {
    riskScore,
    riskLevel,
    alarmCandidates,
    metrics: {
      accelerationMagnitude,
      rotationMagnitude
    }
  };
};

module.exports = {
  calculateMagnitude,
  calculateRisk
};
