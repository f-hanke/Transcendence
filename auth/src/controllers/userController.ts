import { FastifyRequest, FastifyReply } from 'fastify';
import UserService from '../services/userService';
import { UserInput } from '../models/user';

class UserController {
  // Register user
  async register(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userData = request.body as UserInput;
      const result = await UserService.registerUser(userData);
      
      // Generate token
      const token = await reply.jwtSign({ id: result.id });
      
      return reply.code(201).send({
        success: true,
        message: 'User registered successfully',
        user: result.user,
        token
      });
    } catch (error: any) {
      return reply.code(400).send({
        success: false,
        error: error.message || 'Error registering user'
      });
    }
  }
  
  // Login user
  async login(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { email, password } = request.body as { email: string; password: string };
      
      // Authenticate user
      const result = await UserService.loginUser(email, password);
      
      // Generate token
      const token = await reply.jwtSign({ id: result.user.id });
      
      return reply.code(200).send({
        success: true,
        message: 'User logged in successfully',
        user: result.user,
        token
      });
    } catch (error: any) {
      return reply.code(401).send({
        success: false,
        error: error.message || 'Error logging in'
      });
    }
  }
  
  // Get current user profile
  async getCurrentUser(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = (request.user as { id: number }).id;
      const user = await UserService.getUserProfile(userId);
      
      return reply.code(200).send({
        success: true,
        user
      });
    } catch (error: any) {
      return reply.code(500).send({
        success: false,
        error: error.message || 'Error getting user profile'
      });
    }
  }
  
  // Update user avatar
  async updateAvatar(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = (request.user as { id: number }).id;
      const file = request.uploadedFile;
      
      // Read file buffer
      const chunks = [];
      for await (const chunk of file.file) {
        chunks.push(chunk);
      }
      const buffer = Buffer.concat(chunks);
      
      // Update avatar
      const filename = await UserService.updateAvatar(userId, buffer, file.filename);
      
      return reply.code(200).send({
        success: true,
        message: 'Avatar updated successfully',
        filename
      });
    } catch (error: any) {
      return reply.code(500).send({
        success: false,
        error: error.message || 'Error updating avatar'
      });
    }
  }
  
  // Update display name
  async updateDisplayName(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = (request.user as { id: number }).id;
      const { display_name } = request.body as { display_name: string };
      
      const user = await UserService.updateDisplayName(userId, display_name);
      
      return reply.code(200).send({
        success: true,
        message: 'Display name updated successfully',
        user
      });
    } catch (error: any) {
      return reply.code(400).send({
        success: false,
        error: error.message || 'Error updating display name'
      });
    }
  }
  
  // Get user match history
  async getMatchHistory(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = (request.user as { id: number }).id;
      const matches = await UserService.getUserMatchHistory(userId);
      
      return reply.code(200).send({
        success: true,
        matches
      });
    } catch (error: any) {
      return reply.code(500).send({
        success: false,
        error: error.message || 'Error getting match history'
      });
    }
  }
  
  // Get user friends
  async getFriends(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = (request.user as { id: number }).id;
      const friends = await UserService.getUserFriends(userId);
      
      return reply.code(200).send({
        success: true,
        friends
      });
    } catch (error: any) {
      return reply.code(500).send({
        success: false,
        error: error.message || 'Error getting friends'
      });
    }
  }
  
  // Send friend request
  async sendFriendRequest(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = (request.user as { id: number }).id;
      const { recipient_id } = request.body as { recipient_id: number };
      
      const requestId = await UserService.sendFriendRequest(userId, recipient_id);
      
      return reply.code(200).send({
        success: true,
        message: 'Friend request sent successfully',
        request_id: requestId
      });
    } catch (error: any) {
      return reply.code(400).send({
        success: false,
        error: error.message || 'Error sending friend request'
      });
    }
  }
  
  // Respond to friend request
  async respondToFriendRequest(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = (request.user as { id: number }).id;
      const { request_id, accept } = request.body as { request_id: number; accept: boolean };
      
      await UserService.respondToFriendRequest(request_id, userId, accept);
      
      return reply.code(200).send({
        success: true,
        message: accept ? 'Friend request accepted' : 'Friend request rejected'
      });
    } catch (error: any) {
      return reply.code(400).send({
        success: false,
        error: error.message || 'Error responding to friend request'
      });
    }
  }
  
  // Get pending friend requests
  async getPendingFriendRequests(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = (request.user as { id: number }).id;
      const requests = await UserService.getPendingFriendRequests(userId);
      
      return reply.code(200).send({
        success: true,
        requests
      });
    } catch (error: any) {
      return reply.code(500).send({
        success: false,
        error: error.message || 'Error getting friend requests'
      });
    }
  }
  
  // Remove friend
  async removeFriend(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = (request.user as { id: number }).id;
      const { friend_id } = request.body as { friend_id: number };
      
      await UserService.removeFriend(userId, friend_id);
      
      return reply.code(200).send({
        success: true,
        message: 'Friend removed successfully'
      });
    } catch (error: any) {
      return reply.code(400).send({
        success: false,
        error: error.message || 'Error removing friend'
      });
    }
  }
  
  // Block user
  async blockUser(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = (request.user as { id: number }).id;
      const { blocked_id } = request.body as { blocked_id: number };
      
      await UserService.blockUser(userId, blocked_id);
      
      return reply.code(200).send({
        success: true,
        message: 'User blocked successfully'
      });
    } catch (error: any) {
      return reply.code(400).send({
        success: false,
        error: error.message || 'Error blocking user'
      });
    }
  }
  
  // Unblock user
  async unblockUser(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = (request.user as { id: number }).id;
      const { blocked_id } = request.body as { blocked_id: number };
      
      await UserService.unblockUser(userId, blocked_id);
      
      return reply.code(200).send({
        success: true,
        message: 'User unblocked successfully'
      });
    } catch (error: any) {
      return reply.code(400).send({
        success: false,
        error: error.message || 'Error unblocking user'
      });
    }
  }
  
  // Get blocked users
  async getBlockedUsers(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = (request.user as { id: number }).id;
      const blockedUsers = await UserService.getBlockedUsers(userId);
      
      return reply.code(200).send({
        success: true,
        blocked_users: blockedUsers
      });
    } catch (error: any) {
      return reply.code(500).send({
        success: false,
        error: error.message || 'Error getting blocked users'
      });
    }
  }
  
  // Logout
  async logout(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = (request.user as { id: number }).id;
      
      // Set user offline
      await UserService.setUserOffline(userId);
      
      return reply.code(200).send({
        success: true,
        message: 'User logged out successfully'
      });
    } catch (error: any) {
      return reply.code(500).send({
        success: false,
        error: error.message || 'Error logging out'
      });
    }
  }
  
  // Get user by ID (for public profiles)
  async getUserById(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const userId = parseInt(id, 10);
      
      const user = await UserService.getUserProfile(userId);
      
      return reply.code(200).send({
        success: true,
        user
      });
    } catch (error: any) {
      return reply.code(404).send({
        success: false,
        error: error.message || 'User not found'
      });
    }
  }
  
  // Record a match
  async recordMatch(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = (request.user as { id: number }).id;
      const { opponent_id, user_score, opponent_score } = request.body as {
        opponent_id: number;
        user_score: number;
        opponent_score: number;
      };
      
      const matchId = await UserService.recordMatch(userId, opponent_id, user_score, opponent_score);
      
      return reply.code(201).send({
        success: true,
        message: 'Match recorded successfully',
        match_id: matchId
      });
    } catch (error: any) {
      return reply.code(400).send({
        success: false,
        error: error.message || 'Error recording match'
      });
    }
  }
}

export default new UserController();
