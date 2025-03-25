import { FastifyRequest, FastifyReply } from 'fastify';
import UserModel from '../models/user';

// Declare the types for extended FastifyRequest
declare module 'fastify' {
  interface FastifyRequest {
    user?: any;
  }
}

// Middleware to verify JWT token and attach user to request
export const authenticate = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
  try {
    // Verify JWT token
    await request.jwtVerify();
    
    // Token is valid, extract user id
    const userId = (request.user as { id: number }).id;
    
    // Get user from database
    const user = await UserModel.findById(userId);
    
    // Check if user exists
    if (!user) {
      reply.code(401).send({ error: 'Unauthorized: User not found' });
      return;
    }
    
    // Attach user to request
    request.user = { id: userId, ...user };
  } catch (err) {
    reply.code(401).send({ error: 'Unauthorized: Invalid token' });
  }
};

// Middleware to verify user ownership of a resource
export const verifyOwnership = (resourceIdParam: string) => {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const params = request.params as Record<string, string>;
    const resourceId = parseInt(params[resourceIdParam], 10);
    const userId = (request.user as { id: number }).id;
    
    // If it's not the user's own resource
    if (resourceId !== userId) {
      reply.code(403).send({ error: 'Forbidden: You do not have permission to access this resource' });
      return;
    }
  };
};