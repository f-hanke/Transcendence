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
        matchSemifinale1Id TEXT DEFAULT NULL,
        matchSemifinale2Id TEXT DEFAULT NULL,
        matchFinaleId TEXT DEFAULT NULL,
        matchBronzeId TEXT DEFAULT NULL
      )
    `);

    // Create ongoing tournaments' matches table
    db.exec(`
        CREATE TABLE IF NOT EXISTS matches (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          player1Id TEXT DEFAULT NULL,
          player2Id TEXT DEFAULT NULL,
          player1Score INTEGER DEFAULT NULL,
          player2Score INTEGER DEFAULT NULL,
          playedAt TEXT DEFAULT NULL
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
