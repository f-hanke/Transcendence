import Fastify from 'fastify';
import fastifyWebsocket, { WebsocketHandler } from '@fastify/websocket';
import cors from '@fastify/cors';
import { WebSocket } from 'ws';
import { ChatServiceTypes, transNetworkSettings } from 'transcendence';
import { FastifyRequest } from 'fastify/types/request';

const fastify = Fastify();
fastify.register(fastifyWebsocket);
fastify.register(cors, { origin: "*" });

type ChatUser = ChatServiceTypes.ChatUser;
type Message = ChatServiceTypes.Message;
type ServerSendChatHistory = ChatServiceTypes.ServerSendChatHistory;

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
	}
	const ServerSendUserList = {
		type: "serverSendUserList",
		data: {
			chatUsers: users,
		},
	}
	return ServerSendUserList;
  };

const generateTestConversation = (): Message[] => {
	const now = new Date();
	const formatDate = (minutesAgo: number) =>
		new Date(now.getTime() - minutesAgo * 60 * 1000).toISOString();

	const conversation: Message[] = [
		{
		authorId: "1",
		recipientId: "2",
		message: "Hey! How’s it going?",
		date: formatDate(5),
		},
		{
		authorId: "2",
		recipientId: "1",
		message: "Good, just working on a project. You?",
		date: formatDate(4),
		},
		{
		authorId: "1",
		recipientId: "2",
		message: "Same here! Doing some TypeScript stuff.",
		date: formatDate(3),
		},
		{
		authorId: "2",
		recipientId: "1",
		message: "Nice! Let me know if you wanna pair-program later.",
		date: formatDate(2),
		},
		{
		authorId: "1",
		recipientId: "2",
		message: "For sure! Ping me after 6?",
		date: formatDate(1),
		},
		{
		authorId: "2",
		recipientId: "1",
		message: "Will do ✌️",
		date: formatDate(0),
		},
	];

	return conversation;
};

fastify.get('/chat-history/:recipientId', async (req, reply) => {
	const { recipientId } = req.params as { recipientId: string };

	const history = generateTestConversation().filter(
		(msg) => msg.recipientId === recipientId || msg.authorId === recipientId
	);

	return reply.send({
		type: "serverSendChatHistory",
		data: {
		recipientId,
		history,
		},
	});
});

const clients = new Map<WebSocket, string>();

fastify.register(async function (fastify) {
	fastify.get("/ws", { websocket: true }, (socket, req) => {
		registerClient(req, socket);

		const testArray = generateTestUsers();
		socket.send(JSON.stringify(testArray));

		socket.on('message', (message) => {
			const data = message.toString("utf-8");
			console.log("message received: ", data);
			socket.send(data);
		});

		socket.on('close', () => {
			const clientId = clients.get(socket);
			console.log(`Client disconnected: ${clientId}`);
			clients.delete(socket);
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
	clients.set(socket, clientId);
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
