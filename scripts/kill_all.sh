#!/bin/bash

echo "Killing all tagged devprocesses..."

docker stop rabbitmq
docker remove rabbitmq

# Find any process with 'devprocess_' in the command line and kill it
ps aux | grep TRANSCENDENCE_DEV | grep -v grep | awk '{print $2}' | xargs -r kill

