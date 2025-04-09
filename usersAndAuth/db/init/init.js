/**
 * Database init script
 */
'use strict';

const db = require('../db');

// Run initialization
(function runInit() {
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
        image TEXT DEFAULT NULL,
        online_status INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create matches table
    db.exec(`
      CREATE TABLE IF NOT EXISTS matches (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        opponent INTEGER NOT NULL,
        body TEXT,
        user_id INTEGER NOT NULL,
        user_score INTEGER NOT NULL,
        opponent_score INTEGER NOT NULL,
        date TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (opponent) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Create friendships table
    db.exec(`
      CREATE TABLE IF NOT EXISTS friendships (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user1 INTEGER NOT NULL,
        user2 INTEGER NOT NULL,
        FOREIGN KEY (user1) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (user2) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(user1, user2)
      )
    `);

    // Create friend_requests table
    db.exec(`
      CREATE TABLE IF NOT EXISTS friend_requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        asker INTEGER NOT NULL,
        responder INTEGER NOT NULL,
        status INTEGER DEFAULT 0,
        FOREIGN KEY (asker) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (responder) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(asker, responder)
      )
    `);

    // Create blockings table
    db.exec(`
      CREATE TABLE IF NOT EXISTS blockings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        blocked_user_id INTEGER NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (blocked_user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(user_id, blocked_user_id)
      )
    `);

    // Create indexes for better performance
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_matches_user_id ON matches(user_id);
      CREATE INDEX IF NOT EXISTS idx_friendships_user1 ON friendships(user1);
      CREATE INDEX IF NOT EXISTS idx_friendships_user2 ON friendships(user2);
      CREATE INDEX IF NOT EXISTS idx_friend_requests_asker ON friend_requests(asker);
      CREATE INDEX IF NOT EXISTS idx_friend_requests_responder ON friend_requests(responder);
      CREATE INDEX IF NOT EXISTS idx_blockings_user_id ON blockings(user_id);
      CREATE INDEX IF NOT EXISTS idx_blockings_blocked_user_id ON blockings(blocked_user_id);
    `);

    console.log('Database migrations completed successfully!');
  } catch (error) {
    console.error('Error running migrations:', error);
    process.exit(1);
  }
})();
