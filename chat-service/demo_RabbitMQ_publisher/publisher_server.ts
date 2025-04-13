import amqp from 'amqplib';

const QUEUE = 'user_registered';

async function publishMessage(user: { id: string; username: string }) {
	try {
		const connection = await amqp.connect('amqp://localhost');
		const channel = await connection.createChannel();

		await channel.assertQueue(QUEUE, { durable: true });

		const msg = JSON.stringify(user);
		channel.sendToQueue(QUEUE, Buffer.from(msg), { persistent: true });

		console.log(`📤 Sent message to ${QUEUE}:`, msg);

		// Optionally close connection after a delay
		setTimeout(() => connection.close(), 500);
	} catch (err) {
		console.error('Failed to publish:', err);
	}
}

// Simulate new user
publishMessage({ id: '1234', username: 'alice' });
