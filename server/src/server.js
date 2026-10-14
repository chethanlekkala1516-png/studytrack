const app = require('./app');

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`🎓 StudyTrack Backend Server running on port ${PORT}`);
  console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`===============================================`);
});

module.exports = server;
