import UserModel, { UserInput, User, UserWithStats } from '../models/user';
import { hashPassword, verifyPassword } from '../utils/passwordUtils';
import { saveFile, deleteFile } from '../utils/fileUtils';

class UserService {
  // Register a new user
  async registerUser(userData: UserInput): Promise<{ id: number; user: User }> {
    try {
      // Check if email already exists
      const existingEmail = await UserModel.findByEmail(userData.email);
      if (existingEmail) {
        throw new Error('Email already in use');
      }
      
      // Check if display name already exists
      const existingDisplayName = await UserModel.findByDisplayName(userData.display_name);
      if (existingDisplayName) {
        throw new Error('Display name already in use');
      }
      
      // Hash password
      const pwHash = await hashPassword(userData.password);
      
      // Create user
      const userId = await UserModel.create(userData, pwHash);
      
      // Get user data without password
      const user = await UserModel.findById(userId);
      
      if (!user) {
        throw new Error('Failed to create user');
      }
      
      return { id: userId, user };
    } catch (error) {
      console.error('Error registering user:', error);
      throw error;
    }
  }
  
  // Authenticate user
  async loginUser(email: string, password: string): Promise<{ user: User; token: string }> {
    try {
      // Find user by email
      const user = await UserModel.findByEmail(email);
      
      // If user not found
      if (!user) {
        throw new Error('Invalid email or password');
      }
      
      // Verify password
      const isPasswordValid = await verifyPassword(password, user.pw_hash);
      
      if (!isPasswordValid) {
        throw new Error('Invalid email or password');
      }
      
      // Update login count
      await UserModel.updateLoginCount(user.id);
      
      // Update online status
      await UserModel.updateOnlineStatus(user.id, 1);
      
      // Return user without password hash
      const { pw_hash, ...userWithoutPassword } = user;
      
      // Generate JWT token (will be handled by the controller)
      const token = 'JWT_TOKEN_PLACEHOLDER';
      
      return {
        user: userWithoutPassword,
        token
      };
    } catch (error) {
      console.error('Error logging in user:', error);
      throw error;
    }
  }
  
  // Update user avatar
  async updateAvatar(userId: number, fileBuffer: Buffer, filename: string): Promise<string> {
    try {
      // Get current user to find old avatar
      const user = await UserModel.findById(userId);
      
      if (!user) {
        throw new Error('User not found');
      }
      
      // Save new avatar
      const savedFilename = await saveFile(fileBuffer, filename);
      
      // Delete old avatar if it's not the default
      if (user.image !== 'default.png') {
        await deleteFile(user.image);
      }
      
      // Update user record
      await UserModel.updateAvatar(userId, savedFilename);
      
      return savedFilename;
    } catch (error) {
      console.error('Error updating avatar:', error);
      throw error;
    }
  }
  
  // Update display name
  async updateDisplayName(userId: number, displayName: string): Promise<User> {
    try {
      // Check if display name already exists
      const existingUser = await UserModel.findByDisplayName(displayName);
      
      if (existingUser && existingUser.id !== userId) {
        throw new Error('Display name already in use');
      }
      
      // Update display name
      await UserModel.updateDisplayName(userId, displayName);
      
      // Get updated user
      const updatedUser = await UserModel.findById(userId);
      
      if (!updatedUser) {
        throw new Error('User not found');
      }
      
      return updatedUser;
    } catch (error) {
      console.error('Error updating display name:', error);
      throw error;
    }
  }
  
  // Get user profile with stats
  async getUserProfile(userId: number): Promise<UserWithStats> {
    try {
      const userWithStats = await UserModel.getUserWithStats(userId);
      
      if (!userWithStats) {
        throw new Error('User not found');
      }
      
      return userWithStats;
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw error;
    }
  }
  
  // Get user match history
  async getUserMatchHistory(userId: number): Promise<any[]> {
    try {
      return await UserModel.getMatchHistory(userId);
    } catch (error) {
      console.error('Error getting match history:', error);
      throw error;
    }
  }
  
  // Get user friends
  async getUserFriends(userId: number): Promise<User[]> {
    try {
      return await UserModel.getFriends(userId);
    } catch (error) {
      console.error('Error getting user friends:', error);
      throw error;
    }
  }
  
  // Send friend request
  async sendFriendRequest(askerId: number, responderId: number): Promise<number> {
    try {
      // Check if users are the same
      if (askerId === responderId) {
        throw new Error('Cannot send friend request to yourself');
      }
      
      // Check if responder exists
      const responder = await UserModel.findById(responderId);
      
      if (!responder) {
        throw new Error('User not found');
      }
      
      // Check if blocked
      const isBlocked = await UserModel.isBlocked(responderId, askerId);
      
      if (isBlocked) {
        throw new Error('Cannot send friend request');
      }
      
      // Create friend request
      return await UserModel.createFriendRequest(askerId, responderId);
    } catch (error) {
      console.error('Error sending friend request:', error);
      throw error;
    }
  }
  
  // Respond to friend request
  async respondToFriendRequest(requestId: number, userId: number, accept: boolean): Promise<void> {
    try {
      // Find the request
      const request: any = await UserModel.dbGet(
        'SELECT * FROM friend_requests WHERE id = ? AND responder = ?',
        [requestId, userId]
      );
      
      if (!request) {
        throw new Error('Friend request not found');
      }
      
      if (accept) {
        // Accept the request
        await UserModel.updateFriendRequestStatus(requestId, 1);
        
        // Add as friends
        await UserModel.addFriend(request.asker, request.responder);
      } else {
        // Reject the request
        await UserModel.updateFriendRequestStatus(requestId, 2);
      }
    } catch (error) {
      console.error('Error responding to friend request:', error);
      throw error;
    }
  }
  
  // Get pending friend requests
  async getPendingFriendRequests(userId: number): Promise<any[]> {
    try {
      return await UserModel.getPendingFriendRequests(userId);
    } catch (error) {
      console.error('Error getting pending friend requests:', error);
      throw error;
    }
  }
  
  // Remove friend
  async removeFriend(userId: number, friendId: number): Promise<void> {
    try {
      await UserModel.removeFriend(userId, friendId);
    } catch (error) {
      console.error('Error removing friend:', error);
      throw error;
    }
  }
  
  // Block user
  async blockUser(userId: number, blockedId: number): Promise<void> {
    try {
      // Check if users are the same
      if (userId === blockedId) {
        throw new Error('Cannot block yourself');
      }
      
      // Check if user to block exists
      const userToBlock = await UserModel.findById(blockedId);
      
      if (!userToBlock) {
        throw new Error('User not found');
      }
      
      await UserModel.blockUser(userId, blockedId);
    } catch (error) {
      console.error('Error blocking user:', error);
      throw error;
    }
  }
  
  // Unblock user
  async unblockUser(userId: number, blockedId: number): Promise<void> {
    try {
      await UserModel.unblockUser(userId, blockedId);
    } catch (error) {
      console.error('Error unblocking user:', error);
      throw error;
    }
  }
  
  // Get blocked users
  async getBlockedUsers(userId: number): Promise<User[]> {
    try {
      return await UserModel.getBlockedUsers(userId);
    } catch (error) {
      console.error('Error getting blocked users:', error);
      throw error;
    }
  }
  
  // Set user offline
  async setUserOffline(userId: number): Promise<void> {
    try {
      await UserModel.updateOnlineStatus(userId, 0);
    } catch (error) {
      console.error('Error setting user offline:', error);
      throw error;
    }
  }
  
  // Record a match
  async recordMatch(userId: number, opponentId: number, userScore: number, opponentScore: number): Promise<number> {
    try {
      return await UserModel.recordMatch(userId, opponentId, userScore, opponentScore);
    } catch (error) {
      console.error('Error recording match:', error);
      throw error;
    }
  }
}

export default new UserService();
