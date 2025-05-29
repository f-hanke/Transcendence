import amqp from 'amqplib';
import { rabbitMQTypeGuards, RabbitMQTypes } from 'transcendence';
import { db, sendToClient, updateUnreadMessages } from './server.js';
import { databaseQuerys } from './databaseQuerys.js';
import { matchmakingTypeGuards } from 'transcendence';
import { MatchMakingTypes } from 'transcendence';
import { tournamentResultNotification, tournamentStartNotification } from './tournamentNotifications.js';

const queue = 'auth-ChatService';
const tournamentQueue = 'matchmaking-service-queue';

function	updateUserDatabase(msg: RabbitMQTypes.UserChange){
	console.log("update user db", msg);
	try {
		db.prepare(databaseQuerys.updateUserDatabase).run(msg.id, msg.displayName, msg.smallImage, msg.language);
	} catch (err) {
		console.error("DB error updating/inserting user db", err);
	}
}

export async function startConsumer() {
	let connection;
	try {
		connection = await amqp.connect('amqp://admin:admin@rabbitmq-service:5672');
	} catch (err) {
		console.warn('Failed to connect to rabbitmq-service, trying localhost...');
		connection = await amqp.connect('amqp://localhost');
	}

	const channel = await connection.createChannel();
	await channel.assertQueue(queue, { durable: false });

	console.log('[Consumer] Waiting for messages...');
	channel.consume(queue, (msg) => {
		if (msg !== null) {
			const message = JSON.parse(msg.content.toString());
			if (message.smallImage && message.smallImage.type === 'Buffer')
				message.smallImage = Buffer.from(message.smallImage.data);
			if (message.id)
				message.id = message.id.toString();
			if (rabbitMQTypeGuards.isUserChangeBody(message)) {
				channel.ack(msg);
				updateUserDatabase(message);
			}else {
				console.error("Wrong data read from rabbitMQ : ChatService.");
				console.log(message);
				channel.nack(msg, false, true);
			}
		}
	});

	await channel.assertQueue(tournamentQueue, { durable: false });
	console.log('[Consumer] Waiting tournament notifications...');

	channel.consume(tournamentQueue, (msg) => {
		if (msg !== null) {
			const message = JSON.parse(msg.content.toString());
			if (matchmakingTypeGuards.isTournamentNotification(message)) {
				channel.ack(msg);
				console.log("Received tournament notification:", message);
				tournamentResultNotification(message);
			} else if (matchmakingTypeGuards.isServerStartTournament(message)){
				console.log("Tournament upcoming Match Nofitication!");
				tournamentStartNotification(message);
			} else if (matchmakingTypeGuards.isPlayerLeftSinceTournamentStarted(message)) {
				;
			} else {
				console.error("Wrong data read from rabbitMQ : ChatService.");
				console.log("Message: ", message)
				channel.nack(msg, false, true);
			}
		}
	});
}
