const bcrypt = require('bcryptjs');
const { db } = require('../config/db');

// GET /api/settings
function getSettings(req, res) {
  try {
    const userId = req.user.id;

    const user = db.prepare('SELECT id, name, email, created_at FROM users WHERE id = ?').get(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    let settings = db.prepare('SELECT * FROM user_settings WHERE user_id = ?').get(userId);
    if (!settings) {
      // Auto-create default settings if missing
      db.prepare(`
        INSERT INTO user_settings (user_id, theme, daily_task_goal, daily_study_minutes_goal, focus_duration, short_break, long_break, timezone)
        VALUES (?, 'light', 5, 120, 25, 5, 15, 'UTC')
      `).run(userId);
      settings = db.prepare('SELECT * FROM user_settings WHERE user_id = ?').get(userId);
    }

    return res.json({
      user,
      settings
    });
  } catch (err) {
    console.error('getSettings error:', err);
    return res.status(500).json({ error: 'Failed to retrieve settings' });
  }
}

// PATCH /api/settings
function updateSettings(req, res) {
  try {
    const userId = req.user.id;
    const {
      name,
      theme,
      daily_task_goal,
      daily_study_minutes_goal,
      focus_duration,
      short_break,
      long_break,
      timezone,
      reminder_lead_time,
      current_password,
      new_password
    } = req.body;

    // Update user profile name if provided
    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({ error: 'Display name cannot be empty' });
      }
      db.prepare('UPDATE users SET name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(name.trim(), userId);
    }

    // Change password if requested
    if (new_password) {
      if (!current_password) {
        return res.status(400).json({ error: 'Current password is required to set a new password' });
      }
      if (new_password.length < 6) {
        return res.status(400).json({ error: 'New password must be at least 6 characters long' });
      }

      const userRow = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(userId);
      if (!userRow || !bcrypt.compareSync(current_password, userRow.password_hash)) {
        return res.status(400).json({ error: 'Current password is incorrect' });
      }

      const salt = bcrypt.genSaltSync(10);
      const newHash = bcrypt.hashSync(new_password, salt);
      db.prepare('UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(newHash, userId);
    }

    // Update settings fields
    const currentSettings = db.prepare('SELECT * FROM user_settings WHERE user_id = ?').get(userId);

    const updatedTheme = theme !== undefined ? (theme === 'dark' ? 'dark' : 'light') : (currentSettings ? currentSettings.theme : 'light');
    const updatedTaskGoal = daily_task_goal !== undefined ? Math.max(1, parseInt(daily_task_goal, 10) || 5) : (currentSettings ? currentSettings.daily_task_goal : 5);
    const updatedMinutesGoal = daily_study_minutes_goal !== undefined ? Math.max(10, parseInt(daily_study_minutes_goal, 10) || 120) : (currentSettings ? currentSettings.daily_study_minutes_goal : 120);
    const updatedFocusDur = focus_duration !== undefined ? Math.max(5, parseInt(focus_duration, 10) || 25) : (currentSettings ? currentSettings.focus_duration : 25);
    const updatedShortBreak = short_break !== undefined ? Math.max(1, parseInt(short_break, 10) || 5) : (currentSettings ? currentSettings.short_break : 5);
    const updatedLongBreak = long_break !== undefined ? Math.max(1, parseInt(long_break, 10) || 15) : (currentSettings ? currentSettings.long_break : 15);
    const updatedTimezone = timezone !== undefined ? timezone : (currentSettings ? currentSettings.timezone : 'UTC');
    const updatedReminderLead = reminder_lead_time !== undefined ? parseInt(reminder_lead_time, 10) || 60 : (currentSettings ? currentSettings.reminder_lead_time : 60);

    if (currentSettings) {
      db.prepare(`
        UPDATE user_settings SET
          theme = ?,
          daily_task_goal = ?,
          daily_study_minutes_goal = ?,
          focus_duration = ?,
          short_break = ?,
          long_break = ?,
          timezone = ?,
          reminder_lead_time = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?
      `).run(
        updatedTheme,
        updatedTaskGoal,
        updatedMinutesGoal,
        updatedFocusDur,
        updatedShortBreak,
        updatedLongBreak,
        updatedTimezone,
        updatedReminderLead,
        userId
      );
    } else {
      db.prepare(`
        INSERT INTO user_settings (
          user_id, theme, daily_task_goal, daily_study_minutes_goal,
          focus_duration, short_break, long_break, timezone, reminder_lead_time
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        userId,
        updatedTheme,
        updatedTaskGoal,
        updatedMinutesGoal,
        updatedFocusDur,
        updatedShortBreak,
        updatedLongBreak,
        updatedTimezone,
        updatedReminderLead
      );
    }

    const updatedUser = db.prepare('SELECT id, name, email, created_at FROM users WHERE id = ?').get(userId);
    const updatedSet = db.prepare('SELECT * FROM user_settings WHERE user_id = ?').get(userId);

    return res.json({
      message: 'Settings updated successfully',
      user: updatedUser,
      settings: updatedSet
    });
  } catch (err) {
    console.error('updateSettings error:', err);
    return res.status(500).json({ error: 'Failed to update settings' });
  }
}

module.exports = {
  getSettings,
  updateSettings
};
