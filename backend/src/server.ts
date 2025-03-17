'use strict';

import { Game } from './Game';
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


fastify.register(fastifyStatic, {
  root: path.join(__dirname, '..', 'public'),
  prefix: '/',
});

fastify.register(async function (fastify) {
  fastify.get('/ws', { websocket: true }, (socket /* WebSocket */, req /* FastifyRequest */) => {
    console.log(chalk.green("A client connected via WebSocket"));

    socket.on('message', message => {
      console.log(chalk.blue("Message received:", message.toString()));  // Journaliser le message reçu


      const command = message.toString().trim().toLowerCase();
      if (command === 'start game') {
        console.log(chalk.yellow("Starting the game..."));

        const game = new Game(800, 800);
        game.startGame();


        socket.send(JSON.stringify({ message: 'Game started!' }));
      } else {

       // console.log(chalk.red("Invalid command received: ", message));
        socket.send(JSON.stringify({ message: 'Invalid command!' }));
      }
    });

    socket.on('close', () => {
      console.log(chalk.red("A client disconnected"));
    });
  });
});


fastify.get('/favicon.ico', async (request, reply) => {
  reply.status(204).send();
});


const start = async () => {
  try {
    await fastify.listen({ port: 3000, host: "0.0.0.0" });
    console.log(chalk.cyan.bold("Server running on http://localhost:3000"));
   // const game = new Game(800,800);
    //game.startGame();
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();






