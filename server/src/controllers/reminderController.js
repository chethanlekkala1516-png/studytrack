const { db } = require('../config/db');

// Helper to sync dynamic reminders for a user based on current deadlines
function syncUserReminders(userId) {
  try {
    const now = new Date();
    const tasks = db.prepare(`
      SELECT id, title, subject, due_date, status 
      FROM tasks 
      WHERE user_id = ? AND status != 'Completed'
    `).all(userId);

    const insertReminder = db.prepare(`
      INSERT INTO reminders (user_id, task_id, title, message, type, is_read, trigger_time)
      VALUES (?, ?, ?, ?, ?, 0, ?)
    `);

    for (const task of tasks) {
      if (!task.due_date) continue;
      const dueDate = new Date(task.due_date);
      const diffMs = dueDate.getTime() - now.getTime();

      // Check overdue (diffMs < 0)
      if (diffMs < 0) {
        const existingOverdue = db.prepare(`
          SELECT id FROM reminders 
          WHERE user_id = ? AND task_id = ? AND type = 'overdue'
        `).get(userId, task.id);

        if (!existingOverdue) {
          insertReminder.run(
            userId,
            task.id,
            `Overdue: ${task.title}`,
            `Task "${task.title}" (${task.subject}) was due on ${task.due_date}.`,
            'overdue',
            now.toISOString()
          );
        }
      } 
      // Check due soon (within 24 hours)
      else if (diffMs <= 24 * 60 * 60 * 1000) {
        const existingDueSoon = db.prepare(`
          SELECT id FROM reminders 
          WHERE user_id = ? AND task_id = ? AND type = 'due_soon'
        `).get(userId, task.id);

        if (!existingDueSoon) {
          insertReminder.run(
            userId,
            task.id,
            `Due Soon: ${task.title}`,
            `Task "${task.title}" (${task.subject}) is due within 24 hours!`,
            'due_soon',
            now.toISOString()
          );
        }
      }
    }
  } catch (err) {
    console.error('Error syncing reminders:', err);
  }
}

// GET /api/reminders
function getReminders(req, res) {
  try {
    const userId = req.user.id;
    // Auto-sync reminders against current task deadlines
    syncUserReminders(userId);

    const reminders = db.prepare(`
      SELECT r.*, t.title as task_title, t.subject as task_subject
      FROM reminders r
      LEFT JOIN tasks t ON r.task_id = t.id
      WHERE r.user_id = ?
      ORDER BY r.is_read ASC, r.created_at DESC
      LIMIT 100
    `).all(userId);

    const unreadCount = db.prepare(`
      SELECT COUNT(*) as count FROM reminders WHERE user_id = ? AND is_read = 0
    `).get(userId).count;

    return res.json({
      reminders,
      unreadCount
    });
  } catch (err) {
    console.error('getReminders error:', err);
    return res.status(500).json({ error: 'Failed to retrieve reminders' });
  }
}

// PATCH /api/reminders/:id
function markAsRead(req, res) {
  try {
    const userId = req.user.id;
    const reminderId = parseInt(req.params.id, 10);

    const reminder = db.prepare('SELECT id FROM reminders WHERE id = ? AND user_id = ?').get(reminderId, userId);
    if (!reminder) {
      return res.status(404).json({ error: 'Reminder not found' });
    }

    db.prepare('UPDATE reminders SET is_read = 1 WHERE id = ? AND user_id = ?').run(reminderId, userId);

    return res.json({ message: 'Reminder marked as read' });
  } catch (err) {
    console.error('markAsRead error:', err);
    return res.status(500).json({ error: 'Failed to update reminder' });
  }
}

// POST /api/reminders/read-all
function markAllAsRead(req, res) {
  try {
    const userId = req.user.id;
    db.prepare('UPDATE reminders SET is_read = 1 WHERE user_id = ?').run(userId);
    return res.json({ message: 'All reminders marked as read' });
  } catch (err) {
    console.error('markAllAsRead error:', err);
    return res.status(500).json({ error: 'Failed to mark all as read' });
  }
}

module.exports = {
  getReminders,
  markAsRead,
  markAllAsRead
};
