const express = require('express');

const {
  createZone,
  getZones,
  scanZone
} = require('../controllers/zone.controller');

const { protect } = require('../middlewares/auth.middleware');
const { authorizeRoles } = require('../middlewares/role.middleware');

const router = express.Router();

router.get('/', protect, authorizeRoles('admin'), getZones);
router.post('/', protect, authorizeRoles('admin'), createZone);
router.post('/scan', protect, authorizeRoles('worker', 'admin'), scanZone);

module.exports = router;