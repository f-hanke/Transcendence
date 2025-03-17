'use strict';


import Fastify from "fastify";
import path from "path";
import fastifyStatic from '@fastify/static';
import cors from "@fastify/cors";
import websocket from "@fastify/websocket";
import chalk from "chalk"; //colors


const fastify = Fastify({ logger: true });

// To allow requests from other domains (CORS)
fastify.register(cors, { origin: "*", });


// For real-time communication via WebSockets
fastify.register(require('@fastify/websocket'))
//fastify.register(websocket);

fastify.register(fastifyStatic, {
  root: path.join(__dirname, '..', 'public'),
  prefix: '/',
});

fastify.register(async function (fastify) {
  fastify.get('/ws', { websocket: true }, (socket /* WebSocket */, req /* FastifyRequest */) => {
    socket.on('message', message => {
      // message.toString() === 'hi from client'
      socket.send(JSON.stringify({ message: 'hi from server' }));

    })
  })
})

// fastify.get('/', async (request, reply) => {
// 	return { message: 'Welcome to your Pong game!' };
//   });


// fastify.get('/game', async (request, reply) => {
//   return reply.sendFile('index.html'); // Sends the index.html located in 'public'
// });


fastify.get('/favicon.ico', async (request, reply) => {
  reply.status(204).send();
});

fastify.listen({ port: 3000 }, err => {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
})



// // WebSocket route for real-time communication
// fastify.get('/ws', { websocket: true }, (connection, req) => {
//   console.log(chalk.green("A client connected via WebSocket"));

//   connection.send(JSON.stringify({ message: "Welcome to WebSocket!" }));

//   // Handle incoming messages from the client
//   connection.on('message', (message) => {
//     //const data = JSON.parse(message);
//     console.log(chalk.blue("Message received:", message.toString()));

//     connection.send(JSON.stringify({ message: "Server received: " + message.toString() }));
//   });

//   connection.on('close', () => {
//     console.log(chalk.red("A client disconnected"));
//   });
//});



// Starting the server
// const start = async () => {
//   try {
//     await fastify.listen({ port: 3000, host: "0.0.0.0" });
//     console.log(chalk.cyan.bold("Server running on http://localhost:3000"));
//   } catch (err) {
//     fastify.log.error(err);
//     process.exit(1);
//   }
// };

// start();
