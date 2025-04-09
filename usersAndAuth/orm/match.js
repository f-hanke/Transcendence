/**
 * Match model for game history
 */
'use strict';

const db = require('../db/db');

const Match = {
  /**
   * Create a new match record
   * @param {Object} matchData Match data
   * @returns {Object} Created match
   */
  create(matchData) {
    try {
      const { user_id, opponent, user_score, opponent_score, body } = matchData;
      
      const stmt = db.prepare(`
        INSERT INTO matches (user_id, opponent, user_score, opponent_score, body)
        VALUES (?, ?, ?, ?, ?)
      `);
      
      const result = stmt.run(user_id, opponent, user_score, opponent_score, body || null);
      
      if (result.changes === 0) {
        throw new Error('Match could not be created');
      }
      
      return this.findById(result.lastInsertRowid);
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Find match by ID
   * @param {number} id Match ID
   * @returns {Object|null} Match or null if not found
   */
  findById(id) {
    try {
      const stmt = db.prepare(`
        SELECT m.*, u1.display_name as user_name, u2.display_name as opponent_name
        FROM matches m
        JOIN users u1 ON m.user_id = u1.id
        JOIN users u2 ON m.opponent = u2.id
        WHERE m.id = ?
      `);
      
      return stmt.get(id) || null;
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Get match history for a user
   * @param {number} userId User ID
   * @param {number} limit Maximum number of matches to return
   * @param {number} offset Offset for pagination
   * @returns {Array} List of matches
   */
  getUserMatches(userId, limit = 10, offset = 0) {
    try {
      const stmt = db.prepare(`
        SELECT m.*, 
               u1.display_name as user_name, 
               u2.display_name as opponent_name,
               CASE
                 WHEN m.user_score > m.opponent_score THEN 'win'
                 WHEN m.user_score < m.opponent_score THEN 'loss'
                 ELSE 'draw'
               END as result
        FROM matches m
        JOIN users u1 ON m.user_id = u1.id
        JOIN users u2 ON m.opponent = u2.id
        WHERE m.user_id = ? OR m.opponent = ?
        ORDER BY m.date DESC
        LIMIT ? OFFSET ?
      `);
      
      return stmt.all(userId, userId, limit, offset);
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Count total matches for a user
   * @param {number} userId User ID
   * @returns {number} Total match count
   */
  countUserMatches(userId) {
    try {
      const stmt = db.prepare(`
        SELECT COUNT(*) as count
        FROM matches
        WHERE user_id = ? OR opponent = ?
      `);
      
      const result = stmt.get(userId, userId);
      return result.count;
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Get user stats (wins, losses, total games)
   * @param {number} userId User ID
   * @returns {Object} User stats
   */
  getUserStats(userId) {
    try {
      const stmt = db.prepare(`
        SELECT 
          COUNT(*) as total_games,
          SUM(CASE 
            WHEN (user_id = ? AND user_score > opponent_score) OR 
                 (opponent = ? AND opponent_score > user_score) 
            THEN 1 ELSE 0 END) as wins,
          SUM(CASE 
            WHEN (user_id = ? AND user_score < opponent_score) OR 
                 (opponent = ? AND opponent_score < user_score) 
            THEN 1 ELSE 0 END) as losses,
          SUM(CASE 
            WHEN user_score = opponent_score 
            THEN 1 ELSE 0 END) as draws
        FROM matches
        WHERE user_id = ? OR opponent = ?
      `);
      
      return stmt.get(userId, userId, userId, userId, userId, userId) || { 
        total_games: 0, 
        wins: 0, 
        losses: 0, 
        draws: 0 
      };
    } catch (error) {
      throw error;
    }
  }
};

module.exports = Match;
