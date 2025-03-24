import Fastify from 'fastify';
import fastifyJwt from '@fastify/jwt';
import fastifyMultipart from '@fastify/multipart';
import fastifyCors from '@fastify/cors';
import fastifyStatic from '@fastify/static';
import path from 'path';
import fs from 'fs';

import { config } from './config/config';
import { initializeDatabase, closeDatabase } from './db/dbClient';
import userRoutes from './routes/userRoutes';
import { createDefaultAvatar, ensureUploadDir } from './utils/fileUtils';

// Create Fastify instance
const fastify = Fastify({
  logger: {
    level: config.environment === 'development' ? 'info' : 'error',
    transport: config.environment === 'development'
      ? {
          target: 'pino-pretty',
          options: {
            translateTime: 'HH:MM:ss Z',
            ignore: 'pid,hostname',
          },
        }
      : undefined,
  },
});

// Register plugins
async function start() {
  try {
    // Register JWT plugin
    await fastify.register(fastifyJwt, {
      secret: config.jwt.secret,
      sign: {
        expiresIn: config.jwt.expiresIn
      }
    });
    
    // Register multipart plugin for file uploads
    await fastify.register(fastifyMultipart, {
      limits: {
        fileSize: config.upload.maxFileSize
      }
    });
    
    // Register CORS plugin
    await fastify.register(fastifyCors, {
      origin: true,
      credentials: true
    });
    
    // Serve static files
    await fastify.register(fastifyStatic, {
      root: path.join(process.cwd(), 'public'),
      prefix: '/public/'
    });
    
    // Register routes
    await fastify.register(userRoutes, { prefix: '/api/users' });
    
    // Root route - serve the SPA
    fastify.get('/', async (request, reply) => {
      return reply.sendFile('index.html');
    });
    
    // Initialize database
    await initializeDatabase();
    
    // Ensure upload directory exists
    ensureUploadDir();
    
    // Create default avatar if it doesn't exist
    await createDefaultAvatar();
    
    // Start the server
    await fastify.listen({ port: config.port, host: config.host });
    console.log(`Server is running on http://${config.host}:${config.port}`);
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
const closeGracefully = async (signal: string) => {
  console.log(`Received ${signal}, closing server...`);
  
  try {
    await fastify.close();
    await closeDatabase();
    console.log('Server closed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error during graceful shutdown:', error);
    process.exit(1);
  }
};

// Listen for termination signals
process.on('SIGTERM', () => closeGracefully('SIGTERM'));
process.on('SIGINT', () => closeGracefully('SIGINT'));

// Start the application
start();
