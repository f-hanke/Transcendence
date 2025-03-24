import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config();

interface AppConfig {
  port: number;
  host: string;
  environment: string;
  dbPath: string;
  jwt: {
    secret: string;
    expiresIn: string;
  };
  upload: {
    dir: string;
    maxFileSize: number;
  };
}

// Export configuration object
export const config: AppConfig = {
  port: parseInt(process.env.PORT || '3001', 10),
  host: process.env.HOST || '0.0.0.0',
  environment: process.env.NODE_ENV || 'development',
  dbPath: process.env.DB_PATH || path.join(process.cwd(), 'data', 'user-service.db'),
  jwt: {
    secret: process.env.JWT_SECRET || 'default_insecure_jwt_secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  },
  upload: {
    dir: process.env.UPLOAD_DIR || path.join(process.cwd(), 'public', 'uploads'),
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10), // 5MB default
  },
};

// Validate critical configuration
if (config.jwt.secret === 'default_insecure_jwt_secret' && process.env.NODE_ENV === 'production') {
  console.warn('WARNING: Using default insecure JWT secret in production environment!');
}

export default config;
