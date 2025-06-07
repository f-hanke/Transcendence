#!/bin/bash

# Create password file for Prometheus to authenticate with Elasticsearch
echo "${ELASTIC_PASSWORD}" > /etc/prometheus/elastic_password

# Set proper permissions
chmod 600 /etc/prometheus/elastic_password

# Start Prometheus with the original command
exec "$@" 