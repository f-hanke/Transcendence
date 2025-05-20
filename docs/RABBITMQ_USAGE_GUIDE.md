# RabbitMQ Usage Guide for Microservices

This guide provides comprehensive instructions on how to use RabbitMQ for inter-service communication in our microservices architecture.

## Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Getting Started](#getting-started)
4. [Basic Concepts](#basic-concepts)
5. [Integration Examples](#integration-examples)
   - [TypeScript Integration](#typescript-integration)
   - [Advanced Patterns](#advanced-patterns)
6. [Monitoring and Management](#monitoring-and-management)
7. [Troubleshooting](#troubleshooting)
8. [Best Practices](#best-practices)

## Overview

RabbitMQ is used as our central message broker to enable asynchronous communication between microservices. This allows services to communicate without direct dependencies, improving scalability and resilience.

## Architecture

Our RabbitMQ setup is configured with a topic exchange and dedicated queues for each service:

```
                      ┌─────────────────┐
                      │                 │
                      │  microservices  │
                      │    exchange     │
                      │    (topic)      │
                      │                 │
                      └─────────────────┘
                              │
              ┌───────────────┼───────────────┐
              │               │               │
              ▼               ▼               ▼
    ┌─────────────────┐┌─────────────────┐┌─────────────────┐
    │  auth-service   ││  user-service   ││  game-service   │
    │     queue       ││     queue       ││     queue       │
    └─────────────────┘└─────────────────┘└─────────────────┘
              ▲               ▲               ▲
              │               │               │
         auth.#           user.#           game.#
     (routing key)     (routing key)     (routing key)
```

- **Exchange**: `microservices-exchange` (topic type)
- **Queues**: Dedicated per service (e.g., `auth-service-queue`)
- **Routing Keys**: Pattern-based (e.g., `auth.#` routes to auth service queue)

## Getting Started

1. **Start RabbitMQ**:
   ```bash
   ./start-rabbitmq.sh
   ```
   Or if starting with the entire stack:
   ```bash
   ./start.sh
   ```

2. **Access Management UI**:
   - URL: http://localhost:15672
   - Username: admin
   - Password: admin

## Basic Concepts

### Messaging Patterns

1. **Point-to-Point**:
   - One sender, one receiver
   - Messages sent to a specific queue

2. **Publish/Subscribe**:
   - One sender, multiple receivers
   - Messages sent to an exchange, then routed to queues

3. **Request/Reply**:
   - Send a message and wait for a response
   - Uses correlation IDs to match requests with replies

### Key Components

- **Exchange**: Routes messages to queues based on rules
- **Queue**: Stores messages until consumers retrieve them
- **Binding**: Links exchanges to queues with routing rules
- **Routing Key**: Address used for message routing

## Integration Examples

### TypeScript Integration

#### 1. Install Required Packages
```bash
npm install amqplib
npm install @types/amqplib --save-dev
```

#### 2. Message Types

```typescript
// types.ts
export interface BaseMessage {
  event: string;
  timestamp: string;
}

export interface UserCreatedMessage extends BaseMessage {
  event: 'user_created';
  id: string;
  username: string;
  email: string;
}

export interface UserUpdatedMessage extends BaseMessage {
  event: 'user_updated';
  id: string;
  username?: string;
  email?: string;
}

export interface UserDeletedMessage extends BaseMessage {
  event: 'user_deleted';
  id: string;
}

export type UserMessage = UserCreatedMessage | UserUpdatedMessage | UserDeletedMessage;
```

#### 3. Publishing Messages

```typescript
// publisher.ts
import amqp from 'amqplib';
import { UserCreatedMessage } from './types';

async function publishMessage<T>(routingKey: string, message: T): Promise<boolean> {
  try {
    // Connect to RabbitMQ
    const connection = await amqp.connect('amqp://admin:admin@localhost:5672');
    const channel = await connection.createChannel();
    
    // Ensure exchange exists
    const exchange = 'microservices-exchange';
    await channel.assertExchange(exchange, 'topic', { durable: true });
    
    // Publish message
    const success = channel.publish(
      exchange,
      routingKey,
      Buffer.from(JSON.stringify(message)),
      { persistent: true }
    );
    
    console.log(`Message sent to ${routingKey}:`, message);
    
    // Close connection
    setTimeout(() => {
      channel.close();
      connection.close();
    }, 500);
    
    return success;
  } catch (error) {
    console.error('Error publishing message:', error);
    throw error;
  }
}

// Example usage
const userCreatedMessage: UserCreatedMessage = {
  event: 'user_created',
  id: '12345',
  username: 'newuser',
  email: 'user@example.com',
  timestamp: new Date().toISOString()
};

publishMessage('user.created', userCreatedMessage);
```

#### 4. Consuming Messages

```typescript
// consumer.ts
import amqp, { Channel, Connection, ConsumeMessage } from 'amqplib';
import { UserMessage } from './types';

type MessageHandler<T> = (message: T, properties: amqp.MessageProperties) => Promise<void>;

interface ConsumerResult {
  connection: Connection;
  channel: Channel;
}

async function setupConsumer<T>(
  queueName: string, 
  bindingPattern: string, 
  messageHandler: MessageHandler<T>
): Promise<ConsumerResult> {
  try {
    // Connect to RabbitMQ
    const connection = await amqp.connect('amqp://admin:admin@localhost:5672');
    const channel = await connection.createChannel();
    
    // Setup exchange
    const exchange = 'microservices-exchange';
    await channel.assertExchange(exchange, 'topic', { durable: true });
    
    // Setup queue
    await channel.assertQueue(queueName, { durable: true });
    
    // Bind queue to exchange with routing pattern
    await channel.bindQueue(queueName, exchange, bindingPattern);
    
    // Set prefetch (only process one message at a time)
    channel.prefetch(1);
    
    // Start consuming
    channel.consume(queueName, async (msg: ConsumeMessage | null) => {
      if (!msg) return;
      
      try {
        const content = JSON.parse(msg.content.toString()) as T;
        console.log(`Received message on ${queueName}:`, content);
        
        // Process message with provided handler
        await messageHandler(content, msg.properties);
        
        // Acknowledge successful processing
        channel.ack(msg);
      } catch (error) {
        console.error('Error processing message:', error);
        // Reject message and requeue (or not)
        channel.nack(msg, false, false);
      }
    });
    
    console.log(`Consumer started: ${queueName} (listening for ${bindingPattern})`);
    return { connection, channel };
  } catch (error) {
    console.error('Error setting up consumer:', error);
    throw error;
  }
}

// Message handlers
async function handleUserCreated(data: UserMessage): Promise<void> {
  if (data.event !== 'user_created') return;
  console.log('User created:', data);
  // Your business logic here
}

async function handleUserUpdated(data: UserMessage): Promise<void> {
  if (data.event !== 'user_updated') return;
  console.log('User updated:', data);
  // Your business logic here
}

// Example usage
setupConsumer<UserMessage>(
  'matchmaking-service-queue',
  'user.#',
  async (message, properties) => {
    switch (message.event) {
      case 'user_created':
        await handleUserCreated(message);
        break;
      case 'user_updated':
        await handleUserUpdated(message);
        break;
      default:
        console.warn('Unknown event type:', (message as any).event);
    }
  }
);
```

### Advanced Patterns

#### Request-Reply Pattern

```typescript
// requester.ts
import amqp from 'amqplib';

interface UserInfo {
  id: string;
  username: string;
  email: string;
}

async function requestUserInfo(userId: string): Promise<UserInfo> {
  const connection = await amqp.connect('amqp://admin:admin@localhost:5672');
  const channel = await connection.createChannel();
  
  // Create a temporary reply queue
  const { queue: replyQueue } = await channel.assertQueue('', { exclusive: true });
  
  // Generate a correlation ID
  const correlationId = generateUuid();
  
  // Setup a consumer to listen for replies
  const responsePromise = new Promise<UserInfo>((resolve) => {
    channel.consume(replyQueue, (msg) => {
      if (msg && msg.properties.correlationId === correlationId) {
        resolve(JSON.parse(msg.content.toString()) as UserInfo);
        channel.ack(msg);
      }
    });
  });
  
  // Send the request with the reply-to and correlation ID
  channel.publish(
    'microservices-exchange',
    'user.get',
    Buffer.from(JSON.stringify({ userId })),
    {
      correlationId,
      replyTo: replyQueue,
      expiration: '10000'  // 10s timeout
    }
  );
  
  // Wait for response
  const response = await responsePromise;
  
  // Close connection
  await channel.close();
  await connection.close();
  
  return response;
}

function generateUuid(): string {
  return Math.random().toString() + 
    Math.random().toString() + 
    Math.random().toString();
}

// Example usage
async function getUserData(): Promise<void> {
  try {
    const userInfo = await requestUserInfo('12345');
    console.log('User info received:', userInfo);
  } catch (error) {
    console.error('Error getting user info:', error);
  }
}

getUserData();
```

```typescript
// responder.ts
import amqp, { ConsumeMessage } from 'amqplib';

interface UserRequest {
  userId: string;
}

interface UserInfo {
  id: string;
  username: string;
  email: string;
}

async function setupUserInfoResponder(): Promise<void> {
  const connection = await amqp.connect('amqp://admin:admin@localhost:5672');
  const channel = await connection.createChannel();
  
  // Setup queue
  const queueName = 'matchmaking-service-queue';
  await channel.assertQueue(queueName, { durable: true });
  await channel.bindQueue(queueName, 'microservices-exchange', 'user.get');
  
  // Process requests
  channel.consume(queueName, async (msg: ConsumeMessage | null) => {
    if (!msg) return;
    
    try {
      const request = JSON.parse(msg.content.toString()) as UserRequest;
      console.log('User info requested:', request);
      
      // Get user info
      const userInfo = await getUserFromDatabase(request.userId);
      
      // Send response back to the reply queue
      channel.sendToQueue(
        msg.properties.replyTo,
        Buffer.from(JSON.stringify(userInfo)),
        { correlationId: msg.properties.correlationId }
      );
      
      channel.ack(msg);
    } catch (error) {
      console.error('Error handling request:', error);
      channel.nack(msg, false, false);
    }
  });
  
  console.log('User info responder is running');
}

async function getUserFromDatabase(userId: string): Promise<UserInfo> {
  // Example function to get user data
  return {
    id: userId,
    username: 'example',
    email: 'user@example.com'
  };
}

setupUserInfoResponder().catch(console.error);
```

## Monitoring and Management

### RabbitMQ Management UI

The management interface provides visibility into:
- Queue depths and message rates
- Exchange and binding configurations
- Connection and channel status
- Virtual hosts and users

### Key Metrics to Monitor

1. **Queue Metrics**:
   - Queue depth (number of messages)
   - Message rates (published/delivered per second)
   - Consumer count

2. **Node Metrics**:
   - Memory usage
   - File descriptor usage
   - Erlang processes

3. **Connection Metrics**:
   - Connection count
   - Channel count
   - Socket usage

### Integration with Prometheus

Our monitoring stack includes Prometheus metrics for RabbitMQ:

```typescript
// metrics.ts
import * as promClient from 'prom-client';

interface RabbitMQMetrics {
  messagesPublished: promClient.Counter<string>;
  messagesConsumed: promClient.Counter<string>;
  processingTime: promClient.Histogram<string>;
}

export const rabbitmqMetrics: RabbitMQMetrics = {
  messagesPublished: new promClient.Counter({
    name: 'rabbitmq_messages_published_total',
    help: 'Total number of messages published to RabbitMQ',
    labelNames: ['queue', 'routing_key']
  }),
  messagesConsumed: new promClient.Counter({
    name: 'rabbitmq_messages_consumed_total',
    help: 'Total number of messages consumed from RabbitMQ',
    labelNames: ['queue']
  }),
  processingTime: new promClient.Histogram({
    name: 'rabbitmq_message_processing_seconds',
    help: 'Time spent processing RabbitMQ messages',
    labelNames: ['queue', 'message_type'],
    buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5]
  })
};
```

## Troubleshooting

### Common Issues

1. **Connection Refused**
   - Ensure RabbitMQ is running: `docker ps | grep rabbitmq`
   - Check connection string: `amqp://admin:admin@localhost:5672`
   - Verify network connectivity: `telnet localhost 5672`

2. **Authentication Failed**
   - Verify credentials (default: admin/admin)
   - Check if user has appropriate permissions

3. **Queue Not Found**
   - Ensure queue is declared before use
   - Check for typos in queue names
   - Verify exchange bindings

4. **Messages Not Being Consumed**
   - Check consumer is running and bound to correct queue
   - Verify routing keys are correct
   - Look for messages in dead-letter queues

### Debugging Tools

1. **Management UI**: http://localhost:15672
   - View queues, messages, and connections
   - Inspect message properties and content

2. **Docker Logs**:
   ```bash
   docker logs rabbitmq-service
   ```

3. **RabbitMQ Commands**:
   ```bash
   # Run these inside the container
   docker exec -it rabbitmq-service rabbitmqctl list_queues
   docker exec -it rabbitmq-service rabbitmqctl list_exchanges
   docker exec -it rabbitmq-service rabbitmqctl list_bindings
   ```

## Best Practices

1. **Message Structure**
   - Include message type/event name
   - Add timestamp for tracking
   - Include correlation ID for request-reply patterns
   - Use versioning for schema changes

2. **Error Handling**
   - Implement retry mechanisms with backoff
   - Use dead-letter queues for failed messages
   - Log detailed error information

3. **Connection Management**
   - Reuse connections and channels
   - Implement connection recovery
   - Monitor connection health

4. **Performance**
   - Use consumer prefetch limits
   - Consider message batching for high throughput
   - Implement flow control for producers

5. **Security**
   - Use separate users for each service
   - Apply minimum required permissions
   - Consider using TLS for production

## Example Service Integration

Here's a complete example of integrating RabbitMQ in a TypeScript microservice:

```typescript
// rabbitmq.ts - Reusable RabbitMQ client
import amqp, { Connection, Channel, ConsumeMessage, Options } from 'amqplib';
import { rabbitmqMetrics } from './metrics';

interface RabbitMQConfig {
  url: string;
  exchange: string;
  exchangeType: string;
}

interface SubscribeOptions {
  prefetch?: number;
}

type MessageHandler<T> = (message: T, properties: amqp.MessageProperties) => Promise<void>;

export class RabbitMQClient {
  private config: RabbitMQConfig;
  private connection: Connection | null = null;
  private channel: Channel | null = null;
  private connected = false;
  
  constructor(config: Partial<RabbitMQConfig> = {}) {
    this.config = {
      url: 'amqp://admin:admin@localhost:5672',
      exchange: 'microservices-exchange',
      exchangeType: 'topic',
      ...config
    };
  }
  
  async connect(): Promise<this> {
    try {
      this.connection = await amqp.connect(this.config.url);
      this.channel = await this.connection.createChannel();
      
      // Setup exchange
      await this.channel.assertExchange(
        this.config.exchange,
        this.config.exchangeType,
        { durable: true }
      );
      
      this.connected = true;
      console.log('Connected to RabbitMQ');
      
      // Setup reconnection
      this.connection.on('error', this._handleConnectionError.bind(this));
      this.connection.on('close', this._handleConnectionClosed.bind(this));
      
      return this;
    } catch (error) {
      console.error('Failed to connect to RabbitMQ:', error);
      // Attempt to reconnect after delay
      setTimeout(() => this.connect(), 5000);
      throw error;
    }
  }
  
  async publish<T>(routingKey: string, message: T, options: Options.Publish = {}): Promise<boolean> {
    try {
      if (!this.connected || !this.channel) await this.connect();
      
      const startTime = Date.now();
      const success = this.channel!.publish(
        this.config.exchange,
        routingKey,
        Buffer.from(JSON.stringify(message)),
        { persistent: true, ...options }
      );
      
      // Record metrics
      rabbitmqMetrics.messagesPublished
        .labels(options.queue || 'unknown', routingKey)
        .inc();
      
      console.log(`Message published to ${routingKey}:`, message);
      return success;
    } catch (error) {
      console.error(`Error publishing message to ${routingKey}:`, error);
      throw error;
    }
  }
  
  async subscribe<T>(
    queue: string, 
    routingKey: string, 
    handler: MessageHandler<T>, 
    options: SubscribeOptions = {}
  ): Promise<boolean> {
    try {
      if (!this.connected || !this.channel) await this.connect();
      
      // Setup queue
      await this.channel!.assertQueue(queue, { durable: true });
      
      // Bind queue to exchange with routing pattern
      await this.channel!.bindQueue(queue, this.config.exchange, routingKey);
      
      // Set prefetch if provided
      if (options.prefetch) {
        this.channel!.prefetch(options.prefetch);
      }
      
      // Start consuming
      this.channel!.consume(queue, async (msg: ConsumeMessage | null) => {
        if (!msg) return;
        
        try {
          const startTime = Date.now();
          const content = JSON.parse(msg.content.toString()) as T;
          console.log(`Received on ${queue} (${routingKey}):`, content);
          
          // Process message with provided handler
          await handler(content, msg.properties);
          
          // Record metrics
          rabbitmqMetrics.messagesConsumed.labels(queue).inc();
          rabbitmqMetrics.processingTime
            .labels(queue, (content as any).event || 'unknown')
            .observe((Date.now() - startTime) / 1000);
          
          // Acknowledge successful processing
          this.channel!.ack(msg);
        } catch (error) {
          console.error(`Error processing message on ${queue}:`, error);
          // Reject and don't requeue if it's a parsing error
          const requeue = !(error instanceof SyntaxError);
          this.channel!.nack(msg, false, requeue);
        }
      });
      
      console.log(`Subscribed to ${routingKey} on ${queue}`);
      return true;
    } catch (error) {
      console.error(`Error subscribing to ${routingKey} on ${queue}:`, error);
      throw error;
    }
  }
  
  async close(): Promise<void> {
    if (this.channel) await this.channel.close();
    if (this.connection) await this.connection.close();
    this.connected = false;
    this.channel = null;
    this.connection = null;
    console.log('Disconnected from RabbitMQ');
  }
  
  private _handleConnectionError(error: Error): void {
    console.error('RabbitMQ connection error:', error);
    this.connected = false;
  }
  
  private _handleConnectionClosed(): void {
    console.log('RabbitMQ connection closed, attempting to reconnect...');
    this.connected = false;
    setTimeout(() => this.connect(), 5000);
  }
}
```

**Using the client in a service:**

```typescript
// user-service.ts
import { RabbitMQClient } from './rabbitmq';
import { UserMessage } from './types';

// Mock user service logic - in a real app, this would be your actual service
const userService = {
  async handleUserCreated(message: UserMessage): Promise<void> {
    if (message.event !== 'user_created') return;
    console.log('Processing user created:', message);
    // Actual logic here
  },
  async handleUserUpdated(message: UserMessage): Promise<void> {
    if (message.event !== 'user_updated') return;
    console.log('Processing user updated:', message);
    // Actual logic here
  },
  async handleUserDeleted(message: UserMessage): Promise<void> {
    if (message.event !== 'user_deleted') return;
    console.log('Processing user deleted:', message);
    // Actual logic here
  }
};

async function startService(): Promise<void> {
  // Connect to RabbitMQ
  const rabbitmq = new RabbitMQClient();
  await rabbitmq.connect();
  
  // Subscribe to user events
  await rabbitmq.subscribe<UserMessage>(
    'matchmaking-service-queue',
    'user.#',
    async (message, properties) => {
      switch (message.event) {
        case 'user_created':
          await userService.handleUserCreated(message);
          break;
        case 'user_updated':
          await userService.handleUserUpdated(message);
          break;
        case 'user_deleted':
          await userService.handleUserDeleted(message);
          break;
        default:
          console.warn('Unknown event type:', (message as any).event);
      }
    },
    { prefetch: 10 }
  );
  
  // Example of publishing a message
  setInterval(async () => {
    await rabbitmq.publish('user.heartbeat', {
      event: 'heartbeat',
      service: 'user-service',
      timestamp: new Date().toISOString()
    });
  }, 60000);
  
  console.log('User service started and connected to RabbitMQ');
  
  // Handle shutdown gracefully
  process.on('SIGINT', async () => {
    console.log('Shutting down user service...');
    await rabbitmq.close();
    process.exit(0);
  });
}

startService().catch(console.error);
```

This guide provides a comprehensive overview of how to use RabbitMQ in our microservices architecture with TypeScript. For specific implementation details or troubleshooting, refer to the RabbitMQ official documentation or contact the infrastructure team. 