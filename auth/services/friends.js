/**
 * Friends service
 */
'use strict';

const Friendship = require('../models/friendship');
const Blocking = require('../models/blocking');

const friendsService = {
  /**
   * Get friends list for a user
   * @param {number} userId User ID
   * @returns {Array} List of friends
   */
  async getFriends(userId) {
    try {
      return Friendship.getFriends(userId);
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Send friend request
   * @param {number} askerId User sending the request
   * @param {number} responderId User receiving the request
   * @returns {Object} Created friend request
   */
  async sendFriendRequest(askerId, responderId) {
    try {
      // Check if users are already friends
      const areFriends = await Friendship.areFriends(askerId, responderId);
      if (areFriends) {
        throw new Error('Users are already friends');
      }
      
      // Check if user is blocked
      const isBlocked = await Blocking.isBlocked(responderId, askerId);
      if (isBlocked) {
        throw new Error('Cannot send friend request');
      }
      
      // Create friend request
      return Friendship.createRequest(askerId, responderId);
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Accept friend request
   * @param {number} requestId Friend request ID
   * @param {number} userId User accepting the request
   * @returns {boolean} True if request was accepted
   */
  async acceptFriendRequest(requestId, userId) {
    try {
      return Friendship.acceptRequest(requestId);
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Reject friend request
   * @param {number} requestId Friend request ID
   * @param {number} userId User rejecting the request
   * @returns {boolean} True if request was rejected
   */
  async rejectFriendRequest(requestId, userId) {
    try {
      return Friendship.rejectRequest(requestId);
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Get pending friend requests for a user
   * @param {number} userId User ID
   * @returns {Array} List of pending friend requests
   */
  async getPendingRequests(userId) {
    try {
      return Friendship.getPendingRequests(userId);
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Get sent friend requests by a user
   * @param {number} userId User ID
   * @returns {Array} List of sent friend requests
   */
  async getSentRequests(userId) {
    try {
      return Friendship.getSentRequests(userId);
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Remove friend
   * @param {number} userId User removing the friend
   * @param {number} friendId Friend to remove
   * @returns {boolean} True if friend was removed
   */
  async removeFriend(userId, friendId) {
    try {
      return Friendship.delete(userId, friendId);
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Block user
   * @param {number} userId User blocking
   * @param {number} blockUserId User to block
   * @returns {Object} Created blocking
   */
  async blockUser(userId, blockUserId) {
    try {
      // Remove friendship if it exists
      await Friendship.delete(userId, blockUserId);
      
      // Create blocking
      return Blocking.blockUser(userId, blockUserId);
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Unblock user
   * @param {number} userId User unblocking
   * @param {number} blockedUserId User to unblock
   * @returns {boolean} True if user was unblocked
   */
  async unblockUser(userId, blockedUserId) {
    try {
      return Blocking.unblockUser(userId, blockedUserId);
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Get blocked users
   * @param {number} userId User ID
   * @returns {Array} List of blocked users
   */
  async getBlockedUsers(userId) {
    try {
      return Blocking.getBlockedUsers(userId);
    } catch (error) {
      throw error;
    }
  }
};

module.exports = friendsService;
