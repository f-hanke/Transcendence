#!/bin/bash
set -e

echo "Starting RabbitMQ service..."
# Use docker compose V2 command
docker compose up -d

echo "Waiting for RabbitMQ to start..."
sleep 10

echo "============================================"
echo "RabbitMQ service is now running:"
echo "============================================"
echo "RabbitMQ AMQP: localhost:5672"
echo "Management UI: http://localhost:15672 (admin/admin)"
echo "============================================"
echo "Pre-configured queues:"
echo "  - auth-service-queue"
echo "  - matchmaking-service-queue"
echo "  - game-service-queue"
echo "  - chat-service-queue"
echo "  - notification-service-queue"
echo "============================================"
echo "Exchange:"
echo "  - microservices-exchange (topic)"
echo "============================================" 