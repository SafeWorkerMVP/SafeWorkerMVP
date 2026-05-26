const express = require('express');

const {
  getSummary,
  getLiveWorkers,
  getRiskChart
} = require('../controllers/dashboard.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorizeRoles } = require('../middlewares/role.middleware');

const router = express.Router();

router.get('/summary', protect, authorizeRoles('admin'), getSummary);
router.get('/live-workers', protect, authorizeRoles('admin'), getLiveWorkers);
router.get('/risk-chart/:workerId', protect, authorizeRoles('admin'), getRiskChart);

module.exports = router;
