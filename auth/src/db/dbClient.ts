import sqlite3 from 'sqlite3';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { config } from '../config/config';

// Configure SQLite
sqlite3.verbose();

// Ensure the data directory exists
const dbDir = path.dirname(config.dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Create database connection
const db = new sqlite3.Database(config.dbPath, (err) => {
  if (err) {
    console.error('Database connection error:', err.message);
  } else {
    console.log('Connected to the SQLite database');
  }
});

// Create promisified versions of database methods
export const dbRun = promisify(db.run.bind(db));
export const dbGet = promisify(db.get.bind(db));
export const dbAll = promisify(db.all.bind(db));

// Initialize the database with schema
export const initializeDatabase = async (): Promise<void> => {
  try {
    // Read schema SQL file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    
    // Execute schema SQL
    await new Promise<void>((resolve, reject) => {
      db.exec(schemaSql, (err) => {
        if (err) {
          console.error('Error initializing database schema:', err.message);
          reject(err);
        } else {
          console.log('Database schema initialized successfully');
          resolve();
        }
      });
    });
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
};

// Close database connection
export const closeDatabase = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err.message);
        reject(err);
      } else {
        console.log('Database connection closed');
        resolve();
      }
    });
  });
};

export default db;
