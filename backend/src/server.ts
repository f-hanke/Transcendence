"use strict";

import { Game } from "./Game.js";
import { Player } from "./player.js";
import { gameSettings } from "transcendence";

// Web server & utilities
import Fastify from "fastify";
import fastifyStatic from "@fastify/static";
import cors from "@fastify/cors";
import { WebSocket } from "ws";
import ws from "ws";
import fastifyWebsocket from "@fastify/websocket";

// Logging & monitoring
import chalk from "chalk";
import logger from "./lib/logger.js";
import { setupMetrics } from "./lib/metrics.js";

import {
  gameServiceTypeGuards,
  GameServiceTypes,
  MatchMakingTypes,
  transNetworkSettings,
} from "transcendence";

// Elasticsearch integration
import esClient, { checkElasticsearch } from "./lib/elasticsearch.js";
import { websocketIsReadyForSending } from "./utils.js";
import { monitoringEnabled } from "transcendence";

type ReadyClient = {
  hostIdReady: boolean;
  oponentIdReady: boolean;
  sockets: Map<string, WebSocket>;
};

const fastify = Fastify({ logger: true });

const games = new Map<string, Game>(); // matchId → Game instance
const clients = new Map(); // clientId → WebSocket
const clientsGames = new Map<string, string>(); //clientId -> matchId
const readyClients = new Map<string, ReadyClient>(); // matchId → ReadyClient

// if (monitoringEnabled) {
//   setupMetrics(fastify);
//   //keep commented out unless docker is running requires elsasticsearch to be running
//   await checkElasticsearch();
//   logger.info("Metrics and logger initialized.");
// }

//health check endpoint for Docker
fastify.get("/health", async () => {
  return { status: "ok" };
});

// Temporary OPTIONS route for verifying JWT auth during development
fastify.options("/api/auth/verify-jwt", (request, reply) => {
  reply
    .header("Access-Control-Allow-Origin", "*")
    .header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
    .header("Access-Control-Allow-Headers", "Content-Type, Authorization")
    .send();
});

fastify.register(fastifyWebsocket);

export function sendMessage(
  socket: WebSocket | null,
  msg: GameServiceTypes.AllGameServiceMessageTypes
): void {
  // added by Steffen check that websocket is ready before writing to it
  if (websocketIsReadyForSending(socket)) socket.send(JSON.stringify(msg));
}

// Game REST API Endpoints
/* ---------------------------------------------------------------------------------------------- */
fastify.get("/api/routes", async (request, reply) => {
  const routes = fastify.printRoutes();
  reply.type("text/plain").send(routes);
});

fastify.post("/api/game/init", async (request, reply) => {
  const message = JSON.stringify(request.body, null, 2);
  logger.info(chalk.cyan.bold("=== Incoming Game init Request ==="));
  logger.info(chalk.cyan.bold(message));

  const { typeOfGame, hostId, oponentId, matchId } =
    request.body as GameServiceTypes.StaticGameProperties;

  const validGameTypes = ["localPvP", "localPvAi", "remote"] as const;
  if (!validGameTypes.includes(typeOfGame)) {
    console.error(chalk.red(`Invalid game type: "${typeOfGame}"`));
    return reply.status(400).send({
      error: `Invalid typeOfGame "${typeOfGame}". Must be one of: ${validGameTypes.join(
        ", "
      )}`,
    });
  }
  logger.info(chalk.yellow.bold(` typeOfGame: ${typeOfGame}`));
  logger.info(
    chalk.yellow(
      ` matchId: ${matchId}, hostId: ${hostId}, opponentId: ${oponentId}`
    )
  );

  const game = new Game(typeOfGame, matchId, hostId, oponentId);
  games.set(matchId, game);

  clientsGames.set(hostId, matchId);
  clientsGames.set(oponentId, matchId);

  reply.send({ message: "Game started!", matchId });
});

fastify.post("/api/game/start", async (request, reply) => {
  const message = JSON.stringify(request.body, null, 2);
  logger.info(chalk.cyan.bold("=== Incoming Game start Request ==="));
  logger.info(chalk.cyan.bold(message));

  const { typeOfGame, hostId, oponentId, matchId } =
    request.body as GameServiceTypes.StaticGameProperties;

  const game = new Game(typeOfGame, matchId, hostId, oponentId);
  games.set(matchId, game);

  clientsGames.set(hostId, matchId);
  clientsGames.set(oponentId, matchId);
  reply.send({ message: "Game started!", matchId });
});

// Returns current game state for given matchId
// Includes player positions, scores, and game over status
fastify.get("/api/game/state/:matchId", async (request, reply) => {
  const { matchId } = request.params as { matchId: string };

  logger.info(chalk.cyan.bold("=== Incoming state match Request ==="));
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

// Lists all currently active games
fastify.get("/api/game/active", async (request, reply) => {
  const activeGames = [];
  logger.info(chalk.cyan.bold("=== Incoming active games Request ==="));

  for (const [matchId, game] of games.entries()) {
    if (!game.isGameOver) {
      activeGames.push({
        matchId,
        type: game.typeOfGame,
        players: {
          host: game.player1?.id ?? "unknown",
          opponent: game.player2?.id ?? "unknown",
        },
        status: "active",
      });
    }
  }

  const response = {
    count: activeGames.length,
    activeGames,
  };

  reply
    .header("Content-Type", "application/json; charset=utf-8")
    .send(JSON.stringify(response, null, 2));
});

fastify.post("/api/game/leave", async (request, reply) => {
  const message = JSON.stringify(request.body, null, 2);
  logger.info(chalk.cyan.bold("=== Incoming leave game Request ==="));
  logger.info(chalk.cyan(message));
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

  game.stopGame("playerLeftGame", clientId);
  games.delete(matchId);

  reply.send({ message: `Player ${clientId} left game ${matchId}` });
});

fastify.post("/api/game/paddle", async (request, reply) => {
  const { matchId, player, newY } = request.body as GameServiceTypes.APIPaddle;

  logger.info(chalk.cyan.bold("=== Incoming move paddle Request ==="));

  const game = games.get(matchId);
  if (!game) return reply.status(404).send({ error: "Game not found" });

  if (game.typeOfGame !== "localPvP" && game.typeOfGame !== "localPvAi") {
    return reply.status(403).send({
      error: "Paddle control is only allowed in localPvP or localPvAi games.",
    });
  }

  const clampedY = Math.max(
    gameSettings.paddleMinY,
    Math.min(newY, gameSettings.paddleMaxY)
  );

  let data: GameServiceTypes.DataClientUpdatePaddlePosition;

  if (player === 1) {
    data = {
      matchId,
      player1: { playerId: "", paddleY: clampedY, paddleSpeed: 0 },
      player2: null,
    };
    reply.status(200).send({ msg: "Updated Player 1 Pos" });
  } else if (player === 2) {
    data = {
      matchId,
      player1: { playerId: "", paddleY: 0, paddleSpeed: 0 },
      player2: { playerId: "", paddleY: clampedY, paddleSpeed: 0 },
    };
    reply.status(200).send({ msg: "Updated Player 2 Pos" });
  } else {
    return reply.status(400).send({ error: "Invalid player number" });
  }

  game.updatePaddlePositionRestAPI(data, player);

  reply.send({ message: "Paddle position updated" });
});

//WebSocket Route
/* ---------------------------------------------------------------------------------------------- */

// Main WebSocket entry point for real-time gameplay communication
// Handles readiness, paddle updates, and player disconnections
fastify.register(async function (fastify) {
  fastify.get(
    "/ws",
    { websocket: true },
    (socket /* WebSocket */, req /* FastifyRequest */) => {
      const urlParams = new URLSearchParams(req.url.split("?")[1]);
      //logger.info(req?.query);
      const clientId = urlParams.get("clientId") || "anonymous";
      logger.info(
        chalk.green(`A client with ID: ${clientId} connected via WebSocket`)
      );
      clients.set(clientId, socket);

      socket.on("message", (message) => {
        const data = message.toString("utf-8");
        const dataJson = JSON.parse(data);

        //logger.info("Received message:", dataJson);

        const current_game = games.get(dataJson.data.matchId);

        if (!current_game) {
          logger.info("Error or game not created");
        } else if (current_game.typeOfGame == "remote") {
          const hostId = current_game.player1.id;
          const oponentId = current_game.player2.id;

          const { matchId } = dataJson.data;

          const clientId = urlParams.get("clientId");

          // logger.info(chalk.yellow(`Handling remote game for matchId: ${matchId}`));
          // logger.info(chalk.yellow(`Initializing match with hostId: ${hostId}, oponentId: ${oponentId}`));
          // logger.info(chalk.yellow(`Client ${clientId} connected to match ${matchId}`));

          if (!readyClients.has(matchId)) {
            const newReadyClient: ReadyClient = {
              hostIdReady: false,
              oponentIdReady: false,
              sockets: new Map<string, WebSocket>(),
            };
            readyClients.set(matchId, newReadyClient);
            current_game.remoteWebsockets = newReadyClient.sockets;
          }

          const match = readyClients.get(matchId) as ReadyClient;

          logger.info(
            `Current match status: hostIdReady: ${match.hostIdReady}, oponentIdReady: ${match.oponentIdReady}`
          );

          if (gameServiceTypeGuards.isClientIsReady(dataJson)) {
            logger.info(chalk.green(`${clientId} is ready`));
            match.sockets.set(dataJson.data.clientId, socket);

            if (clientId === hostId) {
              match.hostIdReady = true;
              logger.info(chalk.yellow(`${hostId} is marked as ready`));
              current_game.websocketplayer1 = socket;
            } else if (clientId === oponentId) {
              match.oponentIdReady = true;
              current_game.websocketplayer2 = socket;
              logger.info(chalk.yellow(`${oponentId} is marked as ready`));
            }

            if (current_game.isGameOver === false) {
              logger.info("Game already running!");
              return;
            }

            if (match.hostIdReady && match.oponentIdReady) {
              logger.info(
                chalk.yellow(
                  `Both players ready for match ${matchId}. Starting game...`
                )
              );

              for (const [id, socket] of match.sockets.entries()) {
                sendMessage(socket, {
                  type: "serverGameStarted",
                  data: {
                    matchId: dataJson.data.matchId,
                  },
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
        } else if (
          current_game.typeOfGame == "localPvP" ||
          current_game.typeOfGame == "localPvAi"
        ) {
          if (gameServiceTypeGuards.isClientIsReady(dataJson)) {
            logger.info(chalk.green(` ${clientId} is ready`));
            setTimeout(
              () =>
                sendMessage(socket, {
                  type: "serverGameStarted",
                  data: {
                    matchId: dataJson.data.matchId,
                  },
                }),
              1000
            );

            games.get(dataJson.data.matchId)!.websocket = socket;
            games.get(dataJson.data.matchId)?.startGame();
          }

          if (gameServiceTypeGuards.isClientUpdatePaddlePosition(dataJson)) {
            games
              .get(dataJson.data.matchId)
              ?.updatePaddlePosition(dataJson.data);
          }
        }

        if (gameServiceTypeGuards.isClientLeftGame(dataJson)) {
          const game = games.get(dataJson.data.matchId);

          game?.stopGame("playerLeftGame", dataJson.data.playerId);

        }

      if (gameServiceTypeGuards.isClientLeftGameBeforeStart(dataJson)) {
            logger.info( chalk.cyan.bold(
        "isClientLeftGameBeforeStart received"));
        const game = games.get(dataJson.data.matchId);

        if (game?.typeOfGame === "remote") {
          const matchId = dataJson.data.matchId;
          const match = readyClients.get(matchId);
          logger.info( chalk.cyan.bold("Game is def remote"));
          if (match) {
            logger.info( chalk.cyan.bold("Match exists"));
            const player1Id = game.player1.id;
            const player2Id = game.player2.id;
            let socketRemainClient: WebSocket | null = null;


            if (clientId === player1Id) {
              socketRemainClient = clients.get(player2Id);
              logger.info( chalk.cyan.bold("Player1 left"));
            } else {
              socketRemainClient = clients.get(player1Id);

            }

            match.hostIdReady = false;
            match.oponentIdReady = false;

            logger.info( chalk.cyan.bold("before sending to the remaining client"));
            if (socketRemainClient) {
              logger.info( chalk.cyan.bold("Sending to frontend"));
              sendMessage(socketRemainClient, {
                type: "clientLeftGameBeforeStart",
                data: {
                  matchId,
                  playerId: dataJson.data.playerId,
                },
              });
            }

            game.cancelGame();
            readyClients.delete(matchId);
            games.delete(matchId);

            logger.info(
              chalk.red(
                `Player ${dataJson.data.playerId} left match ${matchId} before start. Match deleted.`
              )
            );
          }
        }
      }
      });

      /*------------------------------------------------------------*/
      socket.on("close", () => {
        logger.info(chalk.red(`A client with ID: ${clientId} disconnected`));

        const matchId = clientsGames.get(clientId);

        clients.delete(clientId);
        clientsGames.delete(clientId);

        if (matchId) {
          const game = games.get(matchId);
          if (!game || game.typeOfGame !== "remote")
            game?.stopGame("playerDisconnected", clientId);
          else {
            const player1Id = game.player1.id;
            //const player2Id = game.player2.id;

            let socketWinner: null | WebSocket = null;

            // player 1 left
            if (clientId === player1Id) {
              socketWinner = game.websocketplayer2;
              game.player2.score = gameSettings.maxScore;
              game.player1.score = 0;
              // player 2 left
            } else {
              socketWinner = game.websocketplayer1;
              game.player1.score = gameSettings.maxScore;
              game.player2.score = 0;
            }
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

            game?.updateScore(game.player1.score, game.player2.score);
            game?.stopGame("playerDisconnected", clientId);
            games.delete(matchId);
          }
        }
      });
    }
  );
});

fastify.get("/favicon.ico", async (request, reply) => {
  reply.status(200);
  reply.send({ message: "Game started!" });
});

const start = async () => {
  try {
    await fastify.listen({
      port: transNetworkSettings.gamePlay.port,
      host: transNetworkSettings.gamePlay.ip,
    });
    logger.info(
      chalk.cyan.bold(
        `Server running on http://localhost:${transNetworkSettings.gamePlay.port}`
      )
    );
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
