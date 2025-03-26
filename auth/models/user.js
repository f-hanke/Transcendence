/**
 * User model
 */
'use strict';

const db = require('../db/db');
const passwordUtils = require('../utils/password');
const config = require('../config/config');

const User = {
  /**
   * Create a new user
   * @param {Object} userData User data to insert
   * @returns {Object} Created user
   */
  async create(userData) {
    try {
      const { email, password, display_name } = userData;
      
      // Hash password
      const pw_hash = await passwordUtils.hashPassword(password);
      
      // Insert user
      const stmt = db.prepare(`
        INSERT INTO users (email, pw_hash, display_name, image)
        VALUES (?, ?, ?, ?)
      `);
      
      const result = stmt.run(email, pw_hash, display_name, config.DEFAULT_AVATAR);
      
      if (result.changes === 0) {
        throw new Error('User could not be created');
      }
      
      return this.findById(result.lastInsertRowid);
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Find user by ID
   * @param {number} id User ID
   * @returns {Object|null} User or null if not found
   */
  findById(id) {
    try {
      const stmt = db.prepare('SELECT id, email, display_name, image, online_status, created_at FROM users WHERE id = ?');
      return stmt.get(id) || null;
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Find user by email
   * @param {string} email User email
   * @returns {Object|null} User or null if not found
   */
  findByEmail(email) {
    try {
      const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
      return stmt.get(email) || null;
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Find user by display name
   * @param {string} displayName User display name
   * @returns {Object|null} User or null if not found
   */
  findByDisplayName(displayName) {
    try {
      const stmt = db.prepare('SELECT id, email, display_name, image, online_status, created_at FROM users WHERE display_name = ?');
      return stmt.get(displayName) || null;
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Update user information
   * @param {number} id User ID
   * @param {Object} userData User data to update
   * @returns {Object} Updated user
   */
  update(id, userData) {
    try {
      const { display_name, image } = userData;
      
      const stmt = db.prepare(`
        UPDATE users
        SET display_name = ?, image = ?
        WHERE id = ?
      `);
      
      const result = stmt.run(display_name, image, id);
      
      if (result.changes === 0) {
        throw new Error('User could not be updated');
      }
      
      return this.findById(id);
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Update user's password
   * @param {number} id User ID
   * @param {string} password New password
   * @returns {boolean} True if password was updated
   */
  async updatePassword(id, password) {
    try {
      const pw_hash = await passwordUtils.hashPassword(password);
      
      const stmt = db.prepare('UPDATE users SET pw_hash = ? WHERE id = ?');
      const result = stmt.run(pw_hash, id);
      
      return result.changes > 0;
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Update user's online status
   * @param {number} id User ID
   * @param {number} status Online status (0: offline, 1: online)
   * @returns {boolean} True if status was updated
   */
  updateOnlineStatus(id, status) {
    try {
      const stmt = db.prepare('UPDATE users SET online_status = ? WHERE id = ?');
      const result = stmt.run(status, id);
      
      return result.changes > 0;
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Increment login count for user
   * @param {number} id User ID
   * @returns {boolean} True if count was incremented
   */
  incrementLoginCount(id) {
    try {
      const stmt = db.prepare('UPDATE users SET login_count = login_count + 1 WHERE id = ?');
      const result = stmt.run(id);
      
      return result.changes > 0;
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Get all users
   * @returns {Array} List of users
   */
  findAll() {
    try {
      const stmt = db.prepare('SELECT id, display_name, image, online_status FROM users');
      return stmt.all();
    } catch (error) {
      throw error;
    }
  }
};

module.exports = User;
