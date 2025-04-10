/**
 * Friends routes
 */
'use strict';

const friendsService = require('../services/friends');
const userService = require('../services/user');

/**
 * Friends routes plugin
 * @param {FastifyInstance} fastify Fastify instance
 * @param {Object} options Plugin options
 */
module.exports = async function(fastify, options) {
  /**
   * Get friends list
   */
  fastify.get('/', { preHandler: fastify.authenticate }, async (request, reply) => {
    try {
      const friends = await friendsService.getFriends(request.session.user.id);
      
      return reply.view('friends/list', { 
        title: 'My Friends',
        friends
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.view('errors/500', { title: 'Error', error: error.message });
    }
  });
  
  /**
   * Send friend request
   */
  fastify.post('/request', { preHandler: fastify.authenticate }, async (request, reply) => {
    try {
      const { user_id } = request.body;
      
      if (!user_id) {
        return reply.status(400).send({ error: 'User ID is required' });
      }
      
      await friendsService.sendFriendRequest(request.session.user.id, parseInt(user_id));
      
      return reply.redirect('/friends/requests');
    } catch (error) {
      fastify.log.error(error);
      return reply.status(400).send({ error: error.message });
    }
  });
  
  /**
   * View friend requests
   */
  fastify.get('/requests', { preHandler: fastify.authenticate }, async (request, reply) => {
    try {
      const pendingRequests = await friendsService.getPendingRequests(request.session.user.id);
      const sentRequests = await friendsService.getSentRequests(request.session.user.id);
      
      return reply.view('friends/requests', { 
        title: 'Friend Requests',
        pendingRequests,
        sentRequests
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.view('errors/500', { title: 'Error', error: error.message });
    }
  });
  
  /**
   * Accept friend request
   */
  fastify.post('/accept', { preHandler: fastify.authenticate }, async (request, reply) => {
    try {
      const { request_id } = request.body;
      
      if (!request_id) {
        return reply.status(400).send({ error: 'Request ID is required' });
      }
      
      await friendsService.acceptFriendRequest(parseInt(request_id), request.session.user.id);
      
      return reply.redirect('/friends');
    } catch (error) {
      fastify.log.error(error);
      return reply.status(400).send({ error: error.message });
    }
  });
  
  /**
   * Reject friend request
   */
  fastify.post('/reject', { preHandler: fastify.authenticate }, async (request, reply) => {
    try {
      const { request_id } = request.body;
      
      if (!request_id) {
        return reply.status(400).send({ error: 'Request ID is required' });
      }
      
      await friendsService.rejectFriendRequest(parseInt(request_id), request.session.user.id);
      
      return reply.redirect('/friends/requests');
    } catch (error) {
      fastify.log.error(error);
      return reply.status(400).send({ error: error.message });
    }
  });
  
  /**
   * Remove friend
   */
  fastify.post('/remove', { preHandler: fastify.authenticate }, async (request, reply) => {
    try {
      const { friend_id } = request.body;
      
      if (!friend_id) {
        return reply.status(400).send({ error: 'Friend ID is required' });
      }
      
      await friendsService.removeFriend(request.session.user.id, parseInt(friend_id));
      
      return reply.redirect('/friends');
    } catch (error) {
      fastify.log.error(error);
      return reply.status(400).send({ error: error.message });
    }
  });
  
  /**
   * View blocked users
   */
  fastify.get('/blocked', { preHandler: fastify.authenticate }, async (request, reply) => {
    try {
      const blockedUsers = await friendsService.getBlockedUsers(request.session.user.id);
      
      return reply.view('friends/blocked', { 
        title: 'Blocked Users',
        blockedUsers
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.view('errors/500', { title: 'Error', error: error.message });
    }
  });
  
  /**
   * Block user
   */
  fastify.post('/block', { preHandler: fastify.authenticate }, async (request, reply) => {
    try {
      const { user_id } = request.body;
      
      if (!user_id) {
        return reply.status(400).send({ error: 'User ID is required' });
      }
      
      await friendsService.blockUser(request.session.user.id, parseInt(user_id));
      
      // Redirect based on referer
      const referer = request.headers.referer;
      if (referer && referer.includes('/friends')) {
        return reply.redirect('/friends');
      } else {
        return reply.redirect('/friends/blocked');
      }
    } catch (error) {
      fastify.log.error(error);
      return reply.status(400).send({ error: error.message });
    }
  });
  
  /**
   * Unblock user
   */
  fastify.post('/unblock', { preHandler: fastify.authenticate }, async (request, reply) => {
    try {
      const { user_id } = request.body;
      
      if (!user_id) {
        return reply.status(400).send({ error: 'User ID is required' });
      }
      
      await friendsService.unblockUser(request.session.user.id, parseInt(user_id));
      
      return reply.redirect('/friends/blocked');
    } catch (error) {
      fastify.log.error(error);
      return reply.status(400).send({ error: error.message });
    }
  });
};
