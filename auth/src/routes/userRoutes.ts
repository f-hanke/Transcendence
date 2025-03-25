import { FastifyInstance } from 'fastify';
import UserController from '../controllers/userController';
import { authenticate, verifyOwnership } from '../middleware/auth';
import { 
  validateRegistration, 
  validateLogin, 
  validateAvatarUpload,
  validateIdParam
} from '../middleware/validation';

export default async function userRoutes(fastify: FastifyInstance): Promise<void> {
  // Public routes
  
  // Register user
  fastify.post('/register', { preHandler: validateRegistration }, UserController.register);
  
  // Login user
  fastify.post('/login', { preHandler: validateLogin }, UserController.login);
  
  // Protected routes (require authentication)
  
  // Get current user profile
  fastify.get('/me', { preHandler: authenticate }, UserController.getCurrentUser);
  
  // Update user avatar
  fastify.post('/me/avatar', { preHandler: [authenticate, validateAvatarUpload] }, UserController.updateAvatar);
  
  // Update display name
  fastify.put('/me/display-name', { preHandler: authenticate }, UserController.updateDisplayName);
  
  // Get match history
  fastify.get('/me/matches', { preHandler: authenticate }, UserController.getMatchHistory);
  
  // Get friends
  fastify.get('/me/friends', { preHandler: authenticate }, UserController.getFriends);
  
  // Send friend request
  fastify.post('/friend-requests', { preHandler: authenticate }, UserController.sendFriendRequest);
  
  // Respond to friend request
  fastify.put('/friend-requests/respond', { preHandler: authenticate }, UserController.respondToFriendRequest);
  
  // Get pending friend requests
  fastify.get('/friend-requests/pending', { preHandler: authenticate }, UserController.getPendingFriendRequests);
  
  // Remove friend
  fastify.delete('/friends', { preHandler: authenticate }, UserController.removeFriend);
  
  // Block user
  fastify.post('/blocks', { preHandler: authenticate }, UserController.blockUser);
  
  // Unblock user
  fastify.delete('/blocks', { preHandler: authenticate }, UserController.unblockUser);
  
  // Get blocked users
  fastify.get('/blocks', { preHandler: authenticate }, UserController.getBlockedUsers);
  
  // Logout
  fastify.post('/logout', { preHandler: authenticate }, UserController.logout);
  
  // Get user by ID (public profile)
  fastify.get('/users/:id', { preHandler: validateIdParam('id') }, UserController.getUserById);
  
  // Record a match
  fastify.post('/matches', { preHandler: authenticate }, UserController.recordMatch);
}