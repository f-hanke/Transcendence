# Microservices Monitoring Integration Guide (JavaScript/Node.js)

This guide explains how to integrate your Node.js microservices with our monitoring infrastructure using ELK Stack (Elasticsearch, Logstash, Kibana) and Prometheus with Grafana.

## Table of Contents
- [Communication Overview](#communication-overview)
- [Understanding Logging vs. Metrics](#understanding-logging-vs-metrics)
- [Logging Setup (ELK Stack)](#logging-setup-elk-stack)
- [Filebeat Configuration](#filebeat-configuration)
- [Metrics Setup (Prometheus)](#metrics-setup-prometheus)
- [RabbitMQ Setup and Configuration](#rabbitmq-setup-and-configuration)
- [Complete Integration Example](#complete-integration-example)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## Communication Overview

### How to Communicate with Monitoring Infrastructure

#### 1. Logging Communication (ELK Stack)

Your services need to send logs to Logstash using one of these methods:

- **TCP Logging** (Recommended): Send logs to `localhost:5000` using TCP
- **UDP Logging**: Send logs to `localhost:5000` using UDP (faster but less reliable)
- **Filebeat**: Configure Filebeat to send logs to `localhost:5044`

Key Requirements:
- All logs must be in JSON format
- Include the service name in the logs (e.g., "auth-service", "user-service")
- Include relevant context like user IDs, request IDs, etc.
- Use structured logging instead of string concatenation

Example Logging:
```javascript
// Good: Structured logging with context
logger.info('User action', {
  userId: '123',
  action: 'login',
  timestamp: new Date(),
  service: 'auth-service'  // Important: include service name
});

// Bad: String concatenation
logger.info(`User ${userId} logged in at ${new Date()}`);
```

#### 2. Metrics Communication (Prometheus)

Your services need to expose metrics that Prometheus can scrape:

- Each service must expose a `/metrics` endpoint on port 8080
- Use the prom-client library to define and expose metrics
- Include standard metrics like request counts, response times, and error rates
- Add business-specific metrics relevant to each service

Example Metrics:
```javascript
// Recording request duration
httpRequestDuration
  .labels('auth-service', 'POST', '/login', '200')
  .observe(0.42);  // Duration in seconds

// Updating active users count
activeUsers.labels('auth-service').set(42);
```

#### 3. Error Communication

Example Error Logging:
```javascript
try {
  // Service logic
} catch (error) {
  logger.error('Operation failed', {
    error: error.message,
    stack: error.stack,
    context: {
      userId: req.userId,
      operation: 'login'
    }
  });
}
```

### Key Communication Points

1. **Consistency**
   - Use consistent service names across all services
   - Use consistent metric labels
   - Follow the same logging format

2. **Structured Data**
   - Always use JSON format for logs
   - Include timestamps
   - Include service identification

3. **Context**
   - Include user IDs
   - Include request IDs
   - Include operation names
   - Include relevant business data

4. **Performance Considerations**
   - Use UDP logging for high-volume services
   - Implement log batching when needed
   - Monitor metric cardinality

5. **Testing Communication**
   - Verify logs appear in Kibana (http://localhost:5601)
   - Verify metrics appear in Prometheus (http://localhost:9090)
   - Test error logging
   - Test metric updates

## Understanding Logging vs. Metrics

### Key Differences

#### Logging
- **Purpose**: Records individual events and their context
- **Format**: Text or structured data (JSON) with detailed information
- **Volume**: Can be high (thousands of events per second)
- **Example**: "User 123 logged in at 2:30 PM with IP 192.168.1.1"
- **Use case**: Debugging, auditing, understanding specific events
- **Storage**: Usually stored for longer periods (days/weeks/months)
- **Query**: Full-text search, filtering by fields

#### Metrics
- **Purpose**: Measures and tracks numerical values over time
- **Format**: Numerical values with labels/tags
- **Volume**: Lower (typically a few values per second)
- **Example**: "active_users = 42" or "request_duration_seconds = 0.15"
- **Use case**: Monitoring, alerting, performance analysis
- **Storage**: Often aggregated over time (e.g., average per minute)
- **Query**: Time-series queries, aggregation functions

### Simple Analogy
- **Logs** are like a detailed diary of everything that happens
- **Metrics** are like a dashboard with gauges and counters

### In Our Monitoring Setup

1. **ELK Stack (Logging)**:
   - Collects detailed logs from all services
   - Stores them in Elasticsearch
   - Visualizes them in Kibana for searching and analysis

2. **Prometheus/Grafana (Metrics)**:
   - Collects numerical metrics from all services
   - Stores them as time-series data
   - Visualizes them in Grafana for monitoring and alerting

### Example to Illustrate

For a login system:

**Logging (ELK)**:
```javascript
logger.info('User login attempt', {
  userId: '123',
  timestamp: '2023-05-15T14:30:00Z',
  ipAddress: '192.168.1.1',
  userAgent: 'Mozilla/5.0...',
  success: true
});
```

**Metrics (Prometheus)**:
```javascript
// Count of login attempts
loginAttempts.labels('success').inc();

// Current number of active users
activeUsers.set(42);

// Login response time
loginDuration.observe(0.15); // seconds
```

### Why We Need Both

- **Logs** help you understand what happened and why (debugging)
- **Metrics** help you monitor system health and performance (monitoring)

They complement each other - logs provide the details of individual events, while metrics give you the big picture of system performance and health.

## Logging Setup (ELK Stack)

### 1. Install Dependencies
```bash
npm install winston winston-logstash-transport
```

### 2. Create Logger Configuration
```javascript
// logger.js
const winston = require('winston');
require('winston-logstash-transport').LogstashTransport;

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'auth-service' },
  transports: [
    // Console logging for development
    new winston.transports.Console(),
    // Logstash transport
    new winston.transports.Logstash({
      host: 'localhost',
      port: 5000,
      protocol: 'tcp',
      // Optional: ssl_enable: true for production
    })
  ]
});

module.exports = logger;
```

### 3. Usage in Express Application
```javascript
// app.js
const express = require('express');
const logger = require('./logger');
const app = express();

// Middleware to log all requests
app.use((req, res, next) => {
  const start = Date.now();
  
  // Log when request finishes
  res.on('finish', () => {
    logger.info('API Request', {
      path: req.path,
      method: req.method,
      status: res.statusCode,
      duration: Date.now() - start,
      userId: req.headers['x-user-id'],
      // Add any other relevant context
    });
  });
  
  next();
});

app.post('/login', (req, res) => {
  // Your login logic here
  logger.info('User login attempt', {
    userId: req.body.userId,
    success: true
  });
  res.json({ status: 'success' });
});
```

## Filebeat Configuration

### 1. Install Filebeat
```bash
# For macOS (using Homebrew)
brew install filebeat

# For Ubuntu/Debian
curl -L -O https://artifacts.elastic.co/downloads/beats/filebeat/filebeat-8.12.1-amd64.deb
sudo dpkg -i filebeat-8.12.1-amd64.deb
```

### 2. Configure Filebeat
```yaml
# filebeat.yml
filebeat.inputs:
- type: log
  enabled: true
  paths:
    - /var/log/your-service/*.log  # Adjust path to your log files
  fields:
    service: auth-service  # Add your service name
  json.keys_under_root: true
  json.add_error_key: true

output.logstash:
  hosts: ["localhost:5044"]

logging.level: info
```

### 3. Modify Logger Configuration
```javascript
// logger.js
const winston = require('winston');
const path = require('path');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'auth-service' },
  transports: [
    // Console logging for development
    new winston.transports.Console(),
    // File transport for Filebeat
    new winston.transports.File({
      filename: path.join('/var/log/your-service', 'app.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  ]
});

module.exports = logger;
```

### 4. Update Logstash Configuration
```javascript
// logstash/pipeline/logstash.conf
input {
  beats {
    port => 5044
    codec => json
  }
}

filter {
  if [fields][service] == "auth-service" {
    mutate {
      add_field => { "[@metadata][service]" => "auth" }
    }
  }
  // ... other service filters ...
}

output {
  elasticsearch {
    hosts => ["elasticsearch:9200"]
    index => "microservices-logs-%{+YYYY.MM.dd}"
  }
  stdout { codec => rubydebug }
}
```

### 5. Start Filebeat
```bash
# Start Filebeat
sudo systemctl start filebeat

# Enable Filebeat to start on boot
sudo systemctl enable filebeat

# Check Filebeat status
sudo systemctl status filebeat
```

### 6. Verify Configuration
```bash
# Test Filebeat configuration
sudo filebeat test config -c /etc/filebeat/filebeat.yml

# Test Filebeat output
sudo filebeat test output -c /etc/filebeat/filebeat.yml
```

### 7. Monitoring Filebeat
```bash
# View Filebeat logs
sudo tail -f /var/log/filebeat/filebeat

# Check Filebeat metrics
curl http://localhost:5066/stats
```

### Best Practices for Filebeat

1. **Log Rotation**
   - Configure log rotation to prevent disk space issues
   - Use Winston's built-in rotation or external tools like logrotate

2. **Performance**
   - Adjust Filebeat's prospector settings for your log volume
   - Consider using multiple prospectors for different log types

3. **Security**
   - Ensure log files have appropriate permissions
   - Use SSL/TLS for Filebeat to Logstash communication in production

4. **Monitoring**
   - Monitor Filebeat's own logs for issues
   - Set up alerts for Filebeat failures

### Troubleshooting Filebeat

1. **Logs not appearing in Elasticsearch**
   - Check Filebeat logs: `sudo tail -f /var/log/filebeat/filebeat`
   - Verify Logstash connection: `curl http://localhost:5044`
   - Check file permissions on log files

2. **Performance Issues**
   - Adjust prospector settings
   - Consider using multiple Filebeat instances
   - Monitor system resources

3. **Configuration Issues**
   - Test configuration: `sudo filebeat test config`
   - Test output: `sudo filebeat test output`
   - Check log file paths and permissions

## Metrics Setup (Prometheus)

### 1. Install Dependencies
```bash
npm install prom-client express
```

### 2. Create Metrics Configuration
```javascript
// metrics.js
const promClient = require('prom-client');
const express = require('express');

// Create a Registry
const register = new promClient.Registry();

// Add default metrics (CPU, memory, etc.)
promClient.collectDefaultMetrics({ register });

// Define custom metrics
const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['service', 'method', 'route', 'status_code'],
  buckets: [0.1, 0.5, 1, 2, 5]
});

const activeUsers = new promClient.Gauge({
  name: 'active_users',
  help: 'Number of active users',
  labelNames: ['service']
});

// Register custom metrics
register.registerMetric(httpRequestDuration);
register.registerMetric(activeUsers);

// Create metrics endpoint
const metricsApp = express();
metricsApp.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// Start metrics server
metricsApp.listen(8080, () => {
  console.log('Metrics server listening on port 8080');
});

module.exports = {
  httpRequestDuration,
  activeUsers
};
```

### Understanding Metric Buckets

When using Histogram metrics, buckets are crucial for measuring distributions of values. Here's how they work:

```javascript
const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['service', 'method', 'route', 'status_code'],
  buckets: [0.1, 0.5, 1, 2, 5]  // These are the buckets!
});
```

#### How Buckets Work

Think of buckets like measuring cups with different sizes:
- 0.1s bucket (100ms)
- 0.5s bucket (500ms)
- 1s bucket (1 second)
- 2s bucket (2 seconds)
- 5s bucket (5 seconds)

When you measure a value, it gets counted in ALL buckets that are larger than its duration:

```javascript
// Example: Request takes 0.3 seconds (300ms)
httpRequestDuration.observe(0.3);

// This request is counted in:
// - 0.5s bucket (because 0.3 < 0.5)
// - 1s bucket (because 0.3 < 1)
// - 2s bucket (because 0.3 < 2)
// - 5s bucket (because 0.3 < 5)

// Example: Request takes 3 seconds
httpRequestDuration.observe(3);

// This request is counted in:
// - 5s bucket (because 3 < 5)
// It is NOT counted in 0.1, 0.5, 1, or 2 second buckets because 3 > 2
```

#### Common Bucket Configurations

1. **Response Time Buckets**:
   ```javascript
   buckets: [0.1, 0.5, 1, 2, 5]  // Good for most web services
   ```

2. **Fine-grained Response Time Buckets**:
   ```javascript
   buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5]  // For very fast services
   ```

3. **Memory Usage Buckets**:
   ```javascript
   buckets: [50, 100, 200, 500, 1000, 2000]  // In MB
   ```

#### Using Buckets for Analysis

Buckets enable you to answer questions like:
- "How many requests took less than 1 second?"
- "What's the 95th percentile of response times?"
- "How many requests are really slow (>2s)?"

Example Prometheus queries:
```promql
# Count of requests taking less than 1 second
rate(http_request_duration_seconds_bucket{le="1"}[5m])

# 95th percentile of response times
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))
```

## RabbitMQ Setup and Configuration

### 1. Install RabbitMQ
```bash
# For macOS (using Homebrew)
brew install rabbitmq

# For Ubuntu/Debian
sudo apt-get install rabbitmq-server

# Start RabbitMQ
brew services start rabbitmq  # macOS
sudo systemctl start rabbitmq-server  # Ubuntu/Debian
```

### 2. Basic Configuration
```bash
# Enable the management plugin (for web UI)
rabbitmq-plugins enable rabbitmq_management

# Create a user
rabbitmqctl add_user your_user your_password
rabbitmqctl set_user_tags your_user administrator
rabbitmqctl set_permissions -p / your_user ".*" ".*" ".*"
```

### 3. Node.js Client Setup
```bash
npm install amqplib
```

### 4. Basic Producer Example
```javascript
// producer.js
const amqp = require('amqplib');

async function sendMessage() {
  try {
    // Connect to RabbitMQ
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();

    // Declare a queue
    const queue = 'user_events';
    await channel.assertQueue(queue, { durable: true });

    // Send a message
    const message = {
      event: 'user_created',
      userId: '123',
      timestamp: new Date().toISOString()
    };

    channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), {
      persistent: true
    });

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

### 5. Basic Consumer Example
```javascript
// consumer.js
const amqp = require('amqplib');

async function consumeMessages() {
  try {
    // Connect to RabbitMQ
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();

    // Declare the same queue
    const queue = 'user_events';
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

### 6. Integration with Monitoring

#### Logging RabbitMQ Events
```javascript
// In your RabbitMQ producer/consumer
const logger = require('./logger');

// Log when sending a message
logger.info('RabbitMQ message sent', {
  queue: 'user_events',
  message: message,
  timestamp: new Date()
});

// Log when receiving a message
logger.info('RabbitMQ message received', {
  queue: 'user_events',
  message: content,
  timestamp: new Date()
});
```

#### Monitoring RabbitMQ Metrics
```javascript
// metrics.js
const rabbitmqMetrics = {
  messagesPublished: new promClient.Counter({
    name: 'rabbitmq_messages_published_total',
    help: 'Total number of messages published to RabbitMQ',
    labelNames: ['queue']
  }),
  messagesConsumed: new promClient.Counter({
    name: 'rabbitmq_messages_consumed_total',
    help: 'Total number of messages consumed from RabbitMQ',
    labelNames: ['queue']
  }),
  processingTime: new promClient.Histogram({
    name: 'rabbitmq_message_processing_seconds',
    help: 'Time spent processing RabbitMQ messages',
    labelNames: ['queue'],
    buckets: [0.1, 0.5, 1, 2, 5]
  })
};

// In your consumer
const startTime = Date.now();
// Process message
rabbitmqMetrics.processingTime
  .labels('user_events')
  .observe((Date.now() - startTime) / 1000);
```

### 7. Best Practices

1. **Queue Configuration**
   - Use durable queues for important messages
   - Set appropriate message TTL
   - Configure dead letter exchanges for failed messages

2. **Error Handling**
   - Implement retry mechanisms
   - Use dead letter queues for failed messages
   - Monitor queue lengths

3. **Performance**
   - Use connection pooling
   - Implement message batching when appropriate
   - Monitor memory usage

4. **Security**
   - Use SSL/TLS for production
   - Implement proper authentication
   - Restrict permissions

### 8. Monitoring and Management

1. **RabbitMQ Management UI**
   - Access at http://localhost:15672
   - Default credentials: guest/guest

2. **Key Metrics to Monitor**
   - Queue lengths
   - Message rates
   - Connection counts
   - Memory usage
   - Disk usage

3. **Common Issues and Solutions**

   a. **High Memory Usage**
   ```bash
   # Check memory usage
   rabbitmq-diagnostics memory_breakdown
   
   # Set memory limit
   rabbitmqctl set_vm_memory_high_watermark 0.4
   ```

   b. **Queue Backlog**
   ```bash
   # List queues and their message counts
   rabbitmqctl list_queues name messages
   
   # Purge a queue if needed
   rabbitmqctl purge_queue queue_name
   ```

   c. **Connection Issues**
   ```bash
   # List connections
   rabbitmqctl list_connections
   
   # Check connection status
   rabbitmq-diagnostics check_port_connectivity
   ```

## Complete Integration Example

```javascript
// app.js
const express = require('express');
const logger = require('./logger');
const { httpRequestDuration, activeUsers } = require('./metrics');

const app = express();
app.use(express.json());

// Middleware to track request duration
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    // Record metrics
    httpRequestDuration
      .labels('auth-service', req.method, req.path, res.statusCode)
      .observe(duration / 1000); // Convert to seconds
      
    // Log request
    logger.info('API Request', {
      path: req.path,
      method: req.method,
      status: res.statusCode,
      duration,
      userId: req.headers['x-user-id']
    });
  });
  
  next();
});

// Example route with metrics and logging
app.post('/login', async (req, res) => {
  try {
    // Your login logic here
    const userId = req.body.userId;
    
    // Update active users metric
    activeUsers.labels('auth-service').inc();
    
    // Log successful login
    logger.info('User logged in successfully', {
      userId,
      loginTime: new Date().toISOString()
    });
    
    res.json({ status: 'success' });
  } catch (error) {
    // Log error
    logger.error('Login failed', {
      userId: req.body.userId,
      error: error.message
    });
    
    res.status(500).json({ status: 'error' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack
  });
  
  res.status(500).json({ status: 'error' });
});

app.listen(3000, () => {
  logger.info('Server started', { port: 3000 });
});
```

## Best Practices

### 1. Structured Logging
```javascript
// Good
logger.info('User action', {
  userId: '123',
  action: 'login',
  timestamp: new Date()
});

// Bad
logger.info(`User ${userId} logged in at ${new Date()}`);
```

### 2. Error Handling
```javascript
try {
  // Your code
} catch (error) {
  logger.error('Operation failed', {
    error: error.message,
    stack: error.stack,
    context: {
      userId: req.userId,
      operation: 'login'
    }
  });
}
```