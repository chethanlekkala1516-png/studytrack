const jwt = require('jsonwebtoken');
const { db } = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'studytrack_super_secret_jwt_key_hackathon_2026';

function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function authMiddleware(req, res, next) {
  try {
    let token = null;

    // Check Authorization header (Bearer token)
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } 
    // Fallback to cookie
    else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({ error: 'Authentication required. Please log in.' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Check if user still exists in database
    const user = db.prepare('SELECT id, name, email FROM users WHERE id = ?').get(decoded.id);
    if (!user) {
      return res.status(401).json({ error: 'User account no longer exists.' });
    }

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email
    };

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Session expired. Please log in again.', code: 'TOKEN_EXPIRED' });
    }
    return res.status(401).json({ error: 'Invalid authentication token.', code: 'TOKEN_INVALID' });
  }
}

module.exports = {
  authMiddleware,
  generateToken,
  JWT_SECRET
};
