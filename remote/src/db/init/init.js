/**
 * Initial ongoing tournaments database migration script
 */
'use strict';

import { db } from '../db.js';

// Run migrations
(function runMigrations() {
  try {
    console.log('Running database migrations...');

    // Create ongoing tournaments table
    db.exec(`
      CREATE TABLE IF NOT EXISTS tournaments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        player1Id TEXT,
        player2Id TEXT DEFAULT NULL,
        player3Id TEXT DEFAULT NULL,
        player4Id TEXT DEFAULT NULL,
        match1Id TEXT DEFAULT NULL,
        match2Id TEXT DEFAULT NULL,
        match3Id TEXT DEFAULT NULL,
        match4Id TEXT DEFAULT NULL,
        match5Id TEXT DEFAULT NULL,
        match6Id TEXT DEFAULT NULL,
        match7Id TEXT DEFAULT NULL,
        match8Id TEXT DEFAULT NULL,
        match9Id TEXT DEFAULT NULL,
        match10Id TEXT DEFAULT NULL
      )
    `);

    // Create ongoing tournaments' matches table
    db.exec(`
        CREATE TABLE IF NOT EXISTS matches (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          p1_id TEXT NOT NULL,
          p2_id TEXT NOT NULL,
          p1_score INTEGER DEFAULT NULL,
          p2_score INTEGER DEFAULT NULL
        )
      `);

    // Create table of players exclusively tied to tournaments
    db.exec(`
      CREATE TABLE IF NOT EXISTS playerTournaments (
        playerId TEXT PRIMARY KEY,
        tournamentId INTEGER NOT NULL
      )
    `);

    console.log('Database migrations completed successfully!');
  } catch (error) {
    console.error('Error running migrations:', error);
    process.exit(1);
  }
})();
