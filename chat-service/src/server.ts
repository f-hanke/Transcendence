import Fastify from 'fastify';
import fastifyWebsocket, { WebsocketHandler } from '@fastify/websocket';
import cors from '@fastify/cors';
import { WebSocket } from 'ws';
import { chatServiceTypeGuards, ChatServiceTypes, SharedTypes, transNetworkSettings } from 'transcendence';
import { FastifyRequest } from 'fastify/types/request';
import Database from 'better-sqlite3';
import { parse } from 'path';
import { get } from 'http';

const fastify = Fastify();
fastify.register(fastifyWebsocket);
fastify.register(cors, { origin: "*" });

const db = new Database('./test_users_database.db');
const socketToClientId = new Map<WebSocket, string>();
const clientIdToSocket = new Map<string, WebSocket>(); //todo websocket[] array to allow connections over multiple tabs

type MatchMakingFastifyRequest = FastifyRequest<{
	Querystring: SharedTypes.ClientQueryParamMatchMaking;
}>;

fastify.get('/chat-history/', async (req: MatchMakingFastifyRequest, reply) => {
	console.log("Chat history request received");

	const { clientId, recipientId } = req.query;
	if (!clientId || !recipientId) {
		const msg = "Missing authorId or recipientId in query string!";
		console.log(msg);
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

fastify.register(async function (fastify) {
	fastify.get("/ws", { websocket: true }, async (socket, req) => {
		registerClient(req, socket);

		const testArray = await getUsers(socket);
		console.log(testArray);
		socket.send(JSON.stringify(testArray));

		socket.on('message', (message) => {
			const data = message.toString("utf-8");
			const dataJson = JSON.parse(data);
			if (chatServiceTypeGuards.isClientSentMessage(dataJson)) {
				handleClientSentMessage(dataJson);
			}
		});

		socket.on('close', () => {
			const clientId = socketToClientId.get(socket) as string;
			socketToClientId.delete(socket);
			clientIdToSocket.delete(clientId);
			console.log(`Client disconnected: ${clientId}`);
			updateUserOnlineStatus(clientId, false);
		});
		socket.on("error", (err) => {
			console.error("WebSocket error:", err);
		});
	});
});

function registerClient(req: FastifyRequest, socket: WebSocket) {
	const clientId = (req.query as { clientId?: string }).clientId;
	if (!clientId) {
		console.log("No clientId provided in query");
		socket.close(1008, "Missing clientId");
		return;
	}
	socketToClientId.set(socket, clientId);
	clientIdToSocket.set(clientId, socket);
	console.log(`Client connected: ${clientId}`);
	updateUserOnlineStatus(clientId, true);
}

function updateUserOnlineStatus(userId: string, isOnline: boolean): void {
	const query = `UPDATE users SET online = ? WHERE id = ?`;
	try {
		const stmt = db.prepare(query);
		const result = stmt.run(isOnline ? 1 : 0, userId);

		if (result.changes === 0) {
			console.warn(`No user found with id ${userId}`);
		} else {
			console.log(`Updated user ${userId} online status to ${isOnline}`);
			fastify.websocketServer.clients.forEach((client) => {
				if (client !== clientIdToSocket.get(userId)){
					const ServerClientChangedOnlineStatus = {
						type: "serverClientChangedOnlineStatus",
						data: {
							recipientId: userId,
							onlineStatus: isOnline,
						},
					}
					client.send(JSON.stringify(ServerClientChangedOnlineStatus));
				}
			});
		}
	} catch (err) {
		console.error(`Failed to update user status:`, err);
		throw err;
	}
}

function handleClientSentMessage(dataJson: ChatServiceTypes.ClientSentMessage) {
	console.log(dataJson);
	const { authorId, recipientId, message, date } = dataJson.data;

	try {
		const stmt = db.prepare(
			"INSERT INTO messages (authorId, recipientId, message, date) VALUES (?, ?, ?, ?)"
		);
		stmt.run(authorId, recipientId, message, date);

		console.log("Message inserted successfully");
		updateUnreadMessages(recipientId, true);
		const response = {
			type: "serverSentMessage",
			data: dataJson.data,
		};
		const recipientSocket = clientIdToSocket.get(recipientId);
		const authorSocket = clientIdToSocket.get(authorId);
		if (authorSocket) {
			authorSocket.send(JSON.stringify(response));
			//todo : if websocket[] send to all sockets
		}
		if (recipientSocket)
			recipientSocket.send(JSON.stringify(response));
	} catch (err) {
		console.error("DB error inserting message:", err);
	}
}

function getUsers(socket: WebSocket): { type: string; data: { chatUsers: ChatServiceTypes.ChatUser[] } } | undefined {
	const clientId = socketToClientId.get(socket);
	if (!clientId) {
		console.log("No clientId found for socket");
		return undefined;
	}
	const users: ChatServiceTypes.ChatUser[] = [];

	try {
		const stmt = db.prepare("SELECT username, id, online, unreadMessages FROM users");
		const rows = stmt.all() as { username: string; id: string; online: boolean; unreadMessages: boolean }[];

		rows.forEach((row) => {
			if (row.id === clientId) return;
			users.push({
				blocked: Math.random() < 0.5,
				friend: Math.random() < 0.5,
				online: row.online,
				unreadMessages: row.unreadMessages,
				displayName: row.username,
				recipientId: row.id,
				email: `${row.username}@test.com`,
				image: "test",
				lastMessage: "start a conversation",
			});
		});

		return {
			type: "serverSendUserList",
			data: {
				chatUsers: users,
			},
		};
	} catch (err) {
		console.error("DB error fetching users:", err);
		return undefined;
	}
}
//todo ClientChangeBlockStatus, ClientInviteToPlay

function updateUnreadMessages(recipientId: string, unreadMessages: boolean): void {
	try {
		const stmt = db.prepare("UPDATE users SET unreadMessages = ? WHERE id = ?");
		stmt.run(unreadMessages ? 1 : 0, recipientId);
	} catch (err) {
		console.error("DB error updating unread messages:", err);
	}
}

function getChatHistory(authorId: string, recipientId: string): ChatServiceTypes.Message[] {
	const query = `
		SELECT authorId, recipientId, message, date
		FROM messages
		WHERE
			(authorId = ? AND recipientId = ?) OR
			(authorId = ? AND recipientId = ?)
		ORDER BY date ASC
	`;

	try {
		const stmt = db.prepare(query);
		const rows = stmt.all(authorId, recipientId, recipientId, authorId) as ChatServiceTypes.Message[];

		console.log(`Chat history successfully fetched authorId: ${authorId} recipientId: ${recipientId}`);
		updateUnreadMessages(authorId, false);
		return rows;
	} catch (err) {
		console.error("DB error fetching chat history:", err);
		throw err;
	}
}

fastify.listen({ port: transNetworkSettings.chatService.port, host: "0.0.0.0" }, (err) => {
if (err) {
	console.log("Server Error!");
	fastify.log.error(err);
	process.exit(1);
}
console.log(`Server listening on http://localhost:${transNetworkSettings.chatService.port}/`);
});
