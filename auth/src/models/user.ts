import { dbGet, dbAll, dbRun } from '../db/dbClient';

export interface User {
  id: number;
  email: string;
  display_name: string;
  image: string;
  login_count: number;
  online_status: number;
  created_at: string;
}

export interface UserWithStats extends User {
  wins: number;
  losses: number;
  friends_count: number;
}

export interface UserInput {
  email: string;
  password: string;
  display_name: string;
}

class UserModel {
  // Create a new user
  async create(userData: UserInput, pwHash: string): Promise<number> {
    const sql = `
      INSERT INTO users (email, pw_hash, display_name)
      VALUES (?, ?, ?)
    `;
    
    const result: any = await dbRun(sql, [userData.email, pwHash, userData.display_name]);
    return result.lastID;
  }

  // Find user by ID
  async findById(id: number): Promise<User | null> {
    const sql = 'SELECT id, email, display_name, image, login_count, online_status, created_at FROM users WHERE id = ?';
    const user = await dbGet(sql, [id]);
    return user || null;
  }

  // Find user by email
  async findByEmail(email: string): Promise<User & { pw_hash: string } | null> {
    const sql = 'SELECT id, email, pw_hash, display_name, image, login_count, online_status, created_at FROM users WHERE email = ?';
    const user = await dbGet(sql, [email]);
    return user || null;
  }

  // Find user by display name
  async findByDisplayName(displayName: string): Promise<User | null> {
    const sql = 'SELECT id, email, display_name, image, login_count, online_status, created_at FROM users WHERE display_name = ?';
    const user = await dbGet(sql, [displayName]);
    return user || null;
  }

  // Update user's login count
  async updateLoginCount(id: number): Promise<void> {
    const sql = 'UPDATE users SET login_count = login_count + 1 WHERE id = ?';
    await dbRun(sql, [id]);
  }

  // Update user's online status
  async updateOnlineStatus(id: number, status: number): Promise<void> {
    const sql = 'UPDATE users SET online_status = ? WHERE id = ?';
    await dbRun(sql, [status, id]);
  }

  // Update user's avatar image
  async updateAvatar(id: number, imagePath: string): Promise<void> {
    const sql = 'UPDATE users SET image = ? WHERE id = ?';
    await dbRun(sql, [imagePath, id]);
  }

  // Update user's display name
  async updateDisplayName(id: number, displayName: string): Promise<void> {
    const sql = 'UPDATE users SET display_name = ? WHERE id = ?';
    await dbRun(sql, [displayName, id]);
  }

  // Get user's match history
  async getMatchHistory(userId: number): Promise<any[]> {
    const sql = `
      SELECT 
        m.id, 
        m.user_id, 
        m.opponent, 
        u.display_name as opponent_name,
        m.user_score, 
        m.opponent_score, 
        m.date
      FROM matches m
      JOIN users u ON m.opponent = u.id
      WHERE m.user_id = ?
      ORDER BY m.date DESC
    `;
    
    return await dbAll(sql, [userId]);
  }

  // Get user statistics
  async getUserStats(userId: number): Promise<{ wins: number, losses: number }> {
    // Get wins (user_score > opponent_score)
    const winsSQL = `
      SELECT COUNT(*) as wins 
      FROM matches 
      WHERE user_id = ? AND user_score > opponent_score
    `;
    
    // Get losses (user_score < opponent_score)
    const lossesSQL = `
      SELECT COUNT(*) as losses 
      FROM matches 
      WHERE user_id = ? AND user_score < opponent_score
    `;
    
    const wins: any = await dbGet(winsSQL, [userId]);
    const losses: any = await dbGet(lossesSQL, [userId]);
    
    return {
      wins: wins ? wins.wins : 0,
      losses: losses ? losses.losses : 0
    };
  }

  // Get user with stats
  async getUserWithStats(userId: number): Promise<UserWithStats | null> {
    const user = await this.findById(userId);
    if (!user) return null;

    const stats = await this.getUserStats(userId);
    const friendsCount = await this.getFriendsCount(userId);

    return {
      ...user,
      wins: stats.wins,
      losses: stats.losses,
      friends_count: friendsCount
    };
  }

  // Get user's friends count
  async getFriendsCount(userId: number): Promise<number> {
    const sql = `
      SELECT COUNT(*) as count 
      FROM friendships 
      WHERE user1 = ? OR user2 = ?
    `;
    
    const result: any = await dbGet(sql, [userId, userId]);
    return result ? result.count : 0;
  }

  // Get user's friends
  async getFriends(userId: number): Promise<User[]> {
    const sql = `
      SELECT u.id, u.email, u.display_name, u.image, u.online_status, u.created_at, u.login_count
      FROM users u
      JOIN friendships f ON (u.id = f.user1 OR u.id = f.user2)
      WHERE (f.user1 = ? OR f.user2 = ?) AND u.id != ?
    `;
    
    return await dbAll(sql, [userId, userId, userId]);
  }

  // Get all users
  async getAllUsers(): Promise<User[]> {
    const sql = 'SELECT id, email, display_name, image, login_count, online_status, created_at FROM users';
    return await dbAll(sql);
  }

  // Check if users are friends
  async areFriends(user1Id: number, user2Id: number): Promise<boolean> {
    const sql = `
      SELECT COUNT(*) as count 
      FROM friendships 
      WHERE (user1 = ? AND user2 = ?) OR (user1 = ? AND user2 = ?)
    `;
    
    const result: any = await dbGet(sql, [user1Id, user2Id, user2Id, user1Id]);
    return result && result.count > 0;
  }

  // Add friend
  async addFriend(user1Id: number, user2Id: number): Promise<void> {
    // First check if they're already friends
    const areFriends = await this.areFriends(user1Id, user2Id);
    if (areFriends) return;

    const sql = 'INSERT INTO friendships (user1, user2) VALUES (?, ?)';
    await dbRun(sql, [user1Id, user2Id]);
  }

  // Remove friend
  async removeFriend(user1Id: number, user2Id: number): Promise<void> {
    const sql = `
      DELETE FROM friendships 
      WHERE (user1 = ? AND user2 = ?) OR (user1 = ? AND user2 = ?)
    `;
    
    await dbRun(sql, [user1Id, user2Id, user2Id, user1Id]);
  }

  // Check if a user is blocked
  async isBlocked(userId: number, blockedId: number): Promise<boolean> {
    const sql = 'SELECT COUNT(*) as count FROM blockings WHERE user_id = ? AND blocked_user_id = ?';
    const result: any = await dbGet(sql, [userId, blockedId]);
    return result && result.count > 0;
  }

  // Block a user
  async blockUser(userId: number, blockedId: number): Promise<void> {
    // First check if already blocked
    const isAlreadyBlocked = await this.isBlocked(userId, blockedId);
    if (isAlreadyBlocked) return;

    const sql = 'INSERT INTO blockings (user_id, blocked_user_id) VALUES (?, ?)';
    await dbRun(sql, [userId, blockedId]);

    // If they were friends, remove the friendship
    await this.removeFriend(userId, blockedId);
  }

  // Unblock a user
  async unblockUser(userId: number, blockedId: number): Promise<void> {
    const sql = 'DELETE FROM blockings WHERE user_id = ? AND blocked_user_id = ?';
    await dbRun(sql, [userId, blockedId]);
  }

  // Get blocked users
  async getBlockedUsers(userId: number): Promise<User[]> {
    const sql = `
      SELECT u.id, u.email, u.display_name, u.image, u.login_count, u.online_status, u.created_at
      FROM users u
      JOIN blockings b ON u.id = b.blocked_user_id
      WHERE b.user_id = ?
    `;
    
    return await dbAll(sql, [userId]);
  }

  // Create friend request
  async createFriendRequest(askerId: number, responderId: number): Promise<number> {
    // Check if already friends
    const areFriends = await this.areFriends(askerId, responderId);
    if (areFriends) {
      throw new Error('Users are already friends');
    }

    // Check if request already exists
    const requestExists = await this.getFriendRequest(askerId, responderId);
    if (requestExists) {
      throw new Error('Friend request already exists');
    }

    const sql = 'INSERT INTO friend_requests (asker, responder, status) VALUES (?, ?, 0)';
    const result: any = await dbRun(sql, [askerId, responderId]);
    return result.lastID;
  }

  // Get friend request
  async getFriendRequest(askerId: number, responderId: number): Promise<any | null> {
    const sql = 'SELECT * FROM friend_requests WHERE asker = ? AND responder = ?';
    return await dbGet(sql, [askerId, responderId]);
  }

  // Update friend request status
  async updateFriendRequestStatus(requestId: number, status: number): Promise<void> {
    const sql = 'UPDATE friend_requests SET status = ? WHERE id = ?';
    await dbRun(sql, [status, requestId]);
  }

  // Get pending friend requests for a user
  async getPendingFriendRequests(userId: number): Promise<any[]> {
    const sql = `
      SELECT fr.id, fr.asker, fr.responder, fr.status, fr.created_at, u.display_name as asker_name
      FROM friend_requests fr
      JOIN users u ON fr.asker = u.id
      WHERE fr.responder = ? AND fr.status = 0
    `;
    
    return await dbAll(sql, [userId]);
  }

  // Record a match
  async recordMatch(userId: number, opponentId: number, userScore: number, opponentScore: number): Promise<number> {
    const sql = `
      INSERT INTO matches (user_id, opponent, user_score, opponent_score)
      VALUES (?, ?, ?, ?)
    `;
    
    const result: any = await dbRun(sql, [userId, opponentId, userScore, opponentScore]);
    return result.lastID;
  }
}

export default new UserModel();
