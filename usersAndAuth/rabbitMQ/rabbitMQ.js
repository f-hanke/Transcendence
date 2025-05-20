import amqp from 'amqplib';
import { gameResultTypeGuards } from 'transcendence';
import { GameResultModel } from '../orm/gameResultModel.js';
import { matchmakingTypeGuards } from 'transcendence';
const queue = 'matchmaking-service-queue';
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
    const connection = await amqp.connect(`amqp://${process.env.RABBITMQ_HOST || 'localhost'}`);
    const channel = await connection.createChannel();
    await channel.assertQueue(queue, { durable: false });
    console.log('[Consumer] Waiting for messages...');
    channel.consume(queue, async (msg) => {
        if (msg !== null) {
            const message = JSON.parse(msg.content.toString());
            console.log('[Consumer] Received:', message);
            if (gameResultTypeGuards.isTournamentResult(message))
                await updateUserTournamentRecords(message);
            else if (gameResultTypeGuards.isMatchResult(message))
                await updateUserSimpleMatchRecords(message);
            else if (matchmakingTypeGuards.isTournamentNotification(message))
                console.log("Received tournament notification:", message, ", not for usersAndAuth service.");
            else
                console.error("Wrong data read from rabbitMQ in usersAndAuth service.");
            channel.ack(msg);
        }
    });
}
