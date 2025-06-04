import amqp from 'amqplib';
import { GameResultTypes, gameResultTypeGuards } from 'transcendence';
import { GameResultModel } from '../orm/gameResultModel.js';
import { matchmakingTypeGuards } from 'transcendence';

const queue = 'matchmaking-service-queue';

async function updateUserTournamentRecords(msg: GameResultTypes.TournamentResult){
	console.log("Updating user tournament records db...");
	if (!gameResultTypeGuards.isTournamentResult(msg)) {
		console.error("Invalid tournament result message format");
		return;
	}
	try {
		await GameResultModel.recordNewTournament(msg);
	} catch (err) {
		console.error("DB error inserting user tournament records", err);
	}
}

async function updateUserSimpleMatchRecords(msg: GameResultTypes.MatchResult) {
	console.log("Updating user simple match history db...");
	if (!gameResultTypeGuards.isMatchResult(msg)) {
		console.error("Invalid match result message format");
		return;
	}
	try {
		await GameResultModel.recordNewSimpleMatch(msg);
	} catch (err) {
		console.error("DB error inserting user simple match records", err);
	}
}

export async function startConsumer() {
	// const connection = await amqp.connect(`amqp://${process.env.RABBITMQ_HOST || 'localhost'}`);
	let connection;
	try {
		connection = await amqp.connect("amqp://admin:admin@rabbitmq-service:5672");
		console.log("Connected to amqp://admin:admin@rabbitmq-service:5672");
	} catch (err) {
		console.warn("Failed to connect to rabbitmq-service, trying localhost...");
		connection = await amqp.connect("amqp://localhost");
	}
	const channel = await connection.createChannel();

	await channel.assertQueue(queue, { durable: true });

	console.log('[Consumer] Waiting for messages...');

	channel.consume(queue, async (msg) => {
		if (msg !== null) {
			const message = JSON.parse(msg.content.toString());
			console.log('[Consumer] Received:', message);
			if (gameResultTypeGuards.isTournamentResult(message))
				await updateUserTournamentRecords(message);
			else if (gameResultTypeGuards.isMatchResult(message))
				await updateUserSimpleMatchRecords(message);
			if (matchmakingTypeGuards.isTournamentNotification(message) || matchmakingTypeGuards.isServerStartTournament(message) || matchmakingTypeGuards.isPlayerLeftSinceTournamentStarted(message)) {
				console.log("Received TournamentNotification or ServerStartTournament:", message, ", not for usersAndAuth service, nack() it.");
				channel.nack(msg, false, true);
				return;
			}
			else
				console.error("Wrong data read from rabbitMQ in usersAndAuth service.");
			channel.ack(msg);
		}
	});
}
