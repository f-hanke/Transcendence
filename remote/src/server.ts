import Fastify, { FastifyRequest } from "fastify";
import cors from '@fastify/cors';
import fastifyWebsocket from "@fastify/websocket";
import amqp from 'amqplib';
import { WebSocket } from "ws";
import {
  gameResultTypeGuards,
  GameResultTypes,
  isDefined,
  matchmakingTypeGuards,
  MatchMakingTypes,
  SharedTypes,
  transNetworkSettings,
} from "transcendence";

import { db } from "./db/db.js"
import { Tournament } from "./orm/tournament.js";
import { utils } from "./utils/ranking.js";
import { dbConverters } from "./utils/rawDBTypeConverters.js";
import { startConsumer } from "./rabbitMQ/rabbitMQ.js";
import { match } from "assert";

const fastify = Fastify();
fastify.register(fastifyWebsocket);
fastify.register(cors, { origin: "*" });

// Add health check endpoint for Docker
fastify.get('/health', async () => {
  return { status: 'ok' };
});

type MatchMakingFastifyRequest = FastifyRequest<{
  Querystring: SharedTypes.ClientQueryParamMatchMaking;
}>;

let games: MatchMakingTypes.BasicGame[] = [];
let tournaments: MatchMakingTypes.Tournament[] = await dbConverters.getAllTournamentsRuntimeTyped();  // load up any unfinished tournaments
console.log("Loaded up following tournaments: ", tournaments);

const socketToClientId = new Map<WebSocket, string>();
const clientIdToSocket = new Map<string, WebSocket>();

const queue = 'matchMaking-results';

async function publishMessage(message: GameResultTypes.MatchResult | GameResultTypes.TournamentResult) {
  if (!gameResultTypeGuards.isMatchResult(message) && !gameResultTypeGuards.isTournamentResult(message))
    console.error("Trying to publish unknown type");
  const connection = await amqp.connect('amqp://localhost');
  const channel = await connection.createChannel();

  await channel.assertQueue(queue, { durable: false });

  channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
  console.log('[Publisher] Sent:', message);
}

async function handleMatchResultProcessed(matchResult: GameResultTypes.MatchResult)
{
  tournaments = await dbConverters.getAllTournamentsRuntimeTyped();  // update runtime tournaments so they include the scores recently stored in DB
  let tournamentToHandle: MatchMakingTypes.Tournament | null = null;
  for (let tournament of tournaments) {
    if (tournament.matchSemifinale1?.matchId === matchResult.matchId || tournament.matchSemifinale2?.matchId === matchResult.matchId)
    {
      tournamentToHandle = tournament;

      if (tournament.matchSemifinale1?.matchId === matchResult.matchId)
        tournament.matchResultSemifinale1 = matchResult;
      else if (tournament.matchSemifinale2?.matchId === matchResult.matchId)
        tournament.matchResultSemifinale2 = matchResult;

      // SCHEDULE FINAL MATCHES
      if (!tournament.matchFinale && !tournament.matchBronze) {
        let newMatchId = await Tournament.scheduleMatch(
          tournament.tournamentId as string,
          "matchFinale",
          matchResult.winnerId,
          ""
        );
        let newMatch: MatchMakingTypes.BasicGame = {
          matchId: newMatchId,
          hostId: matchResult.winnerId,
          oponentId: null,
          tournamentId: tournament.tournamentId as string,
          type: "tournament",
          invitedPlayerId: null
        };
        tournament.matchFinale = newMatch;

        newMatchId = await Tournament.scheduleMatch(
          tournament.tournamentId as string,
          "matchBronze",
          matchResult.winnerId === matchResult.player1Id ? matchResult.player2Id : matchResult.player1Id,
          ""
        );
        newMatch = {
          matchId: newMatchId,
          hostId: matchResult.winnerId === matchResult.player1Id ? matchResult.player2Id : matchResult.player1Id,
          oponentId: null,
          tournamentId: tournament.tournamentId as string,
          type: "tournament",
          invitedPlayerId: null
        }
      }
      else if (tournament.matchFinale && tournament.matchBronze) {
        await Tournament.addOpponentToMatch(tournament.tournamentId as string, matchResult.matchId, "matchFinale", matchResult.winnerId);
        tournament.matchFinale.invitedPlayerId = matchResult.winnerId;
        await Tournament.addOpponentToMatch(tournament.tournamentId as string, matchResult.matchId, "matchBronze", matchResult.winnerId === matchResult.player1Id ? matchResult.player2Id : matchResult.player1Id);
        tournament.matchBronze.invitedPlayerId = matchResult.winnerId === matchResult.player1Id ? matchResult.player2Id : matchResult.player1Id;
      }
      break;
    }
    else if (tournament.matchFinale?.matchId === matchResult.matchId) {
      tournamentToHandle = tournament;
      tournament.matchResultFinale = matchResult;
      break;
    }
    else if (tournament.matchBronze?.matchId === matchResult.matchId) {
      tournamentToHandle = tournament;
      tournament.matchResultBronze = matchResult;
      break;
    }
  }

  if (!tournamentToHandle) {
    console.log("Tournament not found for matchId", matchResult.matchId, ", processing as a simple match");
    const game = games.find((g) => g.matchId === matchResult.matchId) || null;
    if (!game) {
      console.error("Game service published a result for matchId <", matchResult.matchId, "> unknown to matchmaking");
      return;
    }
    publishMessage(matchResult);  // read by usersAndAuth
    removeGameFromServerGameList(game);
    sendMessageToAllClients({ type: "deleteGame", data: game });
    console.log("Simple Match result processed for matchId: ", game.matchId);
    return;
  }
  const tournamentWithRanking: MatchMakingTypes.TournamentWithRanking = utils.deriveTournamentWithRanking(tournamentToHandle);
  if (tournamentWithRanking.rank1PlayerId && tournamentWithRanking.rank2PlayerId && tournamentWithRanking.rank3PlayerId && tournamentWithRanking.rank4PlayerId) {
    const tournamentToStore: GameResultTypes.TournamentResult = {
      tournamentId: tournamentWithRanking.tournamentId as string,
      rank1PlayerId: tournamentWithRanking.rank1PlayerId,
      rank2PlayerId: tournamentWithRanking.rank2PlayerId,
      rank3PlayerId: tournamentWithRanking.rank3PlayerId,
      rank4PlayerId: tournamentWithRanking.rank4PlayerId,
      matchSemifinale1: tournamentWithRanking.matchResultSemifinale1 as GameResultTypes.MatchResult,
      matchSemifinale2: tournamentWithRanking.matchResultSemifinale2 as GameResultTypes.MatchResult,
      matchBronze: tournamentWithRanking.matchResultBronze as GameResultTypes.MatchResult,
      matchFinale: tournamentWithRanking.matchResultFinale as GameResultTypes.MatchResult,
      createdAt: new Date().toISOString()
    }
    publishMessage(tournamentToStore); // read by usersAndAuth
    // TODO: delete tournament from matchMaking service's runtime and DB, consult with Steffen when to do it?
  }
}

// await startConsumer(handleMatchResultProcessed);


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
      const tournamentIdDBObj: MatchMakingTypes.TournamentId | null = await Tournament.getPlayerTournamentId(playerId) as MatchMakingTypes.TournamentId || null;
      if (!tournamentIdDBObj || !tournamentIdDBObj.tournamentId) {
        console.log("Player is not part of any tournament, returning null");
        return reply.status(200).send(null);
      }
      const playerTournamendId: string = tournamentIdDBObj.tournamentId.toString();
      const tournament = tournaments.find((tournament) => tournament.tournamentId === playerTournamendId) as MatchMakingTypes.Tournament || null;
      console.log("Player is part of tournament <", tournament.tournamentId, ">, returning TournamentWithRanking");
      const tournamentWithRanking = utils.deriveTournamentWithRanking(tournament);
      return reply.status(200).send(tournamentWithRanking);

    } catch (err) {
      console.error("Error fetching tournament: ", err);
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
        console.error("Matchmaking server received unknown message from client!");
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
  socketToClientId.set(socket, clientId as string);
  clientIdToSocket.set(clientId as string, socket);
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
  const correspondingGame = games.find((game) => game.matchId === dataJson.data.matchId) as MatchMakingTypes.BasicGame;
  if (!correspondingGame) {
    console.log("Client tried to join game, that didn't exist!");
  } else if (!isDefined(correspondingGame.oponentId)) {
    correspondingGame.oponentId = dataJson.data.oponentId;
  } else {
    console.log("Client tried to join game, thats already full!");
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
    const newTournament: MatchMakingTypes.Tournament = {
      tournamentId: newTournamentId,
      player1Id: dataJson.data.playerId, player2Id: null, player3Id: null, player4Id: null,
      matchSemifinale1: null, matchSemifinale2: null, matchFinale: null, matchBronze: null,
      matchResultSemifinale1: null, matchResultSemifinale2: null, matchResultFinale: null, matchResultBronze: null,
      started: false, playedAt: null,
    };
    tournaments.push(newTournament);
    sendMessageToAllClients({ type: "updateOneTournament", data: newTournament });
  } catch (err) {
    console.error("Error creating tournament:", err);
  }
}

async function handleClientJoinTournament(dataJson: MatchMakingTypes.ClientJoinTournament) {
  const correspondingTournament = tournaments.find((tournament) => tournament.tournamentId === dataJson.data.tournamentId) as MatchMakingTypes.Tournament || null;
  try {
    if (!correspondingTournament)
      throw new Error("Client tried to join a tournament that didn't exist!");
    const playerPosition: MatchMakingTypes.PlayerKey = await Tournament.addPlayer(dataJson.data.tournamentId, dataJson.data.playerId) as MatchMakingTypes.PlayerKey;
    correspondingTournament[playerPosition] = dataJson.data.playerId as string;
    console.log(" ~ joinTournament", dataJson.data.tournamentId);
    sendMessageToAllClients({ type: "updateOneTournament", data: correspondingTournament });
  } catch (err) {
    console.error("Error adding player to tournament:", err);
  }

  // startTournament logic INDEED when lobby full
  if (correspondingTournament.player1Id && correspondingTournament.player2Id && correspondingTournament.player3Id && correspondingTournament.player4Id) {
    const participants = [
      correspondingTournament.player1Id as string,
      correspondingTournament.player2Id as string,
      correspondingTournament.player3Id as string,
      correspondingTournament.player4Id as string,
    ];

    try {
      let newMatchId = await Tournament.scheduleMatch(
        correspondingTournament.tournamentId as string,
        "matchSemifinale1",                 // matchName
        correspondingTournament.player1Id,  // match playerNr1
        correspondingTournament.player2Id   // match playerNr2
      );
      let newMatch: MatchMakingTypes.BasicGame = {
        matchId: newMatchId,
        hostId: correspondingTournament.player1Id,
        oponentId: null,
        tournamentId: correspondingTournament.tournamentId as string,
        type: "tournament",
        invitedPlayerId: correspondingTournament.player2Id
      };
      correspondingTournament.matchSemifinale1 = newMatch;
      // games.push(newMatch);

      newMatchId = await Tournament.scheduleMatch(
        correspondingTournament.tournamentId as string,
        "matchSemifinale2",                 // matchName
        correspondingTournament.player3Id,  // match playerNr1
        correspondingTournament.player4Id   // match playerNr2
      );
      newMatch = {
        matchId: newMatchId,
        hostId: correspondingTournament.player3Id,
        oponentId: null,
        tournamentId: correspondingTournament.tournamentId as string,
        type: "tournament",
        invitedPlayerId: correspondingTournament.player4Id
      };
      correspondingTournament.matchSemifinale2 = newMatch;
      // games.push(newMatch);

      correspondingTournament.matchFinale = null;
      correspondingTournament.matchBronze = null;

    } catch (err) {
      console.error("Error scheduling match:", err);
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
    const tournament = tournaments.find((tournament) => tournament.tournamentId === dataJson.data.tournamentId) as MatchMakingTypes.Tournament || null;
    if (!tournament)
      throw new Error("Client tried to leave a tournament that didn't exist!");
    if (tournament.started === false)
    {
      Tournament.removePlayer(dataJson.data.tournamentId as string, dataJson.data.playerId as string);
      if (tournament.player1Id === dataJson.data.playerId)
        tournament.player1Id = null;
      else if (tournament.player2Id === dataJson.data.playerId)
        tournament.player2Id = null;
      else if (tournament.player3Id === dataJson.data.playerId)
        tournament.player3Id = null;
      else if (tournament.player4Id === dataJson.data.playerId)
        tournament.player4Id = null;
      // delete Tournament (1.) from DB and also (2.) from memory if no players left
      if (tournament.player1Id === null && tournament.player2Id === null && tournament.player3Id === null && tournament.player4Id === null)
      {
        tournaments = tournaments.filter((t) => t.tournamentId !== tournament.tournamentId)
        Tournament.delete(tournament.tournamentId as string);
      }
      // Steffen checks players manually to determine if null
      sendMessageToAllClients({type: "updateOneTournament", data: tournament});
    }
    else if (tournament.started === true)
    {
      // TODO: store any unfinished matches with opponent as winner
    }
  } catch (err) {
    console.error("Error removing player from tournament:", err);
  }
}

// defunct?
async function handleClientDeleteTournament(dataJson: MatchMakingTypes.ClientDeleteTournament) {
  try {
    removeTournament(dataJson.data);
  } catch (err) {
    console.error("Error deleting tournament:", err);
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

async function removeTournament(tournament: MatchMakingTypes.Tournament)
{
  try {
    // first delete all tournament matches from DB (and not from server game list bc never added)
    await Tournament.deleteMatch(tournament.matchSemifinale1?.matchId as string);
    await Tournament.deleteMatch(tournament.matchSemifinale2?.matchId as string);
    await Tournament.deleteMatch(tournament.matchFinale?.matchId as string);
    await Tournament.deleteMatch(tournament.matchBronze?.matchId as string);

    // then delete tournament from DB and from server tournament list
    await Tournament.delete(tournament.tournamentId as string);
    removeTournamentFromServerTournamentList(tournament);
    console.log(" ~ deleteTournament", tournament.tournamentId);
  } catch (err) {
    console.error("Error deleting tournament:", err);
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

process.on('SIGINT', () => {
  db.close();
  process.exit();
});
