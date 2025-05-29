"use strict";

import { Game } from "./Game.js";
import { Player } from './player.js';
import { gameSettings } from 'transcendence';
import Fastify from "fastify";
import path from "path";
import fastifyStatic from "@fastify/static";
import cors from "@fastify/cors";
import { WebSocket } from "ws";
import ws from "ws";
// import { v4 as uuidv4 } from 'uuid';
import chalk from "chalk";
import {
  gameServiceTypeGuards,
  GameServiceTypes,
  MatchMakingTypes,
  transNetworkSettings,
} from "transcendence";
import fastifyWebsocket from "@fastify/websocket";
import { request } from "http";
import { json } from "stream/consumers";

type ReadyClient = {
  hostIdReady: boolean;
  oponentIdReady: boolean,
  sockets: Map<string, WebSocket>
};

const fastify = Fastify({ logger: true });
const games = new Map<string, Game>();
const clients = new Map();
const clientsGames = new Map<string, string>(); //clientId -> matchId
const readyClients = new Map<string, ReadyClient>();

// Add health check endpoint for Docker
fastify.get('/health', async () => {
  return { status: 'ok' };
});

//debuging after auth
fastify.options('/api/auth/verify-jwt', (request, reply) => {
  reply
    .header('Access-Control-Allow-Origin', '*')
    .header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    .header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    .send();
});

fastify.register(fastifyWebsocket);

export function sendMessage(

  socket: WebSocket,
  msg: GameServiceTypes.AllGameServiceMessageTypes
): void {
  socket.send(JSON.stringify(msg));
}

fastify.get("/api/routes", async (request, reply) => {
  const routes = fastify
    .printRoutes();
  reply.type("text/plain").send(routes);
});

fastify.post("/api/game/init", async (request, reply) => {
  const message = JSON.stringify(request.body, null, 2);
   console.log(chalk.cyan.bold("=== Incoming Game Start Request ==="));
  console.log(chalk.cyan.bold(message));

  const { typeOfGame, hostId, oponentId, matchId } =
    request.body as GameServiceTypes.StaticGameProperties;

  const validGameTypes = ["localPvP", "localPvAi", "remote"] as const;
  if (!validGameTypes.includes(typeOfGame)) {
    console.error(chalk.red(`Invalid game type: "${typeOfGame}"`));
    return reply.status(400).send({
      error: `Invalid typeOfGame "${typeOfGame}". Must be one of: ${validGameTypes.join(", ")}`,
    });
  }
  console.log(chalk.yellow.bold(` typeOfGame: ${typeOfGame}`));
  console.log(chalk.yellow(` matchId: ${matchId}, hostId: ${hostId}, opponentId: ${oponentId}`));

  const game = new Game(typeOfGame, matchId, hostId, oponentId);
  games.set(matchId, game);

  clientsGames.set(hostId, matchId);
  clientsGames.set(oponentId, matchId);

  reply.send({ message: "Game started!", matchId });

});

fastify.post("/api/game/start", async (request, reply) => {
  const message = JSON.stringify(request.body, null, 2);
  console.log(chalk.cyan.bold(message));

  const { typeOfGame, hostId, oponentId, matchId } =
    request.body as GameServiceTypes.StaticGameProperties;

  const game = new Game(typeOfGame, matchId, hostId, oponentId);
  games.set(matchId, game);

  clientsGames.set(hostId, matchId);
  clientsGames.set(oponentId, matchId);
  reply.send({ message: "Game started!", matchId });

});

fastify.get("/api/game/state/:matchId", async (request, reply) => {
  const { matchId } = request.params as { matchId: string };

  const game = games.get(matchId);

  if (!game) {
    return reply.status(404).send({ error: "Game not found" });
  }

  reply.send({
    matchId,
    typeOfGame: game.typeOfGame,
    player1: {
      id: game.player1.id,
      score: game.player1.score,
      paddle: game.player1.y,
    },
    player2: {
      id: game.player2.id,
      score: game.player2.score,
      paddle: game.player2.y,
    },
    isGameOver: game.isGameOver,
  });
});




fastify.get("/api/game/active", async (request, reply) => {
  const activeGames = [];

  for (const [matchId, game] of games.entries()) {
    if (!game.isGameOver) {
      activeGames.push({
        matchId,
        type: game.typeOfGame,
        players: {
          host: game.player1?.id ?? "unknown",
          opponent: game.player2?.id ?? "unknown"
        },
        status: "active"
      });
    }
  }

  const response = {
    count: activeGames.length,
    activeGames
  };

  reply
    .header('Content-Type', 'application/json; charset=utf-8')
    .send(JSON.stringify(response, null, 2));
});


fastify.post("/api/game/leave", async (request, reply) => {
  const message = JSON.stringify(request.body, null, 2);
  console.log(chalk.cyan.bold("=== Game Leave Request ==="))
  console.log(chalk.cyan(message));
  const { matchId, clientId } = request.body as GameServiceTypes.APIClientLeave;
  const game = games.get(matchId);

  if (!game) return reply.status(404).send({ error: "Game not found" });
  const isHost = game.player1?.id === clientId;
  const isOpponent = game.player2?.id === clientId;

  if (!isHost && !isOpponent) {
    return reply.status(403).send({
      error: `Client ${clientId} is not a player in match ${matchId}`,
    });
  }

  game.stopGame("playerLeftGame");
  games.delete(matchId);

  reply.send({ message: `Player ${clientId} left game ${matchId}` });
});

/*Not TESTED
Add borders tests
restrict to local and remote */
fastify.post("/api/game/paddle", async (request, reply) => {
  const { matchId, player, newY } = request.body as GameServiceTypes.APIPaddle;

  const game = games.get(matchId);
  if (!game) return reply.status(404).send({ error: "Game not found" });

  let data: GameServiceTypes.DataClientUpdatePaddlePosition;

  if (player === 1) {
    data = {
      matchId,
      player1: { playerId: "", paddleY: newY, paddleSpeed: 0 },
      player2: null,
    };
  } else if (player === 2) {
    data = {
      matchId,
      player1: { playerId: "", paddleY: 0, paddleSpeed: 0 },
      player2: { playerId: "", paddleY: newY, paddleSpeed: 0 },
    };
  } else {
    return reply.status(400).send({ error: "Invalid player number" });
  }

  game.updatePaddlePositionRestAPI(data, player);

  reply.send({ message: "Paddle position updated" });
});


fastify.register(async function (fastify) {
  fastify.get(
    "/ws",
    { websocket: true },
    (socket /* WebSocket */, req /* FastifyRequest */) => {
      const urlParams = new URLSearchParams(req.url.split("?")[1]);
      //console.log(req?.query);
      const clientId = urlParams.get("clientId") || "anonymous";
      console.log(chalk.green(`A client with ID: ${clientId} connected via WebSocket`));
      clients.set(clientId, socket);

      /*------------------------------------------------------------*/
      socket.on("message", (message) => {
        const data = message.toString("utf-8");
        const dataJson = JSON.parse(data);

        console.log("Received message:", dataJson);

        const current_game = games.get(dataJson.data.matchId);

        if (!current_game) {
          console.log("Error or game not created")
        }
        else if (current_game.typeOfGame == "remote") {
          const hostId = current_game.player1.id;
          const oponentId = current_game.player2.id;

          const { matchId } = dataJson.data;

          const clientId = urlParams.get("clientId");
          console.log(chalk.yellow(`Handling remote game for matchId: ${matchId}`));
          console.log(chalk.yellow(`Initializing match with hostId: ${hostId}, oponentId: ${oponentId}`));
          console.log(chalk.yellow(`Client ${clientId} connected to match ${matchId}`));

          if (!readyClients.has(matchId)) {
            const newReadyClient: ReadyClient = {
              hostIdReady: false,
              oponentIdReady: false,
              sockets: new Map<string, WebSocket>()
            };
            readyClients.set(matchId, newReadyClient);
            current_game.remoteWebsockets = newReadyClient.sockets;
          }

          const match = readyClients.get(matchId) as ReadyClient;
          console.log(`Current match status: hostIdReady: ${match.hostIdReady}, oponentIdReady: ${match.oponentIdReady}`);


          if (gameServiceTypeGuards.isClientIsReady(dataJson)) {

            console.log(chalk.green(`${clientId} is ready`));
            match.sockets.set(dataJson.data.clientId, socket);



            if (clientId === hostId) {
              match.hostIdReady = true;
              console.log(chalk.yellow(`${hostId} is marked as ready`));
              current_game.websocketplayer1 = socket;
            } else if (clientId === oponentId) {
              match.oponentIdReady = true;
              current_game.websocketplayer2 = socket;
              console.log(chalk.yellow(`${oponentId} is marked as ready`));
            }

            if (current_game.isGameOver === false) {
              console.log("Game already running!");
              return;
            }

            if (match.hostIdReady && match.oponentIdReady) {
              console.log(chalk.yellow(`Both players ready for match ${matchId}. Starting game...`));

              for (const [id, socket] of match.sockets.entries()) {
                sendMessage(socket, {
                  type: "serverGameStarted",
                  data: {
                    matchId: dataJson.data.matchId,
                  }
                });
              }
              games.get(dataJson.data.matchId)!.websocket = socket;
              games.get(dataJson.data.matchId)?.startGame();

              readyClients.delete(dataJson.data.matchId);
            }
          }

          if (gameServiceTypeGuards.isClientUpdatePaddlePosition(dataJson)) {
            games
              .get(dataJson.data.matchId)
              ?.updatePaddlePositionRemote(dataJson.data);
          }
        }
        else if (current_game.typeOfGame == "localPvP" || current_game.typeOfGame == "localPvAi" ) {
          if (gameServiceTypeGuards.isClientIsReady(dataJson)) {
            console.log(chalk.green(` ${clientId} is ready`));
            setTimeout(
              () =>
                sendMessage(socket, {
                  type: "serverGameStarted",
                  data: {
                    matchId: dataJson.data.matchId,
                  },
                }),
              1000
            )

            games.get(dataJson.data.matchId)!.websocket = socket;
            games.get(dataJson.data.matchId)?.startGame();
          }

          if (gameServiceTypeGuards.isClientUpdatePaddlePosition(dataJson)) {
            games
              .get(dataJson.data.matchId)
              ?.updatePaddlePosition(dataJson.data);
          }

        }

        /*Not sure*/
        if (gameServiceTypeGuards.isClientLeftGame(dataJson)) {
          const game = games.get(dataJson.data.matchId);
          game?.stopGame("playerLeftGame");
          // games.delete(dataJson.data.matchId);

        }
      });

      /*------------------------------------------------------------*/
      socket.on("close", () => {

        console.log(chalk.red(`A client with ID: ${clientId} disconnected`));

        const matchId = clientsGames.get(clientId);

        clients.delete(clientId);
        clientsGames.delete(clientId);

        if (matchId)
        {
          const game = games.get(matchId);
          if (!game || game.typeOfGame !== "remote")
            game?.stopGame("playerDisconnected");
          else
          {
              //const otherPlayerId = game.player1.id === clientId ? game.player2.id : game.player1.id;
                const player1Id = game.player1.id;
                //const player2Id = game.player2.id;

                let winner: Player, loser: Player;

                if (clientId === player1Id) {
                  winner = game.player2;
                  loser = game.player1;
                } else {
                  winner = game.player1;
                  loser = game.player2;
                }

                winner.score = gameSettings.maxScore;
                loser.score = 0;


                const socketWinner = (winner.id === player1Id)
                ? game.websocketplayer1 : game.websocketplayer2;

                if (socketWinner) {
                  sendMessage(socketWinner, {
                    type: "serverGameIsOver",
                    data: {
                      matchId: matchId,
                      player1: {
                        id: game.player1.id,
                        score: game.player1.score,
                      },
                      player2: {
                        id: game.player2.id,
                        score: game.player2.score,
                      },
                      reason: "playerDisconnected",
                    },
                  });
                }
              games.delete(matchId);

            }
          } // close fastify.on("close")
      }); //close fastify.get ws
    }
  );
});


fastify.get("/favicon.ico", async (request, reply) => {
  reply.status(200);
  //.send();
  reply.send({ message: "Game started!" });
});


const start = async () => {
  try {
    await fastify.listen({ port: transNetworkSettings.gamePlay.port, host: transNetworkSettings.gamePlay.ip });
    console.log(chalk.cyan.bold(`Server running on http://localhost:${transNetworkSettings.gamePlay.port}`));
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
