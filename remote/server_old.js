'use strict';

const fastify = require('fastify')();
fastify.register(require('@fastify/websocket'));

// Stores active games [{ id, creator, players }]
let games = [];
const clients = new Map();

fastify.register(async function (fastify) {
  fastify.get('/', { websocket: true }, (socket, req) => {
    console.log('New WebSocket connection');

    // Send the current game list to the new client
    socket.send(JSON.stringify({ type: 'updateGames', games }));

    socket.on('message', (message) => {
      const data = JSON.parse(message);

      if (data.type === 'connect') {
        clients.set(socket, data.clientID);
      }

      if (data.type === 'createGame') {
        if (games.length < 3) {
          const game = { id: data.currentGameID, creator: data.clientID, players: [data.clientID] };
          games.push(game);
          broadcastGames();
        }
      }
      else if (data.type === 'joinGame') {
        const game = games.find(g => g.id === data.gameID);
        if (game && game.players.length < 2) {
          game.players.push(data.clientID);
          if (game.players.length === 2) {
            // When two players join, remove game and notify them to start
            games = games.filter(g => g.id !== data.gameID);
            fastify.websocketServer.clients.forEach(client => {
              client.send(JSON.stringify({ type: 'startGame', gameID: data.gameID }));
            });
          }
          broadcastGames();
        }
      }
      else if (data.type === 'leaveGame') {
        const game = games.find(g => g.id === data.gameID);
        if (game) {
          // Identify the other player
          const otherPlayerID = game.players.find(player => player !== data.clientID);

          // Remove the game
          games = games.filter(g => g.id !== data.gameID);

          // Notify the other player if they are still connected
          if (otherPlayerID) {
            fastify.websocketServer.clients.forEach(client => {
              if (clients.get(client) === otherPlayerID) {
                client.send(JSON.stringify({ type: 'opponentLeft' }));
              }
            });
          }
        }
        broadcastGames();
      }
      else if (data.type === 'deleteGame'){
        games = games.filter(g => g.id !== data.gameID);
        broadcastGames();
      }
    });

    socket.on('close', () => {
      console.log('Client disconnected.');

      const clientID = clients.get(socket);
      games = games.filter(game => game.creator !== clientID);
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

fastify.listen({ port: 3000 }, (err) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  console.log('Server listening on http://localhost:3000/index.html');
});
