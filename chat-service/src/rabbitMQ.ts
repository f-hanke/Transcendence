import amqp from 'amqplib';
import { rabbitMQTypeGuards, RabbitMQTypes } from 'transcendence';
import { db } from './server.js';
import { databaseQuerys } from './databaseQuerys.js';
import { matchmakingTypeGuards } from 'transcendence';

const queue = 'auth-ChatService';
const tournamentQueue = 'matchmaking-service-queue';

// from auth service
// const message = {
// 	type: "updateUserDatabase",
// 	data: {
// 		id: string,
// 		username: string,
// 		smallimage: string,
//   	}
//   };

//announce tournament matchup

function	updateUserDatabase(msg: RabbitMQTypes.UserChange){
	if (!rabbitMQTypeGuards.isUserChangeBody(msg))
		console.error("Trying to updateUserDatabase with wrong data.");
	console.log("update user db");
	try {
		db.prepare(databaseQuerys.updateUserDatabase).run(msg.id, msg.displayName, msg.smallImage);
	} catch (err) {
		console.error("DB error updating/inserting user db", err);
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
			}else
				console.error("Wrong data read from rabbitMQ : ChatService.");
		}
	});

	await channel.assertQueue(tournamentQueue, { durable: false });
	console.log('[Consumer] Waiting tournament notifications...');

	channel.consume(tournamentQueue, (msg) => {
		if (msg !== null) {
			const message = JSON.parse(msg.content.toString());
			if (matchmakingTypeGuards.isTournamentNotification(message)) {
				channel.ack(msg);
				// if (message.type === 'tournamentMatchup') {
				// 	const tournamentMatchup = message.data;
				// 	db.prepare(databaseQuerys.updateTournamentMatchup).run(
				// 		tournamentMatchup.tournamentId,
				// 		tournamentMatchup.matchSemifinale1,
				// 		tournamentMatchup.matchSemifinale2,
				// 		tournamentMatchup.matchFinale,
				// 		tournamentMatchup.matchBronze
				// 	);
				// } else if (message.type === 'tournamentResult') {
				// 	const tournamentResult = message.data;
				// 	db.prepare(databaseQuerys.updateTournamentResult).run(
				// 		tournamentResult.tournamentId,
				// 		tournamentResult.rank1PlayerId,
				// 		tournamentResult.rank2PlayerId,
				// 		tournamentResult.rank3PlayerId,
				// 		tournamentResult.rank4PlayerId
				// 	);
				// }
				console.log("Received tournament notification:", message);
			} else {
				console.error("Wrong data read from rabbitMQ : ChatService.");
				channel.nack(msg);
			}
		}
	});
}
