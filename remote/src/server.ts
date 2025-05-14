import Fastify, { FastifyRequest } from "fastify";
import fastifyWebsocket from "@fastify/websocket";
import { WebSocket } from "ws";
import {
  isDefined,
  matchmakingTypeGuards,
  MatchMakingTypes,
  SharedTypes,
  transNetworkSettings,
} from "transcendence";

import { Tournament } from "./orm/tournament.js";
import { utils } from "./utils/ranking.js";

const fastify = Fastify();

fastify.register(fastifyWebsocket);

// Add health check endpoint for Docker
fastify.get('/health', async () => {
  return { status: 'ok' };
});

type MatchMakingFastifyRequest = FastifyRequest<{
  Querystring: SharedTypes.ClientQueryParamMatchMaking;
}>;

let games: MatchMakingTypes.BasicGame[] = [];
let tournaments: MatchMakingTypes.Tournament[] = await Tournament.findAll() as MatchMakingTypes.Tournament[];  // load up any unfinished

const socketToClientId = new Map<WebSocket, string>();
const clientIdToSocket = new Map<string, WebSocket>();

fastify.register(async function (fastify) {
  
  // API endpoint
  fastify.get<{
    Params: { playerId: string };
    Returns: {
      200: MatchMakingTypes.TournamentWithRanking | null;
      500: { error: string };
    }
  }>("/matchmaking/playertournament/:playerId", async (req, reply) => {
    const playerId = req.params.playerId as string;
    try {
      const tournamentId: MatchMakingTypes.TournamentId | null = await Tournament.getPlayerTournamentId(playerId) as MatchMakingTypes.TournamentId | null;
      if (!tournamentId) {
        return reply.status(200).send(null);
      }
      const tournament = await Tournament.findById(tournamentId.tournamentId.toString()) as MatchMakingTypes.TournamentWithMatches;
      return reply.status(200).send(utils.deriveTournamentWithRanking(tournament));
      
    } catch (err) {
      console.error("Error fetching tournament:", err);
      return reply.status(500).send({ error: "Internal server error" });
    }
  });


  // websocket
  fastify.get("/", { websocket: true }, (socket, req) => {
    registerClient(req as MatchMakingFastifyRequest, socket);
    sendMessageToOneClient(socket, {
      type: "updateGames",
      data: {
        basicGames: games,
        tournaments: tournaments
      }

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
      } else if (matchmakingTypeGuards.isClientCreateTournament(dataJson)) {
        handleClientCreateTournament(dataJson);
      } else if (matchmakingTypeGuards.isClientJoinTournament(dataJson)) {
        handleClientJoinTournament(dataJson);
      } else if (matchmakingTypeGuards.isClientLeaveTournament(dataJson)) {
        handleClientLeaveTournament(dataJson);
      } else if (matchmakingTypeGuards.isClientDeleteTournament(dataJson)) {
        handleClientDeleteTournament(dataJson);
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
  // to do for Milos
  // here, only remove game, if its not a tournament game
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


async function handleClientCreateTournament(dataJson: MatchMakingTypes.ClientCreateTournament) {
  try {
    const newTournamentId = await Tournament.create(dataJson.data.playerId) as string;
    console.log(" ~ createTournament", newTournamentId);
    const newTournament: MatchMakingTypes.TournamentWithMatches = {
      tournamentId: newTournamentId,
      player1Id: dataJson.data.playerId, player2Id: null, player3Id: null, player4Id: null,
      matches: [], matchResults: []
    };
    tournaments.push(newTournament);
    sendMessageToAllClients({ type: "updateOneTournament", data: newTournament });
  } catch (err) {
    console.error("Error creating tournament:", err);
    throw new Error("Failed to create tournament");
  }
}

async function handleClientJoinTournament(dataJson: MatchMakingTypes.ClientJoinTournament) {
  
  const correspondingTournament = tournaments.find((tournament) => tournament.tournamentId === dataJson.data.tournamentId) as MatchMakingTypes.TournamentWithMatches || null;
  if (!correspondingTournament)
    throw new Error("Client tried to join a tournament that didn't exist!");
  try {
    const playerPosition: MatchMakingTypes.PlayerKey = await Tournament.addPlayer(dataJson.data.tournamentId, dataJson.data.playerId) as MatchMakingTypes.PlayerKey;
    correspondingTournament[playerPosition] = dataJson.data.playerId as string;
    console.log(" ~ joinTournament", dataJson.data.tournamentId);
    sendMessageToAllClients({ type: "updateOneTournament", data: correspondingTournament });
  } catch (err) {
    console.error("Error adding player to tournament:", err);
    throw new Error("Failed to add player to tournament");
  }

  // startTournament logic INDEED when lobby full
  if (correspondingTournament.player1Id && correspondingTournament.player2Id && correspondingTournament.player3Id && correspondingTournament.player4Id) {
    const participants = [
      correspondingTournament.player1Id as string,
      correspondingTournament.player2Id as string,
      correspondingTournament.player3Id as string,
      correspondingTournament.player4Id as string,
    ];

    let offset = 0;
    for (let i = 0; i < 6; i++) {
      if (i === 4) {
        offset = 1;
      }
      try {
        const newMatchId = await Tournament.scheduleMatch(
          correspondingTournament.tournamentId as string,
          (i + 1).toString(),                     // matchNr (1-6)
          (i % 4 + 1).toString(),                 // match playerNr1
          ((i + 1 + offset) % 4 + 1).toString()   // match playerNr2
        );
        const newMatch: MatchMakingTypes.BasicGame = {
          matchId: newMatchId,
          hostId: correspondingTournament[`player${(i % 4 + 1)}Id` as MatchMakingTypes.PlayerKey] as string,
          oponentId: correspondingTournament[`player${(i + 1 + offset) % 4 + 1}Id` as MatchMakingTypes.PlayerKey] as string,
          tournamentId: correspondingTournament.tournamentId as string,
          type: "tournament",
          invitedPlayerId: null,  // ??? needed?
        };
        // type MatchKey = keyof Pick<MatchMakingTypes.Tournament, 'match1' | 'match2' | 'match3' | 'match4' | 'match5' | 'match6'>;
        // const key = `match${i + 1}` as MatchKey;
        // correspondingTournament[key] = newMatch;  // match1-6
        correspondingTournament.matches.push(newMatch);
        games.push(newMatch);  // add to server game list => needed???
      } catch (err) {
        console.error("Error scheduling match:", err);
        throw new Error("Failed to schedule match");
      }
    }

    sendMessageToManyClients(participants, {
      type: "startTournament",
      data: correspondingTournament as MatchMakingTypes.TournamentFull,
      // TODO: let them know about game schedule
    });
  }
}

async function handleClientLeaveTournament(dataJson: MatchMakingTypes.ClientLeaveTournament) {
  try {
    Tournament.removePlayer(dataJson.data.tournamentId as string, dataJson.data.playerId as string);
    const tournament = tournaments.find((tournament) => tournament.tournamentId === dataJson.data.tournamentId) as MatchMakingTypes.Tournament || null;
    if (tournament.player1Id === dataJson.data.playerId)
      tournament.player1Id = null;
    else if (tournament.player2Id === dataJson.data.playerId)
      tournament.player2Id = null;
    else if (tournament.player3Id === dataJson.data.playerId)
      tournament.player3Id = null;
    else if (tournament.player4Id === dataJson.data.playerId)
      tournament.player4Id = null;
    
    // delete Tournament (1) from DB and (2) from mem if no players left
    if (tournament.player1Id === null && tournament.player2Id === null && tournament.player3Id === null && tournament.player4Id === null)
    {
      tournaments = tournaments.filter((t) => t.tournamentId !== tournament.tournamentId)
      Tournament.delete(tournament.tournamentId as string);
    }
    // Steffen checks players manually to determine if null
    sendMessageToAllClients({type: "updateOneTournament", data: tournament});
  } catch (err) {
    console.error("Error removing player from tournament:", err);
    throw new Error("Failed to remove player from tournament");
  }
}

async function handleClientDeleteTournament(dataJson: MatchMakingTypes.ClientDeleteTournament) {
  try {
    removeTournament(dataJson.data);
  } catch (err) {
    console.error("Error deleting tournament:", err);
    throw new Error("Failed to delete tournament");
  }
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

async function removeTournament(tournament: MatchMakingTypes.TournamentWithMatches)
{
  try {
    // first delete any matches from DB and from server game list
    for (let i = 0; i < 6; i++) {
      const match: MatchMakingTypes.BasicGame = tournament.matches[i] as MatchMakingTypes.BasicGame;
      if (match) {
        await Tournament.deleteMatch(match.matchId);
        removeGameFromServerGameList(match);
      }
    }
    // then delete tournament from DB and from server tournament list
    await Tournament.delete(tournament.tournamentId as string);
    removeTournamentFromServerTournamentList(tournament);
    console.log(" ~ deleteTournament", tournament.tournamentId);
  } catch (err) {
    console.error("Error deleting tournament:", err);
    throw new Error("Failed to delete tournament");
  }
}

function removeTournamentFromServerTournamentList(game: MatchMakingTypes.Tournament)
{
  tournaments = tournaments.filter((g) => g.tournamentId !== game.tournamentId);
}

fastify.setNotFoundHandler((req, res) => {
  res.code(404).send({ route: req.url, method: req.method });
});

fastify.listen({ port: transNetworkSettings.gameMatchmaking.port, host: transNetworkSettings.gameMatchmaking.ip }, (err) => {
  if (err) {
    console.log("Server Error!");
    fastify.log.error(err);
    process.exit(1);
  }
  console.log(`Server listening on http://${transNetworkSettings.gameMatchmaking.ip}:${transNetworkSettings.gameMatchmaking.port}/`);
});
