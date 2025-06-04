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

# Function to check service health for custom microservices
check_service() {
  local service_name=$1
  local url=$2
  local method=${3:-"GET"}
  local header=${4:-""}
  local is_external=${5:-false}
  local timeout=5
  
  # For third-party services, just check if they're responding
  if [ "$is_external" == "true" ]; then
    if http_code=$(curl -sk --max-time $timeout -o /dev/null -w "%{http_code}" $url 2>/dev/null) && ([[ $http_code =~ 2[0-9][0-9] ]] || [[ $http_code == 302 ]]); then
      if [[ $http_code == 302 ]]; then
        echo -e "${GREEN}$service_name: ✅ ($url) - HTTP 302 (redirect)${NC}"
      else
        echo -e "${GREEN}$service_name: ✅ ($url)${NC}"
      fi
      return 0
    else
      echo -e "${RED}$service_name: ❌ ($url) - HTTP code $http_code${NC}"
      return 1
    fi
  # For our own services, check for standard {"status":"ok"} format
  elif [ "$method" == "HTTPS" ]; then
    if response=$(curl -sk --max-time $timeout $url 2>/dev/null) && echo "$response" | grep -q "status.*ok"; then
      echo -e "${GREEN}$service_name: ✅ ($url)${NC}"
      return 0
    elif http_code=$(curl -sk --max-time $timeout -o /dev/null -w "%{http_code}" $url 2>/dev/null) && [[ $http_code =~ 2[0-9][0-9] ]]; then
      echo -e "${YELLOW}$service_name: ⚠️ ($url) - HTTP $http_code but non-standard format${NC}"
      return 2
    else
      echo -e "${RED}$service_name: ❌ ($url) - HTTP code $http_code${NC}"
      return 1
    fi
  else
    if response=$(curl -s --max-time $timeout $url 2>/dev/null) && echo "$response" | grep -q "status.*ok"; then
      echo -e "${GREEN}$service_name: ✅ ($url)${NC}"
      return 0
    elif http_code=$(curl -s --max-time $timeout -o /dev/null -w "%{http_code}" $url 2>/dev/null) && [[ $http_code =~ 2[0-9][0-9] ]]; then
      echo -e "${YELLOW}$service_name: ⚠️ ($url) - HTTP $http_code but non-standard format${NC}"
      return 2
    else
      echo -e "${RED}$service_name: ❌ ($url) - Failed to connect${NC}"
      return 1
    fi
  fi
}

# Check infrastructure services (third-party)
check_service "Elasticsearch" "http://localhost:9200" "GET" "" true
check_service "Kibana" "http://localhost:5601" "GET" "" true
check_service "Prometheus" "http://localhost:9090" "GET" "" true
check_service "Grafana" "http://localhost:3000" "GET" "" true
check_service "RabbitMQ" "http://localhost:15672" "GET" "" true

# Check application services (our custom services)
check_service "API Gateway" "https://localhost:8443/health" "HTTPS"

echo "wont work because of the port are only exposed on localhost"
check_service "Matchmaking Service" "http://localhost:10002/health"
check_service "Game Service" "http://localhost:10003/health"
check_service "Chat Service" "http://localhost:10001/health"
check_service "Auth Service" "http://localhost:10004/health"
check_service "Webserver" "http://localhost:10005/health"
# Frontend is now served by the webserver
check_service "Frontend via Webserver" "http://localhost:10005/index.html" "GET" "" true

echo "============================================"
echo "API GATEWAY ROUTING CHECKS:"

# Check services via API Gateway
check_service "Webserver via API Gateway" "https://localhost:8443/health" "HTTPS"
check_service "Auth Service via API Gateway" "https://localhost:8443/AUTHENTICATION/health" "HTTPS"
check_service "Matchmaking Service via API Gateway" "https://localhost:8443/MATCHMAKING/health" "HTTPS"
check_service "Game Service via API Gateway" "https://localhost:8443/GAMESERVICE/health" "HTTPS"
check_service "Chat Service via API Gateway" "https://localhost:8443/CHATSERVICE/health" "HTTPS"
# check_service "Webserver via API Gateway" "https://localhost:8443/WEBSERVER/health" "HTTPS"

echo "============================================" 

echo "============================================" 
echo "Check out the frontend at:"
echo "https://localhost:8443"


