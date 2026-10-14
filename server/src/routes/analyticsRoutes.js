const express = require('express');
const router = express.Router();
const {
  getSummary,
  getWeekly,
  getMonthly
} = require('../controllers/analyticsController');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

router.get('/summary', getSummary);
router.get('/weekly', getWeekly);
router.get('/monthly', getMonthly);

module.exports = router;
