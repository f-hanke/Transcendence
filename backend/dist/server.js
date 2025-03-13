"use strict";
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
const path_1 = __importDefault(require("path")); // Nécessaire pour la gestion des chemins
const static_1 = __importDefault(require("@fastify/static")); // Plugin pour servir des fichiers statiques
const cors_1 = __importDefault(require("@fastify/cors"));
const websocket_1 = __importDefault(require("@fastify/websocket"));
const fastify = (0, fastify_1.default)({ logger: true });
// To allow requests from other domains (CORS)
fastify.register(cors_1.default);
// For real-time communication via WebSockets
fastify.register(websocket_1.default);
// Serve static files like index.html, client.js, etc.
fastify.register(static_1.default, {
    root: path_1.default.join(__dirname, '..', 'public'), // Dossier où tes fichiers HTML, CSS et JS sont stockés
    prefix: '/', // Les fichiers seront accessibles à partir de la racine (ex: http://localhost:3000/index.html)
});
// fastify.get('/', async (request, reply) => {
// 	return { message: 'Welcome to your Pong game!' };
//   });
fastify.get("/", (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
    reply.sendFile("index.html"); // This will send the index.html file from the public folder
}));
// fastify.get('/game', async (request, reply) => {
//   return reply.sendFile('index.html'); // Sends the index.html located in 'public'
// });
// Route to handle favicon.ico requests
fastify.get('/favicon.ico', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
    reply.status(204).send(); // Retourne un statut 204 (pas de contenu) pour les requêtes favicon
}));
// Starting the server
const start = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield fastify.listen({ port: 3000, host: "0.0.0.0" });
        console.log("🚀 Server running on http://localhost:3000");
    }
    catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
});
start();
