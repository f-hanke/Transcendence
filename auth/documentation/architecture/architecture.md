# Ft_transcendence System Architecture

## Overview
The architecture diagram shows a microservices-based implementation with four main sections:
1. WebSocket Connections (Client Side)
2. Core Services (Backend Microservices)
3. Monitoring & Logging Infrastructure
4. Data Stores

## Components and Their Relationships

### WebSocket Connections
- **Client Browser/App**: The frontend application that connects to the backend
- Sends **Requests** and maintains **Real-time** connections to the API Gateway

### Core Services
- **API Gateway**: Central entry point that routes requests to appropriate services
  - Routes **Serve SPA** requests to the **Web Server**
  - Routes **Auth** requests to the **Auth Service**
  - Routes **User** requests to the **User Service**
  - Routes **Game** requests to the **Game Service**
  - Routes **Chat** requests to the **Chat Service**
  - Routes **Notify** requests to the **Notification Service**
  - Handles **Forward** operations between services

- **Service Components**:
  - **Web Server**: Serves the Single Page Application
  - **Auth Service**: Manages authentication and authorization
  - **User Service**: Handles user-related operations
  - **Game Service**: Manages game logic and state
  - **Chat Service**: Handles messaging between users
  - **Notification Service**: Manages system notifications

- All services emit **Logs** that are sent to Logstash
- All services emit **Metrics** that are sent to Prometheus
- Services communicate with each other through the API Gateway **Forward** mechanism
- Services publish events via **Pub/Sub** to RabbitMQ

### Monitoring & Logging
- **Logging Pipeline**:
  - **Logstash**: Collects and processes logs from all services
  - **Elasticsearch**: Stores and indexes log data
  - **Kibana Dashboard**: Visualizes log data

- **Metrics Pipeline**:
  - **Prometheus**: Collects and processes metrics from all services
  - **Grafana Dashboard**: Visualizes metrics data

### Message Queue
- **RabbitMQ**: Message broker that handles **Pub/Sub** communication between services
  - Receives messages from all core services
  - Primarily used for asynchronous communication

### Data Stores
- Separate databases for each service:
  - **Auth DB**: Stores authentication data
  - **User DB**: Stores user information
  - **Game DB**: Stores game data and history
  - **Chat DB**: Stores chat messages and history
  - **Notification DB**: Stores notification data

## Data Flow
1. Client communicates with API Gateway via HTTP requests and WebSocket connections
2. API Gateway routes requests to appropriate microservices
3. Services process requests and store data in their respective databases
4. Services publish events to RabbitMQ for asynchronous processing
5. Services log activities to the logging infrastructure
6. Services report metrics to the monitoring infrastructure
7. Administrators can view system health and performance via Kibana and Grafana dashboards

This architecture implements the selected modules from the ft_transcendence project, including backend framework, frontend toolkit, database, user management, remote players, live chat, AI opponent, infrastructure for log management, and microservices-based backend as specified in your module choices.
