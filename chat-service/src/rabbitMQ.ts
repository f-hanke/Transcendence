import amqp from 'amqplib';
import { rabbitMQTypeGuards, RabbitMQTypes } from 'transcendence';
import { db } from './server.js';
import { databaseQuerys } from './databaseQuerys.js';

const queue = 'auth-ChatService';

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
			message.id = message.id.toString();
			if (message.smallImage && message.smallImage.type === 'Buffer')
				message.smallImage = Buffer.from(message.smallImage.data);
			if (rabbitMQTypeGuards.isUserChangeBody(message)) {
				channel.ack(msg);
				updateUserDatabase(message);
			}else
				console.error("Wrong data read from rabbitMQ : ChatService.");
		}
	});
}
