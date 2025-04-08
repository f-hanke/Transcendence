import Fastify from 'fastify';
import fastifyWebsocket, { WebsocketHandler } from '@fastify/websocket';
import cors from '@fastify/cors';
import { WebSocket } from 'ws';
import { chatServiceTypeGuards, ChatServiceTypes, SharedTypes, transNetworkSettings } from 'transcendence';
import { FastifyRequest } from 'fastify/types/request';
import { parse } from 'path';

const fastify = Fastify();
fastify.register(fastifyWebsocket);
fastify.register(cors, { origin: "*" });

type ChatUser = ChatServiceTypes.ChatUser;
type Message = ChatServiceTypes.Message;

const messageMap = new Map<number, Message[]>();

type MatchMakingFastifyRequest = FastifyRequest<{
	Querystring: SharedTypes.ClientQueryParamMatchMaking;
}>;

function getClientIdFromQueryParam(req: MatchMakingFastifyRequest) {
	if (req?.query?.recipientId) return req.query.recipientId;
	const msg =
	  "Client didn't provide their id in query string when connecting to websocket!";
	console.log(msg);
	throw new Error(msg);
}

fastify.get('/chat-history/', async (req: MatchMakingFastifyRequest, reply) => {
	console.log("Chat history request received");
	const recipientId = getClientIdFromQueryParam(req as MatchMakingFastifyRequest);

	console.log(recipientId);
	const messages = messageMap.get(parseInt(recipientId));

	return reply.send({type: "serverSendChatHistory", data: messages});
});


const generateTestUsers = () =>{
	const users: ChatUser[] = [];

	for (let i = 0; i < 20; i++) {
	  users.push({
		blocked: Math.random() < 0.5,
		friend: true,
		online: Math.random() < 0.5,
		unreadMessages: Math.random() < 0.5,
		displayName: `User ${i}`,
		recipientId: `${i}`,
		email: `user${i}@test.com`,
		image: "test",
		lastMessage: `Last message from user ${i}`,
	  });
	  generateTestConversation(i);
	}
	const ServerSendUserList = {
		type: "serverSendUserList",
		data: {
			chatUsers: users,
		},
	}
	return ServerSendUserList;
  };

const generateTestConversation = (recipientId: number) => {
	const now = new Date();
	const formatDate = (minutesAgo: number) =>
		new Date(now.getTime() - minutesAgo * 60 * 1000).toISOString();

	const recipientIdString = recipientId.toString();
	const conversation: Message[] = [
		{
		authorId: "user1",
		recipientId: recipientIdString,
		message: "Hey! How’s it going?",
		date: formatDate(5),
		},
		{
		authorId: recipientIdString,
		recipientId: "user1",
		message: `${recipientIdString} Good, just working on a project. You?`,
		date: formatDate(4),
		},
		{
		authorId: "user1",
		recipientId: recipientIdString,
		message: "Same here! Doing some TypeScript stuff.",
		date: formatDate(3),
		},
		{
		authorId: recipientIdString,
		recipientId: "user1",
		message: `${recipientIdString} Nice! Let me know if you wanna pair-program later.`,
		date: formatDate(2),
		},
		{
		authorId: "user1",
		recipientId: recipientIdString,
		message: "For sure! Ping me after 6?",
		date: formatDate(1),
		},
		{
		authorId: recipientIdString,
		recipientId: "user1",
		message: `${recipientIdString} Will do`,
		date: formatDate(0),
		},
	];
	messageMap.set(parseInt(recipientIdString), conversation);
};

const socketToClientId = new Map<WebSocket, string>();
const clientIdToSocket = new Map<string, WebSocket>();

fastify.register(async function (fastify) {
	fastify.get("/ws", { websocket: true }, (socket, req) => {
		registerClient(req, socket);

		const testArray = generateTestUsers();
		socket.send(JSON.stringify(testArray));

		socket.on('message', (message) => {
			const data = message.toString("utf-8");
			const dataJson = JSON.parse(data);
			if (dataJson.type == "clientSentMessage") {
				const dataJsonType = dataJson as ChatServiceTypes.ClientSentMessage;
				console.log(dataJsonType);
				console.log(`${dataJsonType.data.authorId} sent a msg to ${dataJsonType.data.recipientId}`)
				if (clientIdToSocket.has(dataJsonType.data.recipientId)) {
					console.log(`-----> recipient online`);
					const recipientSocket = clientIdToSocket.get(dataJsonType.data.recipientId);
					recipientSocket?.send(JSON.stringify({
						type: "serverSentMessage",
						data: dataJsonType.data,
					}));
				}
				else
					console.log(`-----> recipient offline`);
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

fastify.listen({ port: transNetworkSettings.chatService.port, host: "0.0.0.0" }, (err) => {
if (err) {
	console.log("Server Error!");
	fastify.log.error(err);
	process.exit(1);
}
console.log(`Server listening on http://localhost:${transNetworkSettings.chatService.port}/`);
});
