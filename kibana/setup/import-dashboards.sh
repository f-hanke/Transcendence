#!/bin/bash

set -e

echo "Waiting for Kibana to be ready..."

# Wait for Kibana to be available
until curl -s -f -u "elastic:${ELASTIC_PASSWORD}" "http://kibana:5601/api/status" >/dev/null 2>&1; do
    echo "Waiting for Kibana..."
    sleep 1
done

echo "Kibana is ready! Setting up microservices dashboards..."

# Remove any existing e-commerce dashboards
echo "Removing e-commerce sample dashboards..."
curl -X DELETE "kibana:5601/api/sample_data/ecommerce" \
  -H "kbn-xsrf: true" \
  -u "elastic:${ELASTIC_PASSWORD}" 2>/dev/null || echo "No e-commerce data to remove"

# Create index pattern using data views API
echo "Creating microservices logs data view..."
curl -X POST "kibana:5601/api/data_views/data_view?overwrite=true" \
  -H 'Content-Type: application/json' \
  -H "kbn-xsrf: true" \
  -u "elastic:${ELASTIC_PASSWORD}" \
  -d '{
    "data_view": {
      "title": "microservices-logs-*",
      "timeFieldName": "@timestamp",
      "name": "Microservices Logs"
    }
  }' 2>/dev/null || echo "Data view may already exist, continuing..."

echo "Microservices setup completed!"
echo ""
echo "🎉 Your Kibana is now configured!"
echo "You can access Kibana at: http://localhost:5601"
echo "Login with: elastic / (check your .env file for ELASTIC_PASSWORD)"
echo ""
echo "To view your microservices logs:"
echo "1. Go to Discover"
echo "2. Select 'microservices-logs-*' data view"
echo "3. Create your own dashboards and visualizations!" 