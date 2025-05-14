/**
 * Database connection and utilities
 */
'use strict';

import sqlite3 from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { config } from '../config/config.js';

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
export { db };
