const express = require('express');
const router = express.Router();
const { getGoals, updateGoals } = require('../controllers/goalsController');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', getGoals);
router.put('/', updateGoals);

module.exports = router;
