const express = require('express');
const { getInventoryDashboard } = require('../controllers/dashboardController');

const router = express.Router();

router.get('/inventory', getInventoryDashboard);

module.exports = router;
