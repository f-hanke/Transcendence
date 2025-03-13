import Fastify from "fastify";
import path from "path"; // Nécessaire pour la gestion des chemins
import fastifyStatic from '@fastify/static'; // Plugin pour servir des fichiers statiques
import cors from "@fastify/cors";
import websocket from "@fastify/websocket";

const fastify = Fastify({ logger: true });

// To allow requests from other domains (CORS)
fastify.register(cors);

// For real-time communication via WebSockets
fastify.register(websocket);

// Serve static files like index.html, client.js, etc.
fastify.register(fastifyStatic, {
  root: path.join(__dirname, '..', 'public'), // Dossier où tes fichiers HTML, CSS et JS sont stockés
  prefix: '/', // Les fichiers seront accessibles à partir de la racine (ex: http://localhost:3000/index.html)
});

// fastify.get('/', async (request, reply) => {
// 	return { message: 'Welcome to your Pong game!' };
//   });

fastify.get("/", async (request, reply) => {
	reply.sendFile("index.html"); // This will send the index.html file from the public folder
  });

// fastify.get('/game', async (request, reply) => {
//   return reply.sendFile('index.html'); // Sends the index.html located in 'public'
// });


// Route to handle favicon.ico requests
fastify.get('/favicon.ico', async (request, reply) => {
  reply.status(204).send(); // Retourne un statut 204 (pas de contenu) pour les requêtes favicon
});

// Starting the server
const start = async () => {
  try {
    await fastify.listen({ port: 3000, host: "0.0.0.0" });
    console.log("🚀 Server running on http://localhost:3000");
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
