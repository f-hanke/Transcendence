import Fastify, { FastifyRequest } from "fastify";
import cors from "@fastify/cors";
import fastifyWebsocket from "@fastify/websocket";
import amqp from "amqplib";
import { WebSocket } from "ws";
import {
  gameResultTypeGuards,
  GameResultTypes,
  isDefined,
  matchmakingTypeGuards,
  MatchMakingTypes,
  SharedTypes,
  transNetworkSettings,
  gameSettings,
  monitoringEnabled,
} from "transcendence";

import { db } from "./db/db.js";
import { Tournament } from "./orm/tournament.js";
import { utils } from "./utils/ranking.js";
import { dbConverters } from "./utils/rawDBTypeConverters.js";
import { startConsumer } from "./rabbitMQ/rabbitMQ.js";
import { match } from "assert";
import { stringify } from "querystring";
import esClient, { checkElasticsearch } from "./lib/elasticsearch.js";
import logger from "./lib/logger.js";
import { setupMetrics } from "./lib/metrics.js";

const fastify = Fastify();
fastify.register(fastifyWebsocket);
fastify.register(cors, { origin: "*" });

if (monitoringEnabled) {
  setupMetrics(fastify);
  //keep commented out unless docker is running requires elsasticsearch to be running
  await checkElasticsearch();
  logger.info("Metrics and logger initialized.");
}
// Add health check endpoint for Docker
fastify.get("/health", async () => {
  return { status: "ok" };
});

type MatchMakingFastifyRequest = FastifyRequest<{
  Querystring: SharedTypes.ClientQueryParamMatchMaking;
}>;

let games: MatchMakingTypes.BasicGame[] = [];
let tournaments: MatchMakingTypes.Tournament[] =
  await dbConverters.getAllTournamentsRuntimeTyped(); // load up any unfinished tournaments
logger.info("Loaded up following tournaments: ", tournaments);

const socketToClientId = new Map<WebSocket, string>();
const clientIdToSocket = new Map<string, WebSocket>();

// const queue = 'matchMaking-results';
const queue = "matchmaking-service-queue";

async function publishMessage(
  message:
    | GameResultTypes.MatchResult
    | GameResultTypes.TournamentResult
    | MatchMakingTypes.TournamentNotification
    | MatchMakingTypes.ServerStartTournament
    | MatchMakingTypes.PlayerLeftSinceTournamentStarted
) {
  if (
    !gameResultTypeGuards.isMatchResult(message) &&
    !gameResultTypeGuards.isTournamentResult(message) &&
    !matchmakingTypeGuards.isTournamentNotification(message) &&
    !matchmakingTypeGuards.isServerStartTournament(message) &&
    !matchmakingTypeGuards.isPlayerLeftSinceTournamentStarted(message)
  )
    logger.error("Trying to publish unknown type:", message);
  let connection;
  try {
    connection = await amqp.connect("amqp://admin:admin@rabbitmq-service:5672");
    logger.info("Connected to amqp://admin:admin@rabbitmq-service:5672");
  } catch (err) {
    logger.warn("Failed to connect to rabbitmq-service, trying localhost...");
    connection = await amqp.connect("amqp://localhost");
  }
  const channel = await connection.createChannel();

  await channel.assertQueue(queue, { durable: true });

  channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
  logger.info("[Publisher] Sent:", message);
}

async function handleMatchResultProcessed(
  matchResult: GameResultTypes.MatchResult
) {
  tournaments = await dbConverters.getAllTournamentsRuntimeTyped(); // update runtime tournaments so they include the scores recently stored in DB
  let tournamentToHandle: MatchMakingTypes.Tournament | null = null;
  // logger.info("handleMatchResultProcessed, fetched tournaments:", tournaments);
  let isDuplicateMatchResult = false;

  for (let tournament of tournaments) {
    logger.info("Checking tournament: ", tournament.tournamentId);
    if (
      tournament.matchSemifinale1?.matchId === matchResult.matchId ||
      tournament.matchSemifinale2?.matchId === matchResult.matchId
    ) {
      tournamentToHandle = tournament;

      if (
        tournamentToHandle.matchSemifinale1?.matchId === matchResult.matchId
      ) {
        if (tournamentToHandle.matchResultSemifinale1 !== null)
          isDuplicateMatchResult = true;
        tournamentToHandle.matchResultSemifinale1 = matchResult;
      } else if (
        tournamentToHandle.matchSemifinale2?.matchId === matchResult.matchId
      ) {
        if (tournamentToHandle.matchResultSemifinale2 !== null)
          isDuplicateMatchResult = true;
        tournamentToHandle.matchResultSemifinale2 = matchResult;
      }

      // SCHEDULE FINAL MATCHES (if semifinals are done and final matches unscheduled)
      logger.info(
        "tournamentToHandle.matchResultSemifinale1: ",
        tournamentToHandle.matchResultSemifinale1
      );
      logger.info(
        "tournamentToHandle.matchResultSemifinale2: ",
        tournamentToHandle.matchResultSemifinale2
      );
      logger.info(
        "tournamentToHandle.matchFinale: ",
        tournamentToHandle.matchFinale
      );
      logger.info(
        "tournamentToHandle.matchBronze: ",
        tournamentToHandle.matchBronze
      );
      if (
        tournamentToHandle.matchResultSemifinale1 &&
        tournamentToHandle.matchResultSemifinale2 &&
        !tournamentToHandle.matchFinale &&
        !tournamentToHandle.matchBronze
      ) {
        try {
          // if 2+ players who clicked to leave
          if (tournamentToHandle.playersWhoClickedToLeave.length > 1)
          {
            logger.info("~ There are 2+ players who clicked to leave");
            let newMatchId = await Tournament.scheduleMatch(
              tournamentToHandle.tournamentId as string,
              "matchBronze",
              tournamentToHandle.playersWhoClickedToLeave[1],
              tournamentToHandle.playersWhoClickedToLeave[0]
            );
            let newMatch: MatchMakingTypes.BasicGame = {
              matchId: newMatchId,
              hostId: tournamentToHandle.playersWhoClickedToLeave[1],
              oponentId: tournamentToHandle.playersWhoClickedToLeave[0],
              tournamentId: tournamentToHandle.tournamentId as string,
              type: "tournament",
              invitedPlayerId: tournamentToHandle.playersWhoClickedToLeave[0],
            };
            tournamentToHandle.matchBronze = newMatch;
            logger.info(
              "Just scheduled bogus matchBronze with two players who ClickedToLeave, generating match result now"
            );
            const matchBronzeResult: GameResultTypes.MatchResult = {
              matchId: newMatchId,
              player1Id: tournamentToHandle.playersWhoClickedToLeave[1],
              player2Id: tournamentToHandle.playersWhoClickedToLeave[0],
              winnerId: tournamentToHandle.playersWhoClickedToLeave[1],
              player1Score: 0,
              player2Score: 0,
              createdAt: new Date().toISOString(),
            };
            await Tournament.updateOngoingTournamentDatabase(
              matchBronzeResult.player1Score,
              matchBronzeResult.player2Score,
              matchBronzeResult.createdAt,
              matchBronzeResult.matchId
            );
            const tournamentNotification: MatchMakingTypes.TournamentNotification =
              {
                updateForMatch: "bronze",
                tournamentData: tournamentToHandle,
              } as MatchMakingTypes.TournamentNotification;
            tournamentToHandle.matchResultBronze = matchBronzeResult;
            publishMessage(tournamentNotification); // read by chat-service
            logger.info("Ongoing Tournament updated in DB");

            const finalistsWhoClickedToLeave =
              tournamentToHandle.playersWhoClickedToLeave.slice(2);
            logger.info(
              "Finalists who clicked to leave: ",
              finalistsWhoClickedToLeave
            );
            let finalistsWhoDidntClickToLeave = [
              tournamentToHandle!.matchResultSemifinale1?.winnerId,
              tournamentToHandle!.matchResultSemifinale2?.winnerId,
            ].filter(
              (id) => !tournamentToHandle!.playersWhoClickedToLeave.includes(id)
            );
            logger.info(
              "Finalists who didn't click to leave: ",
              finalistsWhoDidntClickToLeave
            );
            if (finalistsWhoDidntClickToLeave.length === 1) {
              finalistsWhoDidntClickToLeave = [
                tournamentToHandle!.player1Id as string,
                tournamentToHandle!.player2Id as string,
                tournamentToHandle!.player3Id as string,
                tournamentToHandle!.player4Id as string,
              ].filter(
                (id) =>
                  !tournamentToHandle!.playersWhoClickedToLeave.includes(id)
              );
            }
            logger.info(
              "Finalists who didn't click to leave after filtering: ",
              finalistsWhoDidntClickToLeave
            );
            let clickedToLeavePopable = JSON.parse(
              JSON.stringify(finalistsWhoClickedToLeave)
            );
            let didntClickToLeavePopable = JSON.parse(
              JSON.stringify(finalistsWhoDidntClickToLeave)
            );
            let finalist1Id: string =
              didntClickToLeavePopable.length > 0
                ? (didntClickToLeavePopable.pop() as string)
                : (clickedToLeavePopable.pop() as string);
            let finalist2Id: string =
              didntClickToLeavePopable.length > 0
                ? (didntClickToLeavePopable.pop() as string)
                : (clickedToLeavePopable.pop() as string);
            newMatchId = await Tournament.scheduleMatch(
              tournamentToHandle.tournamentId as string,
              "matchFinale",
              finalist1Id,
              finalist2Id
            );
            newMatch = {
              matchId: newMatchId,
              hostId: finalist1Id,
              oponentId: finalist2Id,
              tournamentId: tournamentToHandle.tournamentId as string,
              type: "tournament",
              invitedPlayerId: finalist2Id,
            };
            tournamentToHandle.matchFinale = newMatch;
            if (finalistsWhoClickedToLeave.length > 0) {
              logger.info(
                "Just scheduled bogus matchFinale with at least 1 player who ClickedToLeave, generating match result now"
              );
              const matchFinaleResult: GameResultTypes.MatchResult = {
                matchId: newMatchId,
                player1Id: finalist1Id,
                player2Id: finalist2Id,
                winnerId: finalist1Id,
                player1Score: 0,
                player2Score: 0,
                createdAt: new Date().toISOString(),
              };
              if (finalistsWhoClickedToLeave.length !== 2) {
                matchFinaleResult.player1Score = gameSettings.maxScore;
              }
              await Tournament.updateOngoingTournamentDatabase(
                matchFinaleResult.player1Score,
                matchFinaleResult.player2Score,
                matchFinaleResult.createdAt,
                matchFinaleResult.matchId
              );
              const tournamentNotification: MatchMakingTypes.TournamentNotification =
                {
                  updateForMatch: "finale",
                  tournamentData: tournamentToHandle,
                } as MatchMakingTypes.TournamentNotification;
              tournamentToHandle.matchResultFinale = matchFinaleResult;
              publishMessage(tournamentNotification); // read by chat-service
              await Tournament.updateOngoingTournamentDatabase(
                matchFinaleResult.player1Score,
                matchFinaleResult.player2Score,
                matchFinaleResult.createdAt,
                matchFinaleResult.matchId
              );
              logger.info("Ongoing Tournament updated in DB");
            } else {
              logger.info(
                "finalistsWhoClickedToLeave.length: ",
                finalistsWhoClickedToLeave.length
              );
              logger.info(
                "finalistsWhoClickedToLeave: ",
                finalistsWhoClickedToLeave
              );
              logger.info(
                "matchBronze was autogenerated, but there are still two finalists who didn't ClickToLeave, so matchFinale was scheduled normally"
              );
            }
          }
          else
          {
            // if tournament.playersWhoClickedToLeave.length === 0 | 1
            let finaleOpponentId: string | null = null;
            let bronzeOpponentId: string | null = null;
            finaleOpponentId = tournamentToHandle.matchResultSemifinale1.winnerId === matchResult.winnerId ? tournamentToHandle.matchResultSemifinale2.winnerId : tournamentToHandle.matchResultSemifinale1.winnerId;
            if ( tournamentToHandle.matchSemifinale1?.matchId === matchResult.matchId )
              bronzeOpponentId = tournamentToHandle.matchResultSemifinale2.player1Id === tournamentToHandle.matchResultSemifinale2.winnerId ? tournamentToHandle.matchResultSemifinale2.player2Id : tournamentToHandle.matchResultSemifinale2.player1Id;
            else
              bronzeOpponentId = tournamentToHandle.matchResultSemifinale1.player1Id === tournamentToHandle.matchResultSemifinale1.winnerId ? tournamentToHandle.matchResultSemifinale1.player2Id : tournamentToHandle.matchResultSemifinale1.player1Id;

            let newMatchId: string = await Tournament.scheduleMatch(
              tournamentToHandle.tournamentId as string,
              "matchFinale",
              matchResult.winnerId,
              finaleOpponentId as string
            );
            let newMatch: MatchMakingTypes.BasicGame = {
              matchId: newMatchId,
              hostId: matchResult.winnerId,
              oponentId: null,
              tournamentId: tournamentToHandle.tournamentId as string,
              type: "tournament",
              invitedPlayerId: finaleOpponentId as string,
            };
            tournament.matchFinale = newMatch;
            if (tournament.playersWhoClickedToLeave?.includes(tournament.matchFinale.hostId) ||
                tournament.playersWhoClickedToLeave?.includes(finaleOpponentId as string))
            {
              logger.info("Had scheduled matchFinale but one of the players had clicked to leave, generating match result now");
              const onePlayerProvenToHaveClickedLeaveId = tournament.playersWhoClickedToLeave.includes( tournament.matchFinale.hostId ) ? tournament.matchFinale.hostId : (finaleOpponentId as string); // there could be more than one, but we determine one proven
              const matchFinaleResult: GameResultTypes.MatchResult = {
                matchId: newMatchId,
                player1Id: tournament.matchFinale.hostId,
                player2Id: finaleOpponentId as string,
                winnerId: tournament.matchFinale.hostId === onePlayerProvenToHaveClickedLeaveId ? finaleOpponentId : tournament.matchFinale.hostId,
                player1Score: tournament.matchFinale.hostId === onePlayerProvenToHaveClickedLeaveId ? 0 : gameSettings.maxScore,
                player2Score: finaleOpponentId === onePlayerProvenToHaveClickedLeaveId ? 0 : gameSettings.maxScore,
                createdAt: new Date().toISOString(),
              };
              const tournamentNotification: MatchMakingTypes.TournamentNotification =
                {
                  updateForMatch: "finale",
                  tournamentData: tournamentToHandle,
                } as MatchMakingTypes.TournamentNotification;
              tournament.matchResultFinale = matchFinaleResult;
              publishMessage(tournamentNotification); // read by chat-service
              await Tournament.updateOngoingTournamentDatabase(
                matchFinaleResult.player1Score,
                matchFinaleResult.player2Score,
                matchFinaleResult.createdAt,
                matchFinaleResult.matchId
              );
              logger.info("Ongoing Tournament updated in DB");
            }

            newMatchId = await Tournament.scheduleMatch(
              tournament.tournamentId as string,
              "matchBronze",
              matchResult.winnerId === matchResult.player1Id ? matchResult.player2Id : matchResult.player1Id,
              bronzeOpponentId as string
            );
            newMatch = {
              matchId: newMatchId,
              hostId: matchResult.winnerId === matchResult.player1Id ? matchResult.player2Id : matchResult.player1Id,
              oponentId: null,
              tournamentId: tournament.tournamentId as string,
              type: "tournament",
              invitedPlayerId: bronzeOpponentId as string,
            };
            tournament.matchBronze = newMatch;
            if ( tournament.playersWhoClickedToLeave?.includes( tournament.matchBronze.hostId ) || tournament.playersWhoClickedToLeave?.includes( bronzeOpponentId as string ) )
            {
              logger.info( "Had scheduled matchBronze but one of the players had clicked to leave, generating match result now" );
              const onePlayerProvenToHaveClickedLeaveId = tournament.playersWhoClickedToLeave.includes( tournament.matchBronze.hostId ) ? tournament.matchBronze.hostId : (bronzeOpponentId as string); // there could be more than one, but we determine one proven
              const matchBronzeResult: GameResultTypes.MatchResult = {
                matchId: newMatchId,
                player1Id: tournament.matchBronze.hostId,
                player2Id: bronzeOpponentId as string,
                winnerId: tournament.matchBronze.hostId === onePlayerProvenToHaveClickedLeaveId ? bronzeOpponentId : tournament.matchBronze.hostId,
                player1Score: tournament.matchBronze.hostId === onePlayerProvenToHaveClickedLeaveId ? 0 : gameSettings.maxScore,
                player2Score: bronzeOpponentId === onePlayerProvenToHaveClickedLeaveId ? 0 : gameSettings.maxScore,
                createdAt: new Date().toISOString(),
              };
              const tournamentNotification: MatchMakingTypes.TournamentNotification =
                {
                  updateForMatch: "bronze",
                  tournamentData: tournamentToHandle,
                } as MatchMakingTypes.TournamentNotification;
              tournament.matchResultBronze = matchBronzeResult;
              publishMessage(tournamentNotification); // read by chat-service
              await Tournament.updateOngoingTournamentDatabase(
                matchBronzeResult.player1Score,
                matchBronzeResult.player2Score,
                matchBronzeResult.createdAt,
                matchBronzeResult.matchId
              );
              logger.info("Ongoing Tournament updated in DB");
            }
          }

          // logger.info("Scheduled final matches: ", tournament);
        } catch (err) {
          logger.error("Error scheduling final matches:", err);
        }
      }
      break;
    } else if (tournament.matchFinale?.matchId === matchResult.matchId) {
      tournamentToHandle = tournament;
      tournamentToHandle.matchResultFinale = matchResult;
      break;
    } else if (tournament.matchBronze?.matchId === matchResult.matchId) {
      tournamentToHandle = tournament;
      tournamentToHandle.matchResultBronze = matchResult;
      break;
    }
  }
  if (tournamentToHandle) {
    try {
      await Tournament.updateOngoingTournamentDatabase(
        matchResult.player1Score,
        matchResult.player2Score,
        matchResult.createdAt,
        matchResult.matchId
      );
      logger.info("Ongoing Tournament updated in DB");
    } catch (err) {
      logger.error("DB error updating/inserting ongoing Tournament db: ", err);
    }

    const tournamentWithRanking: MatchMakingTypes.TournamentWithRanking =
      utils.deriveTournamentWithRanking(tournamentToHandle);
    if (
      tournamentWithRanking.rank1PlayerId &&
      tournamentWithRanking.rank2PlayerId &&
      tournamentWithRanking.rank3PlayerId &&
      tournamentWithRanking.rank4PlayerId
    ) {
      const tournamentToStore: GameResultTypes.TournamentResult = {
        tournamentId: tournamentWithRanking.tournamentId as string,
        rank1PlayerId: tournamentWithRanking.rank1PlayerId,
        rank2PlayerId: tournamentWithRanking.rank2PlayerId,
        rank3PlayerId: tournamentWithRanking.rank3PlayerId,
        rank4PlayerId: tournamentWithRanking.rank4PlayerId,
        matchSemifinale1:
          tournamentWithRanking.matchResultSemifinale1 as GameResultTypes.MatchResult,
        matchSemifinale2:
          tournamentWithRanking.matchResultSemifinale2 as GameResultTypes.MatchResult,
        matchBronze:
          tournamentWithRanking.matchResultBronze as GameResultTypes.MatchResult,
        matchFinale:
          tournamentWithRanking.matchResultFinale as GameResultTypes.MatchResult,
        createdAt: new Date().toISOString(),
      };
      publishMessage(tournamentToStore); // read by usersAndAuth
      // DONE: delete tournament from matchMaking service's runtime and DB, consult with Steffen when to do it? For now just do it
      await removeTournament(tournamentToHandle);
      logger.info(
        "Tournament finished and stored in DB, removed from runtime and DB"
      );
      tournaments = tournaments.filter(
        (t) => t.tournamentId !== tournamentToHandle.tournamentId
      ); // remove from runtime
      logger.info(
        "Removed tournament from runtime tournaments list: ",
        tournamentToHandle.tournamentId
      );
    }
    // for every update to a tournament, whether finished or not, send the updated tournament to chat-service
    let matchType = "";
    if (matchResult.matchId === tournamentToHandle.matchSemifinale1?.matchId)
      matchType = "semifinale1";
    else if (
      matchResult.matchId === tournamentToHandle.matchSemifinale2?.matchId
    )
      matchType = "semifinale2";
    else if (matchResult.matchId === tournamentToHandle.matchFinale?.matchId)
      matchType = "finale";
    else if (matchResult.matchId === tournamentToHandle.matchBronze?.matchId)
      matchType = "bronze";
    let tournamentNotification: MatchMakingTypes.TournamentNotification = {
      updateForMatch: matchType,
      tournamentData: tournamentToHandle,
    } as MatchMakingTypes.TournamentNotification;
    if (!isDuplicateMatchResult) publishMessage(tournamentNotification); // read by chat-service
    logger.info(
      "Tournament state published to chat-service: ",
      tournamentToHandle
    );
  } else {
    logger.info(
      "Tournament not found for matchId",
      matchResult.matchId,
      ", processing as a simple match"
    );
    publishMessage(matchResult); // read by usersAndAuth
    logger.info(
      "Simple Match result processed for matchId: ",
      matchResult.matchId
    );
  }
}

await startConsumer(handleMatchResultProcessed).catch(logger.error);

fastify.register(async function (fastify) {
  // API endpoint
  fastify.get<{
    Params: { playerId: string };
    Returns: {
      200: MatchMakingTypes.TournamentWithRanking | null;
      500: { error: string };
    };
  }>("/matchmaking/playertournament/:playerId", async (req, reply) => {
    const playerId = req.params.playerId as string;
    try {
      const tournamentIdDBObj: MatchMakingTypes.TournamentId | null =
        ((await Tournament.getPlayerTournamentId(
          playerId
        )) as MatchMakingTypes.TournamentId) || null;
      if (!tournamentIdDBObj || !tournamentIdDBObj.tournamentId) {
        logger.info("Player is not part of any tournament, returning null");
        return reply.status(200).send(null);
      }
      const playerTournamentId: string =
        tournamentIdDBObj.tournamentId.toString();
      const tournament =
        (tournaments.find(
          (tournament) => tournament.tournamentId === playerTournamentId
        ) as MatchMakingTypes.Tournament) || null;
      logger.info(
        "Player is part of tournament <",
        tournament.tournamentId,
        ">, returning TournamentWithRanking"
      );
      const tournamentWithRanking =
        utils.deriveTournamentWithRanking(tournament);
      return reply.status(200).send(tournamentWithRanking);
    } catch (err) {
      logger.error("Error fetching tournament: ", err);
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
        tournaments: tournaments,
      },
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
        logger.error(
          "Matchmaking server received unknown Message from client!"
        );
        logger.error("Message: ", dataJson);
      }
    });
    socket.on("close", () => {
      logger.info(
        "WebSocket closed. Client ID: ",
        socketToClientId.get(socket)
      );
      closeGamesOpenedByClient(socket); // @Steffen: too soon, I need Leo's results first
      unregisterClient(socket);
    });

    socket.on("error", (err) => {
      logger.error("WebSocket error:", err);
    });
  });
});

function registerClient(req: MatchMakingFastifyRequest, socket: WebSocket) {
  const clientId = getClientIdFromQueryParam(req as MatchMakingFastifyRequest);
  socketToClientId.set(socket, clientId as string);
  clientIdToSocket.set(clientId as string, socket);
  logger.info(" ~ Client connected: ", clientId);
}

function unregisterClient(socket: WebSocket) {
  const clientId = socketToClientId.get(socket) as string;
  socketToClientId.delete(socket);
  clientIdToSocket.delete(clientId);
  logger.info(" ~ Client disconnected: ", clientId);
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
  logger.info(msg);
}

function handleClientLeaveGame(dataJson: MatchMakingTypes.ClientLeaveGame) {
  // to do for Milos
  // here, only remove game, if its not a tournament game
  logger.info(" ~ leaveGame", dataJson.data.matchId);
  removeGameFromServerGameList(dataJson.data);
  sendMessageToAllClients({ type: "leaveGame", data: dataJson.data });
}

function handleClientCreateGame(dataJson: MatchMakingTypes.ClientCreateGame) {
  logger.info(" ~ createGame", dataJson.data.matchId);
  games.push(dataJson.data);
  logger.info("Games: ", games);
  logger.info("Send Client create game to all clients!");
  sendMessageToAllClients({ type: "createGame", data: dataJson.data });
}

function handleClientJoinGame(dataJson: MatchMakingTypes.ClientJoinGame) {
  logger.info(" ~ joinGame", dataJson.data.matchId);
  const correspondingGame = games.find(
    (game) => game.matchId === dataJson.data.matchId
  ) as MatchMakingTypes.BasicGame;
  if (!correspondingGame) {
    logger.info("Client tried to join game, that didn't exist!");
  } else if (!isDefined(correspondingGame.oponentId)) {
    correspondingGame.oponentId = dataJson.data.oponentId;
  } else {
    logger.info("Client tried to join game, thats already full!");
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
  logger.info(" ~ deleteGame", dataJson.data.matchId);
  removeGameFromServerGameList(dataJson.data);
  sendMessageToAllClients({ type: "deleteGame", data: dataJson.data });
}

async function handleClientCreateTournament(
  dataJson: MatchMakingTypes.ClientCreateTournament
) {
  try {
    const newTournamentId = (await Tournament.create(
      dataJson.data.playerId
    )) as string;
    logger.info(" ~ createTournament", newTournamentId);
    const newTournament: MatchMakingTypes.Tournament = {
      tournamentId: newTournamentId,
      player1Id: dataJson.data.playerId,
      player2Id: null,
      player3Id: null,
      player4Id: null,
      matchSemifinale1: null,
      matchSemifinale2: null,
      matchFinale: null,
      matchBronze: null,
      matchResultSemifinale1: null,
      matchResultSemifinale2: null,
      matchResultFinale: null,
      matchResultBronze: null,
      started: false,
      playedAt: null,
      playersWhoClickedToLeave: [],
    };
    tournaments.push(newTournament);
    sendMessageToAllClients({
      type: "updateOneTournament",
      data: newTournament,
    });
  } catch (err) {
    logger.error("Error creating tournament:", err);
  }
}

async function handleClientJoinTournament(
  dataJson: MatchMakingTypes.ClientJoinTournament
) {
  const correspondingTournament =
    (tournaments.find(
      (tournament) => tournament.tournamentId === dataJson.data.tournamentId
    ) as MatchMakingTypes.Tournament) || null;
  try {
    if (!correspondingTournament)
      throw new Error("Client tried to join a tournament that didn't exist!");
    const playerPosition: MatchMakingTypes.PlayerKey =
      (await Tournament.addPlayer(
        dataJson.data.tournamentId,
        dataJson.data.playerId
      )) as MatchMakingTypes.PlayerKey;
    correspondingTournament[playerPosition] = dataJson.data.playerId as string;
    logger.info(" ~ joinTournament", dataJson.data.tournamentId);
    sendMessageToAllClients({
      type: "updateOneTournament",
      data: correspondingTournament,
    });
  } catch (err) {
    logger.error("Error adding player to tournament:", err);
  }

  // startTournament logic INDEED when lobby full
  if (
    correspondingTournament.player1Id &&
    correspondingTournament.player2Id &&
    correspondingTournament.player3Id &&
    correspondingTournament.player4Id
  ) {
    correspondingTournament.playedAt = new Date().toISOString();
    logger.info(" ~ startTournament", correspondingTournament.tournamentId);
    const participants = [
      correspondingTournament.player1Id as string,
      correspondingTournament.player2Id as string,
      correspondingTournament.player3Id as string,
      correspondingTournament.player4Id as string,
    ];

    try {
      let newMatchId: string = await Tournament.scheduleMatch(
        correspondingTournament.tournamentId as string,
        "matchSemifinale1", // matchName
        correspondingTournament.player1Id, // match playerNr1
        correspondingTournament.player2Id // match playerNr2
      );
      let newMatch: MatchMakingTypes.BasicGame = {
        matchId: newMatchId,
        hostId: correspondingTournament.player1Id,
        oponentId: null,
        tournamentId: correspondingTournament.tournamentId as string,
        type: "tournament",
        invitedPlayerId: correspondingTournament.player2Id,
      };
      correspondingTournament.matchSemifinale1 = newMatch;
      // games.push(newMatch);

      newMatchId = await Tournament.scheduleMatch(
        correspondingTournament.tournamentId as string,
        "matchSemifinale2", // matchName
        correspondingTournament.player3Id, // match playerNr1
        correspondingTournament.player4Id // match playerNr2
      );
      newMatch = {
        matchId: newMatchId,
        hostId: correspondingTournament.player3Id,
        oponentId: null,
        tournamentId: correspondingTournament.tournamentId as string,
        type: "tournament",
        invitedPlayerId: correspondingTournament.player4Id,
      };
      correspondingTournament.matchSemifinale2 = newMatch;
      // games.push(newMatch);

      correspondingTournament.matchFinale = null;
      correspondingTournament.matchBronze = null;

      correspondingTournament.started = true; // semifinales are scheduled === tournament has started
    } catch (err) {
      logger.error("Error scheduling match:", err);
    }

    const serverTournamentStartObj: MatchMakingTypes.ServerStartTournament = {
      type: "startTournament",
      data: correspondingTournament as MatchMakingTypes.TournamentFull,
    } as MatchMakingTypes.ServerStartTournament;
    publishMessage(serverTournamentStartObj); // pub by MatchMaking, ack by chat-service, nack by usersAndAuth
    sendMessageToManyClients(participants, serverTournamentStartObj); // read by frontend
  }
}

async function handleClientLeaveTournament(
  dataJson: MatchMakingTypes.ClientLeaveTournament
) {
  try {
    const tournament =
      (tournaments.find(
        (tournament) => tournament.tournamentId === dataJson.data.tournamentId
      ) as MatchMakingTypes.Tournament) || null;
    if (!tournament)
      throw new Error("Client tried to leave a tournament that didn't exist!");

    if (tournament.started === false) {
      Tournament.removePlayer(
        dataJson.data.tournamentId as string,
        dataJson.data.playerId as string
      );
      if (tournament.player1Id === dataJson.data.playerId)
        tournament.player1Id = null;
      else if (tournament.player2Id === dataJson.data.playerId)
        tournament.player2Id = null;
      else if (tournament.player3Id === dataJson.data.playerId)
        tournament.player3Id = null;
      else if (tournament.player4Id === dataJson.data.playerId)
        tournament.player4Id = null;
      // delete Tournament (1.) from DB and also (2.) from memory if no players left
      if (
        tournament.player1Id === null &&
        tournament.player2Id === null &&
        tournament.player3Id === null &&
        tournament.player4Id === null
      ) {
        tournaments = tournaments.filter(
          (t) => t.tournamentId !== tournament.tournamentId
        );
        Tournament.delete(tournament.tournamentId as string);
      }
      // Steffen checks players manually to determine if null
      sendMessageToAllClients({
        type: "updateOneTournament",
        data: tournament,
      });
    } else if (tournament.started === true) {
      // DONE: store any unfinished matches with opponent as winner, emulating Leo over here
      if (
        !tournament.playersWhoClickedToLeave.includes(
          dataJson.data.playerId as string
        )
      )
        tournament.playersWhoClickedToLeave.push(
          dataJson.data.playerId as string
        );
      let matchResult: GameResultTypes.MatchResult | null = null;
      if (!tournament.matchBronze && !tournament.matchFinale) {
        if (
          tournament.matchSemifinale1?.hostId === dataJson.data.playerId ||
          (tournament.matchSemifinale1?.invitedPlayerId ===
            dataJson.data.playerId &&
            !tournament.matchResultSemifinale1)
        ) {
          // player leaving was in semifinal 1 but there's no result for it, generate a match result with the player leaving as loser
          const opponentId =
            tournament.matchSemifinale1!.hostId === dataJson.data.playerId
              ? (tournament.matchSemifinale1!.invitedPlayerId as string)
              : (tournament.matchSemifinale1!.hostId as string);
          matchResult = {
            matchId: tournament.matchSemifinale1!.matchId as string,
            player1Id: tournament.matchSemifinale1!.hostId as string,
            player2Id: tournament.matchSemifinale1!.invitedPlayerId as string,
            winnerId:
              tournament.matchSemifinale1!.hostId === dataJson.data.playerId
                ? (tournament.matchSemifinale1!.invitedPlayerId as string)
                : (tournament.matchSemifinale1!.hostId as string),
            player1Score:
              tournament.matchSemifinale1!.hostId === dataJson.data.playerId
                ? 0
                : gameSettings.maxScore,
            player2Score:
              tournament.matchSemifinale1!.invitedPlayerId ===
              dataJson.data.playerId
                ? 0
                : gameSettings.maxScore,
            createdAt: new Date().toISOString(),
          };
          if (tournament.playersWhoClickedToLeave.includes(opponentId)) {
            // opponent also clicked to leave, so we generate a match result with both players as losers
            matchResult.player1Score = 0;
            matchResult.player2Score = 0;
          }
        } else if (
          tournament.matchSemifinale2?.hostId === dataJson.data.playerId ||
          (tournament.matchSemifinale2?.invitedPlayerId ===
            dataJson.data.playerId &&
            !tournament.matchResultSemifinale2)
        ) {
          // player leaving was in semifinal 2 but there's no result for it, generate a match result with the player leaving as loser
          const opponentId =
            tournament.matchSemifinale2!.hostId === dataJson.data.playerId
              ? (tournament.matchSemifinale2!.invitedPlayerId as string)
              : (tournament.matchSemifinale2!.hostId as string);
          matchResult = {
            matchId: tournament.matchSemifinale2!.matchId as string,
            player1Id: tournament.matchSemifinale2!.hostId as string,
            player2Id: tournament.matchSemifinale2!.invitedPlayerId as string,
            winnerId:
              tournament.matchSemifinale2!.hostId === dataJson.data.playerId
                ? (tournament.matchSemifinale2?.invitedPlayerId as string)
                : (tournament.matchSemifinale2?.hostId as string),
            player1Score:
              tournament.matchSemifinale2!.hostId === dataJson.data.playerId
                ? 0
                : gameSettings.maxScore,
            player2Score:
              tournament.matchSemifinale2!.invitedPlayerId ===
              dataJson.data.playerId
                ? 0
                : gameSettings.maxScore,
            createdAt: new Date().toISOString(),
          };
          if (tournament.playersWhoClickedToLeave.includes(opponentId)) {
            // opponent also clicked to leave, so we generate a match result with both players as losers
            matchResult.player1Score = 0;
            matchResult.player2Score = 0;
          }
        } else {
          logger.error(
            "Player tried to leave a tournament, but they were in semifinales which had been played, repeat-processing the same matchResultSemifinale1/2 for simplicity"
          );
          if (
            tournament.matchResultSemifinale1?.player1Id ===
              dataJson.data.playerId ||
            tournament.matchResultSemifinale1?.player2Id ===
              dataJson.data.playerId
          )
            matchResult = tournament.matchResultSemifinale1;
          else if (
            tournament.matchResultSemifinale2?.player1Id ===
              dataJson.data.playerId ||
            tournament.matchResultSemifinale2?.player2Id ===
              dataJson.data.playerId
          )
            matchResult = tournament.matchResultSemifinale2;
          else
            logger.error(
              "Player tried to leave a tournament, but they were not in any of the semifinales, this should not happen!"
            );
        }
      } else {
        // this means the player has already played in the semifinales, so we only need to generate a match result (IF NOT ALREADY PRESENT) for either finale or bronze match
        if (
          tournament.matchFinale?.hostId === dataJson.data.playerId ||
          (tournament.matchFinale?.invitedPlayerId === dataJson.data.playerId &&
            !tournament.matchResultFinale)
        ) {
          // player leaving was in finale but there's no result for it, generate a match result with the player leaving as loser
          matchResult = {
            matchId: tournament.matchFinale!.matchId as string,
            player1Id: tournament.matchFinale!.hostId as string,
            player2Id: tournament.matchFinale!.invitedPlayerId as string,
            winnerId:
              tournament.matchFinale!.hostId === dataJson.data.playerId
                ? (tournament.matchFinale?.invitedPlayerId as string)
                : (tournament.matchFinale?.hostId as string),
            player1Score:
              tournament.matchFinale!.hostId === dataJson.data.playerId
                ? 0
                : gameSettings.maxScore,
            player2Score:
              tournament.matchFinale!.invitedPlayerId === dataJson.data.playerId
                ? 0
                : gameSettings.maxScore,
            createdAt: new Date().toISOString(),
          };
          logger.info(
            "Player leaving was scheduled to play for finale but left and there's no result, now generating match result with the player leaving as loser"
          );
        } else if (
          tournament.matchBronze?.hostId === dataJson.data.playerId ||
          (tournament.matchBronze?.invitedPlayerId === dataJson.data.playerId &&
            !tournament.matchResultBronze)
        ) {
          // player leaving was in bronze match but there's no result for it, generate a match result with the player leaving as loser
          matchResult = {
            matchId: tournament.matchBronze!.matchId as string,
            player1Id: tournament.matchBronze!.hostId as string,
            player2Id: tournament.matchBronze!.invitedPlayerId as string,
            winnerId:
              tournament.matchBronze!.hostId === dataJson.data.playerId
                ? (tournament.matchBronze?.invitedPlayerId as string)
                : (tournament.matchBronze?.hostId as string),
            player1Score:
              tournament.matchBronze!.hostId === dataJson.data.playerId
                ? 0
                : gameSettings.maxScore,
            player2Score:
              tournament.matchBronze!.invitedPlayerId === dataJson.data.playerId
                ? 0
                : gameSettings.maxScore,
            createdAt: new Date().toISOString(),
          };
          logger.info(
            "Player leaving was scheduled to play for bronze but left and there's no result, now generating match result with the player leaving as loser"
          );
        } else {
          // player has played all the matches and is leaving, anything we must do? I'm informing Steffen below anyway
        }
      }

      // scope reminder: if started === true
      await Tournament.removePlayerFromPlayerTournamentsOnly(
        dataJson.data.tournamentId as string,
        dataJson.data.playerId as string
      );
      if (matchResult) handleMatchResultProcessed(matchResult);

      sendMessageToAllClients({
        type: "updateOneTournament",
        data: tournament,
      });
      // DONE: let Florian know so remaining players are informed about some automatic resolvement? Here is good
      const tournamentUpdatedHereToBeSafe =
        (tournaments.find(
          (tournament) => tournament.tournamentId === dataJson.data.tournamentId
        ) as MatchMakingTypes.Tournament) || null;
      publishMessage({
        playerLeavingId: dataJson.data.playerId,
        tournament: tournamentUpdatedHereToBeSafe,
      } as MatchMakingTypes.PlayerLeftSinceTournamentStarted); // read by chat-service, nack() by usersAndAuth
      // DONE: and what if all of them leave after tournament has started?
    }
  } catch (err) {
    logger.error("Error removing player from tournament:", err);
  }
}

// defunct?
async function handleClientDeleteTournament(
  dataJson: MatchMakingTypes.ClientDeleteTournament
) {
  try {
    removeTournament(dataJson.data);
  } catch (err) {
    logger.error("Error deleting tournament:", err);
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

function removeGameFromServerGameList(game: MatchMakingTypes.BasicGame) {
  games = games.filter((g) => g.matchId !== game.matchId);
}

async function removeTournament(tournament: MatchMakingTypes.Tournament) {
  try {
    // first delete all tournament matches from DB (and not from server game list bc never added)
    await Tournament.deleteMatch(
      tournament.matchSemifinale1?.matchId as string
    );
    await Tournament.deleteMatch(
      tournament.matchSemifinale2?.matchId as string
    );
    await Tournament.deleteMatch(tournament.matchFinale?.matchId as string);
    await Tournament.deleteMatch(tournament.matchBronze?.matchId as string);

    // then delete tournament from DB and from server tournament list
    await Tournament.delete(tournament.tournamentId as string);
    removeTournamentFromServerTournamentList(tournament);
    logger.info(" ~ deleteTournament", tournament.tournamentId);
  } catch (err) {
    logger.error("Error deleting tournament:", err);
  }
}

function removeTournamentFromServerTournamentList(
  game: MatchMakingTypes.Tournament
) {
  tournaments = tournaments.filter((g) => g.tournamentId !== game.tournamentId);
}

fastify.setNotFoundHandler((req, res) => {
  res.code(404).send({ route: req.url, method: req.method });
});

fastify.listen(
  {
    port: transNetworkSettings.gameMatchmaking.port,
    host: transNetworkSettings.gameMatchmaking.ip,
  },
  (err) => {
    if (err) {
      logger.info("Server Error!");
      fastify.log.error(err);
      process.exit(1);
    }
    logger.info(
      `Server listening on http://${transNetworkSettings.gameMatchmaking.ip}:${transNetworkSettings.gameMatchmaking.port}/`
    );
  }
);

process.on("SIGINT", () => {
  db.close();
  process.exit();
});
