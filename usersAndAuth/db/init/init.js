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

    // Create match records table which stores both simple and tournament matches, but we differentiate sneakily
    db.exec(`
      CREATE TABLE IF NOT EXISTS matches (
        id TEXT NOT NULL PRIMARY KEY,
        player1Id TEXT NOT NULL,
        player2Id TEXT NOT NULL,
        player1Score INTEGER NOT NULL,
        player2Score INTEGER NOT NULL,
        winnerId TEXT NOT NULL,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create tournament records table
    db.exec(`
      CREATE TABLE IF NOT EXISTS tournaments (
        id TEXT NOT NULL PRIMARY KEY,
        playerRank1Id TEXT NOT NULL,
        playerRank2Id TEXT NOT NULL,
        playerRank3Id TEXT NOT NULL,
        playerRank4Id TEXT NOT NULL,
        matchSemifinale1Id TEXT NOT NULL,
        matchSemifinale2Id TEXT NOT NULL,
        matchFinaleId TEXT NOT NULL,
        matchBronzeId TEXT NOT NULL,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create user matches relationship table FOR SIMPLE MATCHES (stored per user, yes in duplicates)
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
