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
const chalk_1 = __importDefault(require("chalk")); //colors
const ws_1 = __importDefault(require("ws"));
const clients = new Set();
const fastify = (0, fastify_1.default)({ logger: true });
// To allow requests from other domains (CORS)
fastify.register(cors_1.default, { origin: "*", });
// For real-time communication via WebSockets
fastify.register(require('@fastify/websocket'));
fastify.register(static_1.default, {
    root: path_1.default.join(__dirname, '..', 'public'),
    prefix: '/',
});
let gameState = {
    player1Y: 250,
    player2Y: 250,
    paddleSpeed: 10,
    screenHeight: 600,
};
fastify.register(function (fastify) {
    return __awaiter(this, void 0, void 0, function* () {
        fastify.get('/ws', { websocket: true }, (socket /* WebSocket */, req /* FastifyRequest */) => {
            console.log(chalk_1.default.green("A client connected via WebSocket"));
            clients.add(socket);
            socket.on('message', message => {
                console.log(chalk_1.default.blue("Message received:", message.toString())); // Journaliser le message reçu
                const command = message.toString().trim().toLowerCase();
                if (command === 'start game') {
                    console.log(chalk_1.default.yellow("Starting the game..."));
                    const game = new Game_2.Game(800, 800);
                    game.startGame();
                    socket.send(JSON.stringify({ message: 'Game started!' }));
                }
                try {
                    const data = JSON.parse(message.toString());
                    if (data.type === 'move') {
                        console.log(`Move : Joueur ${data.player}, Direction ${data.direction}`);
                        if (data.player === 1) {
                            if (data.direction === 'up' && gameState.player1Y > 0) {
                                gameState.player1Y -= gameState.paddleSpeed;
                            }
                            else if (data.direction === 'down' && gameState.player1Y + 100 < gameState.screenHeight) {
                                gameState.player1Y += gameState.paddleSpeed;
                            }
                        }
                        else if (data.player === 2) {
                            if (data.direction === 'up' && gameState.player2Y > 0) {
                                gameState.player2Y -= gameState.paddleSpeed;
                            }
                            else if (data.direction === 'down' && gameState.player2Y + 100 < gameState.screenHeight) {
                                gameState.player2Y += gameState.paddleSpeed;
                            }
                        }
                        const updateMessage = JSON.stringify({
                            type: 'update',
                            player1Y: gameState.player1Y,
                            player2Y: gameState.player2Y,
                        });
                        console.log("Sending update :", updateMessage);
                        clients.forEach((client) => {
                            if (client.readyState === ws_1.default.OPEN) {
                                client.send(updateMessage);
                            }
                        });
                    }
                }
                catch (error) {
                    // console.log(chalk.red("Erreur lors du traitement du message :", error));
                }
            });
            //  else {
            //  // console.log(chalk.red("Invalid command received: ", message));
            //   socket.send(JSON.stringify({ message: 'Invalid command!' }));
            // }
            socket.on('close', () => {
                console.log(chalk_1.default.red("A client disconnected"));
                clients.delete(socket);
            });
        });
    });
});
fastify.get('/favicon.ico', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
    reply.status(204).send();
}));
const start = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield fastify.listen({ port: 3000, host: "0.0.0.0" });
        console.log(chalk_1.default.cyan.bold("Server running on http://localhost:3000"));
        // const game = new Game(800,800);
        //game.startGame();
    }
    catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
});
start();
