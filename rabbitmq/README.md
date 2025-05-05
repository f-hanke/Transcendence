# RabbitMQ Message Queue Service

This directory contains the configuration for running RabbitMQ as a standalone service for inter-service communication in our microservices architecture.

## Overview

RabbitMQ is used as the central message broker for asynchronous communication between microservices:

- Auth Service ⟷ RabbitMQ ⟷ User Service
- Game Service ⟷ RabbitMQ ⟷ Chat Service
- Notification Service ⟷ RabbitMQ ⟷ Other Services

## Pre-configured Components

- **Exchange**: `microservices-exchange` (topic)
- **Queues**:
  - `auth-service-queue`
  - `user-service-queue`
  - `game-service-queue`
  - `chat-service-queue`
  - `notification-service-queue`
- **Bindings**:
  - `auth.#` → `auth-service-queue`
  - `user.#` → `user-service-queue`
  - `game.#` → `game-service-queue`
  - `chat.#` → `chat-service-queue`
  - `notification.#` → `notification-service-queue`

## Getting Started

1. Start the RabbitMQ service:
   ```bash
   ./start-rabbitmq.sh
   ```

2. Access the management UI:
   - URL: http://localhost:15672
   - Username: admin
   - Password: admin

## Service Configuration

- **AMQP port**: 5672
- **Management port**: 15672
- **Default credentials**: admin/admin

## Integration Examples

### Publishing a Message

```javascript
// producer.js
const amqp = require('amqplib');

async function sendMessage() {
  try {
    // Connect to RabbitMQ
    const connection = await amqp.connect('amqp://admin:admin@localhost:5672');
    const channel = await connection.createChannel();

    // Publish to exchange with routing key
    const exchange = 'microservices-exchange';
    const routingKey = 'user.created';
    const message = {
      event: 'user_created',
      userId: '123',
      timestamp: new Date().toISOString()
    };

    channel.publish(
      exchange,
      routingKey,
      Buffer.from(JSON.stringify(message)),
      { persistent: true }
    );

    console.log('Message sent:', message);

    // Close the connection
    await channel.close();
    await connection.close();
  } catch (error) {
    console.error('Error:', error);
  }
}

sendMessage();
```

### Consuming Messages

```javascript
// consumer.js
const amqp = require('amqplib');

async function consumeMessages() {
  try {
    // Connect to RabbitMQ
    const connection = await amqp.connect('amqp://admin:admin@localhost:5672');
    const channel = await connection.createChannel();

    // Consume from a specific queue
    const queue = 'user-service-queue';
    
    // Ensure the queue exists
    await channel.assertQueue(queue, { durable: true });

    // Set up consumer
    channel.consume(queue, (message) => {
      if (message !== null) {
        const content = JSON.parse(message.content.toString());
        console.log('Received:', content);

        // Process the message
        processMessage(content);

        // Acknowledge the message
        channel.ack(message);
      }
    });

    console.log('Waiting for messages...');
  } catch (error) {
    console.error('Error:', error);
  }
}

function processMessage(message) {
  // Your message processing logic here
  console.log('Processing message:', message);
}

consumeMessages();
```

## Maintenance

- **View logs**:
  ```bash
  docker logs rabbitmq-service
  ```

- **Reset RabbitMQ**:
  ```bash
  docker stop rabbitmq-service
  docker rm rabbitmq-service
  ./start-rabbitmq.sh
  ```

- **Manage exchanges and queues**:
  Use the RabbitMQ management UI at http://localhost:15672

## Monitoring

Configure RabbitMQ monitoring in the main monitoring stack to track:
- Queue depths
- Message rates
- Consumer counts
- Memory usage 