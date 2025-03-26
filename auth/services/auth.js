/**
 * Authentication service
 */
'use strict';

const User = require('../models/user');
const passwordUtils = require('../utils/password');

const authService = {
  /**
   * Register a new user
   * @param {Object} userData User data
   * @returns {Object} Created user
   */
  async register(userData) {
    try {
      // Check if user with email already exists
      const existingUserByEmail = await User.findByEmail(userData.email);
      if (existingUserByEmail) {
        throw new Error('Email is already registered');
      }
      
      // Check if user with display name already exists
      const existingUserByDisplayName = await User.findByDisplayName(userData.display_name);
      if (existingUserByDisplayName) {
        throw new Error('Display name is already taken');
      }
      
      // Create user
      const user = await User.create(userData);
      
      // Return user without sensitive information
      return {
        id: user.id,
        email: user.email,
        display_name: user.display_name,
        image: user.image,
        created_at: user.created_at
      };
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Login user
   * @param {string} email User email
   * @param {string} password User password
   * @returns {Object} User data and session info
   */
  async login(email, password) {
    try {
      // Find user by email
      const user = await User.findByEmail(email);
      if (!user) {
        throw new Error('Invalid email or password');
      }
      
      // Verify password
      const isPasswordValid = await passwordUtils.comparePassword(password, user.pw_hash);
      if (!isPasswordValid) {
        throw new Error('Invalid email or password');
      }
      
      // Update user online status and login count
      User.updateOnlineStatus(user.id, 1);
      User.incrementLoginCount(user.id);
      
      // Return user without sensitive information
      return {
        id: user.id,
        email: user.email,
        display_name: user.display_name,
        image: user.image,
        created_at: user.created_at
      };
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Logout user
   * @param {number} userId User ID
   * @returns {boolean} True if logout was successful
   */
  async logout(userId) {
    try {
      return User.updateOnlineStatus(userId, 0);
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Change user password
   * @param {number} userId User ID
   * @param {string} currentPassword Current password
   * @param {string} newPassword New password
   * @returns {boolean} True if password was changed
   */
  async changePassword(userId, currentPassword, newPassword) {
    try {
      // Find user
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }
      
      // Verify current password
      const isPasswordValid = await passwordUtils.comparePassword(currentPassword, user.pw_hash);
      if (!isPasswordValid) {
        throw new Error('Current password is incorrect');
      }
      
      // Update password
      return User.updatePassword(userId, newPassword);
    } catch (error) {
      throw error;
    }
  }
};

module.exports = authService;
