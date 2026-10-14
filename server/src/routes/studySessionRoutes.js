const express = require('express');
const router = express.Router();
const {
  getStudySessions,
  logStudySession
} = require('../controllers/studySessionController');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', getStudySessions);
router.post('/', logStudySession);

module.exports = router;
