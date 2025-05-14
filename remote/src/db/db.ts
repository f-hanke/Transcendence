/**
 * Database connection and utilities
 */
'use strict';

import sqlite3 from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

// Ensure the database directory exists
const dbDirectory = path.dirname('./dist/db/matchmaking_service.db');
if (!fs.existsSync(dbDirectory)) {
  fs.mkdirSync(dbDirectory, { recursive: true });
}

// Create database connection
const db = sqlite3('./dist/db/matchmaking_service.db');

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Export the database connection
export { db };
