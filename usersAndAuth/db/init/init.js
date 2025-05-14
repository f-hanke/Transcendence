/**
 * Initial database migration script
 */
'use strict';

import { db } from '../db.js';

// Run migrations
(function runMigrations() {
  try {
    console.log('Running database migrations...');

    // Create users table
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        pw_hash TEXT NOT NULL,
        login_count INTEGER DEFAULT 0,
        display_name TEXT UNIQUE NOT NULL,
        image BLOB DEFAULT NULL,
        small_image BLOB DEFAULT NULL,
        online_status INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create match records table
    db.exec(`
      CREATE TABLE IF NOT EXISTS matches (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        p1_id INTEGER NOT NULL,
        p2_id INTEGER NOT NULL,
        p1_score INTEGER NOT NULL,
        p2_score INTEGER NOT NULL,
        date TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create tournament records table
    db.exec(`
      CREATE TABLE IF NOT EXISTS tournaments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ranking1_id INTEGER NOT NULL,
        ranking2_id INTEGER,
        ranking3_id INTEGER,
        ranking4_id INTEGER,
        rank1_score INTEGER,
        rank2_score INTEGER,
        rank3_score INTEGER,
        rank4_score INTEGER,
        date TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create user matches relationship table (stored per user, yes in duplicates)
    db.exec(`
      CREATE TABLE IF NOT EXISTS user_matches (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        match_id INTEGER NOT NULL
      )
    `);

    // Create user tournaments table (stored per user, yes in duplicates)
    db.exec(`
      CREATE TABLE IF NOT EXISTS user_tournaments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        tournament_id INTEGER NOT NULL
      )
    `);

    console.log('Database migrations completed successfully!');
  } catch (error) {
    console.error('Error running migrations:', error);
    process.exit(1);
  }
})();
