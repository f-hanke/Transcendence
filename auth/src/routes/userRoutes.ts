import { FastifyInstance } from 'fastify';
import UserController from '../controllers/userController';
import { authenticate, verifyOwnership } from '../middleware/auth';
import { 
  validateRegistration, 
  validateLogin, 
  validateAvatarUpload,
  validateIdParam
} from '../middleware/validation';

export default async function userRoutes(fastify: FastifyInstance) {
  // Public routes
  
  // Register user
  fastify.post('/register', {
    preHandler: validateRegistration,
    handler: UserController.register
  });
  
  // Login user
  fastify.post('/login', {
    preHandler: validateLogin,
    handler: UserController.login
  });
  
  // Protected routes (require authentication)
  
  // Get current user profile
  fastify.get('/me', {
    preHandler: authenticate,
    handler: UserController.getCurrentUser
  });
  
  // Update user avatar
  fastify.post('/me/avatar', {
    preHandler: [authenticate, validateAvatarUpload],
    handler: UserController.updateAvatar
  });
  
  // Update display name
  fastify.put('/me/display-name', {
    preHandler: authenticate,
    handler: UserController.updateDisplayName
  });
  
  // Get match history
  fastify.get('/me/matches', {
    preHandler: authenticate,
    handler: UserController.getMatchHistory
  });
  
  // Get friends
  fastify.get('/me/friends', {
    preHandler: authenticate,
    handler: UserController.getFriends
  });
  
  // Send friend request
  fastify.post('/friend-requests', {
    preHandler: authenticate,
    handler: UserController.sendFriendRequest
  });
  
  // Respond to friend request
  fastify.put('/friend-requests/respond', {
    preHandler: authenticate,
    handler: UserController.respondToFriendRequest
  });
  
  // Get pending friend requests
  fastify.get('/friend-requests/pending', {
    preHandler: authenticate,
    handler: UserController.getPendingFriendRequests
  });
  
  // Remove friend
  fastify.delete('/friends', {
    preHandler: authenticate,
    handler: UserController.removeFriend
  });
  
  // Block user
  fastify.post('/blocks', {
    preHandler: authenticate,
    handler: UserController.blockUser
  });
  
  // Unblock user
  fastify.delete('/blocks', {
    preHandler: authenticate,
    handler: UserController.unblockUser
  });
  
  // Get blocked users
  fastify.get('/blocks', {
    preHandler: authenticate,
    handler: UserController.getBlockedUsers
  });
  
  // Logout
  fastify.post('/logout', {
    preHandler: authenticate,
    handler: UserController.logout
  });
  
  // Get user by ID (public profile)
  fastify.get('/users/:id', {
    preHandler: validateIdParam('id'),
    handler: UserController.getUserById
  });
  
  // Record a match
  fastify.post('/matches', {
    preHandler: authenticate,
    handler: UserController.recordMatch
  });
}
