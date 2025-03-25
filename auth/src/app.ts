import Fastify from 'fastify';
import path from 'path';
import fastifyJwt from '@fastify/jwt';
import fastifyMultipart from '@fastify/multipart';
import fastifyCors from '@fastify/cors';
import fastifyStatic from '@fastify/static';

import { config } from './config/config';
import { initializeDatabase, closeDatabase } from './db/dbClient';
import userRoutes from './routes/userRoutes';
import { createDefaultAvatar, ensureUploadDir } from './utils/fileUtils';

// Create Fastify instance
const server = Fastify({
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

// Register plugins and start server
const start = async () => {
  try {
    // Register JWT plugin
    await server.register(fastifyJwt, {
      secret: config.jwt.secret,
      sign: {
        expiresIn: config.jwt.expiresIn
      }
    });
    
    // Register multipart plugin for file uploads
    await server.register(fastifyMultipart, {
      limits: {
        fileSize: config.upload.maxFileSize
      }
    });
    
    // Register CORS plugin
    await server.register(fastifyCors, {
      origin: true,
      credentials: true
    });
    
    // Serve static files
    await server.register(fastifyStatic, {
      root: path.join(process.cwd(), 'public'),
      prefix: '/public/'
    });
    
    // Register routes
    await server.register(userRoutes, { prefix: '/api/users' });
    
    // Root route - serve the SPA
    server.get('/', async (request, reply) => {
      return reply.sendFile('index.html');
    });
    
    // Initialize database
    await initializeDatabase();
    
    // Ensure upload directory exists
    ensureUploadDir();
    
    // Create default avatar if it doesn't exist
    await createDefaultAvatar();
    
    // Start the server
    await server.listen({ port: config.port, host: config.host });
    console.log(`Server is running on http://${config.host}:${config.port}`);
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
const closeGracefully = async (signal: string) => {
  console.log(`Received ${signal}, closing server...`);
  
  try {
    await server.close();
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