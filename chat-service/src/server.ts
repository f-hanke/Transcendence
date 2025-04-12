import Fastify from 'fastify';
import fastifyWebsocket, { WebsocketHandler } from '@fastify/websocket';
import cors from '@fastify/cors';
import { WebSocket } from 'ws';
import { chatServiceTypeGuards, ChatServiceTypes, SharedTypes, transNetworkSettings } from 'transcendence';
import { FastifyRequest } from 'fastify/types/request';
import Database from 'better-sqlite3';
import { parse } from 'path';
import { get } from 'http';
import { send } from 'process';

const fastify = Fastify();
fastify.register(fastifyWebsocket);
fastify.register(cors, { origin: "*" });

const db = new Database('./test_users_database.db');
const socketToClientId = new Map<WebSocket, string>();
const clientIdToSocket = new Map<string, WebSocket[]>();

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

function	acceptFriendRequest(authorId: string, recipientId: string, type: string){
	try {
		const result = db.prepare(`
			UPDATE friends
			SET status = 'accepted'
			WHERE (user_id1 = ? AND user_id2 = ?)
			OR (user_id1 = ? AND user_id2 = ?)
		`).run(authorId, recipientId, recipientId, authorId);

		if (result.changes === 0)
			return [400, { reason: 'Friend request not found or already accepted.' }] as const;

		// Notify users via WebSocket
		console.log("friend request successfully accepted");
		sendToClient(recipientId, { type: 'accept', recipientId: authorId} );
		return [200, null] as const;
	}
	catch (err) {
		console.error("Error accepting friend request:", err);
		return [500, { reason: 'Failed to accept friend request' }] as const;
	}
}

function	sendFriendRequest(authorId: string, recipientId: string, type: string){
	try {
		// Check if they are already friends
		const existingFriendship = db.prepare(`
			SELECT * FROM friends
			WHERE (user_id1 = ? AND user_id2 = ? AND status = 'accepted')
			OR (user_id1 = ? AND user_id2 = ? AND status = 'accepted')
		`).get(authorId, recipientId, recipientId, authorId);

		if (existingFriendship)
			return [400, { reason: 'You are already friends.' }] as const;

		// Check if there is already a pending request
		const existingRequest = db.prepare(`
			SELECT * FROM friends
			WHERE (user_id1 = ? AND user_id2 = ? AND status = 'pending')
			OR (user_id1 = ? AND user_id2 = ? AND status = 'pending')
		`).get(authorId, recipientId, recipientId, authorId);

		if (existingRequest)
			return [400, { reason: 'Friend request already exists or is pending.' }] as const;

		// Insert the request with 'pending' status
		db.prepare(`
			INSERT INTO friends (user_id1, user_id2, status)
			VALUES (?, ?, 'pending')
		`).run(authorId, recipientId);
		console.log("friend request successfully sent");
		sendToClient(recipientId, { type: "send", recipientId: authorId})
		return [200, null] as const;
	}
	catch (err) {
		console.error("Error sending friend request:", err);
		return [500, { reason: 'Failed to send friend request' }] as const;
	}
}

function	removeFriendRequest(authorId: string, recipientId: string, type: ChatServiceTypes.UpdateFriendRequest["type"]){
	try {
		const result = db.prepare(`
			DELETE FROM friends
			WHERE (user_id1 = ? AND user_id2 = ?)
			OR (user_id1 = ? AND user_id2 = ?)
		`).run(authorId, recipientId, recipientId, authorId);

		if (result.changes === 0)
			return [400, { reason: 'Friend request not found.' }] as const;

		// Notify users via WebSocket
		console.log(`friend request successfully ${type}`);
		sendToClient(recipientId, { type: type, recipientId: authorId});
		return [200, null] as const;
	}
	catch (err) {
		console.error(`[Error] for friend request ${type}`, err);
		return [500, { reason: 'Failed to reject friend request' }] as const;
	}
}

// // Reject a Friend Request
fastify.post('/update-friend-request', async (req, reply) => {
	if (!chatServiceTypeGuards.isSendFriendRequestBody(req.body))
		return reply.status(400).send({ reason: 'Body not correct' } satisfies ChatServiceTypes.ErrorResponseBody);
	const { type, authorId, recipientId } = req.body;

	console.log(`Updating friendrequest tpye: ${type}`);
	if (!authorId || !recipientId)
		return reply.status(400).send({ error: 'Missing senderId or recipientId' });

	let status: number, error: ChatServiceTypes.ErrorResponseBody | null;
	switch (type){
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

fastify.post('/update-blocking-status', async (req, reply) => {
	console.log("trying to block user");
	console.log(req.body);
	if (!chatServiceTypeGuards.isClientChangeBlockStatus(req.body))
		return reply.status(400).send({ reason: 'Body not correct' } satisfies ChatServiceTypes.ErrorResponseBody);
	const { clientId, recipientId, blockedStatus } = req.body;

	console.log(req.body);
	try {
		if (blockedStatus === false) {
			const result = db.prepare(`
				DELETE FROM blockings
				WHERE (user_id1 = ? AND user_id2 = ?)
			`).run(clientId, recipientId);
			if (result!.changes === 0)
				return [400, { reason: 'No blockings found' }] as const;
		} else{
			db.prepare(`
				INSERT INTO blockings (user_id1, user_id2)
				VALUES (?, ?)
			`).run(clientId, recipientId);
		}

		// Notify users via WebSocket
		console.log("blocking was successfull");
		return [200, null] as const;
	}
	catch (err) {
		console.error("Error blocking user:", err);
		return [500, { reason: 'Failed to block user' }] as const;
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
			console.log(dataJson);
			if (chatServiceTypeGuards.isSentMessage(dataJson)) {
				handleClientSentMessage(dataJson);
			}
		});

		socket.on('close', () => {
			const clientId = socketToClientId.get(socket) as string;
			socketToClientId.delete(socket);
			removeSocketFromClient(clientId, socket)
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
	addSocketToClient(clientId, socket);
	updateUserOnlineStatus(clientId, true);
}

function addSocketToClient(clientId: string, socket: WebSocket){
	if (!clientIdToSocket.has(clientId)){
		clientIdToSocket.set(clientId, []);
	}
	clientIdToSocket.get(clientId)?.push(socket);
	console.log(`[Connected] Socket added to client ${clientId}`);
}

function removeSocketFromClient(clientId: string, socket: WebSocket){
	const sockets = clientIdToSocket.get(clientId);
	if (!sockets)
		return ;
	const index = sockets.indexOf(socket);
	if (index !== -1)
		sockets.splice(index, 1);

	if (sockets.length === 0) {
		clientIdToSocket.delete(clientId);
		console.log(`[Disconnected] client ${clientId}`);
	}
	else
		console.log(`Socket removed client ${clientId}`)
}

function sendToClient(clientId: string, message: ChatServiceTypes.AllChatMessageTypes){
	const sockets = clientIdToSocket.get(clientId);

	fastify.websocketServer.clients.forEach((client) => {
		if (sockets?.includes(client))
			client.send(JSON.stringify(message));
	});
}

function sendToAllClientsExcept(clientIdToExclude: string, message: ChatServiceTypes.AllChatMessageTypes) {
	fastify.websocketServer.clients.forEach((client) => {
		if (socketToClientId.get(client) !== clientIdToExclude) {
			client.send(JSON.stringify(message));
		}
	});
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
			sendToAllClientsExcept(userId, { type: "serverClientChangedOnlineStatus", data: { recipientId: userId, onlineStatus: isOnline } })
		}
	} catch (err) {
		console.error(`Failed to update user status:`, err);
		throw err;
	}
}

function handleClientSentMessage(dataJson: ChatServiceTypes.SentMessage) {
	console.log(dataJson);
	const { authorId, recipientId, message, date } = dataJson.data;

	try {
		const stmt = db.prepare(
			"INSERT INTO messages (authorId, recipientId, message, date) VALUES (?, ?, ?, ?)"
		);
		stmt.run(authorId, recipientId, message, date);

		console.log("Message inserted successfully");
		updateUnreadMessages(recipientId, authorId, true);
		sendToClient(authorId, { type: "sentMessage", data: dataJson.data });
		sendToClient(recipientId, { type: "sentMessage", data: dataJson.data });
	} catch (err) {
		console.error("DB error inserting message:", err);
	}
}

function getFriendRequestStatus(clientId: string, otherUserId: string){
	try {
		const result = db.prepare(`
			SELECT user_id1, user_id2, status FROM friends
			WHERE (user_id1 = ? AND user_id2 = ?) OR (user_id1 = ? AND user_id2 = ?)
		`).get(clientId, otherUserId, otherUserId, clientId) as { user_id1: string; user_id2: string; status: string } | undefined;

		if (!result)
			return [null, false] as const;

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

		return [null, friend]  as const;
	} catch (err) {
		console.error("Error checking friend request status:", err);
		return [null, false]  as const;
	}
}

function getBlockedStatus(clientId: string, recipientId: string){
	try {
		const result = db.prepare(`
			SELECT user_id1, user_id2 FROM blockings
			WHERE (user_id1 = ? AND user_id2 = ?)
		`).get(clientId, recipientId) as { user_id1: string; user_id2: string} | undefined;

		if (!result)
			return false;
		return true;
	} catch (err) {
		console.error("Error checking blocked status:", err);
		return false;
	}
}

function getLastMessage(clientId: string, recipientId: string)
{
	try {
		const result = db.prepare(`
			SELECT message, date
			FROM messages
			WHERE
				(authorId = ? AND recipientId = ?) OR
				(authorId = ? AND recipientId = ?)
			ORDER BY date DESC
			LIMIT 1
		`).get(clientId, recipientId, recipientId, clientId) as { message: string, date: string} | undefined;

		if (!result)
			return "start a conversation";
		return result.message;
	} catch (err) {
		console.error("Error checking retriving last msg:", err);
		return "start a conversation";
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
		const stmt = db.prepare("SELECT username, id, online FROM users");
		const rows = stmt.all() as { id: string; username: string; online: boolean; }[];

		rows.forEach((row) => {
			if (row.id === clientId)
				return;
			const [friendRequestStatus, friendStatus] = getFriendRequestStatus(clientId, row.id);
			const blocked = getBlockedStatus(clientId, row.id);
			const lastMessage = getLastMessage(clientId, row.id);
			// const lastMessage = "start a new conversation"
			users.push({
				blocked: blocked,
				friend: friendStatus,
				online: row.online,
				unreadMessages: getUnreadMessage(row.id, clientId),
				displayName: row.username,
				recipientId: row.id,
				email: `${row.username}@test.com`,
				image: "test",
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
		console.error("DB error fetching users:", err);
		return undefined;
	}
}
//todo ClientInviteToPlay
function	getUnreadMessage(recipientId: string, authorId: string){
	try {
		const result = db.prepare(`
			SELECT unread
			FROM chat_status
			WHERE (user_id = ? AND chat_partner_id = ?)
		`).get(authorId, recipientId) as { unread: boolean} | undefined;

		if (!result)
			return false;
		return result.unread;
	} catch (err) {
		console.error("Error checking retriving last msg:", err);
		return false;
	}
}

function updateUnreadMessages(recipientId: string, authorId: string, unreadMessages: boolean): void {
	try {
		if (unreadMessages === true){
			db.prepare(`
				INSERT INTO chat_status (user_id, chat_partner_id, unread)
				VALUES (?, ?, 1)
				ON CONFLICT(user_id, chat_partner_id) DO UPDATE SET unread = 1
			`).run(recipientId, authorId);
		}else{
			db.prepare(`
				UPDATE chat_status
				SET unread = 0
				WHERE user_id = ? AND chat_partner_id = ?
			  `).run(authorId, recipientId);
		}
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
		updateUnreadMessages(recipientId, authorId, false);
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
