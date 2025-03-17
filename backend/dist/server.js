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
const fastify_1 = __importDefault(require("fastify"));
const path_1 = __importDefault(require("path"));
const static_1 = __importDefault(require("@fastify/static"));
const cors_1 = __importDefault(require("@fastify/cors"));
const chalk_1 = __importDefault(require("chalk")); //colors
const fastify = (0, fastify_1.default)({ logger: true });
// To allow requests from other domains (CORS)
fastify.register(cors_1.default, { origin: "*", });
// For real-time communication via WebSockets
fastify.register(require('@fastify/websocket'));
fastify.register(static_1.default, {
    root: path_1.default.join(__dirname, '..', 'public'),
    prefix: '/',
});
fastify.register(function (fastify) {
    return __awaiter(this, void 0, void 0, function* () {
        fastify.get('/ws', { websocket: true }, (socket /* WebSocket */, req /* FastifyRequest */) => {
            console.log(chalk_1.default.green("A client connected via WebSocket"));
            socket.on('message', message => {
                socket.send(JSON.stringify({ message: 'Welcome to WebSocket!' }));
                console.log(chalk_1.default.blue("Message received:", message.toString()));
            });
            socket.on('close', () => {
                console.log(chalk_1.default.red("A client disconnected"));
            });
        });
    });
});
//     console.log(chalk.blue("Message received:", message.toString()));
//     connection.send(JSON.stringify({ message: "Server received: " + message.toString() }));
//   });
//   connection.on('close', () => {
//     console.log(chalk.red("A client disconnected"));
//   });
//});
// fastify.get('/', async (request, reply) => {
// 	return { message: 'Welcome to your Pong game!' };
//   });
// fastify.get('/game', async (request, reply) => {
//   return reply.sendFile('index.html'); // Sends the index.html located in 'public'
// });
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
