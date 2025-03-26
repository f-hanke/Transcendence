/**
 * User service
 */
'use strict';

const path = require('path');
const fs = require('fs');
const User = require('../models/user');
const Match = require('../models/match');
const config = require('../config/config');

const userService = {
  /**
   * Get user profile
   * @param {number} userId User ID
   * @returns {Object} User profile with stats
   */
  async getUserProfile(userId) {
    try {
      // Get user data
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }
      
      // Get user stats
      const stats = await Match.getUserStats(userId);
      
      // Combine user data and stats
      return {
        ...user,
        stats
      };
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Update user profile
   * @param {number} userId User ID
   * @param {Object} userData User data to update
   * @returns {Object} Updated user
   */
  async updateProfile(userId, userData) {
    try {
      // Validate display name uniqueness if changed
      if (userData.display_name) {
        const existingUser = await User.findByDisplayName(userData.display_name);
        if (existingUser && existingUser.id !== userId) {
          throw new Error('Display name is already taken');
        }
      }
      
      // Update user
      return User.update(userId, userData);
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Upload user avatar
   * @param {number} userId User ID
   * @param {Object} file Uploaded file
   * @returns {string} Avatar path
   */
  async uploadAvatar(userId, file) {
    try {
      // Ensure avatars directory exists
      if (!fs.existsSync(config.AVATARS_DIR)) {
        fs.mkdirSync(config.AVATARS_DIR, { recursive: true });
      }
      
      // Generate unique filename
      const fileExt = path.extname(file.filename);
      const fileName = `${userId}_${Date.now()}${fileExt}`;
      const filePath = path.join(config.AVATARS_DIR, fileName);
      
      // Save file
      await fs.promises.copyFile(file.path, filePath);
      
      // Update user avatar path in database
      const avatarUrl = `/public/img/avatars/${fileName}`;
      await User.update(userId, { image: avatarUrl });
      
      // Remove temporary file
      try {
        await fs.promises.unlink(file.path);
      } catch (unlinkError) {
        console.error('Failed to remove temporary file:', unlinkError);
      }
      
      return avatarUrl;
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Get match history for a user
   * @param {number} userId User ID
   * @param {number} page Page number (1-based)
   * @param {number} limit Matches per page
   * @returns {Object} Match history with pagination info
   */
  async getMatchHistory(userId, page = 1, limit = 10) {
    try {
      // Calculate offset
      const offset = (page - 1) * limit;
      
      // Get matches
      const matches = await Match.getUserMatches(userId, limit, offset);
      
      // Get total match count
      const totalMatches = await Match.countUserMatches(userId);
      
      // Calculate total pages
      const totalPages = Math.ceil(totalMatches / limit);
      
      return {
        matches,
        pagination: {
          current: page,
          total: totalPages,
          limit,
          totalMatches
        }
      };
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Get list of users
   * @param {number} currentUserId Current user ID (to exclude)
   * @returns {Array} List of users
   */
  async getUserList(currentUserId) {
    try {
      const allUsers = await User.findAll();
      
      // Filter out current user
      return allUsers.filter(user => user.id !== currentUserId);
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Get user by ID
   * @param {number} userId User ID
   * @returns {Object} User
   */
  async getUser(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }
      
      return user;
    } catch (error) {
      throw error;
    }
  }
};

module.exports = userService;
