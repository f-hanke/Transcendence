/**
 * Friendship model
 */
'use strict';

const db = require('../db/db');

const Friendship = {
  /**
   * Create a friendship between two users
   * @param {number} user1 First user ID
   * @param {number} user2 Second user ID
   * @returns {Object} Created friendship
   */
  create(user1, user2) {
    try {
      const stmt = db.prepare('INSERT INTO friendships (user1, user2) VALUES (?, ?)');
      const result = stmt.run(user1, user2);
      
      if (result.changes === 0) {
        throw new Error('Friendship could not be created');
      }
      
      return { id: result.lastInsertRowid, user1, user2 };
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Delete a friendship between two users
   * @param {number} user1 First user ID
   * @param {number} user2 Second user ID
   * @returns {boolean} True if friendship was deleted
   */
  delete(user1, user2) {
    try {
      const stmt = db.prepare(
        'DELETE FROM friendships WHERE (user1 = ? AND user2 = ?) OR (user1 = ? AND user2 = ?)'
      );
      const result = stmt.run(user1, user2, user2, user1);
      
      return result.changes > 0;
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Check if two users are friends
   * @param {number} user1 First user ID
   * @param {number} user2 Second user ID
   * @returns {boolean} True if users are friends
   */
  areFriends(user1, user2) {
    try {
      const stmt = db.prepare(
        'SELECT COUNT(*) as count FROM friendships WHERE (user1 = ? AND user2 = ?) OR (user1 = ? AND user2 = ?)'
      );
      const result = stmt.get(user1, user2, user2, user1);
      
      return result.count > 0;
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Get all friends of a user
   * @param {number} userId User ID
   * @returns {Array} List of friends
   */
  getFriends(userId) {
    try {
      const stmt = db.prepare(`
        SELECT u.id, u.display_name, u.image, u.online_status
        FROM users u
        JOIN friendships f ON (u.id = f.user1 OR u.id = f.user2)
        WHERE (f.user1 = ? OR f.user2 = ?) AND u.id != ?
      `);
      
      return stmt.all(userId, userId, userId);
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Create a friend request
   * @param {number} asker User who sent the request
   * @param {number} responder User who receives the request
   * @returns {Object} Created friend request
   */
  createRequest(asker, responder) {
    try {
      const stmt = db.prepare(
        'INSERT INTO friend_requests (asker, responder, status) VALUES (?, ?, 0)'
      );
      const result = stmt.run(asker, responder);
      
      if (result.changes === 0) {
        throw new Error('Friend request could not be created');
      }
      
      return { id: result.lastInsertRowid, asker, responder, status: 0 };
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Accept a friend request
   * @param {number} requestId Friend request ID
   * @returns {boolean} True if request was accepted
   */
  acceptRequest(requestId) {
    try {
      // Begin transaction
      db.prepare('BEGIN TRANSACTION').run();
      
      // Get the request
      const requestStmt = db.prepare('SELECT asker, responder FROM friend_requests WHERE id = ?');
      const request = requestStmt.get(requestId);
      
      if (!request) {
        db.prepare('ROLLBACK').run();
        throw new Error('Friend request not found');
      }
      
      // Update the request status
      const updateStmt = db.prepare('UPDATE friend_requests SET status = 1 WHERE id = ?');
      updateStmt.run(requestId);
      
      // Create the friendship
      const friendshipStmt = db.prepare('INSERT INTO friendships (user1, user2) VALUES (?, ?)');
      friendshipStmt.run(request.asker, request.responder);
      
      // Commit transaction
      db.prepare('COMMIT').run();
      
      return true;
    } catch (error) {
      db.prepare('ROLLBACK').run();
      throw error;
    }
  },
  
  /**
   * Reject a friend request
   * @param {number} requestId Friend request ID
   * @returns {boolean} True if request was rejected
   */
  rejectRequest(requestId) {
    try {
      const stmt = db.prepare('UPDATE friend_requests SET status = 2 WHERE id = ?');
      const result = stmt.run(requestId);
      
      return result.changes > 0;
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Get pending friend requests for a user
   * @param {number} userId User ID
   * @returns {Array} List of pending friend requests
   */
  getPendingRequests(userId) {
    try {
      const stmt = db.prepare(`
        SELECT fr.id, fr.asker, fr.responder, fr.status, u.display_name, u.image
        FROM friend_requests fr
        JOIN users u ON fr.asker = u.id
        WHERE fr.responder = ? AND fr.status = 0
      `);
      
      return stmt.all(userId);
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Get sent friend requests by a user
   * @param {number} userId User ID
   * @returns {Array} List of sent friend requests
   */
  getSentRequests(userId) {
    try {
      const stmt = db.prepare(`
        SELECT fr.id, fr.asker, fr.responder, fr.status, u.display_name, u.image
        FROM friend_requests fr
        JOIN users u ON fr.responder = u.id
        WHERE fr.asker = ?
      `);
      
      return stmt.all(userId);
    } catch (error) {
      throw error;
    }
  }
};

module.exports = Friendship;
