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
const game = new Game_2.Game(800, 600);
// To allow requests from other domains (CORS)
fastify.register(cors_1.default, { origin: "*", });
// For real-time communication via WebSockets
fastify.register(require('@fastify/websocket'));
fastify.register(static_1.default, {
    root: path_1.default.join(__dirname, '..', 'public'),
    prefix: '/',
});
const gameLoop = () => {
    if (!game.isGameOver) {
        game.update();
        //console.log(chalk.cyan(`Ball position: x=${game.ball.x}, y=${game.ball.y}`)); // Vérifie si la balle bouge
        const updateMessage = JSON.stringify({
            type: 'update',
            player1Y: game.player1.y,
            player2Y: game.player2.y,
            ballX: game.ball.x,
            ballY: game.ball.y,
        });
        clients.forEach((client) => {
            if (client.readyState === ws_1.default.OPEN) {
                client.send(updateMessage);
            }
        });
        setTimeout(gameLoop, 1000 / 60); // 60 FPS
    }
};
/*API */
/*Route to start the game

Successfull answer :  {"message": "Game started!"}

*/
fastify.post('/api/game/start', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
    game.startGame();
    const startMessage = JSON.stringify({ type: "Game started!" });
    clients.forEach((client) => {
        if (client.readyState === ws_1.default.OPEN) {
            client.send(startMessage);
            gameLoop();
        }
    });
    reply.send({ message: "Game started!" });
}));
/*Route to move the paddles

 Player : 1 | 2
 direction : up | down

 succesfull answer:  "message": "Paddle moved successfully!"

 */
fastify.post('/api/game/move', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
    const { player, direction } = request.body;
    ;
    if (player !== 1 && player !== 2) {
        return reply.status(400).send({ message: 'Invalid player ID. Must be 1 or 2.' });
    }
    if (direction !== 'up' && direction !== 'down') {
        return reply.status(400).send({ message: 'Invalid direction. Must be "up" or "down".' });
    }
    if (player === 1) {
        if (direction === 'up' && game.player1.y > 0) {
            game.player1.y -= game.player1.paddleSpeed;
        }
        else if (direction === 'down' && game.player1.y + game.player1.paddleHeight < game.screenHeight) {
            game.player1.y += game.player1.paddleSpeed;
        }
    }
    if (player === 2) {
        if (direction === 'up' && game.player2.y > 0) {
            game.player2.y -= game.player2.paddleSpeed;
        }
        else if (direction === 'down' && game.player2.y + game.player2.paddleHeight < game.screenHeight) {
            game.player2.y += game.player2.paddleSpeed;
        }
    }
    game.update();
    const updateMessage = JSON.stringify({
        type: 'update',
        player1Y: game.player1.y,
        player2Y: game.player2.y,
        ballX: game.ball.x,
        ballY: game.ball.y
    });
    clients.forEach((client) => {
        if (client.readyState === ws_1.default.OPEN) {
            client.send(updateMessage);
        }
    });
    reply.send({ message: 'Paddle moved successfully!' });
}));
fastify.get('/api/game/state', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
    reply.send({
        player1Y: game.player1.y,
        player2Y: game.player2.y,
        ballX: game.ball.x,
        ballY: game.ball.y,
        score1: game.player1.score,
        score2: game.player2.score
    });
}));
fastify.get('/api/game/score', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
    reply.send({
        score1: game.player1.score,
        score2: game.player2.score
    });
}));
fastify.post('/api/game/stop', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
    game.isGameOver = true;
    reply.send({ message: "Game stopped!" });
}));
fastify.post('/api/game/reset', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
    game.resetGame();
    reply.send({ message: "Game reset!" });
}));
fastify.register(function (fastify) {
    return __awaiter(this, void 0, void 0, function* () {
        fastify.get('/ws', { websocket: true }, (socket /* WebSocket */, req /* FastifyRequest */) => {
            console.log(chalk_1.default.green("A client connected via WebSocket"));
            clients.add(socket);
            socket.on('message', message => {
                console.log(chalk_1.default.blue("Message received:", message.toString()));
                try {
                    const data = JSON.parse(message.toString());
                    if (data.type === 'start') {
                        console.log(chalk_1.default.yellow("Starting the game..."));
                        game.startGame();
                        socket.send(JSON.stringify({ message: 'Game started!' }));
                        if (clients.size === 1) {
                            gameLoop();
                        }
                    }
                    if (data.type === 'move') {
                        console.log(`Move : Player ${data.player}, Direction ${data.direction}`);
                        if (data.player === 1) {
                            if (data.direction === 'up' && game.player1.y > 0) {
                                game.player1.y -= game.player1.paddleSpeed;
                            }
                            else if (data.direction === 'down' && game.player1.y + game.player1.paddleHeight < game.screenHeight) {
                                game.player1.y += game.player1.paddleSpeed;
                            }
                        }
                        if (data.player === 2) {
                            if (data.direction === 'up' && game.player2.y > 0) {
                                game.player2.y -= game.player2.paddleSpeed;
                            }
                            else if (data.direction === 'down' && game.player2.y + game.player2.paddleHeight < game.screenHeight) {
                                game.player2.y += game.player2.paddleSpeed;
                            }
                        }
                        if (!game.isGameOver) {
                            game.update();
                        }
                        const updateMessage = JSON.stringify({
                            type: 'update',
                            player1Y: game.player1.y,
                            player2Y: game.player2.y,
                            ballX: game.ball.x,
                            ballY: game.ball.y
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
                    console.log(chalk_1.default.red("Error processing message:", error));
                }
            });
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
    }
    catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
});
start();
