# Microservices Monitoring Infrastructure

This repository contains the configuration for the monitoring infrastructure using ELK Stack (Elasticsearch, Logstash, Kibana) and Prometheus with Grafana, plus a separate RabbitMQ service for message queueing.

## Architecture

The infrastructure is designed to support a microservices architecture with the following components:

- **ELK Stack**: Collects, processes, and visualizes logs
- **Prometheus/Grafana**: Collects and visualizes metrics
- **RabbitMQ**: Handles inter-service communication (running as a separate service)

## Components

- **Elasticsearch**: Search and analytics engine
- **Logstash**: Log processing pipeline
- **Kibana**: Data visualization dashboard
- **Prometheus**: Metrics collection and storage
- **Grafana**: Metrics visualization dashboard
- **RabbitMQ**: Message queueing (as a separate service)

## Prerequisites

- Docker

## Getting Started

1. Clone this repository
2. Run the following command to start all services:
   ```bash
   make up
   ```

## Accessing the Services

- **Kibana**: http://localhost:5601
- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3000 (default credentials: admin/admin)
- **RabbitMQ Management**: http://localhost:15672 (default credentials: admin/admin)
- **Elasticsearch**: http://localhost:9200

## Service Endpoints

### Logging (ELK Stack)

To send logs to Logstash from your microservices, configure them to send logs to:
- TCP: localhost:5000
- UDP: localhost:5000
- Filebeat: localhost:5044

See the [MONITORING_GUIDE.md](MONITORING_GUIDE.md) for detailed instructions on how to integrate your Node.js microservices with the logging infrastructure.

### Metrics (Prometheus)

To expose metrics to Prometheus, ensure your microservices expose metrics endpoints at:
- Auth Service: http://auth-service:8080/metrics
- User Service: http://user-service:8080/metrics
- Game Service: http://game-service:8080/metrics
- Chat Service: http://chat-service:8080/metrics
- Notification Service: http://notification-service:8080/metrics

See the [MONITORING_GUIDE.md](MONITORING_GUIDE.md) for detailed instructions on how to expose metrics from your Node.js microservices.

### Messaging (RabbitMQ)

RabbitMQ is configured as a separate service with its own configuration and setup.

To use RabbitMQ for inter-service communication:
- AMQP: localhost:5672
- Management UI: http://localhost:15672

See the [rabbitmq/README.md](rabbitmq/README.md) for detailed instructions on how to integrate RabbitMQ with your microservices.

## Directory Structure

```
.
├── Makefile                    # Main build and management script
├── elasticsearch/              # Elasticsearch configuration
├── grafana/                    # Grafana configuration
│   ├── dashboards/             # Grafana dashboards
│   └── provisioning/           # Grafana provisioning
├── logstash/                   # Logstash configuration
│   ├── config/                 # Logstash main configuration
│   └── pipeline/               # Logstash pipeline configuration
├── MONITORING_GUIDE.md         # Detailed guide for monitoring integration
├── prometheus/                 # Prometheus configuration
│   └── prometheus.yml          # Prometheus scrape configuration
├── rabbitmq/                   # RabbitMQ as a separate service
│   ├── config/                 # RabbitMQ configuration
│   ├── README.md               # RabbitMQ specific documentation
│   └── start-rabbitmq.sh       # RabbitMQ startup script
└── README.md                   # This file
```

## Maintenance

- To stop all services:
  ```bash
  make down
  ```

- To view logs:
  ```bash
  # View logs for a specific service
  make logs SERVICE=[service-name]
  
  # For example, to view RabbitMQ logs
  make logs SERVICE=rabbitmq-service
  ```

- To restart a specific service:
  ```bash
  make restart SERVICE=[service-name]
  ```

## Troubleshooting

See the [MONITORING_GUIDE.md](MONITORING_GUIDE.md) for detailed troubleshooting instructions for the monitoring stack.

See the [rabbitmq/README.md](rabbitmq/README.md) for troubleshooting RabbitMQ issues. 