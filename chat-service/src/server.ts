import Fastify from 'fastify';
import fastifyWebsocket, { WebsocketHandler } from '@fastify/websocket';
import cors from '@fastify/cors';
import { WebSocket } from 'ws';
import { chatServiceTypeGuards, ChatServiceTypes, SharedTypes, transNetworkSettings } from 'transcendence';
import { FastifyRequest } from 'fastify/types/request';
import sqlite3 from 'sqlite3';
import { parse } from 'path';
import { get } from 'http';

const fastify = Fastify();
fastify.register(fastifyWebsocket);
fastify.register(cors, { origin: "*" });

const db = new sqlite3.Database('./test_users_database.db');
const socketToClientId = new Map<WebSocket, string>();
const clientIdToSocket = new Map<string, WebSocket>();

type MatchMakingFastifyRequest = FastifyRequest<{
	Querystring: SharedTypes.ClientQueryParamMatchMaking;
}>;

// fastify.get('/chat-history/', async (req: MatchMakingFastifyRequest, reply) => {
// 	console.log("Chat history request received");

// 	const recipientId = req.query?.recipientId;
// 	if (!recipientId) {
// 		const msg = "Client didn't provide their id in query string when connecting to websocket!";
// 		console.log(msg);
// 		return reply.status(400).send({ error: msg });
// 	}

// 	console.log(recipientId);

// 	const messages = getChatHistory();
// 	return reply.send({
// 		type: "serverSendChatHistory",
// 		data: messages,
// 	});
// });

fastify.get('/chat-history/', async (req: MatchMakingFastifyRequest, reply) => {
	console.log("Chat history request received");

	// const { clientId, recipientId } = req.query; --> todo "clientId has also to be in query"
	const recipientId = req.query?.recipientId;
	const clientId = "1";
	if (!clientId || !recipientId) {
		const msg = "Missing authorId or recipientId in query string!";
		console.log(msg);
		return reply.status(400).send({ error: msg });
	}

	try {
		const messages = await getChatHistory(clientId, recipientId);
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

		const testArray = await getUsers();
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
}

function handleClientSentMessage(dataJson: ChatServiceTypes.ClientSentMessage) {
	console.log(dataJson);
	// console.log(`${dataJson.data.authorId} sent a msg to ${dataJson.data.recipientId}`)
	// if (clientIdToSocket.has((dataJson.data.recipientId))) { //to String ??? data sent to server  -->    authorId: '2', recipientId: 1, --> todo
	// 	console.log(`-----> recipient online ${dataJson.data.recipientId}`);
	// 	const recipientSocket = clientIdToSocket.get(dataJson.data.recipientId);
	// 	if (recipientSocket){
	// 		console.log("message sent");
	// 		recipientSocket.send(JSON.stringify({
	// 			type: "serverSentMessage",
	// 			data: dataJson.data,
	// 		}));
	// 	}
	// }
	// else
	// 	console.log(`-----> recipient offline`);
	const { authorId, recipientId, message, date } = dataJson.data;

	db.run(
		"INSERT INTO messages (authorId, recipientId, message, date) VALUES (?, ?, ?, ?)",
		[authorId, recipientId, message, date],
		function (err) {
			if (err) {
				console.error("DB error inserting message:", err);
			} else {
				console.log("Message inserted successfully");
				const response = {
					type: "serverSentMessage",
					data: dataJson.data,
				};
				const recipientSocket = clientIdToSocket.get(recipientId);
				if (recipientSocket) {
					recipientSocket.send(JSON.stringify(response));
				}
			}
		}
	);
}

//Database requests
async function getUsers() {
	const users: ChatServiceTypes.ChatUser[] = [];

	return new Promise<{ type: string; data: { chatUsers: ChatServiceTypes.ChatUser[] } }>((resolve, reject) => {
		db.all("SELECT * FROM users", [], (err, rows: { username: string; id: number; lastMessage: string; online: boolean}[]) => {
			if (err) {
				reject(err);
			}
			else {
				rows.forEach((row) => {
					users.push({
						blocked: Math.random() < 0.5,
						friend: Math.random() < 0.5,
						online: row.online,
						unreadMessages: true,
						displayName: row.username,
						recipientId: row.id.toString(),
						email: `${row.username}@test.com`,
						image: "test",
						lastMessage: row.lastMessage,
					});
				});
				resolve({
					type: "serverSendUserList",
					data: {
						chatUsers: users,
					},
				});
			}
		});
	});
}

async function getChatHistory(authorId: string, recipientId: string): Promise<ChatServiceTypes.Message[]> {
	return new Promise((resolve, reject) => {
		const query = `
			SELECT authorId, recipientId, message, date
			FROM messages
			WHERE
				(authorId = ? AND recipientId = ?) OR
				(authorId = ? AND recipientId = ?)
			ORDER BY date ASC
		`;

		db.all(query, [authorId, recipientId, recipientId, authorId], (err, rows: ChatServiceTypes.Message[]) => {
			if (err) {
				console.error("DB error fetching chat history:", err);
				reject(err);
			} else {
				console.log(`Chat history successfully fetched`);
				resolve(rows);
			}
		});
	});
}

fastify.listen({ port: transNetworkSettings.chatService.port, host: "0.0.0.0" }, (err) => {
if (err) {
	console.log("Server Error!");
	fastify.log.error(err);
	process.exit(1);
}
console.log(`Server listening on http://localhost:${transNetworkSettings.chatService.port}/`);
});
