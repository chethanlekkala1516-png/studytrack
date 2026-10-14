const { db } = require('../config/db');

// GET /api/study-sessions
function getStudySessions(req, res) {
  try {
    const userId = req.user.id;
    const { limit = 50 } = req.query;

    const parsedLimit = Math.max(1, Math.min(200, parseInt(limit, 10) || 50));

    const sessions = db.prepare(`
      SELECT s.*, t.title as task_title, t.subject as task_subject
      FROM study_sessions s
      LEFT JOIN tasks t ON s.task_id = t.id
      WHERE s.user_id = ?
      ORDER BY s.completed_at DESC
      LIMIT ?
    `).all(userId, parsedLimit);

    // Calculate total minutes
    const totalRow = db.prepare(`
      SELECT SUM(duration_minutes) as total_minutes
      FROM study_sessions
      WHERE user_id = ? AND session_type = 'focus'
    `).get(userId);

    const totalMinutes = totalRow && totalRow.total_minutes ? totalRow.total_minutes : 0;

    // Today's focus minutes
    const todayStr = new Date().toISOString().split('T')[0];
    const todayRow = db.prepare(`
      SELECT SUM(duration_minutes) as today_minutes
      FROM study_sessions
      WHERE user_id = ? AND session_type = 'focus' AND completed_at LIKE ?
    `).get(userId, `${todayStr}%`);

    const todayMinutes = todayRow && todayRow.today_minutes ? todayRow.today_minutes : 0;

    return res.json({
      sessions,
      stats: {
        totalMinutes,
        todayMinutes
      }
    });
  } catch (err) {
    console.error('getStudySessions error:', err);
    return res.status(500).json({ error: 'Failed to retrieve study sessions' });
  }
}

// POST /api/study-sessions
function logStudySession(req, res) {
  try {
    const userId = req.user.id;
    const { duration_minutes, session_type = 'focus', task_id } = req.body;

    const duration = parseInt(duration_minutes, 10);
    if (!duration || duration <= 0) {
      return res.status(400).json({ error: 'Valid duration in minutes is required' });
    }

    const validTypes = ['focus', 'short_break', 'long_break'];
    if (!validTypes.includes(session_type)) {
      return res.status(400).json({ error: 'Session type must be focus, short_break, or long_break' });
    }

    let validTaskId = null;
    if (task_id) {
      const task = db.prepare('SELECT id FROM tasks WHERE id = ? AND user_id = ?').get(parseInt(task_id, 10), userId);
      if (task) {
        validTaskId = task.id;
      }
    }

    const insertStmt = db.prepare(`
      INSERT INTO study_sessions (user_id, task_id, duration_minutes, session_type, completed_at)
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);

    const result = insertStmt.run(userId, validTaskId, duration, session_type);
    const newSession = db.prepare(`
      SELECT s.*, t.title as task_title 
      FROM study_sessions s 
      LEFT JOIN tasks t ON s.task_id = t.id 
      WHERE s.id = ?
    `).get(Number(result.lastInsertRowid));

    // Update today's daily_goals completed_minutes if it's a focus session
    if (session_type === 'focus') {
      const todayStr = new Date().toISOString().split('T')[0];
      const goal = db.prepare('SELECT * FROM daily_goals WHERE user_id = ? AND date = ?').get(userId, todayStr);
      if (goal) {
        db.prepare('UPDATE daily_goals SET completed_minutes = completed_minutes + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
          .run(duration, goal.id);
      } else {
        const settings = db.prepare('SELECT daily_task_goal, daily_study_minutes_goal FROM user_settings WHERE user_id = ?').get(userId);
        const targetMin = settings ? settings.daily_study_minutes_goal : 120;
        const targetTasks = settings ? settings.daily_task_goal : 5;
        db.prepare(`
          INSERT INTO daily_goals (user_id, date, target_tasks, completed_tasks, target_minutes, completed_minutes)
          VALUES (?, ?, ?, 0, ?, ?)
        `).run(userId, todayStr, targetTasks, targetMin, duration);
      }
    }

    return res.status(201).json({
      message: 'Study session logged successfully',
      session: newSession
    });
  } catch (err) {
    console.error('logStudySession error:', err);
    return res.status(500).json({ error: 'Failed to record study session' });
  }
}

module.exports = {
  getStudySessions,
  logStudySession
};
