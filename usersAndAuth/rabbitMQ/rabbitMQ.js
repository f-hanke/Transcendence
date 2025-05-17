import amqp from 'amqplib';
import { gameResultTypeGuards } from 'transcendence';
import { GameResultModel } from '../orm/gameResultModel.js';
const queue = 'matchMaking-results';
async function updateUserTournamentRecords(msg) {
    console.log("Updating user tournament records db...");
    try {
        await GameResultModel.recordNewTournament(msg);
    }
    catch (err) {
        console.error("DB error inserting user tournament records", err);
    }
}
async function updateUserSimpleMatchRecords(msg) {
    console.log("Updating user simple match history db...");
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
            else
                console.error("Wrong data read from rabbitMQ.");
            channel.ack(msg);
        }
    });
}
