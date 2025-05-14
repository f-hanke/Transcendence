#!/bin/bash

# ANSI color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo "Checking status of all services..."
echo "============================================"
echo "CONTAINER STATUS:"
docker ps

echo "============================================"
echo "SERVICE HEALTH CHECKS:"

# Function to check service health
check_service() {
  local service_name=$1
  local url=$2
  local method=${3:-"GET"}
  local header=${4:-""}
  
  if [ "$method" == "HTTPS" ]; then
    if curl -sk $url > /dev/null 2>&1; then
      echo -e "${GREEN}$service_name: ✅ ($url)${NC}"
      return 0
    else
      echo -e "${RED}$service_name: ❌ (not responding)${NC}"
      return 1
    fi
  elif [ -n "$header" ]; then
    if curl -s $url -H "$header" > /dev/null 2>&1; then
      echo -e "${GREEN}$service_name: ✅ ($url)${NC}"
      return 0
    else
      echo -e "${RED}$service_name: ❌ (not responding)${NC}"
      return 1
    fi
  else
    if curl -s $url > /dev/null 2>&1; then
      echo -e "${GREEN}$service_name: ✅ ($url)${NC}"
      return 0
    else
      echo -e "${RED}$service_name: ❌ (not responding)${NC}"
      return 1
    fi
  fi
}

# Check infrastructure services
check_service "Elasticsearch" "http://localhost:9200"
check_service "Kibana" "http://localhost:5601"
check_service "Prometheus" "http://localhost:9090"
check_service "Grafana" "http://localhost:3000"
check_service "RabbitMQ" "http://localhost:15672"
check_service "API Gateway" "https://localhost:8443" "HTTPS"

# Check application services
check_service "Matchmaking Service" "http://localhost:10001"
check_service "Game Service" "http://localhost:10002"
check_service "Chat Service" "http://localhost:10003"
check_service "Auth Service" "http://localhost:10004/health"
check_service "Webserver" "http://localhost:10005/health"

echo "============================================"
echo "API GATEWAY ROUTING CHECKS:"

# Check services via API Gateway
check_service "Webserver via API Gateway" "https://localhost:8443/health" "HTTPS"
check_service "Auth Service via API Gateway" "https://localhost:8443/AUTHENTICATION/ping" "HTTPS"

echo "============================================" 