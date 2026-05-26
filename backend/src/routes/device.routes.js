const express = require('express');

const {
  getDevices,
  createDevice,
  updateDeviceStatus
} = require('../controllers/device.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorizeRoles } = require('../middlewares/role.middleware');

const router = express.Router();

router.get('/', protect, authorizeRoles('admin'), getDevices);
router.post('/', protect, authorizeRoles('admin'), createDevice);
router.patch('/:id/status', protect, authorizeRoles('admin'), updateDeviceStatus);

module.exports = router;
