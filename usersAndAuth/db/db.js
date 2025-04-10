/**
 * Database connection and utilities
 */
'use strict';

const sqlite3 = require('better-sqlite3').verbose();
const config = require('../config/config');
const fs = require('fs');
const path = require('path');

// Ensure the database directory exists
const dbDirectory = path.dirname(config.DATABASE_PATH);
if (!fs.existsSync(dbDirectory)) {
  fs.mkdirSync(dbDirectory, { recursive: true });
}

// Create database connection
const db = sqlite3(config.DATABASE_PATH);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Export the database connection
module.exports = db;
