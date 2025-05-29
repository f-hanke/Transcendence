import Database from 'better-sqlite3';

// Open or create the SQLite database
const db = new Database('db/chat_service_db.db');

try {
	console.log('Initializing database...');

	// Create tables only if they do not already exist
	db.exec(`
		CREATE TABLE IF NOT EXISTS users (
			id          TEXT    PRIMARY KEY,
			username    TEXT    UNIQUE,
			small_image BLOB,
			online      INTEGER DEFAULT 0,
			language	TEXT
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
	db.prepare(`
		INSERT OR IGNORE INTO users (id, username, small_image, online)
		VALUES (?, ?, ?, ?)
	`).run('0', 'Tournament Notifications', null, 1);
}catch (error) {
	console.error('Error running init.db:', error);
	process.exit(1);
}

console.log('Database initialized successfully.');
