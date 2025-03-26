/**
 * Main application setup
 */
'use strict';

const path = require('path');
const fastify = require('fastify')({ logger: true });
const config = require('./config/config');

// Register plugins
fastify.register(require('@fastify/formbody'));
fastify.register(require('@fastify/static'), {
  root: path.join(__dirname, 'public'),
  prefix: '/public/',
});

// Register view engine
fastify.register(require('@fastify/view'), {
  engine: {
    handlebars: require('handlebars'),
  },
  root: path.join(__dirname, 'views'),
  layout: 'layouts/main',
});

// Register session support
fastify.register(require('@fastify/cookie'));
fastify.register(require('@fastify/session'), {
  secret: config.SESSION_SECRET,
  cookie: { secure: false },
  saveUninitialized: false,
});

// Register routes
fastify.register(require('./routes/auth'), { prefix: '/auth' });
fastify.register(require('./routes/users'), { prefix: '/users' });
fastify.register(require('./routes/friends'), { prefix: '/friends' });
fastify.register(require('./routes/matches'), { prefix: '/matches' });

// Home route
fastify.get('/', async (request, reply) => {
  return reply.view('index', { title: 'User Management Service' });
});

// Handle 404
fastify.setNotFoundHandler((request, reply) => {
  reply.code(404).view('errors/404', { title: 'Not Found' });
});

module.exports = fastify;
