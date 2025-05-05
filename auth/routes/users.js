/**
 * User routes
 */
'use strict';

const userService = require('../services/user');
const validators = require('../utils/validators');

/**
 * User routes plugin
 * @param {FastifyInstance} fastify Fastify instance
 * @param {Object} options Plugin options
 */
module.exports = async function(fastify, options) {
  /**
   * Get user profile
   */
  fastify.get('/profile', { preHandler: fastify.authenticate }, async (request, reply) => {
    try {
      const user = await userService.getUserProfile(request.session.user.id);
      
      // Check for query parameters for success messages
      const passwordChanged = request.query.password_changed === 'true';
      const profileUpdated = request.query.profile_updated === 'true';
      
      return reply.view('users/profile', { 
        title: 'My Profile', 
        user,
        passwordChanged,
        profileUpdated
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.view('errors/500', { title: 'Error', error: error.message });
    }
  });
  
  /**
   * Edit profile page
   */
  fastify.get('/profile/edit', { preHandler: fastify.authenticate }, async (request, reply) => {
    try {
      const user = await userService.getUserProfile(request.session.user.id);
      
      return reply.view('users/edit-profile', { title: 'Edit Profile', user });
    } catch (error) {
      fastify.log.error(error);
      return reply.view('errors/500', { title: 'Error', error: error.message });
    }
  });
  
  /**
   * Update profile
   */
  fastify.post('/profile/edit', { preHandler: fastify.authenticate }, async (request, reply) => {
    try {
      const userData = validators.sanitizeObject(request.body);
      
      // Validate display name
      if (!userData.display_name || !validators.isValidDisplayName(userData.display_name)) {
        const user = await userService.getUserProfile(request.session.user.id);
        
        return reply.view('users/edit-profile', { 
          title: 'Edit Profile', 
          user,
          errors: { 
            display_name: 'Display name must be 3-20 characters and can contain only letters, numbers, spaces, hyphens, and underscores'
          }
        });
      }
      
      // Update profile
      const updatedUser = await userService.updateProfile(request.session.user.id, userData);
      
      // Update session user data
      request.session.user = {
        ...request.session.user,
        display_name: updatedUser.display_name,
        image: updatedUser.image
      };
      
      // Redirect to profile with success message
      return reply.redirect('/users/profile?profile_updated=true');
    } catch (error) {
      fastify.log.error(error);
      
      const user = await userService.getUserProfile(request.session.user.id);
      
      return reply.view('users/edit-profile', { 
        title: 'Edit Profile', 
        user,
        errors: { general: error.message }
      });
    }
  });
  
  /**
   * View user profile
   */
  fastify.get('/:id', { preHandler: fastify.authenticate }, async (request, reply) => {
    try {
      const userId = parseInt(request.params.id);
      
      // If viewing own profile, redirect to profile page
      if (userId === request.session.user.id) {
        return reply.redirect('/users/profile');
      }
      
      const user = await userService.getUserProfile(userId);
      
      return reply.view('users/view-profile', { title: user.display_name, user });
    } catch (error) {
      fastify.log.error(error);
      return reply.view('errors/404', { title: 'User Not Found' });
    }
  });
  
  /**
   * Get match history
   */
  fastify.get('/matches', { preHandler: fastify.authenticate }, async (request, reply) => {
    try {
      const page = parseInt(request.query.page) || 1;
      
      const matchHistory = await userService.getMatchHistory(
        request.session.user.id,
        page,
        10 // Matches per page
      );
      
      return reply.view('users/matches', { 
        title: 'Match History',
        matches: matchHistory.matches,
        pagination: matchHistory.pagination
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.view('errors/500', { title: 'Error', error: error.message });
    }
  });
  
  /**
   * View user match history
   */
  fastify.get('/:id/matches', { preHandler: fastify.authenticate }, async (request, reply) => {
    try {
      const userId = parseInt(request.params.id);
      const page = parseInt(request.query.page) || 1;
      
      // If viewing own matches, redirect to matches page
      if (userId === request.session.user.id) {
        return reply.redirect('/users/matches');
      }
      
      const user = await userService.getUser(userId);
      const matchHistory = await userService.getMatchHistory(userId, page, 10);
      
      return reply.view('users/user-matches', { 
        title: `${user.display_name}'s Matches`,
        user,
        matches: matchHistory.matches,
        pagination: matchHistory.pagination
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.view('errors/404', { title: 'User Not Found' });
    }
  });
  
  /**
   * Get all users
   */
  fastify.get('/', { preHandler: fastify.authenticate }, async (request, reply) => {
    try {
      const users = await userService.getUserList(request.session.user.id);
      
      return reply.view('users/list', { 
        title: 'Users',
        users
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.view('errors/500', { title: 'Error', error: error.message });
    }
  });
};
