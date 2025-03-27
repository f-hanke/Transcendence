'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Game_2 = require("./Game");
const fastify_1 = __importDefault(require("fastify"));
const path_1 = __importDefault(require("path"));
const static_1 = __importDefault(require("@fastify/static"));
const cors_1 = __importDefault(require("@fastify/cors"));
const chalk_1 = __importDefault(require("chalk"));
const websocket_1 = __importDefault(require("@fastify/websocket"));
const fastify = (0, fastify_1.default)({ logger: true });
const games = new Map();
const clients = new Map();
//const clients = new Set<ws.WebSocket>();
fastify.register(websocket_1.default);
fastify.register(cors_1.default, { origin: '*' });
//fastify.register(require('@fastify/websocket'));
fastify.register(static_1.default, {
    root: path_1.default.join(__dirname, '..', 'public'),
    prefix: '/',
});
function sendMessage(socket, msg) {
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
fastify.post('/api/game/start', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
    const message = JSON.stringify(request.body, null, 2);
    console.log(chalk_1.default.cyan.bold(message));
    // const matchId = uuidv4();
    const { hostId, oponentId, matchId } = request.body;
    // request.query.clientId
    const game = new Game_2.Game("remote", matchId, hostId, oponentId);
    games.set(matchId, game);
    // game.startGame();
    // gameLoop(matchId);
    reply.send({ message: 'Game started!', matchId });
}));
fastify.register(function (fastify) {
    return __awaiter(this, void 0, void 0, function* () {
        fastify.get('/ws', { websocket: true }, (socket /* WebSocket */, req /* FastifyRequest */) => {
            const urlParams = new URLSearchParams(req.url.split('?')[1]);
            console.log(req === null || req === void 0 ? void 0 : req.query);
            const clientId = urlParams.get('clientId') || 'anonymous';
            console.log(chalk_1.default.green(`A client with ID: ${clientId} connected via WebSocket`));
            clients.set(clientId, socket);
            socket.send(JSON.stringify({ message: `Bonjour, ${clientId}! You are connected` }));
            socket.on('close', () => {
                console.log(chalk_1.default.red(`A client with ID: ${clientId} disconnected`));
                ;
                clients.delete(clientId);
            });
        });
    });
});
fastify.get('/favicon.ico', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
    reply.status(200);
    //.send();
    reply.send({ message: 'Game started!' });
}));
const start = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield fastify.listen({ port: 3000, host: "0.0.0.0" });
        console.log(chalk_1.default.cyan.bold("Server running on http://localhost:3000"));
    }
    catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
});
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
