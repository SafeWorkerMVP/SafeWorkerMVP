const express = require('express');

const { createZone, getZones, scanZone } = require('../controllers/zone.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorizeRoles } = require('../middlewares/role.middleware');

const router = express.Router();

router.post('/scan', protect, authorizeRoles('worker', 'admin'), scanZone);
router.post('/', protect, authorizeRoles('admin'), createZone);
router.get('/', protect, authorizeRoles('admin'), getZones);

module.exports = router;
