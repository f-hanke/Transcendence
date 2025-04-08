import Fastify from 'fastify';
import websocket from '@fastify/websocket';
import path from 'path';
import fastifyStatic from '@fastify/static';
import Database from 'better-sqlite3';

const db = new Database('users.db');

// Create users table if it doesn't exist
db.prepare(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL
  )
`).run();

// Seed some example users if empty
const count = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
if (count === 0) {
  const insert = db.prepare('INSERT INTO users (username) VALUES (?)');
  ['alice', 'bob', 'charlie'].forEach(u => insert.run(u));
}

const fastify = Fastify();
await fastify.register(websocket);
await fastify.register(fastifyStatic, {
  root: path.join(__dirname, 'public'),
});

fastify.get('/', async (_req, reply) => {
  return reply.sendFile('index.html');
});

fastify.get('/ws', { websocket: true }, (connection /* socket */, _req) => {
  const users = db.prepare('SELECT * FROM users').all();
  connection.socket.send(JSON.stringify({ type: 'user_list', users }));
});

fastify.listen({ port: 3000 }, () => {
  console.log('Server running at http://localhost:3000');
});
