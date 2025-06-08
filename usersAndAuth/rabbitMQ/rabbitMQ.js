import amqp from 'amqplib';
import { gameResultTypeGuards } from 'transcendence';
import { GameResultModel } from '../orm/gameResultModel.js';
const tournamentResultQueue = 'tournament-results-queue';
async function updateUserTournamentRecords(msg) {
    console.log("Updating user tournament records db...");
    if (!gameResultTypeGuards.isTournamentResult(msg)) {
        console.error("Invalid tournament result message format");
        return;
    }
    try {
        await GameResultModel.recordNewTournament(msg);
    }
    catch (err) {
        console.error("DB error inserting user tournament records", err);
    }
}
async function updateUserSimpleMatchRecords(msg) {
    console.log("Updating user simple match history db...");
    if (!gameResultTypeGuards.isMatchResult(msg)) {
        console.error("Invalid match result message format");
        return;
    }
    try {
        await GameResultModel.recordNewSimpleMatch(msg);
    }
    catch (err) {
        console.error("DB error inserting user simple match records", err);
    }
}
export async function startConsumer() {
    let connection;
    try {
        const rabbitUser = process.env.RABBITMQ_DEFAULT_USER || 'admin';
        const rabbitPass = process.env.RABBITMQ_DEFAULT_PASS || 'admin';
        const rabbitHost = process.env.RABBITMQ_HOST || 'rabbitmq-service';
        const connectionString = `amqp://${rabbitUser}:${rabbitPass}@${rabbitHost}:5672`;
        connection = await amqp.connect(connectionString);
        console.log(`✅ Users-auth RabbitMQ Consumer connected at ${connectionString.replace(rabbitPass, '[REDACTED]')}`);
    }
    catch (err) {
        console.warn("Failed to connect to rabbitmq-service, trying localhost...");
        connection = await amqp.connect("amqp://localhost");
    }
    const channel = await connection.createChannel();
    await channel.assertQueue(tournamentResultQueue, { durable: true });
    console.log('[Consumer] Waiting for tournament results...');
    channel.consume(tournamentResultQueue, async (msg) => {
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
