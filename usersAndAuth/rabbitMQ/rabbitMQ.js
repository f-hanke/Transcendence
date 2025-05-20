import amqp from 'amqplib';
import { gameResultTypeGuards } from 'transcendence';
import { GameResultModel } from '../orm/gameResultModel.js';
const queue = 'matchMaking-results';
async function updateUserTournamentRecords(msg) {
    console.log("Updating user tournament records db...");
<<<<<<< HEAD
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
>>>>>>> origin/main
    if (!gameResultTypeGuards.isTournamentResult(msg)) {
        console.error("Invalid tournament result message format");
        return;
    }
<<<<<<< HEAD
=======
>>>>>>> f85dc2c (chore(remote): shovel it carefully onto new main)
>>>>>>> origin/main
=======
>>>>>>> origin/main
    try {
        await GameResultModel.recordNewTournament(msg);
    }
    catch (err) {
        console.error("DB error inserting user tournament records", err);
    }
}
async function updateUserSimpleMatchRecords(msg) {
    console.log("Updating user simple match history db...");
<<<<<<< HEAD
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
>>>>>>> origin/main
    if (!gameResultTypeGuards.isMatchResult(msg)) {
        console.error("Invalid match result message format");
        return;
    }
<<<<<<< HEAD
=======
>>>>>>> f85dc2c (chore(remote): shovel it carefully onto new main)
>>>>>>> origin/main
=======
>>>>>>> origin/main
    try {
        await GameResultModel.recordNewSimpleMatch(msg);
    }
    catch (err) {
        console.error("DB error inserting user simple match records", err);
    }
}
export async function startConsumer() {
<<<<<<< HEAD
<<<<<<< HEAD
    const connection = await amqp.connect('amqp://localhost');
=======
<<<<<<< HEAD
    const connection = await amqp.connect(`amqp://${process.env.RABBITMQ_HOST || 'localhost'}`);
=======
    const connection = await amqp.connect('amqp://localhost');
>>>>>>> f85dc2c (chore(remote): shovel it carefully onto new main)
>>>>>>> origin/main
=======
    const connection = await amqp.connect(`amqp://${process.env.RABBITMQ_HOST || 'localhost'}`);
>>>>>>> origin/main
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
<<<<<<< HEAD
<<<<<<< HEAD
                console.error("Wrong data read from rabbitMQ.");
=======
<<<<<<< HEAD
                console.error("Wrong data read from rabbitMQ in usersAndAuth service.");
=======
                console.error("Wrong data read from rabbitMQ.");
>>>>>>> f85dc2c (chore(remote): shovel it carefully onto new main)
>>>>>>> origin/main
=======
                console.error("Wrong data read from rabbitMQ in usersAndAuth service.");
>>>>>>> origin/main
            channel.ack(msg);
        }
    });
}
