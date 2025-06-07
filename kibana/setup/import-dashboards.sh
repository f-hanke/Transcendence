#!/bin/bash

set -e

echo "Waiting for Kibana to be ready..."

# Wait for Kibana to be available
until curl -s -f -u "elastic:${ELASTIC_PASSWORD}" "http://kibana:5601/api/status" >/dev/null 2>&1; do
    echo "Waiting for Kibana..."
    sleep 10
done

echo "Kibana is ready! Setting up default objects..."

# Create the index pattern first
echo "Creating index pattern..."
curl -X POST "kibana:5601/api/index_patterns/index_pattern" \
  -H 'Content-Type: application/json' \
  -H "kbn-xsrf: true" \
  -u "elastic:${ELASTIC_PASSWORD}" \
  -d '{
    "index_pattern": {
      "title": "microservices-logs-*",
      "timeFieldName": "@timestamp"
    }
  }' || echo "Index pattern may already exist, continuing..."

# Import sample dashboards if available
if [ -f /dashboards/microservices-logging.json ]; then
    echo "Importing microservices dashboards..."
    curl -X POST "kibana:5601/api/saved_objects/_import?overwrite=true" \
      -H "kbn-xsrf: true" \
      -u "elastic:${ELASTIC_PASSWORD}" \
      -F "file=@/dashboards/microservices-logging.json" || echo "Dashboard import failed, but continuing..."
fi

# Enable sample data
echo "Setting up sample data options..."
curl -X POST "kibana:5601/api/sample_data/ecommerce" \
  -H "kbn-xsrf: true" \
  -u "elastic:${ELASTIC_PASSWORD}" || echo "Sample data setup failed, continuing..."

echo "Kibana setup completed!"
echo "You can access Kibana at: http://localhost:5601"
echo "Login with: elastic / (check your .env file for ELASTIC_PASSWORD)" 