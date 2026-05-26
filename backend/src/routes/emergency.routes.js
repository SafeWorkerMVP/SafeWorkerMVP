const express = require('express');

const { createEmergency } = require('../controllers/emergency.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorizeRoles } = require('../middlewares/role.middleware');

const router = express.Router();

router.post('/', protect, authorizeRoles('worker', 'admin'), createEmergency);

module.exports = router;
