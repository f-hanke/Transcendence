import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import logger from './lib/logger.js';

const DB_PATH = './db/chat_service_db.db';

export function initializeDatabase(): Database.Database {
  try {
    // Ensure db directory exists
    const dbDir = path.dirname(DB_PATH);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
      logger.info('Created database directory:', dbDir);
    }

    logger.info('Initializing chat service database...');
    const db = new Database(DB_PATH);

    // Create tables
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id          TEXT    PRIMARY KEY,
        username    TEXT    UNIQUE,
        small_image BLOB,
        online      INTEGER DEFAULT 0,
        language    TEXT    DEFAULT 'en'
      );

      CREATE TABLE IF NOT EXISTS messages (
        mid         INTEGER PRIMARY KEY AUTOINCREMENT,
        authorId    TEXT    REFERENCES users(id),
        recipientId TEXT    REFERENCES users(id),
        message     TEXT,
        date        TEXT,
        type        TEXT
      );

      CREATE TABLE IF NOT EXISTS friends (
        user_id1 TEXT NOT NULL,
        user_id2 TEXT NOT NULL,
        status   TEXT NOT NULL,
        PRIMARY KEY (user_id1, user_id2),
        FOREIGN KEY (user_id1) REFERENCES users(id),
        FOREIGN KEY (user_id2) REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS chat_status (
        user_id         TEXT NOT NULL,
        chat_partner_id TEXT NOT NULL,
        unread          INTEGER NOT NULL DEFAULT 0,
        PRIMARY KEY (user_id, chat_partner_id)
      );

      CREATE TABLE IF NOT EXISTS blockings (
        user_id1 TEXT NOT NULL,
        user_id2 TEXT NOT NULL,
        PRIMARY KEY (user_id1, user_id2),
        FOREIGN KEY (user_id1) REFERENCES users(id),
        FOREIGN KEY (user_id2) REFERENCES users(id)
      );
    `);

    // Insert Tournament Notifications user
    db.prepare(`
      INSERT OR IGNORE INTO users (id, username, small_image, online, language)
      VALUES (?, ?, ?, ?, ?)
    `).run('0', 'Tournament Notifications', null, 1, 'en');

    logger.info('✅ Chat service database initialized successfully');
    return db;
  } catch (error) {
    logger.error('❌ Error initializing chat service database:', error);
    throw error;
  }
} 