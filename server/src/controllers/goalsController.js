const { db } = require('../config/db');

// Helper to calculate streaks from daily_goals
function calculateStreaks(userId) {
  const goals = db.prepare(`
    SELECT date, target_tasks, completed_tasks, target_minutes, completed_minutes
    FROM daily_goals
    WHERE user_id = ?
    ORDER BY date ASC
  `).all(userId);

  if (!goals || goals.length === 0) {
    return { currentStreak: 0, bestStreak: 0 };
  }

  // A day is considered successful if completed_tasks >= target_tasks OR completed_minutes >= target_minutes
  const successDates = new Set();
  goals.forEach(g => {
    if (g.completed_tasks >= g.target_tasks || g.completed_minutes >= g.target_minutes) {
      successDates.add(g.date);
    }
  });

  if (successDates.size === 0) {
    return { currentStreak: 0, bestStreak: 0 };
  }

  // Calculate best streak across all chronological records
  const sortedDates = Array.from(successDates).sort();
  let maxStreak = 0;
  let tempStreak = 0;
  let prevDate = null;

  for (const dateStr of sortedDates) {
    const curDate = new Date(dateStr + 'T00:00:00');
    if (prevDate) {
      const diffDays = Math.round((curDate.getTime() - prevDate.getTime()) / (1000 * 3600 * 24));
      if (diffDays === 1) {
        tempStreak += 1;
      } else {
        tempStreak = 1;
      }
    } else {
      tempStreak = 1;
    }
    prevDate = curDate;
    if (tempStreak > maxStreak) {
      maxStreak = tempStreak;
    }
  }

  // Calculate current streak counting backwards from today/yesterday
  const today = new Date();
  const formatStr = (d) => d.toISOString().split('T')[0];
  const todayStr = formatStr(today);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = formatStr(yesterday);

  let curStreak = 0;
  let checkDate = new Date(today);

  // If today is completed, start from today. Otherwise start checking from yesterday.
  if (successDates.has(todayStr)) {
    curStreak = 1;
    checkDate.setDate(checkDate.getDate() - 1);
  } else if (successDates.has(yesterdayStr)) {
    curStreak = 0; // Will be incremented in loop starting from yesterday
    checkDate = new Date(yesterday);
  } else {
    // Neither today nor yesterday met goal
    return { currentStreak: 0, bestStreak: maxStreak };
  }

  while (true) {
    const dateToCheck = formatStr(checkDate);
    if (successDates.has(dateToCheck)) {
      if (!successDates.has(todayStr) && dateToCheck === yesterdayStr) {
        curStreak += 1;
      } else if (dateToCheck !== todayStr) {
        curStreak += 1;
      }
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return {
    currentStreak: curStreak,
    bestStreak: Math.max(maxStreak, curStreak)
  };
}

// GET /api/goals
function getGoals(req, res) {
  try {
    const userId = req.user.id;
    const todayStr = new Date().toISOString().split('T')[0];

    // Fetch user default targets
    const settings = db.prepare('SELECT daily_task_goal, daily_study_minutes_goal FROM user_settings WHERE user_id = ?').get(userId);
    const targetTasks = settings ? settings.daily_task_goal : 5;
    const targetMinutes = settings ? settings.daily_study_minutes_goal : 120;

    // Check completed tasks today
    const completedTasksRow = db.prepare(`
      SELECT COUNT(*) as count 
      FROM tasks 
      WHERE user_id = ? AND status = 'Completed' AND completed_at LIKE ?
    `).get(userId, `${todayStr}%`);
    const completedTasksToday = completedTasksRow ? completedTasksRow.count : 0;

    // Check completed study minutes today
    const completedMinutesRow = db.prepare(`
      SELECT SUM(duration_minutes) as total 
      FROM study_sessions 
      WHERE user_id = ? AND session_type = 'focus' AND completed_at LIKE ?
    `).get(userId, `${todayStr}%`);
    const completedMinutesToday = completedMinutesRow && completedMinutesRow.total ? completedMinutesRow.total : 0;

    // Ensure today's daily_goals record exists and is synced
    let goal = db.prepare('SELECT * FROM daily_goals WHERE user_id = ? AND date = ?').get(userId, todayStr);
    if (!goal) {
      const res = db.prepare(`
        INSERT INTO daily_goals (user_id, date, target_tasks, completed_tasks, target_minutes, completed_minutes)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(userId, todayStr, targetTasks, completedTasksToday, targetMinutes, completedMinutesToday);
      goal = db.prepare('SELECT * FROM daily_goals WHERE id = ?').get(Number(res.lastInsertRowid));
    } else {
      // Sync latest actual numbers
      db.prepare(`
        UPDATE daily_goals 
        SET completed_tasks = ?, completed_minutes = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(completedTasksToday, completedMinutesToday, goal.id);
      goal = db.prepare('SELECT * FROM daily_goals WHERE id = ?').get(goal.id);
    }

    const { currentStreak, bestStreak } = calculateStreaks(userId);

    // Compute completion percentages
    const taskPercent = Math.min(100, Math.round((goal.completed_tasks / Math.max(1, goal.target_tasks)) * 100));
    const minutesPercent = Math.min(100, Math.round((goal.completed_minutes / Math.max(1, goal.target_minutes)) * 100));
    const overallProgress = Math.round((taskPercent + minutesPercent) / 2);

    // Recent 7 days history
    const history = db.prepare(`
      SELECT date, target_tasks, completed_tasks, target_minutes, completed_minutes
      FROM daily_goals
      WHERE user_id = ?
      ORDER BY date DESC
      LIMIT 7
    `).all(userId);

    return res.json({
      today: {
        date: todayStr,
        targetTasks: goal.target_tasks,
        completedTasks: goal.completed_tasks,
        targetMinutes: goal.target_minutes,
        completedMinutes: goal.completed_minutes,
        taskPercent,
        minutesPercent,
        overallProgress
      },
      streak: {
        current: currentStreak,
        best: bestStreak
      },
      history: history.reverse()
    });
  } catch (err) {
    console.error('getGoals error:', err);
    return res.status(500).json({ error: 'Failed to retrieve goal metrics' });
  }
}

// PUT /api/goals
function updateGoals(req, res) {
  try {
    const userId = req.user.id;
    const { targetTasks, targetMinutes } = req.body;
    const todayStr = new Date().toISOString().split('T')[0];

    const parsedTargetTasks = parseInt(targetTasks, 10);
    const parsedTargetMinutes = parseInt(targetMinutes, 10);

    if (isNaN(parsedTargetTasks) || parsedTargetTasks <= 0) {
      return res.status(400).json({ error: 'Target tasks must be a positive number' });
    }
    if (isNaN(parsedTargetMinutes) || parsedTargetMinutes <= 0) {
      return res.status(400).json({ error: 'Target minutes must be a positive number' });
    }

    // Update user_settings default goals
    db.prepare(`
      UPDATE user_settings 
      SET daily_task_goal = ?, daily_study_minutes_goal = ?, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?
    `).run(parsedTargetTasks, parsedTargetMinutes, userId);

    // Update today's daily_goals
    const existing = db.prepare('SELECT id FROM daily_goals WHERE user_id = ? AND date = ?').get(userId, todayStr);
    if (existing) {
      db.prepare(`
        UPDATE daily_goals 
        SET target_tasks = ?, target_minutes = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(parsedTargetTasks, parsedTargetMinutes, existing.id);
    } else {
      db.prepare(`
        INSERT INTO daily_goals (user_id, date, target_tasks, completed_tasks, target_minutes, completed_minutes)
        VALUES (?, ?, ?, 0, ?, 0)
      `).run(userId, todayStr, parsedTargetTasks, parsedTargetMinutes);
    }

    return res.json({
      message: 'Daily goals updated successfully',
      targetTasks: parsedTargetTasks,
      targetMinutes: parsedTargetMinutes
    });
  } catch (err) {
    console.error('updateGoals error:', err);
    return res.status(500).json({ error: 'Failed to update goals' });
  }
}

module.exports = {
  getGoals,
  updateGoals,
  calculateStreaks
};
