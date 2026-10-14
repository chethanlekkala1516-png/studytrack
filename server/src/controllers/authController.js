const bcrypt = require('bcryptjs');
const { db } = require('../config/db');
const { generateToken } = require('../middleware/auth');

function cookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  };
}

// POST /api/auth/signup
function signup(req, res) {
  try {
    const { name, email, password } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Name is required' });
    }
    if (name.trim().length < 2) {
      return res.status(400).json({ error: 'Name must be at least 2 characters long' });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({ error: 'Email address is required' });
    }
    const emailTrimmed = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailTrimmed)) {
      return res.status(400).json({ error: 'Please enter a valid email address' });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    // Check duplicate email
    const existing = db.prepare('SELECT id FROM users WHERE LOWER(email) = ?').get(emailTrimmed);
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);

    const insertUser = db.prepare(`
      INSERT INTO users (name, email, password_hash)
      VALUES (?, ?, ?)
    `);
    const result = insertUser.run(name.trim(), emailTrimmed, passwordHash);
    const userId = Number(result.lastInsertRowid);

    // Initialize user settings
    db.prepare(`
      INSERT INTO user_settings (user_id, theme, daily_task_goal, daily_study_minutes_goal, focus_duration, short_break, long_break, timezone)
      VALUES (?, 'light', 5, 120, 25, 5, 15, 'UTC')
    `).run(userId);

    const user = {
      id: userId,
      name: name.trim(),
      email: emailTrimmed
    };

    const settings = db.prepare('SELECT * FROM user_settings WHERE user_id = ?').get(userId);

    const token = generateToken(user);
    res.cookie('token', token, cookieOptions());

    return res.status(201).json({
      message: 'Student account created successfully',
      user,
      settings: settings || {},
      token
    });
  } catch (err) {
    console.error('Signup error:', err);
    return res.status(500).json({ error: 'Failed to create account. Please try again.' });
  }
}

// POST /api/auth/login
function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({ error: 'Email is required' });
    }
    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }

    const emailTrimmed = email.trim().toLowerCase();
    const user = db.prepare('SELECT id, name, email, password_hash FROM users WHERE LOWER(email) = ?').get(emailTrimmed);

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = bcrypt.compareSync(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const userData = {
      id: user.id,
      name: user.name,
      email: user.email
    };

    const settings = db.prepare('SELECT * FROM user_settings WHERE user_id = ?').get(user.id);

    const token = generateToken(userData);
    res.cookie('token', token, cookieOptions());

    return res.json({
      message: 'Logged in successfully',
      user: userData,
      settings: settings || {},
      token
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Login failed. Please try again.' });
  }
}

// POST /api/auth/logout
function logout(req, res) {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  });
  return res.json({ message: 'Logged out successfully' });
}

// GET /api/auth/me
function getMe(req, res) {
  try {
    const user = db.prepare('SELECT id, name, email, created_at FROM users WHERE id = ?').get(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const settings = db.prepare('SELECT * FROM user_settings WHERE user_id = ?').get(req.user.id);

    return res.json({
      user,
      settings: settings || {}
    });
  } catch (err) {
    console.error('Get me error:', err);
    return res.status(500).json({ error: 'Failed to retrieve user profile' });
  }
}

module.exports = {
  signup,
  login,
  logout,
  getMe
};
