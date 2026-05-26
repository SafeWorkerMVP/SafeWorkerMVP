const express = require('express');

const {
  createSensorData,
  getSensorDataByWorker,
  getLatestSensorData
} = require('../controllers/sensor.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorizeRoles } = require('../middlewares/role.middleware');

const router = express.Router();

router.post('/', protect, authorizeRoles('worker', 'admin'), createSensorData);
router.get('/:workerId/latest', protect, authorizeRoles('worker', 'admin'), getLatestSensorData);
router.get('/:workerId', protect, authorizeRoles('worker', 'admin'), getSensorDataByWorker);

module.exports = router;
