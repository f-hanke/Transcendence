'use strict';

import { Game } from './Game';

import Fastify from "fastify";
import path from "path";
import fastifyStatic from '@fastify/static';
import cors from "@fastify/cors";
import websocket from "@fastify/websocket";
import chalk from "chalk"; //colors

import ws from 'ws';

const clients = new Set<ws.WebSocket>();

const fastify = Fastify({ logger: true });

// To allow requests from other domains (CORS)
fastify.register(cors, { origin: "*", });


// For real-time communication via WebSockets
fastify.register(require('@fastify/websocket'))


fastify.register(fastifyStatic, {
  root: path.join(__dirname, '..', 'public'),
  prefix: '/',
});

let gameState = {
  player1Y: 250,
  player2Y: 250,
  paddleSpeed: 10,
  screenHeight: 600,
};




fastify.register(async function (fastify) {
  fastify.get('/ws', { websocket: true }, (socket /* WebSocket */, req /* FastifyRequest */) => {
    console.log(chalk.green("A client connected via WebSocket"));

    clients.add(socket);

    socket.on('message', message => {
      console.log(chalk.blue("Message received:", message.toString()));  // Journaliser le message reçu


      const command = message.toString().trim().toLowerCase();
      if (command === 'start game') {
        console.log(chalk.yellow("Starting the game..."));

        const game = new Game(800, 800);
        game.startGame();

        socket.send(JSON.stringify({ message: 'Game started!' }));
      }

      try {
        const data = JSON.parse(message.toString());


        if (data.type === 'move')
        {
          console.log(`Move : Player ${data.player}, Direction ${data.direction}`);
          if (data.player === 1)
          {
            if (data.direction === 'up' && gameState.player1Y > 0)
            {
              gameState.player1Y -= gameState.paddleSpeed;
            }
            else if (data.direction === 'down' && gameState.player1Y + 100 < gameState.screenHeight) {
              gameState.player1Y += gameState.paddleSpeed;
            }
          }
          else if (data.player === 2)
          {
            if (data.direction === 'up' && gameState.player2Y > 0)
            {
              gameState.player2Y -= gameState.paddleSpeed;
            } else if (data.direction === 'down' && gameState.player2Y + 100 < gameState.screenHeight) {
              gameState.player2Y += gameState.paddleSpeed;
            }
          }

          const updateMessage = JSON.stringify(
          {
            type: 'update',
            player1Y: gameState.player1Y,
            player2Y: gameState.player2Y,
          });
          console.log("Sending update :", updateMessage);
          clients.forEach((client: ws.WebSocket) => {
            if (client.readyState === ws.OPEN) {
              client.send(updateMessage);
            }
          });

        }

      } catch (error) {
       // console.log(chalk.red("Erreur lors du traitement du message :", error));
      }
    });


      //  else {

      //  // console.log(chalk.red("Invalid command received: ", message));
      //   socket.send(JSON.stringify({ message: 'Invalid command!' }));
      // }

    socket.on('close', () => {
      console.log(chalk.red("A client disconnected"));
      clients.delete(socket);
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






