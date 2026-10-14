const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

// Determine database path from environment or default to server/data/studytrack.db
const defaultDbDir = path.join(__dirname, '..', '..', 'data');
if (!fs.existsSync(defaultDbDir)) {
  fs.mkdirSync(defaultDbDir, { recursive: true });
}

const dbPath = process.env.DB_PATH 
  ? path.resolve(process.env.DB_PATH) 
  : path.join(defaultDbDir, 'studytrack.db');

const db = new DatabaseSync(dbPath);

// Enable WAL mode and foreign key constraints
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT,
      subject TEXT NOT NULL,
      priority TEXT NOT NULL CHECK(priority IN ('Low', 'Medium', 'High')),
      status TEXT NOT NULL CHECK(status IN ('Pending', 'In Progress', 'Completed')),
      start_date TEXT,
      due_date TEXT NOT NULL,
      estimated_duration INTEGER DEFAULT 30,
      notes TEXT,
      completed_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS reminders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('due_soon', 'overdue', 'custom')),
      is_read INTEGER DEFAULT 0,
      trigger_time TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS study_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      task_id INTEGER REFERENCES tasks(id) ON DELETE SET NULL,
      duration_minutes INTEGER NOT NULL,
      session_type TEXT NOT NULL CHECK(session_type IN ('focus', 'short_break', 'long_break')),
      completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS daily_goals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      date TEXT NOT NULL,
      target_tasks INTEGER DEFAULT 5,
      completed_tasks INTEGER DEFAULT 0,
      target_minutes INTEGER DEFAULT 120,
      completed_minutes INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, date)
    );

    CREATE TABLE IF NOT EXISTS user_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      theme TEXT DEFAULT 'light',
      daily_task_goal INTEGER DEFAULT 5,
      daily_study_minutes_goal INTEGER DEFAULT 120,
      focus_duration INTEGER DEFAULT 25,
      short_break INTEGER DEFAULT 5,
      long_break INTEGER DEFAULT 15,
      timezone TEXT DEFAULT 'UTC',
      reminder_lead_time INTEGER DEFAULT 60,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_tasks_user_due ON tasks(user_id, due_date);
    CREATE INDEX IF NOT EXISTS idx_tasks_user_status ON tasks(user_id, status);
    CREATE INDEX IF NOT EXISTS idx_reminders_user_unread ON reminders(user_id, is_read);
    CREATE INDEX IF NOT EXISTS idx_study_sessions_user_date ON study_sessions(user_id, completed_at);
    CREATE INDEX IF NOT EXISTS idx_daily_goals_user_date ON daily_goals(user_id, date);
  `);

  // Seed demo student account if users table is empty
  seedDemoStudentIfEmpty();
}

function seedDemoStudentIfEmpty() {
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
  if (userCount > 0) return;

  const demoEmail = 'alex.study@example.com';
  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync('password123', salt);

  const insertUser = db.prepare(`
    INSERT INTO users (name, email, password_hash)
    VALUES (?, ?, ?)
  `);
  const result = insertUser.run('Alex Morgan', demoEmail, passwordHash);
  const demoUserId = Number(result.lastInsertRowid);

  // Insert default settings
  db.prepare(`
    INSERT INTO user_settings (user_id, theme, daily_task_goal, daily_study_minutes_goal, focus_duration, short_break, long_break, timezone)
    VALUES (?, 'light', 5, 120, 25, 5, 15, 'America/New_York')
  `).run(demoUserId);

  // Helper date offset
  const today = new Date();
  const formatIsoDate = (d) => d.toISOString().split('T')[0];
  const addDays = (offset) => {
    const d = new Date(today);
    d.setDate(d.getDate() + offset);
    return formatIsoDate(d);
  };

  const sampleTasks = [
    {
      title: 'Complete Linear Algebra Problem Set 4',
      description: 'Eigenvalues, eigenvectors, and diagonalization exercises 1 to 15.',
      subject: 'Mathematics',
      priority: 'High',
      status: 'Pending',
      start_date: addDays(-1),
      due_date: `${addDays(0)} 23:59`,
      estimated_duration: 90,
      notes: 'Check professor office hour notes on section 5.2.'
    },
    {
      title: 'Implement Binary Search Tree in C++',
      description: 'Write insert, delete, and in-order traversal with memory leak checks.',
      subject: 'Computer Science',
      priority: 'High',
      status: 'In Progress',
      start_date: addDays(-2),
      due_date: `${addDays(1)} 17:00`,
      estimated_duration: 120,
      notes: 'Valgrind tests required before submission.'
    },
    {
      title: 'Read Physics Ch. 7: Rotational Dynamics',
      description: 'Focus on moment of inertia and angular momentum conservation.',
      subject: 'Physics',
      priority: 'Medium',
      status: 'Pending',
      start_date: addDays(0),
      due_date: `${addDays(2)} 12:00`,
      estimated_duration: 60,
      notes: 'Summarize key equations in notebook.'
    },
    {
      title: 'Submit Chemistry Lab Report on Titration',
      description: 'Include error analysis, graphs of pH vs volume, and conclusion.',
      subject: 'Chemistry',
      priority: 'High',
      status: 'Completed',
      start_date: addDays(-4),
      due_date: `${addDays(-1)} 23:59`,
      estimated_duration: 75,
      notes: 'Reviewed by lab partner.',
      completed_at: new Date(Date.now() - 86400000).toISOString()
    },
    {
      title: 'Draft Introduction for World History Essay',
      description: 'Analyze industrial revolution trade routes and technological shifts.',
      subject: 'History',
      priority: 'Low',
      status: 'Completed',
      start_date: addDays(-5),
      due_date: `${addDays(-2)} 18:00`,
      estimated_duration: 45,
      notes: 'Three scholarly citations gathered.',
      completed_at: new Date(Date.now() - 172800000).toISOString()
    },
    {
      title: 'Review Organic Reaction Mechanisms Quiz',
      description: 'SN1, SN2, E1, and E2 pathways with carbocation rearrangements.',
      subject: 'Chemistry',
      priority: 'Medium',
      status: 'Pending',
      start_date: addDays(-3),
      due_date: `${addDays(-1)} 09:00`,
      estimated_duration: 60,
      notes: 'Overdue task from yesterday.'
    },
    {
      title: 'Prepare Presentation on Modern Algorithms',
      description: 'Create 10 slides on Dijkstra vs A* pathfinding heuristics.',
      subject: 'Computer Science',
      priority: 'Medium',
      status: 'Pending',
      start_date: addDays(1),
      due_date: `${addDays(4)} 15:30`,
      estimated_duration: 90,
      notes: 'Add animated graph diagram.'
    }
  ];

  const insertTask = db.prepare(`
    INSERT INTO tasks (user_id, title, description, subject, priority, status, start_date, due_date, estimated_duration, notes, completed_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const t of sampleTasks) {
    insertTask.run(
      demoUserId,
      t.title,
      t.description,
      t.subject,
      t.priority,
      t.status,
      t.start_date,
      t.due_date,
      t.estimated_duration,
      t.notes,
      t.completed_at || null
    );
  }

  // Seed study sessions for past 5 days
  const insertSession = db.prepare(`
    INSERT INTO study_sessions (user_id, task_id, duration_minutes, session_type, completed_at)
    VALUES (?, ?, ?, ?, ?)
  `);

  const sessionDays = [-4, -3, -2, -1, 0];
  const minutesPerDay = [50, 75, 100, 85, 60];
  for (let i = 0; i < sessionDays.length; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + sessionDays[i]);
    d.setHours(14, 0, 0, 0);
    insertSession.run(demoUserId, null, minutesPerDay[i], 'focus', d.toISOString());
  }

  // Seed reminders
  const insertReminder = db.prepare(`
    INSERT INTO reminders (user_id, task_id, title, message, type, is_read, trigger_time)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  insertReminder.run(
    demoUserId,
    1,
    'Upcoming Deadline: Linear Algebra Problem Set 4',
    'Due tonight at 23:59. Estimated duration is 90 minutes.',
    'due_soon',
    0,
    new Date().toISOString()
  );

  insertReminder.run(
    demoUserId,
    6,
    'Overdue Task: Review Organic Reaction Mechanisms',
    'Was due yesterday. Remember to review the reaction pathways today!',
    'overdue',
    0,
    new Date(Date.now() - 3600000).toISOString()
  );

  // Seed daily goals for the last 5 days
  const insertGoal = db.prepare(`
    INSERT INTO daily_goals (user_id, date, target_tasks, completed_tasks, target_minutes, completed_minutes)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  for (let i = 0; i < sessionDays.length; i++) {
    const dateStr = addDays(sessionDays[i]);
    const completedTasks = i >= 3 ? 4 : 2;
    insertGoal.run(demoUserId, dateStr, 5, completedTasks, 120, minutesPerDay[i]);
  }
}

module.exports = {
  db,
  initDatabase,
  seedDemoStudentIfEmpty
};
