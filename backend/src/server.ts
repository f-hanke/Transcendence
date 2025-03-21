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

const game = new Game(800, 600);

// To allow requests from other domains (CORS)
fastify.register(cors, { origin: "*", });


// For real-time communication via WebSockets
fastify.register(require('@fastify/websocket'))


fastify.register(fastifyStatic, {
  root: path.join(__dirname, '..', 'public'),
  prefix: '/',
});



const gameLoop = () => {
  if (!game.isGameOver) {
    game.update();

    const updateMessage = JSON.stringify({
      type: 'update',
      player1Y: game.player1.y,
      player2Y: game.player2.y,
      ballX: game.ball.x,
      ballY: game.ball.y,
    });

    clients.forEach((client: ws.WebSocket) => {
      if (client.readyState === ws.OPEN) {
        client.send(updateMessage);
      }
    });

    setTimeout(gameLoop, 1000 / 60); // 60 FPS
  }
};

fastify.register(async function (fastify) {
  fastify.get('/ws', { websocket: true }, (socket /* WebSocket */, req /* FastifyRequest */) => {
    console.log(chalk.green("A client connected via WebSocket"));

    clients.add(socket);

    socket.on('message', message => {
      console.log(chalk.blue("Message received:", message.toString()));

      try {
        const data = JSON.parse(message.toString());

        if (data.type === 'start') {
          console.log(chalk.yellow("Starting the game..."));


          game.startGame();

          socket.send(JSON.stringify({ message: 'Game started!' }));
          if (clients.size === 1) {
            gameLoop();
          }

        }

        if (data.type === 'move')
        {
          console.log(`Move : Player ${data.player}, Direction ${data.direction}`);
          if (data.player === 1) {
            if (data.direction === 'up' && game.player1.y > 0) {
              game.player1.y -= game.player1.paddleSpeed;
            } else if (data.direction === 'down' && game.player1.y + game.player1.paddleHeight < game.screenHeight) {
              game.player1.y += game.player1.paddleSpeed;
            }
          }

          if (data.player === 2) {
            if (data.direction === 'up' && game.player2.y > 0) {
              game.player2.y -= game.player2.paddleSpeed;
            } else if (data.direction === 'down' && game.player2.y + game.player2.paddleHeight < game.screenHeight) {
              game.player2.y += game.player2.paddleSpeed;
            }
          }

          if (!game.isGameOver) {
            game.update();
          }
          const updateMessage = JSON.stringify(
          {
            type: 'update',
            player1Y: game.player1.y,
            player2Y: game.player2.y,
            ballX: game.ball.x,
            ballY: game.ball.y
          });

          console.log("Sending update :", updateMessage);
          clients.forEach((client: ws.WebSocket) => {
            if (client.readyState === ws.OPEN) {
              client.send(updateMessage);
            }
          });

        }

      } catch (error) {
        console.log(chalk.red("Error processing message:", error));
      }
    });

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
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();






