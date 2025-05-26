import amqp from 'amqplib';
import { rabbitMQTypeGuards, RabbitMQTypes } from 'transcendence';
import { db, sendToClient, updateUnreadMessages } from './server.js';
import { databaseQuerys } from './databaseQuerys.js';
import { matchmakingTypeGuards } from 'transcendence';
import { MatchMakingTypes } from 'transcendence';
import { GameResultTypes } from 'transcendence';
import { match } from 'assert';

const queue = 'auth-ChatService';
const tournamentQueue = 'matchmaking-service-queue';

function	updateUserDatabase(msg: RabbitMQTypes.UserChange){
	console.log("update user db");
	try {
		db.prepare(databaseQuerys.updateUserDatabase).run(msg.id, msg.displayName, msg.smallImage);
	} catch (err) {
		console.error("DB error updating/inserting user db", err);
	}
}

function	generateTournamentMessage(type: string, data: MatchMakingTypes.Tournament){
	let msg = "[Tournament Notification] - Match Result\n";

	let matchResult: GameResultTypes.MatchResult | null;
	switch (type) {
		case "semifinale1":
			matchResult = data.matchResultSemifinale1;
			type = type.substring(0, 10);
			break;
		case "semifinale2":
			matchResult = data.matchResultSemifinale2;
			type = type.substring(0, 10);
			break;
		case "finale":
			matchResult = data.matchResultFinale;
			break;
		case "bronze":
			matchResult = data.matchResultBronze;
			break;
	}
	msg += "Type: " + type + "\n";
	msg += "Player1: " + matchResult!.player1Id + "\nPlayer2: " + matchResult!.player2Id + "\n";
	msg += "Winner: " + matchResult!.winnerId;
	return msg;
}

function	tournamentResultNotification(msg: MatchMakingTypes.TournamentNotification) {
	const type = msg.updateForMatch;
	const data = msg.tournamentData;
	const players: string[] = [
		data.player1Id,
		data.player2Id,
		data.player3Id,
		data.player4Id
	].filter((id): id is string => typeof id === 'string');

	console.log("TYPE OF NOTIFICATION: ", type);
	const message = generateTournamentMessage(type, data);
	const date = new Date().toISOString().replace('T', ' ').substring(0, 19);
	switch (type){
		case "semifinale1":
			console.log("Handling semifinal1 match logic");
			players.forEach((player) => {
				const notification = {
					type: "sentMessage",
					data: {
						authorId: "0",
						recipientId: player,
						message: message,
						date: date,
						type: null,
					},
				} as const;
				try {
					const stmt = db.prepare(databaseQuerys.insertMessage).run("0", player, message, date, null);

					console.log("Message inserted successfully");
					updateUnreadMessages(player, "0", true);
				} catch (err) {
					console.error("DB error inserting message:", err);
				}
				sendToClient(player, notification);
			});

			break;
		case "semifinale2":
			console.log("Handling semifinal2 match logic");
			players.forEach((player) => {
				const notification = {
					type: "sentMessage",
					data: {
						authorId: "0",
						recipientId: player,
						message: message,
						date: date,
						type: null,
					},
				} as const;
				try {
					const stmt = db.prepare(databaseQuerys.insertMessage).run("0", player, message, date, null);

					console.log("Message inserted successfully");
					updateUnreadMessages(player, "0", true);
				} catch (err) {
					console.error("DB error inserting message:", err);
				}
				sendToClient(player, notification);
			});

			break;

		case "finale":
			console.log("Handling final match logic");
			players.forEach((player) => {
				const notification = {
					type: "sentMessage",
					data: {
						authorId: "0",
						recipientId: player,
						message: message,
						date: date,
						type: null,
					},
				} as const;
				try {
					const stmt = db.prepare(databaseQuerys.insertMessage).run("0", player, message, date, null);

					console.log("Message inserted successfully");
					updateUnreadMessages(player, "0", true);
				} catch (err) {
					console.error("DB error inserting message:", err);
				}
				sendToClient(player, notification);
			});

			break;

		case "bronze":
			console.log("Handling bronze match logic");
			players.forEach((player) => {
				const notification = {
					type: "sentMessage",
					data: {
						authorId: "0",
						recipientId: player,
						message: message,
						date: date,
						type: null,
					},
				} as const;
				try {
					const stmt = db.prepare(databaseQuerys.insertMessage).run("0", player, message, date, null);

					console.log("Message inserted successfully");
					updateUnreadMessages(player, "0", true);
				} catch (err) {
					console.error("DB error inserting message:", err);
				}
				sendToClient(player, notification);
			});

			break;
	}
}

export async function startConsumer() {
	// const connection = await amqp.connect('amqp://admin:admin@rabbitmq-service:5672');
	let connection;
	try {
		connection = await amqp.connect('amqp://admin:admin@rabbitmq-service:5672');
	} catch (err) {
		console.warn('Failed to connect to rabbitmq-service, trying localhost...');
		connection = await amqp.connect('amqp://localhost');
	}
//   const connection = await amqp.connect(`amqp://localhost`);
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
			} else {
				console.error("Wrong data read from rabbitMQ : ChatService.");
				console.log("Message: ", message)
				channel.nack(msg, false, true);
			}
		}
	});
}
