#!/bin/bash

# Load environment variables
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
fi

echo "Ensuring kibana_system password is set..."

# Wait for Elasticsearch to be available with more retries
echo "Waiting for Elasticsearch to be ready..."
MAX_RETRIES=24  # 2 minutes (24 * 5 seconds)
RETRY_COUNT=0

until curl -s -k -u "elastic:${ELASTIC_PASSWORD}" https://localhost:9200 > /dev/null 2>&1; do
    RETRY_COUNT=$((RETRY_COUNT + 1))
    if [ $RETRY_COUNT -ge $MAX_RETRIES ]; then
        echo "❌ Elasticsearch is not ready after 2 minutes. Please check the logs."
        echo "Try running: docker compose logs elasticsearch"
        exit 1
    fi
    echo "Waiting for Elasticsearch... (attempt $RETRY_COUNT/$MAX_RETRIES)"
    sleep 5
done

echo "✓ Elasticsearch is ready. Setting kibana_system password..."

# Set kibana_system password
RESPONSE=$(curl -s -k -X POST -u "elastic:${ELASTIC_PASSWORD}" -H "Content-Type: application/json" https://localhost:9200/_security/user/kibana_system/_password -d "{\"password\":\"${KIBANA_PASSWORD}\"}")

if [ "$RESPONSE" = "{}" ]; then
    echo "✓ kibana_system password set successfully"
else
    echo "✗ Failed to set kibana_system password. Response: $RESPONSE"
    exit 1
fi

echo "Password setup complete!" 