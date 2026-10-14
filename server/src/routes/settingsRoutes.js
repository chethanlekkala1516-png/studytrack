const express = require('express');
const router = express.Router();
const { getSettings, updateSettings } = require('../controllers/settingsController');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', getSettings);
router.patch('/', updateSettings);

module.exports = router;
