'use strict';
import { db } from '../db/db.js';
import { passwordUtils } from '../utils/password.js';
const User = {
    /**
     * Create a new user
     * @param {Object} userData User data to insert
     * @returns {Object} Created user
     */
    async create(userData) {
        try {
            // Hash password
            const pw_hash = await passwordUtils.hashPassword(userData.password);
            // Insert user
            const stmt = db.prepare(`
        INSERT INTO users (email, pw_hash, display_name)
        VALUES (?, ?, ?)
      `);
            const result = stmt.run(userData.email, pw_hash, userData.displayName);
            // if (result.changes === 0 ) {
            //   throw new Error('User could not be created');
            // }
            return this.findById((result.lastInsertRowid).toString());
        }
        catch (db_error) {
            throw db_error; // just passing along without trying to interpret
        }
    },
    /**
     * Delete user by ID
     * @param {string} id User ID
     * @returns {number} Result of deletion
     */
    async delete(id) {
        try {
            const stmt = db.prepare('DELETE FROM users WHERE id = ?');
            const result = stmt.run(id);
            return result.changes > 0;
        }
        catch (db_error) {
            throw db_error;
        }
    },
    /**
     * Find user by ID
     * @param {string} id User ID
     * @returns {Object|null} User or null if not found
     */
    async findById(id) {
        try {
            const stmt = db.prepare('SELECT id, email, display_name, image, online_status, created_at FROM users WHERE id = ?');
            return stmt.get(Number(id)) || null;
        }
        catch (db_error) {
            throw db_error;
        }
    },
    /**
   * Find users by IDs
   * @param {string[]} ids User IDs
   * @returns {AuthServiceTypes.UserType[]} List of users or empty array if not found
   */
    async findByIds(ids) {
        try {
            const idList = ids.map(() => '?').join(', ');
            const stmt = db.prepare(`SELECT id, email, display_name, image, online_status, created_at FROM users WHERE id IN (${idList})`);
            const results = stmt.all(...ids);
            return results;
        }
        catch (db_error) {
            throw db_error;
        }
    },
    /**
     * Find user by email
     * @param {string} email User email
     * @returns {Object|null} User or null if not found
     */
    async findByEmail(email) {
        try {
            const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
            return stmt.get(email) || null;
        }
        catch (db_error) {
            throw db_error;
        }
    },
    /**
     * Find user by display name
     * @param {string} displayName User display name
     * @returns {Object|null} User or null if not found
     */
    async findByDisplayName(displayName) {
        try {
            const stmt = db.prepare('SELECT id, email, display_name, image, online_status, created_at FROM users WHERE display_name = ?');
            return stmt.get(displayName) || null;
        }
        catch (db_error) {
            throw db_error;
        }
    },
    /**
     * Set user's password
     * @param {string} id User ID
     * @param {string} password New password
     * @returns {boolean} True if password was updated
     */
    async setPassword(id, password) {
        try {
            const pw_hash = await passwordUtils.hashPassword(password);
            const stmt = db.prepare('UPDATE users SET pw_hash = ? WHERE id = ?');
            const result = stmt.run(pw_hash, id);
            return result.changes > 0;
        }
        catch (db_error) {
            throw db_error;
        }
    },
    /**
     * Set user's email
     * @param {string} id User ID
     * @param {string} email New password
     * @returns {boolean} True if password was updated
     */
    async setEmail(id, email) {
        try {
            const stmt = db.prepare('UPDATE users SET email = ? WHERE id = ?');
            const result = stmt.run(email, id);
            return result.changes > 0;
        }
        catch (db_error) {
            throw db_error;
        }
    },
    /**
     * Set user's display name
     * @param {string} id User ID
     * @param {string} displayName New display name
     * @returns {Object} Updated user
     */
    async setDisplayName(id, displayName) {
        try {
            const stmt = db.prepare(`
        UPDATE users
        SET display_name = ?
        WHERE id = ?
      `);
            const result = stmt.run(displayName, id);
            if (result.changes === 0) {
                throw new Error('User could not be updated');
            }
            return this.findById(id);
        }
        catch (db_error) {
            throw db_error;
        }
    },
    /**
   * Set user's image
   * @param {string} id User ID
   * @param {Buffer} image New image
   * @param {Buffer} small_image Small image
   * @returns {Object} Updated user
   */
    async setImage(id, image, small_image) {
        try {
            const stmt = db.prepare(`
          UPDATE users
          SET image = ?, small_image = ?
          WHERE id = ?
        `);
            const result = stmt.run(image, small_image, id);
            if (result.changes === 0) {
                throw new Error('User could not be updated');
            }
            return this.findById(id);
        }
        catch (db_error) {
            throw db_error;
        }
    },
    /**
     * Update user's online status
     * @param {string} id User ID
     * @param {number} status Online status (0: offline, 1: online)
     * @returns {boolean} True if status was updated
     */
    async updateOnlineStatus(id, status) {
        try {
            const stmt = db.prepare('UPDATE users SET online_status = ? WHERE id = ?');
            const result = stmt.run(status, id);
            return result.changes > 0;
        }
        catch (db_error) {
            throw db_error;
        }
    },
    /**
     * Increment login count for user
     * @param {string} id User ID
     * @returns {boolean} True if count was incremented
     */
    async incrementLoginCount(id) {
        try {
            const stmt = db.prepare('UPDATE users SET login_count = login_count + 1 WHERE id = ?');
            const result = stmt.run(id);
            return result.changes > 0;
        }
        catch (db_error) {
            throw db_error;
        }
    },
    /**
     * Get all users
     * @returns {Array} List of users
     */
    async findAll() {
        try {
            const stmt = db.prepare('SELECT id, display_name, image, online_status FROM users');
            return stmt.all();
        }
        catch (db_error) {
            throw db_error;
        }
    }
    /**
     * Store new match entry
     * @param {string} user1_id User1 ID
     * @param {string} user2_id User2 ID
     */
};
export { User };
