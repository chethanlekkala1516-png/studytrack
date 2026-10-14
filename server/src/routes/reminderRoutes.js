const express = require('express');
const router = express.Router();
const {
  getReminders,
  markAsRead,
  markAllAsRead
} = require('../controllers/reminderController');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', getReminders);
router.patch('/:id', markAsRead);
router.post('/read-all', markAllAsRead);

module.exports = router;
