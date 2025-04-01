import Fastify, { FastifyRequest } from "fastify";
import fastifyWebsocket from "@fastify/websocket";
import { WebSocket } from "ws";
import {
  isDefined,
  matchmakingTypeGuards,
  MatchMakingTypes,
  SharedTypes,
} from "transcendence";

const fastify = Fastify();

fastify.register(fastifyWebsocket);

type MatchMakingFastifyRequest = FastifyRequest<{
  Querystring: SharedTypes.ClientQueryParamMatchMaking;
}>;

let games: MatchMakingTypes.BasicGame[] = [];

const socketToClientId = new Map<WebSocket, string>();
const clientIdToSocket = new Map<string, WebSocket>();

// localhost:3000/ws?clientId=dklglsjkdg


fastify.register(async function (fastify) {
  fastify.get("/", { websocket: true }, (socket, req) => {
    registerClient(req as MatchMakingFastifyRequest, socket);
    sendMessageToOneClient(socket, {
      type: "updateGames",
      data: games,
    });
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
      console.log(
        "WebSocket closed. Client ID: ",
        socketToClientId.get(socket)
      );
      closeGamesOpenedByClient(socket);
      unregisterClient(socket);
    });

    socket.on("error", (err) => {
      console.error("WebSocket error:", err);
    });
  });
});

function registerClient(req: MatchMakingFastifyRequest, socket: WebSocket) {
  const clientId = getClientIdFromQueryParam(req as MatchMakingFastifyRequest);
  socketToClientId.set(socket, clientId);
  clientIdToSocket.set(clientId, socket);
  console.log(" ~ Client connected: ", clientId);
}

function unregisterClient(socket: WebSocket) {
  const clientId = socketToClientId.get(socket) as string;
  socketToClientId.delete(socket);
  clientIdToSocket.delete(clientId);
  console.log(" ~ Client disconnected: ", clientId);
}

function closeGamesOpenedByClient(socket: WebSocket) {
  const clientId = socketToClientId.get(socket) as string;
  const gameOfClient = games.find((match) => match.hostId === clientId);
  if (isDefined(gameOfClient)) {
    handleClientDeleteGame({
      type: "deleteGame",
      data: gameOfClient,
    });
  }
}


function getClientIdFromQueryParam(req: MatchMakingFastifyRequest) {
  if (req?.query?.clientId) return req.query.clientId;
  const msg =
    "Client didn't provide their id in query string when connecting to websocket!";
  console.log(msg);
  throw new Error(msg);
}

function handleClientLeaveGame(dataJson: MatchMakingTypes.ClientLeaveGame) {
  console.log(" ~ leaveGame", dataJson.data.matchId);
  removeGameFromServerGameList(dataJson.data);
  sendMessageToAllClients({ type: "leaveGame", data: dataJson.data });
}

function handleClientCreateGame(dataJson: MatchMakingTypes.ClientCreateGame) {
  console.log(" ~ createGame", dataJson.data.matchId);
  games.push(dataJson.data);
  sendMessageToAllClients({ type: "createGame", data: dataJson.data });
}

function handleClientJoinGame(dataJson: MatchMakingTypes.ClientJoinGame) {
  console.log(" ~ joinGame", dataJson.data.matchId);
  const correspondingGame = games.find(
    (game) => game.matchId === dataJson.data.matchId
  );
  if (!correspondingGame) {
    throw new Error("Client tried to join game, that didn't exist!");
  } else if (!isDefined(correspondingGame.oponentId)) {
    correspondingGame.oponentId = dataJson.data.oponentId;
  } else {
    throw new Error("Client tried to join game, thats already full!");
  }
  const participants = [
    correspondingGame.hostId,
    correspondingGame.oponentId as string,
  ];
  sendMessageToManyClients(participants, {
    type: "startGame",
    data: correspondingGame as MatchMakingTypes.BasicGameFull,
  });
  sendMessageToAllClientsBut(participants, {
    type: "updateOneGame",
    data: correspondingGame,
  });
}

function handleClientDeleteGame(dataJson: MatchMakingTypes.ClientDeleteGame) {
  console.log(" ~ deleteGame", dataJson.data.matchId);
  removeGameFromServerGameList(dataJson.data);
  sendMessageToAllClients({ type: "deleteGame", data: dataJson.data });
}

function sendMessageToAllClients(
  message: MatchMakingTypes.AllMatchMakingMessageTypes
) {
  fastify.websocketServer.clients.forEach((client) => {
    client.send(JSON.stringify(message));
  });
}

function sendMessageToAllClientsBut(
  excludeClients: string[],
  message: MatchMakingTypes.AllMatchMakingMessageTypes
) {
  fastify.websocketServer.clients.forEach((client) => {
    if (!excludeClients.includes(socketToClientId.get(client) as string))
      client.send(JSON.stringify(message));
  });
}

function sendMessageToManyClients(
  sentToClients: string[],
  message: MatchMakingTypes.AllMatchMakingMessageTypes
) {
  fastify.websocketServer.clients.forEach((client) => {
    if (sentToClients.includes(socketToClientId.get(client) as string))
      client.send(JSON.stringify(message));
  });
}

function sendMessageToOneClient(
  clientIdOrSocket: string | WebSocket,
  message: MatchMakingTypes.AllMatchMakingMessageTypes
) {
  const socket =
    typeof clientIdOrSocket !== "string"
      ? clientIdOrSocket
      : (clientIdToSocket.get(clientIdOrSocket) as WebSocket);
  socket.send(JSON.stringify(message));
}

function removeGameFromServerGameList(game: MatchMakingTypes.BasicGame)
{
  games = games.filter((g) => g.matchId !== game.matchId);
}

fastify.listen({ port: 3000, host: "0.0.0.0" }, (err) => {
  if (err) {
    console.log("Server Error!");
    fastify.log.error(err);
    process.exit(1);
  }
  console.log("Server listening on http://localhost:3000/");
});
