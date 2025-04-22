/**
 * Blocking model
 */
'use strict';

const db = require('../db/db');

const Blocking = {
  /**
   * Block a user
   * @param {number} userId User who is blocking
   * @param {number} blockedUserId User to be blocked
   * @returns {Object} Created blocking
   */
  blockUser(userId, blockedUserId) {
    try {
      const stmt = db.prepare('INSERT INTO blockings (user_id, blocked_user_id) VALUES (?, ?)');
      const result = stmt.run(userId, blockedUserId);
      
      if (result.changes === 0) {
        throw new Error('User could not be blocked');
      }
      
      return { id: result.lastInsertRowid, user_id: userId, blocked_user_id: blockedUserId };
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Unblock a user
   * @param {number} userId User who is unblocking
   * @param {number} blockedUserId User to be unblocked
   * @returns {boolean} True if user was unblocked
   */
  unblockUser(userId, blockedUserId) {
    try {
      const stmt = db.prepare('DELETE FROM blockings WHERE user_id = ? AND blocked_user_id = ?');
      const result = stmt.run(userId, blockedUserId);
      
      return result.changes > 0;
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Check if a user is blocked
   * @param {number} userId User who might be blocking
   * @param {number} blockedUserId User who might be blocked
   * @returns {boolean} True if blockedUserId is blocked by userId
   */
  isBlocked(userId, blockedUserId) {
    try {
      const stmt = db.prepare('SELECT COUNT(*) as count FROM blockings WHERE user_id = ? AND blocked_user_id = ?');
      const result = stmt.get(userId, blockedUserId);
      
      return result.count > 0;
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Get all users blocked by a user
   * @param {number} userId User ID
   * @returns {Array} List of blocked users
   */
  getBlockedUsers(userId) {
    try {
      const stmt = db.prepare(`
        SELECT u.id, u.display_name, u.image, b.id as blocking_id
        FROM users u
        JOIN blockings b ON u.id = b.blocked_user_id
        WHERE b.user_id = ?
      `);
      
      return stmt.all(userId);
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Get users who have blocked a specific user
   * @param {number} userId User ID who might be blocked
   * @returns {Array} List of user IDs who have blocked userId
   */
  getUsersWhoBlocked(userId) {
    try {
      const stmt = db.prepare('SELECT user_id FROM blockings WHERE blocked_user_id = ?');
      return stmt.all(userId).map(row => row.user_id);
    } catch (error) {
      throw error;
    }
  }
};

module.exports = Blocking;
