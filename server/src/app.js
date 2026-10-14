require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');

const { initDatabase } = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const reminderRoutes = require('./routes/reminderRoutes');
const studySessionRoutes = require('./routes/studySessionRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const goalRoutes = require('./routes/goalRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const healthRoutes = require('./routes/healthRoutes');

const app = express();

// Initialize SQLite database
initDatabase();

// CORS configuration supporting frontend client with credentials
const clientOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
app.use(cors({
  origin: function (origin, callback) {
    // Allow local development and same-origin requests
    if (!origin || origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body & Cookie Parsers
app.use(express.json());
app.use(cookieParser());

// Mount API routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/study-sessions', studySessionRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/settings', settingsRoutes);

// Serve built client assets if available
const fs = require('fs');
const distPath = path.join(__dirname, '..', '..', 'client', 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Centralized error handling
app.use(errorHandler);

module.exports = app;
