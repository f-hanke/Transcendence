import amqp from 'amqplib';
import { GameResultTypes, gameResultTypeGuards } from 'transcendence';
import { db } from '../db/db.js';

const queue = 'game-service-queue';

function updateOngoingTournamentDatabase(msg: GameResultTypes.MatchResult){
  console.log("update Tournament db");
  try {
    db.prepare(`UPDATE matches SET player1Score=?, player2Score=?, playedAt=? WHERE id=?`)
    .run(msg.player1Score, msg.player2Score, msg.createdAt, msg.matchId);
  } catch (err) {
    console.error("DB error updating/inserting Tournament db: ", err);
  }
}

export async function startConsumer(onMessage: (matchResult: GameResultTypes.MatchResult) => void) {
	let connection;
	try {
			connection = await amqp.connect('amqp://admin:admin@rabbitmq-service:5672');
			console.log("Connected to amqp://admin:admin@rabbitmq-service:5672");
		} catch (err) {
			console.warn('Failed to connect to rabbitmq-service, trying localhost...');
			connection = await amqp.connect('amqp://localhost');
		}
	const channel = await connection.createChannel();

	await channel.assertQueue(queue, { durable: true });

	console.log('[Consumer] Waiting for messages...');

	channel.consume(queue, (msg) => {
		if (msg !== null) {
			const matchResult = JSON.parse(msg.content.toString());
			console.log('[Consumer] Received:', matchResult);
			if (gameResultTypeGuards.isMatchResult(matchResult)) {
				channel.ack(msg);
				// updateOngoingTournamentDatabase(matchResult);
        		onMessage(matchResult);  // callback function
		  	}
      		else
				console.error("Wrong data read from rabbitMQ in matchMaking (remote) service.");
		}
	});
}
