const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const db = require('../config/database');

class AuthUtils {
  // ✅ Password hashing
  static async hashPassword(password) {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }

  static async comparePassword(password, hash) {
    return await bcrypt.compare(password, hash);
  }

  // ✅ JWT signing
  static generateToken(payload) {
    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });
  }

  // ✅ Create session (hash token before storing)
  static async createSession(userId, token) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

    // Hash token before saving (so DB never stores raw JWT)
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const query = `
      INSERT INTO user_sessions (user_id, token_hash, expires_at)
      VALUES (?, ?, ?)
    `;

    const result = await db.run(query, [userId, tokenHash, expiresAt.toISOString()]);
    return { id: result.lastID };
  }

  // ✅ Invalidate one session
  static async invalidateSession(token) {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const query = 'DELETE FROM user_sessions WHERE token_hash = ?';
    await db.run(query, [tokenHash]);
  }

  // ✅ Invalidate all sessions of a user
  static async invalidateAllUserSessions(userId) {
    const query = 'DELETE FROM user_sessions WHERE user_id = ?';
    await db.run(query, [userId]);
  }

  // ✅ Clean expired sessions
  static async cleanExpiredSessions() {
    const query = 'DELETE FROM user_sessions WHERE expires_at < datetime(\'now\')';
    await db.run(query);
  }

  // ✅ Generate random verification token
  static generateVerificationToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  // ✅ Validators
  static validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static validatePassword(password) {
    // At least 6 characters
    return password && password.length >= 6;
  }

  static validatePhone(phone) {
    if (!phone) return true; // Phone is optional
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
  }
}

module.exports = AuthUtils;
