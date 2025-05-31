#!/bin/bash

echo "🔍 Testing Monitoring Stack (Docker Network)..."
echo "================================================"

# Test from inside the monitoring network
echo "📊 Testing Elasticsearch (from Docker network)..."
docker exec elasticsearch curl -s http://localhost:9200/_cluster/health

echo ""
echo "📈 Testing Kibana (from Docker network)..."
docker exec kibana curl -s http://localhost:5601/api/status

echo ""
echo "📝 Testing Logstash (from Docker network)..."
docker exec logstash curl -s http://localhost:9600/?pretty

echo ""
echo "📊 Testing Prometheus targets..."
docker exec prometheus curl -s http://localhost:9090/api/v1/targets | jq '.data.activeTargets[] | {job: .labels.job, health: .health, lastError: .lastError}'

echo ""
echo "🎯 Testing Service Metrics (from Prometheus container)..."
services=("api-gateway:8443" "webserver:10005" "users-auth:10004" "remote:10002" "game-service:10003" "chat-service:10001")

for service in "${services[@]}"; do
    name=$(echo $service | cut -d: -f1)
    port=$(echo $service | cut -d: -f2)
    
    echo "Testing $name..."
    if [[ $name == "api-gateway" ]]; then
        # API Gateway uses HTTPS
        docker exec prometheus curl -k -s https://$service/metrics | head -5
    else
        # Other services use HTTP
        docker exec prometheus curl -s http://$service/metrics | head -5
    fi
    echo ""
done

echo ""
echo "🔗 Host Access URLs:"
echo "- Kibana: http://localhost:5601"
echo "- Prometheus: http://localhost:9090"
echo "- Grafana: http://localhost:3000 (admin/admin)"
echo ""
echo "📋 What to check:"
echo "1. Prometheus targets: http://localhost:9090/targets"
echo "2. Grafana dashboards: http://localhost:3000"
echo "3. Kibana logs: http://localhost:5601" 