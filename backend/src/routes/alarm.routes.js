const express = require('express');

const { getAlarms, getActiveAlarms, resolveAlarm } = require('../controllers/alarm.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorizeRoles } = require('../middlewares/role.middleware');

const router = express.Router();

router.get('/', protect, authorizeRoles('admin'), getAlarms);
router.get('/active', protect, authorizeRoles('admin'), getActiveAlarms);
router.patch('/:id/resolve', protect, authorizeRoles('admin'), resolveAlarm);

module.exports = router;
