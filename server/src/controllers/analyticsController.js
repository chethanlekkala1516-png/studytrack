const { db } = require('../config/db');
const { calculateStreaks } = require('./goalsController');

// GET /api/analytics/summary
function getSummary(req, res) {
  try {
    const userId = req.user.id;
    const todayStr = new Date().toISOString().split('T')[0];

    // Total tasks
    const totalRow = db.prepare('SELECT COUNT(*) as count FROM tasks WHERE user_id = ?').get(userId);
    const totalTasks = totalRow ? totalRow.count : 0;

    // Completed tasks
    const completedRow = db.prepare("SELECT COUNT(*) as count FROM tasks WHERE user_id = ? AND status = 'Completed'").get(userId);
    const completedTasks = completedRow ? completedRow.count : 0;

    // Pending tasks
    const pendingRow = db.prepare("SELECT COUNT(*) as count FROM tasks WHERE user_id = ? AND status = 'Pending'").get(userId);
    const pendingTasks = pendingRow ? pendingRow.count : 0;

    // In Progress tasks
    const inProgressRow = db.prepare("SELECT COUNT(*) as count FROM tasks WHERE user_id = ? AND status = 'In Progress'").get(userId);
    const inProgressTasks = inProgressRow ? inProgressRow.count : 0;

    // Overdue tasks: status != 'Completed' AND due_date < now
    const nowIso = new Date().toISOString();
    const overdueRow = db.prepare(`
      SELECT COUNT(*) as count 
      FROM tasks 
      WHERE user_id = ? AND status != 'Completed' AND due_date < ?
    `).get(userId, nowIso);
    const overdueTasks = overdueRow ? overdueRow.count : 0;

    // Today's tasks (due today)
    const todayTasksRow = db.prepare(`
      SELECT COUNT(*) as count 
      FROM tasks 
      WHERE user_id = ? AND due_date LIKE ?
    `).get(userId, `${todayStr}%`);
    const todayTasks = todayTasksRow ? todayTasksRow.count : 0;

    // Completed today
    const completedTodayRow = db.prepare(`
      SELECT COUNT(*) as count 
      FROM tasks 
      WHERE user_id = ? AND status = 'Completed' AND completed_at LIKE ?
    `).get(userId, `${todayStr}%`);
    const completedToday = completedTodayRow ? completedTodayRow.count : 0;

    // Total study minutes
    const totalMinRow = db.prepare(`
      SELECT SUM(duration_minutes) as total 
      FROM study_sessions 
      WHERE user_id = ? AND session_type = 'focus'
    `).get(userId);
    const totalStudyMinutes = totalMinRow && totalMinRow.total ? totalMinRow.total : 0;

    // Today's study minutes
    const todayMinRow = db.prepare(`
      SELECT SUM(duration_minutes) as total 
      FROM study_sessions 
      WHERE user_id = ? AND session_type = 'focus' AND completed_at LIKE ?
    `).get(userId, `${todayStr}%`);
    const todayStudyMinutes = todayMinRow && todayMinRow.total ? todayMinRow.total : 0;

    // Daily completion percentage
    const dailyCompletionRate = todayTasks > 0 ? Math.round((completedToday / todayTasks) * 100) : (completedToday > 0 ? 100 : 0);
    const overallCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Streaks
    const { currentStreak, bestStreak } = calculateStreaks(userId);

    // Recent activity (last 5 tasks updated/completed)
    const recentActivity = db.prepare(`
      SELECT id, title, subject, status, priority, due_date, updated_at, completed_at
      FROM tasks
      WHERE user_id = ?
      ORDER BY updated_at DESC
      LIMIT 5
    `).all(userId);

    return res.json({
      totalTasks,
      completedTasks,
      pendingTasks,
      inProgressTasks,
      overdueTasks,
      todayTasks,
      completedToday,
      totalStudyMinutes,
      todayStudyMinutes,
      dailyCompletionRate,
      overallCompletionRate,
      currentStreak,
      bestStreak,
      recentActivity
    });
  } catch (err) {
    console.error('getSummary error:', err);
    return res.status(500).json({ error: 'Failed to retrieve analytics summary' });
  }
}

// GET /api/analytics/weekly
function getWeekly(req, res) {
  try {
    const userId = req.user.id;
    const days = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });

      // Completed tasks on this day
      const completedRow = db.prepare(`
        SELECT COUNT(*) as count 
        FROM tasks 
        WHERE user_id = ? AND status = 'Completed' AND completed_at LIKE ?
      `).get(userId, `${dateStr}%`);

      // Created tasks on this day
      const createdRow = db.prepare(`
        SELECT COUNT(*) as count 
        FROM tasks 
        WHERE user_id = ? AND created_at LIKE ?
      `).get(userId, `${dateStr}%`);

      // Focus study minutes on this day
      const minutesRow = db.prepare(`
        SELECT SUM(duration_minutes) as total 
        FROM study_sessions 
        WHERE user_id = ? AND session_type = 'focus' AND completed_at LIKE ?
      `).get(userId, `${dateStr}%`);

      days.push({
        date: dateStr,
        day: dayLabel,
        completedTasks: completedRow ? completedRow.count : 0,
        createdTasks: createdRow ? createdRow.count : 0,
        studyMinutes: minutesRow && minutesRow.total ? minutesRow.total : 0
      });
    }

    return res.json({ weekly: days });
  } catch (err) {
    console.error('getWeekly error:', err);
    return res.status(500).json({ error: 'Failed to retrieve weekly metrics' });
  }
}

// GET /api/analytics/monthly
function getMonthly(req, res) {
  try {
    const userId = req.user.id;

    // Subject breakdown
    const subjectStats = db.prepare(`
      SELECT 
        subject,
        COUNT(*) as total,
        SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status != 'Completed' THEN 1 ELSE 0 END) as pending
      FROM tasks
      WHERE user_id = ?
      GROUP BY subject
      ORDER BY total DESC
    `).all(userId);

    // Priority breakdown
    const priorityStats = db.prepare(`
      SELECT 
        priority,
        COUNT(*) as total,
        SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) as completed
      FROM tasks
      WHERE user_id = ?
      GROUP BY priority
      ORDER BY CASE priority WHEN 'High' THEN 1 WHEN 'Medium' THEN 2 WHEN 'Low' THEN 3 ELSE 4 END
    `).all(userId);

    // Status breakdown
    const statusStats = db.prepare(`
      SELECT status, COUNT(*) as count
      FROM tasks
      WHERE user_id = ?
      GROUP BY status
    `).all(userId);

    // Last 30 days daily focus minutes
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

    const studyTrend = db.prepare(`
      SELECT 
        DATE(completed_at) as date,
        SUM(duration_minutes) as minutes
      FROM study_sessions
      WHERE user_id = ? AND session_type = 'focus' AND completed_at >= ?
      GROUP BY DATE(completed_at)
      ORDER BY date ASC
    `).all(userId, thirtyDaysAgoStr);

    return res.json({
      subjectStats,
      priorityStats,
      statusStats,
      studyTrend
    });
  } catch (err) {
    console.error('getMonthly error:', err);
    return res.status(500).json({ error: 'Failed to retrieve monthly metrics' });
  }
}

module.exports = {
  getSummary,
  getWeekly,
  getMonthly
};
