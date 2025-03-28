'use strict';

import { Game } from './Game';
import Fastify from 'fastify';
import path from 'path';
import fastifyStatic from '@fastify/static';
import cors from '@fastify/cors';
import { WebSocket } from "ws";
import ws from 'ws';
import { v4 as uuidv4 } from 'uuid';
import chalk from 'chalk';
import { gameServiceTypeGuards, GameServiceTypes, MatchMakingTypes } from 'transcendence';
import fastifyWebsocket from '@fastify/websocket';
import { request } from 'http';
import { json } from 'stream/consumers';

const fastify = Fastify({ logger: true });
const games = new Map<string, Game>();
const clients = new Map();
//const clients = new Set<ws.WebSocket>();
fastify.register(fastifyWebsocket);

fastify.register(cors, { origin: '*' });

//fastify.register(require('@fastify/websocket'));

fastify.register(fastifyStatic, {
  root: path.join(__dirname, '..', 'public'),
  prefix: '/',
});

export function sendMessage(socket: ws.WebSocket, msg: GameServiceTypes.AllGameServiceMessageTypes): void {
	socket.send(JSON.stringify(msg));
  }


// function gameLoop(matchId : string) {
// 	const game = games.get(matchId);
// 	if (!game || game.isGameOver) return;

// 	game.update();

// 	const updateMessage: GameServiceTypes.ServerUpdateGameState = {
// 		type: "serverUpdateGameState",
// 		data: {
// 		  matchId: game.matchId,
// 		  player1: {
// 			id: game.player1.id,
// 			score: game.player1.score,
// 			paddleY: game.player1.y,
// 		  },
// 		  player2: {
// 			id: game.player2.id,
// 			score: game.player2.score,
// 			paddleY: game.player2.y,
// 		  },
// 		  ball: {
// 			x: game.ball.x,
// 			y: game.ball.y,
// 		  },
// 		},
// 	  };

// 	clients.get(matchId)?.forEach((client: ws.WebSocket)  => sendMessage(client, updateMessage));

// 	if (game.isGameOver) {

// 	  const ServerGameIsOver : GameServiceTypes.DataServerGameIsOver = {

// 			matchId: game.matchId,
// 			player1: {
// 			id: game.player1.id,
// 			score: game.player1.score,
// 			},
// 			player2: {
// 			id:game.player2.id ,
// 			score: game.player2.score,
// 			},
// 			reason: "normalMaxScoreReached",
// 	  }
// 	}
	// clients.get(matchId)?.forEach((client: ws.WebSocket)  => sendMessage(client, ServerGameIsOver ));
	// games.delete(matchId);
	// clients.delete(matchId);
	// }
	// else {
	//   setTimeout(() => gameLoop(matchId));
	// }
//}

// {
// 		matchId: string;
// 		hostId: string;
// 		oponentId: string | null;
// }

fastify.post('/api/game/start', async (request, reply) => {

	const message = JSON.stringify(request.body,null,2);
	console.log(chalk.cyan.bold(message));
	// const matchId = uuidv4();
	const  {typeOfGame, hostId, oponentId, matchId } = request.body as GameServiceTypes.StaticGameProperties;
	// request.query.clientId
	const game = new Game(typeOfGame, matchId, hostId, oponentId );

	games.set(matchId, game);

	reply.send({ message: 'Game started!', matchId });
  });


fastify.register(async function (fastify) {
  fastify.get('/ws', { websocket: true }, (socket /* WebSocket */, req /* FastifyRequest */) => {

	const urlParams = new URLSearchParams(req.url.split('?')[1]);
	console.log(req?.query);
	const clientId = urlParams.get('clientId') || 'anonymous';
	console.log(chalk.green(`A client with ID: ${clientId} connected via WebSocket`));

	clients.set(clientId, socket);

	socket.send(JSON.stringify({ message: `Hello, ${clientId}! You are connected` }));

	socket.on("message", (message) => {
		const data = message.toString("utf-8");
		const dataJson = JSON.parse(data);
		if (gameServiceTypeGuards.isClientIsReady(dataJson))
		{
			//dataJson.data.matchId;
			console.log(chalk.green(` ${clientId} is ready` ));
			sendMessage(socket, {
				type: "serverGameStarted",
				data: {
					matchId: "whatever",
				}
			})

			games.get(dataJson.data.matchId)!.websocket = socket;

			games.get(dataJson.data.matchId)?.startGame();



			//if local or AI => start game
			//if remote , wait for both
		}
		if (gameServiceTypeGuards.isClientUpdatePaddlePosition(dataJson))
		{
			games.get(dataJson.data.matchId)?.updatePaddlePosition(dataJson.data.player1.paddleY, dataJson.data.player2!.paddleY);
		}


		else
		{
			console.log(chalk.green(` ${clientId} is NOT ready` ));
		}
	})

	socket.on('close', () => {
		console.log(chalk.red(`A client with ID: ${clientId} disconnected`));;
		clients.delete(clientId);
	});
});
})



fastify.get('/favicon.ico', async (request, reply) => {
  reply.status(200);
  //.send();
  reply.send({ message: 'Game started!' })
});


const start = async () => {
  try {
	await fastify.listen({ port: 3000, host: "0.0.0.0" });
	console.log(chalk.cyan.bold("Server running on http://localhost:3000"));
  } catch (err) {
	fastify.log.error(err);
	process.exit(1);
  }
};

start();

//   fastify.register(async function (fastify) {
//   fastify.get('/ws', { websocket: true }, (socket, req) => {
//     console.log(chalk.green('A client connected via WebSocket'));

// 	//request.query.clientId

// 	// clientIsReady
// 	// local -> sent Start
// 	// start gameloop
// 	//

//     socket.on('message', message => {
//       try {
//         const data = JSON.parse(message.toString());
//         const { matchId, playerId } = data;

//         // let game = games.get(matchId);
//         // if (!game) {
//         //   sendMessage(socket, { type: 'ServerError', message: 'Game not found' });
//         //   return;
//         // }

//         if (!clients.has(matchId)) clients.set(matchId, new Set());
//         clients.get(matchId).add(socket);


//         if (data.type === 'move') {
//           const player = data.player === 1 ? game.player1 : game.player2;

//           // Mettez à jour la position du joueur en fonction de la direction du mouvement
//           if (data.direction === 'up' && player.y > 0) player.y -= player.paddleSpeed;
//           if (data.direction === 'down' && player.y + player.paddleHeight < game.screenHeight) player.y += player.paddleSpeed;

//           // Met à jour l'état du jeu et envoie la mise à jour à tous les clients
//           game.update();
//           const updateMessage: GameServiceTypes.ServerUpdateGameState = {
//             type: 'serverUpdateGameState',
//             data: {
//               matchId: game.matchId,
//               player1: {
//                 id: game.player1.id,
//                 score: game.player1.score,
//                 paddleY: game.player1.y,
//               },
//               player2: {
//                 id: game.player2.id,
//                 score: game.player2.score,
//                 paddleY: game.player2.y,
//               },
//               ball: {
//                 x: game.ball.x,
// 				if (data.type === 'move') {
// 					const player = data.player === 1 ? game.player1 : game.player2;

// 					// Mettez à jour la position du joueur en fonction de la direction du mouvement
// 					if (data.direction === 'up' && player.y > 0) player.y -= player.paddleSpeed;
// 					if (data.direction === 'down' && player.y + player.paddleHeight < game.screenHeight) player.y += player.paddleSpeed;

// 					// Met à jour l'état du jeu et envoie la mise à jour à tous les clients
// 					game.update();
// 					const updateMessage: GameServiceTypes.ServerUpdateGameState = {
// 					  type: 'serverUpdateGameState',
// 					  data: {
// 						matchId: game.matchId,
// 						player1: {
// 						  id: game.player1.id,
// 						  score: game.player1.score,
// 						  paddleY: game.player1.y,
// 						},
// 						player2: {
// 						  id: game.player2.id,
// 						  score: game.player2.score,
// 						  paddleY: game.player2.y,
// 						},
// 						ball: {
// 						  x: game.ball.x,
// 						  y: game.ball.y,
// 						},
// 					  },
// 					};

// 					clients.get(matchId)?.forEach((client: ws.WebSocket) => sendMessage(client, updateMessage));
// 				  }
// 				} catch (error) {
// 				  console.error(chalk.red('Error processing message:', error));
// 				}            y: game.ball.y,
//               },
//             },
//           };

//           clients.get(matchId)?.forEach((client: ws.WebSocket) => sendMessage(client, updateMessage));
//         }
//       } catch (error) {
//         console.error(chalk.red('Error processing message:', error));
//       }
//     });

//     socket.on('close', () => {
//       console.log(chalk.red('A client disconnected'));
//       clients.forEach((clientSet, matchId) => {
//         clientSet.delete(socket);
//         if (clientSet.size === 0) clients.delete(matchId);
//       });
//     });
//   });


start();

