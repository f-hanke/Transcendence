// src/publisher.ts
import amqp from 'amqplib';

const queue = 'auth-ChatService';

async function publishMessage() {
  const connection = await amqp.connect('amqp://localhost');
  const channel = await connection.createChannel();

  await channel.assertQueue(queue, { durable: false });

  const message = {
    type: "updateUserDatabase",
    data: {
      id: "29",
      username: "testuser29",
    }
  };

  channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
  console.log('[Publisher] Sent:', message);

//   setTimeout(() => {
//     connection.close();
//     process.exit(0);
//   }, 500);
}

publishMessage().catch(console.error);
