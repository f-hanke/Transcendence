/**
 * Matches routes
 */
'use strict';

const Match = require('../models/match');
const User = require('../models/user');

/**
 * Matches routes plugin
 * @param {FastifyInstance} fastify Fastify instance
 * @param {Object} options Plugin options
 */
module.exports = async function(fastify, options) {
  /**
   * Record a match result
   */
  fastify.post('/record', { preHandler: fastify.authenticate }, async (request, reply) => {
    try {
      const { opponent_id, user_score, opponent_score, notes } = request.body;
      
      if (!opponent_id || user_score === undefined || opponent_score === undefined) {
        return reply.status(400).send({ error: 'Missing required fields' });
      }
      
      // Find opponent
      const opponent = await User.findById(parseInt(opponent_id));
      if (!opponent) {
        return reply.status(404).send({ error: 'Opponent not found' });
      }
      
      // Record match
      const match = await Match.create({
        user_id: request.session.user.id,
        opponent: parseInt(opponent_id),
        user_score: parseInt(user_score),
        opponent_score: parseInt(opponent_score),
        body: notes
      });
      
      // Redirect to match history
      return reply.redirect('/users/matches');
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: error.message });
    }
  });
  
  /**
   * View match details
   */
  fastify.get('/:id', { preHandler: fastify.authenticate }, async (request, reply) => {
    try {
      const matchId = parseInt(request.params.id);
      
      // Get match details
      const match = await Match.findById(matchId);
      if (!match) {
        return reply.view('errors/404', { title: 'Match Not Found' });
      }
      
      return reply.view('matches/details', { 
        title: 'Match Details',
        match
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.view('errors/500', { title: 'Error', error: error.message });
    }
  });
  
  /**
   * New match form
   */
  fastify.get('/new', { preHandler: fastify.authenticate }, async (request, reply) => {
    try {
      // Get list of all users except current user
      const users = await User.findAll();
      const opponents = users.filter(user => user.id !== request.session.user.id);
      
      return reply.view('matches/new', { 
        title: 'Record Match',
        opponents
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.view('errors/500', { title: 'Error', error: error.message });
    }
  });
};
