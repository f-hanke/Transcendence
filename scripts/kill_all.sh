#!/bin/bash

echo "Killing all tagged devprocesses..."

# Stop RabbitMQ service using docker-compose
echo "Stopping RabbitMQ service..."
docker-compose stop rabbitmq-service

# Find any process with 'devprocess_' in the command line and kill it
ps aux | grep TRANSCENDENCE_DEV | grep -v grep | awk '{print $2}' | xargs -r kill

