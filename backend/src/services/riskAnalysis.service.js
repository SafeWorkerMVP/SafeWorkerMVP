const { ALARM_TYPES } = require('../constants/alarmTypes');

const roundMetric = (value) => Number(value.toFixed(2));

const calculateMagnitude = (x, y, z) => {
  return roundMetric(Math.sqrt(x * x + y * y + z * z));
};

const clampScore = (score) => Math.min(Math.max(score, 0), 100);

const getRiskLevel = (riskScore) => {
  if (riskScore >= 61) return 'danger';
  if (riskScore >= 31) return 'warning';
  return 'normal';
};

const createRiskFactor = (name, score, description) => ({
  name,
  score,
  description
});

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
  let hardImpactDetected = false;
  let fallRiskDetected = false;

  const alarmCandidates = [];
  const riskFactors = [];

  if (accelerationMagnitude > 25) {
    hardImpactDetected = true;
    riskScore += 40;

    riskFactors.push(
      createRiskFactor(
        'Sert darbe',
        40,
        `İvme büyüklüğü ${accelerationMagnitude} eşik değeri aştı.`
      )
    );

    alarmCandidates.push({
      type: ALARM_TYPES.HARD_IMPACT,
      message: 'Sert darbe algılandı',
      riskScore: 80
    });
  } else if (accelerationMagnitude > 17) {
    riskScore += 15;

    riskFactors.push(
      createRiskFactor(
        'Yüksek ivme',
        15,
        `İvme büyüklüğü ${accelerationMagnitude} uyarı seviyesinde.`
      )
    );
  }

  if (accelerationMagnitude > 20 && rotationMagnitude > 8) {
    fallRiskDetected = true;
    riskScore += 35;

    riskFactors.push(
      createRiskFactor(
        'Düşme riski',
        35,
        `İvme (${accelerationMagnitude}) ve dönüş (${rotationMagnitude}) birlikte yükseldi.`
      )
    );

    alarmCandidates.push({
      type: ALARM_TYPES.FALL_RISK,
      message: 'Düşme riski algılandı',
      riskScore: 75
    });
  } else if (rotationMagnitude > 6) {
    riskScore += 10;

    riskFactors.push(
      createRiskFactor(
        'Ani dönüş',
        10,
        `Jiroskop büyüklüğü ${rotationMagnitude} uyarı seviyesinde.`
      )
    );
  }

  if (payload.inactivity === true && (hardImpactDetected || fallRiskDetected)) {
    riskScore += 10;

    riskFactors.push(
      createRiskFactor(
        'Olay sonrası hareketsizlik',
        10,
        'Sert darbe veya düşme riski sonrasında uzun süre hareket algılanmadı.'
      )
    );

    alarmCandidates.push({
      type: ALARM_TYPES.INACTIVITY,
      message: 'Olay sonrası hareketsizlik algılandı',
      riskScore: 65
    });
  }

  if (payload.inactivity === true && !hardImpactDetected && !fallRiskDetected) {
    riskFactors.push(
      createRiskFactor(
        'Normal hareketsizlik',
        0,
        'Hareketsizlik algılandı ancak darbe veya düşme riski olmadığı için risk puanına eklenmedi.'
      )
    );
  }

  if (payload.batteryLevel < 15) {
    riskScore += 10;

    riskFactors.push(
      createRiskFactor(
        'Düşük pil',
        10,
        `Pil seviyesi %${payload.batteryLevel}.`
      )
    );

    alarmCandidates.push({
      type: ALARM_TYPES.LOW_BATTERY,
      message: 'Düşük pil seviyesi algılandı',
      riskScore: 40
    });
  }

  if (payload.networkStatus === 'offline') {
    riskScore += 30;

    riskFactors.push(
      createRiskFactor(
        'Bağlantı kaybı',
        30,
        'Mobil cihaz ağ bağlantısını kaybetti.'
      )
    );

    alarmCandidates.push({
      type: ALARM_TYPES.CONNECTION_LOST,
      message: 'Bağlantı kaybı algılandı',
      riskScore: 60
    });
  }

  riskScore = clampScore(riskScore);
  const riskLevel = getRiskLevel(riskScore);

  return {
    riskScore,
    riskLevel,
    alarmCandidates,
    riskFactors,
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