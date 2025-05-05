/**
 * Main server entry point for the User Management Service
 */
'use strict';

const app = require('./app');
const config = require('./config/config');

// Start listening
const start = async () => {
  try {
    await app.listen({ port: config.PORT, host: config.HOST });
    console.log(`Server is running on http://${config.HOST}:${config.PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
