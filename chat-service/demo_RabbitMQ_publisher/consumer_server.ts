import amqp from 'amqplib';

const QUEUE = 'user_registered';

async function startConsumer() {
	try {
		const connection = await amqp.connect('amqp://localhost');
		const channel = await connection.createChannel();

		await channel.assertQueue(QUEUE, { durable: true });

		console.log(`📥 Waiting for messages in ${QUEUE}...`);

		channel.consume(QUEUE, (msg) => {
			if (msg) {
				const user = JSON.parse(msg.content.toString());
				console.log('✅ Received user:', user);

				// Here you'd update the local chat DB with the new user
				// e.g., db.insert(user)

				channel.ack(msg);
			}
		});
	} catch (err) {
		console.error('Failed to start consumer:', err);
	}
}

startConsumer();
