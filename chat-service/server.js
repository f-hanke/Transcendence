'use strict';

const fs = require('fs');
const fastify = require('fastify')({
    https: {
        key: fs.readFileSync('./ssl/key.pem'), // Load private key
        cert: fs.readFileSync('./ssl/cert.pem') // Load certificate
    }
});

fastify.register(require('@fastify/websocket'));

let clients = new Map(); // Stores active clients (userId -> WebSocket)
let messages = new Map(); // Stores messages per user pair

fastify.register(async function (fastify) {
    fastify.get('/', { websocket: true }, (socket, req) => {
        const userId = `user_${Math.random().toString(36).substr(2, 9)}`;
        clients.set(userId, socket);

        // Notify all clients about the new user
        broadcastUsers();

        socket.on('message', (message) => {
            const data = JSON.parse(message);

            if (data.type === 'message' && data.to) {
                const key = getChatKey(userId, data.to);
                if (!messages.has(key)) messages.set(key, []);
                messages.get(key).push({ from: userId, content: data.content });

                // Send message to recipient if online
                if (clients.has(data.to)) {
                    clients.get(data.to).send(JSON.stringify({
                        type: 'message', from: userId, content: data.content
                    }));
                }
            }

            // If a client requests chat history
            else if (data.type === 'history' && data.to) {
                const key = getChatKey(userId, data.to);
                socket.send(JSON.stringify({
                    type: 'history',
                    messages: messages.get(key) || []
                }));
            }
        });

        socket.on('close', () => {
            clients.delete(userId);
            broadcastUsers();
        });

        socket.send(JSON.stringify({ type: 'id', id: userId })); // Send ID to client
    });
});

// Function to create a unique chat key for two users (order-independent)
function getChatKey(user1, user2) {
    return [user1, user2].sort().join('-');
}

function broadcastUsers() {
    const userList = Array.from(clients.keys());
    for (let [userId, client] of clients) {
        client.send(JSON.stringify({ type: 'users', users: userList.filter(id => id !== userId) }));
    }
}

fastify.register(require('@fastify/static'), {
	root: __dirname + '/client',
	prefix: '/',
});

fastify.listen({ port: 3000, host: '0.0.0.0'  }, (err) => {
	if (err) {
		fastify.log.error(err);
		process.exit(1);
	}
	console.log('Server listening on https://localhost:3000/index.html');
});
