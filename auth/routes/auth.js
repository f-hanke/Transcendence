/**
 * Authentication routes
 */
'use strict';

const authService = require('../services/auth');
const validators = require('../utils/validators');
const passwordUtils = require('../utils/password');

/**
 * Authentication routes plugin
 * @param {FastifyInstance} fastify Fastify instance
 * @param {Object} options Plugin options
 */
module.exports = async function(fastify, options) {
  /**
   * Register page
   */
  fastify.get('/register', async (request, reply) => {
    // If user is already logged in, redirect to home
    if (request.session.user) {
      return reply.redirect('/');
    }
    
    return reply.view('auth/register', { title: 'Register' });
  });
  
  /**
   * Register user
   */
  fastify.post('/register', async (request, reply) => {
    try {
      // Validate input
      const userData = validators.sanitizeObject(request.body);
      const validation = validators.validateUserRegistration(userData);
      
      if (!validation.isValid) {
        return reply.view('auth/register', { 
          title: 'Register',
          errors: validation.errors,
          input: userData
        });
      }
      
      // Validate password strength
      const passwordValidation = passwordUtils.validatePassword(userData.password);
      if (!passwordValidation.isValid) {
        // Get all error messages
        const passwordErrors = Object.values(passwordValidation.messages)
          .filter(message => message !== null);
        
        return reply.view('auth/register', { 
          title: 'Register',
          errors: { password: passwordErrors.join(' ') },
          input: userData
        });
      }
      
      // Register user
      await authService.register(userData);
      
      // Redirect to login with success message
      return reply.redirect('/auth/login?registered=true');
    } catch (error) {
      const errorMessage = error.message || 'An error occurred during registration';
      
      return reply.view('auth/register', { 
        title: 'Register',
        errors: { general: errorMessage },
        input: validators.sanitizeObject(request.body)
      });
    }
  });
  
  /**
   * Login page
   */
  fastify.get('/login', async (request, reply) => {
    // If user is already logged in, redirect to home
    if (request.session.user) {
      return reply.redirect('/');
    }
    
    // Check for registration success message
    const registered = request.query.registered === 'true';
    
    return reply.view('auth/login', { 
      title: 'Login',
      registered,
    });
  });
  
  /**
   * Login user
   */
  fastify.post('/login', async (request, reply) => {
    try {
      const { email, password } = validators.sanitizeObject(request.body);
      
      // Validate input
      if (!email || !password) {
        return reply.view('auth/login', { 
          title: 'Login',
          errors: { general: 'Email and password are required' },
          input: { email }
        });
      }
      
      // Authenticate user
      const user = await authService.login(email, password);
      
      // Set session
      request.session.user = user;
      
      // Redirect to home
      return reply.redirect('/');
    } catch (error) {
      const errorMessage = error.message || 'An error occurred during login';
      
      return reply.view('auth/login', { 
        title: 'Login',
        errors: { general: errorMessage },
        input: { email: request.body.email }
      });
    }
  });
  
  /**
   * Logout user
   */
  fastify.get('/logout', async (request, reply) => {
    try {
      // Check if user is logged in
      if (request.session.user) {
        // Update user status to offline
        await authService.logout(request.session.user.id);
        
        // Destroy session
        request.session.destroy();
      }
      
      // Redirect to login
      return reply.redirect('/auth/login');
    } catch (error) {
      fastify.log.error(error);
      return reply.redirect('/');
    }
  });
  
  /**
   * Change password page
   */
  fastify.get('/change-password', async (request, reply) => {
    // Check if user is logged in
    if (!request.session.user) {
      return reply.redirect('/auth/login');
    }
    
    return reply.view('auth/change-password', { title: 'Change Password' });
  });
  
  /**
   * Change password
   */
  fastify.post('/change-password', async (request, reply) => {
    // Check if user is logged in
    if (!request.session.user) {
      return reply.redirect('/auth/login');
    }
    
    try {
      const { current_password, new_password, confirm_password } = validators.sanitizeObject(request.body);
      
      // Validate input
      if (!current_password || !new_password || !confirm_password) {
        return reply.view('auth/change-password', { 
          title: 'Change Password',
          errors: { general: 'All fields are required' }
        });
      }
      
      // Check if new passwords match
      if (new_password !== confirm_password) {
        return reply.view('auth/change-password', { 
          title: 'Change Password',
          errors: { confirm_password: 'Passwords do not match' }
        });
      }
      
      // Validate password strength
      const passwordValidation = passwordUtils.validatePassword(new_password);
      if (!passwordValidation.isValid) {
        // Get all error messages
        const passwordErrors = Object.values(passwordValidation.messages)
          .filter(message => message !== null);
        
        return reply.view('auth/change-password', { 
          title: 'Change Password',
          errors: { new_password: passwordErrors.join(' ') }
        });
      }
      
      // Change password
      await authService.changePassword(request.session.user.id, current_password, new_password);
      
      // Redirect to profile with success message
      return reply.redirect('/users/profile?password_changed=true');
    } catch (error) {
      const errorMessage = error.message || 'An error occurred while changing password';
      
      return reply.view('auth/change-password', { 
        title: 'Change Password',
        errors: { general: errorMessage }
      });
    }
  });
  
  /**
   * Authentication middleware
   */
  fastify.decorate('authenticate', async (request, reply) => {
    if (!request.session.user) {
      return reply.redirect('/auth/login');
    }
  });
};
