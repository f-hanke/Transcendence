-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  pw_hash TEXT NOT NULL,
  display_name TEXT UNIQUE NOT NULL,
  image TEXT DEFAULT 'default.png',
  login_count INTEGER DEFAULT 0,
  online_status INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Matches table
CREATE TABLE IF NOT EXISTS matches (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  opponent INTEGER NOT NULL,
  user_score INTEGER NOT NULL,
  opponent_score INTEGER NOT NULL,
  date TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users (id),
  FOREIGN KEY (opponent) REFERENCES users (id)
);

-- Friendships table
CREATE TABLE IF NOT EXISTS friendships (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user1 INTEGER NOT NULL,
  user2 INTEGER NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user1) REFERENCES users (id),
  FOREIGN KEY (user2) REFERENCES users (id),
  UNIQUE(user1, user2)
);

-- Friend requests table
CREATE TABLE IF NOT EXISTS friend_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  asker INTEGER NOT NULL,
  responder INTEGER NOT NULL,
  status INTEGER DEFAULT 0, -- 0: pending, 1: accepted, 2: rejected
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (asker) REFERENCES users (id),
  FOREIGN KEY (responder) REFERENCES users (id),
  UNIQUE(asker, responder)
);

-- Blockings table
CREATE TABLE IF NOT EXISTS blockings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  blocked_user_id INTEGER NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users (id),
  FOREIGN KEY (blocked_user_id) REFERENCES users (id),
  UNIQUE(user_id, blocked_user_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_matches_user_id ON matches (user_id);
CREATE INDEX IF NOT EXISTS idx_matches_opponent ON matches (opponent);

CREATE INDEX IF NOT EXISTS idx_friendships_user1 ON friendships (user1);
CREATE INDEX IF NOT EXISTS idx_friendships_user2 ON friendships (user2);

CREATE INDEX IF NOT EXISTS idx_friend_requests_asker ON friend_requests (asker);
CREATE INDEX IF NOT EXISTS idx_friend_requests_responder ON friend_requests (responder);

CREATE INDEX IF NOT EXISTS idx_blockings_user_id ON blockings (user_id);
CREATE INDEX IF NOT EXISTS idx_blockings_blocked_user_id ON blockings (blocked_user_id);
