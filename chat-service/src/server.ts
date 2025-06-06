import Fastify from "fastify";
import fastifyWebsocket, { WebsocketHandler } from "@fastify/websocket";
import cors from "@fastify/cors";
import { WebSocket } from "ws";
import {
  AuthServiceTypes,
  chatServiceTypeGuards,
  ChatServiceTypes,
  monitoringEnabled,
  SharedTypes,
  transNetworkSettings,
} from "transcendence";
import { FastifyRequest } from "fastify/types/request";
import Database from "better-sqlite3";
import { parse } from "path";
import { get } from "http";
import { send } from "process";
import {
  acceptFriendRequest,
  removeFriendRequest,
  sendFriendRequest,
} from "./friendService.js";
import { databaseQuerys } from "./databaseQuerys.js";
import { startConsumer } from "./rabbitMQ.js";
import { start } from "repl";
import esClient, { checkElasticsearch } from "./lib/elasticsearch.js";
import logger from "./lib/logger.js";
import { setupMetrics } from "./lib/metrics.js";

const fastify = Fastify();
fastify.register(fastifyWebsocket);
fastify.register(cors, { origin: "*" });

// Add health check endpoint for Docker
fastify.get("/health", async () => {
  return { status: "ok" };
});

if (monitoringEnabled) {
  setupMetrics(fastify);
  //keep commented out unless docker is running requires elsasticsearch to be running
  await checkElasticsearch();
  logger.info("Metrics and logger initialized.");
}
export const db = new Database("./db/chat_service_db.db");
const socketToClientId = new Map<WebSocket, string>();
const clientIdToSocket = new Map<string, WebSocket[]>();

export const messagesArray = {
  en: {
    start: "Start a conversation",
  },
  fr: {
    start: "Commencez une conversation",
  },
  de: {
    start: "Beginnen Sie ein Gespräch",
  },
} as const;

await startConsumer().catch(logger.error);

type MatchMakingFastifyRequest = FastifyRequest<{
  Querystring: SharedTypes.ClientQueryParamMatchMaking;
}>;

fastify.get("/chat-history/", async (req: MatchMakingFastifyRequest, reply) => {
  logger.info("Chat history request received");

  const { clientId, recipientId } = req.query;
  if (!clientId || !recipientId) {
    const msg = "Missing authorId or recipientId in query string!";
    logger.info(msg);
    return reply.status(400).send({ error: msg });
  }

  try {
    const messages = getChatHistory(clientId, recipientId);
    return reply.send({
      type: "serverSendChatHistory",
      data: messages,
    });
  } catch (err) {
    return reply.status(500).send({ error: "Failed to fetch chat history" });
  }
});

// Update friend status
fastify.post("/update-friend-request", async (req, reply) => {
  if (!chatServiceTypeGuards.isSendFriendRequestBody(req.body))
    return reply
      .status(400)
      .send({
        reason: "Body not correct",
      } satisfies ChatServiceTypes.ErrorResponseBody);
  const { type, authorId, recipientId } = req.body;

  logger.info(`Updating friendrequest tpye: ${type}`);
  if (!authorId || !recipientId)
    return reply.status(400).send({ error: "Missing senderId or recipientId" });

  let status: number, error: ChatServiceTypes.ErrorResponseBody | null;
  switch (type) {
    case "send":
      [status, error] = sendFriendRequest(authorId, recipientId, type);
      return reply.status(status).send(error);
    case "accept":
      [status, error] = acceptFriendRequest(authorId, recipientId, type);
      return reply.status(status).send(error);
    case "declined":
      [status, error] = removeFriendRequest(authorId, recipientId, type);
      return reply.status(status).send(error);
    case "withdrawn":
      [status, error] = removeFriendRequest(authorId, recipientId, type);
      return reply.status(status).send(error);
    case "unfriended":
      [status, error] = removeFriendRequest(authorId, recipientId, type);
      return reply.status(status).send(error);
  }
});

fastify.post("/update-blocking-status", async (req, reply) => {
  logger.info("trying to block user");
  logger.info(req.body);
  if (!chatServiceTypeGuards.isClientChangeBlockStatus(req.body))
    return reply
      .status(400)
      .send({
        reason: "Body not correct",
      } satisfies ChatServiceTypes.ErrorResponseBody);
  const { clientId, recipientId, blockedStatus } = req.body;

  try {
    if (blockedStatus === false) {
      const result = db
        .prepare(databaseQuerys.deleteBlocking)
        .run(clientId, recipientId);
      if (result!.changes === 0)
        return [400, { reason: "No blockings found" }] as const;
    } else {
      db.prepare(databaseQuerys.insertBlocking).run(clientId, recipientId);
    }

    // Notify users via WebSocket
    logger.info("blocking was successfull");
    return [200, null] as const;
  } catch (err) {
    logger.error("Error blocking user:", err);
    return [500, { reason: "Failed to block user" }] as const;
  }
});

fastify.post("/send-game-invite", async (req, reply) => {
  logger.info("invite to game");
  logger.info(req.body);
  if (!chatServiceTypeGuards.isInviteToPlayRequestBody(req.body))
    return reply
      .status(400)
      .send({
        reason: "Body not correct",
      } satisfies ChatServiceTypes.ErrorResponseBody);
  const { authorId, recipientId, date } = req.body;

  logger.info(req.body);
  const msg = "User invited you to play a game with them\nClick here to join";
  try {
    handleClientSentMessage({
      type: "sentMessage",
      data: {
        authorId: authorId,
        recipientId: recipientId,
        message: msg,
        date: date,
        type: "sendGameInvite",
      },
    });
    logger.info("Game invite was successfull");
    return [200, null] as const;
  } catch (err) {
    logger.error("Error inviting to game:", err);
    return [500, { reason: "Failed to send game invite" }] as const;
  }
});

fastify.register(async function (fastify) {
  fastify.get("/ws", { websocket: true }, async (socket, req) => {
    registerClient(req, socket);

    const testArray = getUsers(socket);
    logger.info(testArray);
    socket.send(JSON.stringify(testArray));

    socket.on("message", (message) => {
      const data = message.toString("utf-8");
      const dataJson = JSON.parse(data);
      logger.info(dataJson);
      if (chatServiceTypeGuards.isSentMessage(dataJson)) {
        handleClientSentMessage(dataJson);
      }
    });

    socket.on("close", () => {
      const clientId = socketToClientId.get(socket) as string;
      socketToClientId.delete(socket);
      removeSocketFromClient(clientId, socket);
      updateUserOnlineStatus(clientId, false);
    });
    socket.on("error", (err) => {
      logger.error("WebSocket error:", err);
    });
  });
});

function registerClient(req: FastifyRequest, socket: WebSocket) {
  const clientId = (req.query as { clientId?: string }).clientId;
  //todo: check if client exists in db
  if (!clientId || clientId == null) {
    logger.info("No clientId provided in query");
    socket.close(1008, "Missing clientId");
    return;
  }
  socketToClientId.set(socket, clientId);
  addSocketToClient(clientId, socket);
  updateUserOnlineStatus(clientId, true);
}

function addSocketToClient(clientId: string, socket: WebSocket) {
  if (!clientIdToSocket.has(clientId)) {
    clientIdToSocket.set(clientId, []);
  }
  clientIdToSocket.get(clientId)?.push(socket);
  logger.info(`[Connected] Socket added to client ${clientId}`);
}

function removeSocketFromClient(clientId: string, socket: WebSocket) {
  const sockets = clientIdToSocket.get(clientId);
  if (!sockets) return;
  const index = sockets.indexOf(socket);
  if (index !== -1) sockets.splice(index, 1);

  if (sockets.length === 0) {
    clientIdToSocket.delete(clientId);
    logger.info(`[Disconnected] client ${clientId}`);
  } else logger.info(`Socket removed client ${clientId}`);
}

export function sendToClient(
  clientId: string,
  message: ChatServiceTypes.AllChatMessageTypes
) {
  const sockets = clientIdToSocket.get(clientId);

  fastify.websocketServer.clients.forEach((client) => {
    if (sockets?.includes(client)) client.send(JSON.stringify(message));
  });
}

function sendToAllClientsExcept(
  clientIdToExclude: string,
  message: ChatServiceTypes.AllChatMessageTypes
) {
  fastify.websocketServer.clients.forEach((client) => {
    if (socketToClientId.get(client) !== clientIdToExclude) {
      client.send(JSON.stringify(message));
    }
  });
}

function updateUserOnlineStatus(userId: string, isOnline: boolean): void {
  try {
    const stmt = db.prepare(databaseQuerys.updateOnlineStatus);
    const result = stmt.run(isOnline ? 1 : 0, userId);

    if (result.changes === 0) {
      logger.warn(`No user found with id ${userId}`);
    } else {
      logger.info(`Updated user ${userId} online status to ${isOnline}`);
      sendToAllClientsExcept(userId, {
        type: "serverClientChangedOnlineStatus",
        data: { recipientId: userId, onlineStatus: isOnline },
      });
    }
  } catch (err) {
    logger.error(`Failed to update user status:`, err);
    throw err;
  }
}

function handleClientSentMessage(dataJson: ChatServiceTypes.SentMessage) {
  logger.info(dataJson);
  const { authorId, recipientId, message, date, type } = dataJson.data;

  try {
    let typeData = null;
    if (type) typeData = type;
    db.prepare(databaseQuerys.insertMessage).run(
      authorId,
      recipientId,
      message,
      date,
      typeData
    );

    logger.info("Message inserted successfully");
    updateUnreadMessages(recipientId, authorId, true);
    sendToClient(authorId, { type: "sentMessage", data: dataJson.data });
    sendToClient(recipientId, { type: "sentMessage", data: dataJson.data });
  } catch (err) {
    logger.error("DB error inserting message:", err);
  }
}

function getFriendRequestStatus(clientId: string, otherUserId: string) {
  try {
    const result = db
      .prepare(databaseQuerys.getFriendRow)
      .get(clientId, otherUserId, otherUserId, clientId) as
      | { user_id1: string; user_id2: string; status: string }
      | undefined;

    if (!result) return [null, false] as const;

    let friend = false;
    if (result.status === "accepted") {
      friend = true;
    } else if (result.status === "pending") {
      if (result.user_id1 === clientId) {
        return ["pendingClientInvite", friend] as const;
      } else {
        return ["pendingRecipientInvite", friend] as const;
      }
    }

    return [null, friend] as const;
  } catch (err) {
    logger.error("Error checking friend request status:", err);
    return [null, false] as const;
  }
}

function getBlockedStatus(clientId: string, recipientId: string) {
  try {
    const result = db
      .prepare(databaseQuerys.getBlocking)
      .get(clientId, recipientId) as
      | { user_id1: string; user_id2: string }
      | undefined;

    if (!result) return false;
    return true;
  } catch (err) {
    logger.error("Error checking blocked status:", err);
    return false;
  }
}

export function getLanguage(clientId: string): string {
  try {
    const result = db.prepare(databaseQuerys.getLanguage).get(clientId) as
      | { language: string }
      | undefined;
    if (!result || !result.language) return "en";

    return result.language;
  } catch (err) {
    logger.error("Error retrieving language from db:", err);
    return "en";
  }
}

function getLastMessage(clientId: string, recipientId: string) {
  const lang = getLanguage(clientId) as AuthServiceTypes.Language;
  const msg = messagesArray[lang].start;
  try {
    const result = db
      .prepare(databaseQuerys.getLastMessage)
      .get(clientId, recipientId, recipientId, clientId) as
      | { message: string; date: string }
      | undefined;

    if (!result) return msg;
    return result.message;
  } catch (err) {
    logger.error("Error checking retriving last msg:", err);
    return msg;
  }
}

function getUsers(
  socket: WebSocket
):
  | { type: string; data: { chatUsers: ChatServiceTypes.ChatUser[] } }
  | undefined {
  const clientId = socketToClientId.get(socket);
  if (!clientId) {
    logger.info("No clientId found for socket");
    return undefined;
  }
  const users: ChatServiceTypes.ChatUser[] = [];

  try {
    const stmt = db.prepare(databaseQuerys.getUser);
    const rows = stmt.all() as {
      id: string;
      username: string;
      small_image: ChatServiceTypes.BufferLike;
      online: boolean;
    }[];

    rows.forEach((row) => {
      if (row.id === clientId) return;
      const [friendRequestStatus, friendStatus] = getFriendRequestStatus(
        clientId,
        row.id
      );
      const blocked = getBlockedStatus(clientId, row.id);
      const lastMessage = getLastMessage(clientId, row.id);
      users.push({
        blocked: blocked,
        friend: friendStatus,
        online: row.online,
        unreadMessages: getUnreadMessage(row.id, clientId),
        displayName: row.username,
        recipientId: row.id,
        email: `${row.username}@test.com`,
        image: row.small_image,
        lastMessage: lastMessage,
        friendRequestStatus: friendRequestStatus,
      });
    });

    return {
      type: "serverSendUserList",
      data: {
        chatUsers: users,
      },
    };
  } catch (err) {
    logger.error("DB error fetching users:", err);
    return undefined;
  }
}

function getUnreadMessage(recipientId: string, authorId: string) {
  try {
    const result = db
      .prepare(databaseQuerys.getUnreadMessage)
      .get(authorId, recipientId) as { unread: boolean } | undefined;
    if (!result) return false;
    return result.unread;
  } catch (err) {
    logger.error("Error checking retriving last msg:", err);
    return false;
  }
}

export function updateUnreadMessages(
  recipientId: string,
  authorId: string,
  unreadMessages: boolean
): void {
  try {
    db.prepare(databaseQuerys.updateUnreadMessage).run(
      recipientId,
      authorId,
      unreadMessages ? 1 : 0,
      unreadMessages ? 1 : 0
    );
  } catch (err) {
    logger.error("DB error updating unread messages:", err);
  }
}

function getChatHistory(
  authorId: string,
  recipientId: string
): ChatServiceTypes.Message[] {
  try {
    const stmt = db.prepare(databaseQuerys.getChatHistory);
    const rows = stmt.all(
      authorId,
      recipientId,
      recipientId,
      authorId
    ) as ChatServiceTypes.Message[];

    logger.info(
      `Chat history successfully fetched authorId: ${authorId} recipientId: ${recipientId}`
    );
    updateUnreadMessages(authorId, recipientId, false);
    return rows;
  } catch (err) {
    logger.error("DB error fetching chat history:", err);
    throw err;
  }
}

fastify.listen(
  {
    port: transNetworkSettings.chatService.port,
    host: transNetworkSettings.chatService.ip,
  },
  (err) => {
    if (err) {
      logger.info("Server Error!");
      fastify.log.error(err);
      process.exit(1);
    }
    logger.info(
      `ChatService - Server listening on http://localhost:${transNetworkSettings.chatService.port}/`
    );
  }
);
