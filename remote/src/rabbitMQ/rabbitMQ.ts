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
    const rabbitUser = process.env.RABBITMQ_DEFAULT_USER || 'admin';
    const rabbitPass = process.env.RABBITMQ_DEFAULT_PASS || 'admin';
    const rabbitHost = process.env.RABBITMQ_HOST || 'rabbitmq-service';
    const connectionString = `amqp://${rabbitUser}:${rabbitPass}@${rabbitHost}:5672`;
    connection = await amqp.connect(connectionString);
    console.log(`✅ Remote RabbitMQ consumer connected at ${connectionString.replace(rabbitPass, '[REDACTED]')}`);
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
