import { FastifyRequest, FastifyReply } from 'fastify';
import { isValidImageType } from '../utils/fileUtils';

// Validate registration input
export const validateRegistration = async (request: FastifyRequest, reply: FastifyReply) => {
  const body = request.body as any;
  
  // Check if all required fields are present
  if (!body.email || !body.password || !body.display_name) {
    return reply.code(400).send({ error: 'Missing required fields' });
  }
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(body.email)) {
    return reply.code(400).send({ error: 'Invalid email format' });
  }
  
  // Validate password strength
  if (body.password.length < 8) {
    return reply.code(400).send({ error: 'Password must be at least 8 characters long' });
  }
  
  // Validate display name
  if (body.display_name.length < 3 || body.display_name.length > 20) {
    return reply.code(400).send({ error: 'Display name must be between 3 and 20 characters' });
  }
  
  // Validate that display name contains only allowed characters
  const displayNameRegex = /^[a-zA-Z0-9_-]+$/;
  if (!displayNameRegex.test(body.display_name)) {
    return reply.code(400).send({ error: 'Display name can only contain letters, numbers, underscores, and hyphens' });
  }
};

// Validate login input
export const validateLogin = async (request: FastifyRequest, reply: FastifyReply) => {
  const body = request.body as any;
  
  // Check if all required fields are present
  if (!body.email || !body.password) {
    return reply.code(400).send({ error: 'Missing email or password' });
  }
};

// Validate avatar upload
export const validateAvatarUpload = async (request: FastifyRequest, reply: FastifyReply) => {
  const file = await request.file();
  
  // Check if file is present
  if (!file) {
    return reply.code(400).send({ error: 'No file uploaded' });
  }
  
  // Check file type
  if (!isValidImageType(file.mimetype)) {
    return reply.code(400).send({ error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.' });
  }
  
  // Check file size
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.file.bytesRead > maxSize) {
    return reply.code(400).send({ error: 'File too large. Maximum size is 5MB.' });
  }
  
  // Attach file to request for later use
  request.uploadedFile = file;
};

// Validate ID param
export const validateIdParam = (paramName: string) => {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const params = request.params as Record<string, string>;
    const id = params[paramName];
    
    // Check if ID is present and is a number
    if (!id || isNaN(parseInt(id, 10))) {
      return reply.code(400).send({ error: `Invalid ${paramName} parameter` });
    }
  };
};

// Declare the types for extended FastifyRequest
declare module 'fastify' {
  interface FastifyRequest {
    uploadedFile?: any;
  }
}
