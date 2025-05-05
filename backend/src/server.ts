"use strict";

import { Game } from "./Game.js";
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



fastify.register(fastifyWebsocket);
fastify.register(cors, { origin: "*" });


export function sendMessage(

  socket: WebSocket,
  msg: GameServiceTypes.AllGameServiceMessageTypes
): void {
  socket.send(JSON.stringify(msg));
}


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

        // console.log("Current game:", current_game);


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
            //console.log(`Update current match status: hostIdReady: ${match.hostIdReady}, oponentIdReady: ${match.oponentIdReady}`);

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
        else if (current_game.typeOfGame == "localPvP") {
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


        if (matchId) {
          const game = games.get(matchId);
          game?.stopGame("playerDisconnected");
          if (game) {
            const otherPlayerId = game.player1.id === clientId ? game.player2.id : game.player1.id;

            //   if (clients.has(otherPlayerId)) {
            //sebd to other client that stayed that he won
            //   }
            games.delete(matchId);
          }
        }
      });

    });
}
);


fastify.get("/favicon.ico", async (request, reply) => {
  reply.status(200);
  //.send();
  reply.send({ message: "Game started!" });
});

const start = async () => {
  try {
    await fastify.listen({ port: transNetworkSettings.gameService.port, host: "0.0.0.0" });
    console.log(chalk.cyan.bold(`Server running on http://localhost:${transNetworkSettings.gameService.port}`));
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();


