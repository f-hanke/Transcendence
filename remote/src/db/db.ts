/**
 * Database connection and utilities
 */
'use strict';

import sqlite3 from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

// Ensure the database directory exists
const dbParentDir = path.dirname('./db_file');
if (!fs.existsSync(dbParentDir)) {
  console.error("Didn't find parent dir for matchmaking_service.db, creating one recursively");
  fs.mkdirSync(dbParentDir, { recursive: true });
}

// Create database connection
const db = sqlite3('./db_file/matchmaking_service.db');

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Export the database connection
export { db };
