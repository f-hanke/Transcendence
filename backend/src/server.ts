'use strict';

import { Game } from './Game';

import Fastify from "fastify";
import path from "path";
import fastifyStatic from '@fastify/static';
import cors from "@fastify/cors";
import websocket from "@fastify/websocket";
import chalk from "chalk"; //colors

import ws from 'ws';
import { GameServiceTypes } from 'transcendence';
import { send } from 'process';

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


function sendMessageToClient(socket: ws.WebSocket, msg: GameServiceTypes.AllGameServiceMessageTypes)
{
  socket.send(JSON.stringify(msg));
}

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


    clients.forEach((client: ws.WebSocket) => {
      if (client.readyState === ws.OPEN) {
        client.send(updateMessage);
      }
    });

    if (game.isGameOver) {
      const gameOverMessage = JSON.stringify({
        type: "serverGameIsOver",
        matchId: "some-match-id",
        player1: { id: "player1-id", score: game.player1.score },
        player2: { id: "player2-id", score: game.player2.score },
        reason: "normalMaxScoreReached",
      });

      // Envoi du message de fin de jeu aux clients
      clients.forEach((client: ws.WebSocket) => {
        if (client.readyState === ws.OPEN) {
          client.send(gameOverMessage);
        }
      });

      console.log("Game Over! Message sent to clients:", gameOverMessage);
      return; // Arrête le gameLoop
    }

    setTimeout(gameLoop, 1000 / 60); // 60 FPS
  }
};

/*API */

/*Route to start the game

Successfull answer :  {"message": "Game started!"}

*/
fastify.post('/api/game/start', async (request, reply) => {
  game.startGame();

  const startMessage = JSON.stringify({ type: "Game started!" });
  clients.forEach((client: ws.WebSocket) => {
    if (client.readyState === ws.OPEN) {
      client.send(startMessage);
      gameLoop();
    }
  });

  reply.send({ message: "Game started!" });
});

interface MoveRequestBody {
  player: number;
  direction: 'up' | 'down';
}

/*Route to move the paddles

 Player : 1 | 2
 direction : up | down

 succesfull answer:  "message": "Paddle moved successfully!"

 */
 fastify.post('/api/game/move', async (request, reply) => {
  const { player, direction } = request.body as MoveRequestBody;;

  if (player !== 1 && player !== 2) {
    return reply.status(400).send({ message: 'Invalid player ID. Must be 1 or 2.' });
  }
  if (direction !== 'up' && direction !== 'down') {
    return reply.status(400).send({ message: 'Invalid direction. Must be "up" or "down".' });
  }

  if (player === 1) {
    if (direction === 'up' && game.player1.y > 0) {
      game.player1.y -= game.player1.paddleSpeed;
    } else if (direction === 'down' && game.player1.y + game.player1.paddleHeight < game.screenHeight) {
      game.player1.y += game.player1.paddleSpeed;
    }
  }

  if (player === 2) {
    if (direction === 'up' && game.player2.y > 0) {
      game.player2.y -= game.player2.paddleSpeed;
    } else if (direction === 'down' && game.player2.y + game.player2.paddleHeight < game.screenHeight) {
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


  clients.forEach((client: ws.WebSocket) => {
    if (client.readyState === ws.OPEN) {
      client.send(updateMessage);
    }
  });

  reply.send({ message: 'Paddle moved successfully!' });
});



fastify.get('/api/game/state', async (request, reply) => {
  reply.send({
    player1Y: game.player1.y,
    player2Y: game.player2.y,
    ballX: game.ball.x,
    ballY: game.ball.y,
    score1: game.player1.score,
    score2: game.player2.score
  });
});


fastify.get('/api/game/score', async (request, reply) => {
  reply.send({
    score1: game.player1.score,
    score2: game.player2.score
  });
});


fastify.post('/api/game/stop', async (request, reply) => {
  game.isGameOver = true;
  reply.send({ message: "Game stopped!" });
});


fastify.post('/api/game/reset', async (request, reply) => {
  game.resetGame();
  reply.send({ message: "Game reset!" });
});



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
      /* If a game is on, need to end the game and send updates to the other client if remote */
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






