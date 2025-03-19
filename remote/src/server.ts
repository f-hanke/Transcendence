import Fastify, { FastifyRequest } from "fastify";
import fastifyWebsocket from "@fastify/websocket";
import { WebSocket } from "ws";
import {
  isDefined,
  matchmakingTypeGuards,
  MatchMakingTypes,
} from "transcendence";

const fastify = Fastify();

fastify.register(fastifyWebsocket);

type MatchMakingFastifyRequest = FastifyRequest<{ Querystring: MatchMakingTypes.ClientQueryParamMatchMaking }>;

let games: MatchMakingTypes.BasicGame[] = [];

const socketToClientId = new Map<WebSocket, string>();

fastify.register(async function (fastify) {
  fastify.get("/", { websocket: true }, (socket, req) => {
    registerClient(req as MatchMakingFastifyRequest, socket);
    sendMessageToClients({ type: "updateGames", data: games });
    socket.on("message", (message) => {
      const data = message.toString("utf-8");
      const dataJson = JSON.parse(data);
      if (matchmakingTypeGuards.isClientLeaveGame(dataJson)) {
        handleClientLeaveGame(dataJson);
      } else if (matchmakingTypeGuards.isClientCreateGame(dataJson)) {
        handleClientCreateGame(dataJson);
      } else if (matchmakingTypeGuards.isClientJoinGame(dataJson)) {
        handleClientJoinGame(dataJson);
      } else if (matchmakingTypeGuards.isClientDeleteGame(dataJson)) {
        handleClientDeleteGame(dataJson);
      } else {
        throw new Error(
          "Matchmaking server received unknown message from client!"
        );
      }
    });
    socket.on("close", () => {
      unregisterClient(socket);
    });
  });
});

fastify.listen({ port: 3000, host: "0.0.0.0" }, (err) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  console.log("Server listening on http://localhost:3000/index.html");
});

function registerClient(req: MatchMakingFastifyRequest, socket: WebSocket) {
  const clientId = getClientIdFromQueryParam(req as MatchMakingFastifyRequest);
  socketToClientId.set(socket, clientId);
  console.log(" ~ Client connected: ", clientId);
}

function unregisterClient(socket: WebSocket) {
  const clientId = socketToClientId.get(socket) as string;
  socketToClientId.delete(socket);
  console.log(" ~ Client disconnected: ", clientId);
}

function getClientIdFromQueryParam(req: MatchMakingFastifyRequest) {
  if (req?.query?.clientId) return req.query.clientId;
  throw new Error(
    "Client didn't provide their id in query string when connecting to websocket!"
  );
}

function handleClientLeaveGame(dataJson: MatchMakingTypes.ClientLeaveGame) {
  console.log(" ~ leaveGame", dataJson.data.matchId);
  games = games.filter((g) => g.matchId !== dataJson.data.matchId);
  sendMessageToClients({ type: "leaveGame", data: dataJson.data });
}

function handleClientCreateGame(dataJson: MatchMakingTypes.ClientCreateGame) {
  console.log(" ~ createGame", dataJson.data.matchId);
  games.push(dataJson.data);
  sendMessageToClients({ type: "createGame", data: dataJson.data });
}

function handleClientJoinGame(dataJson: MatchMakingTypes.ClientJoinGame) {
  console.log(" ~ joinGame", dataJson.data.matchId);
  const correspondingGame = games.find(
    (game) => game.matchId === dataJson.data.matchId
  );
  if (!correspondingGame) {
    games.push(dataJson.data);
  } else if (!isDefined(correspondingGame.oponentId)) {
    correspondingGame.oponentId = dataJson.data.oponentId;
  } else {
    throw new Error("Client tried to join game, thats already full!");
  }
  sendMessageToClients({ type: "joinGame", data: dataJson.data });
}

function handleClientDeleteGame(dataJson: MatchMakingTypes.ClientDeleteGame) {
  console.log(" ~ deleteGame", dataJson.data.matchId);
  games = games.filter((g) => g.matchId !== dataJson.data.matchId);
  sendMessageToClients({ type: "deleteGame", data: dataJson.data });
}

function sendMessageToClients(
  message: MatchMakingTypes.AllMatchMakingMessageTypes
) {
  fastify.websocketServer.clients.forEach((client) => {
    client.send(JSON.stringify(message));
  });
}
