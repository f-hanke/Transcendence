import amqp from 'amqplib';

const queue = 'auth-ChatService';

export async function startConsumer() {
	const connection = await amqp.connect('amqp://localhost');
	const channel = await connection.createChannel();

	await channel.assertQueue(queue, { durable: false });

	console.log('[Consumer] Waiting for messages...');

	channel.consume(queue, (msg) => {
		if (msg !== null) {
		const message = JSON.parse(msg.content.toString());
		console.log('[Consumer] Received:', message);
		channel.ack(msg);
		}
	});
}
