'use strict';

const fastify = require('fastify')();
fastify.register(require('@fastify/websocket'));

// Stores active games [{ id, creator, players }]
let games = [];
const clients = new Map();

fastify.register(async function (fastify) {
	fastify.get('/', { websocket: true }, (socket, req) => {
		socket.send(JSON.stringify({ type: 'updateGames', games }));
		socket.on('message', (message) => {
			const data = JSON.parse(message);

			if (data.type === 'connect') {
				console.log(' ~ Client connected: ', data.clientID);
				clients.set(socket, data.clientID);
			}

			if (data.type === 'createGame') {
				console.log(' ~ createGame', data);
				const game = { id: data.currentGameID, creator: data.clientID, players: [data.clientID] };
				games.push(game);
				broadcastGames();
			}
			else if (data.type === 'joinGame') {
				console.log(' ~ joinGame', data);
				const game = games.find(g => g.id === data.gameID);
				if (game && game.players.length < 2) {
					game.players.push(data.clientID);
					if (game.players.length === 2) {
						// When two players join, remove game and notify them to start
						game.players.forEach(player => {
							fastify.websocketServer.clients.forEach(client => {
								if (clients.get(client) === player) {
									client.send(JSON.stringify({ type: 'startGame', gameID: data.gameID }));
								}
							});
						});
					}
					broadcastGames();
				}
			}
			else if (data.type === 'leaveGame') {
				console.log(' ~ leaveGame', data);
				const game = games.find(g => g.id === data.gameID);
				if (!game)
					return;
				game.players.forEach(player => {
					fastify.websocketServer.clients.forEach(client => {
						if (clients.get(client) === player && player !== data.clientID) {
							client.send(JSON.stringify({ type: 'cancelGame', gameID: data.gameID }));
						}
					});
				});

				games = games.filter(g => g.id !== data.gameID);
				broadcastGames();
			}
			else if (data.type === 'deleteGame' || data.type === 'leaveGameMenu') {
				console.log(' ~ deleteGame/leaveGameMenu', data);
				games = games.filter(g => g.id !== data.gameID);
				broadcastGames();
			}
		});

		socket.on('close', () => {
			const clientID = clients.get(socket);
			console.log(' ~ Client disconnected: ', clientID);

			games.forEach(game => {
				if (game.players.includes(clientID)) {
					const otherPlayerID = game.players.find(player => player !== clientID);
					fastify.websocketServer.clients.forEach(client => {
						if (clients.get(client) === otherPlayerID) {
							client.send(JSON.stringify({ type: 'cancelGame', gameID: game.id }));
						}
					});
					games = games.filter(g => g.id !== game.id);
				}
			});
			clients.delete(socket);

			broadcastGames();
		});
	});

	function broadcastGames() {
		fastify.websocketServer.clients.forEach(client => {
			client.send(JSON.stringify({ type: 'updateGames', games }));
		});
	}
});

fastify.register(require('@fastify/static'), {
	root: __dirname + '/client',
	prefix: '/',
});

fastify.listen({ port: 3000, host: '0.0.0.0'  }, (err) => {
if (err) {
	fastify.log.error(err);
	process.exit(1);
}
console.log('Server listening on http://localhost:3000/index.html');
});
