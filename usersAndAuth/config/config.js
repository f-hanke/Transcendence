/**
 * Application configuration
 */
'use strict';

module.exports = {
  PORT: process.env.PORT || 3000,
  HOST: process.env.HOST || 'localhost',
  SESSION_SECRET: process.env.SESSION_SECRET || 'my-secret-key-for-development-over-32-long',
  DATABASE_PATH: process.env.DATABASE_PATH || './db/user_service.db',
  SALT_ROUNDS: 10,  // for password hashing
  DEFAULT_AVATAR: './public/img/default-avatar.png',
  AVATARS_DIR: './public/img/avatars',
};
