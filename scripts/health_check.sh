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

# Function to check Elasticsearch with security
check_elasticsearch() {
  local timeout=5
  
  # Check if .env file exists and has ELASTIC_PASSWORD
  if [ -f .env ] && grep -q "ELASTIC_PASSWORD=" .env; then
    ELASTIC_PASSWORD=$(grep "^ELASTIC_PASSWORD=" .env | cut -d'=' -f2)
    
    # Try to connect to secured Elasticsearch
    if response=$(curl -sk --max-time $timeout --cacert ./config/certs/ca/ca.crt -u "elastic:${ELASTIC_PASSWORD}" https://localhost:9200 2>/dev/null); then
      if echo "$response" | grep -q "cluster_name"; then
        echo -e "${GREEN}Elasticsearch: ✅ (https://localhost:9200) - Secured with authentication${NC}"
        return 0
      else
        echo -e "${YELLOW}Elasticsearch: ⚠️ (https://localhost:9200) - Connected but unexpected response${NC}"
        return 2
      fi
    else
      # Fallback: check if we get the expected "missing authentication credentials" error
      if http_code=$(curl -sk --max-time $timeout -o /dev/null -w "%{http_code}" https://localhost:9200 2>/dev/null) && [[ $http_code == 401 ]]; then
        echo -e "${GREEN}Elasticsearch: ✅ (https://localhost:9200) - Security enabled (401 auth required)${NC}"
        return 0
      else
        echo -e "${RED}Elasticsearch: ❌ (https://localhost:9200) - Failed to connect (HTTP: $http_code)${NC}"
        return 1
      fi
    fi
  else
    echo -e "${RED}Elasticsearch: ❌ - No .env file or ELASTIC_PASSWORD not found${NC}"
    return 1
  fi
}

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
check_elasticsearch
check_service "Kibana" "http://localhost:5601" "GET" "" true
check_service "Prometheus" "http://localhost:9090" "GET" "" true
check_service "Grafana" "http://localhost:3000" "GET" "" true
check_service "RabbitMQ" "http://localhost:15672" "GET" "" true
check_service "logstash" "http://localhost:9600" "GET" "" true

# Check application services (our custom services)
check_service "API Gateway" "https://localhost:8443/health" "HTTPS"

# Note: Internal services use docker-compose networking
check_service "Matchmaking Service" "http://localhost:10002/health"
check_service "Game Service" "http://localhost:10003/health"
check_service "Chat Service" "http://localhost:10001/health"
check_service "Auth Service" "http://localhost:10004/health"
check_service "Webserver" "http://localhost:10005/health"
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
echo "🔐 SECURITY STATUS:"
if [ -f .env ] && grep -q "ELASTIC_PASSWORD=" .env; then
  echo -e "${GREEN}✅ Elasticsearch security is configured${NC}"
  echo "   - Elasticsearch: https://localhost:9200 (login required)"
  echo "   - Kibana: http://localhost:5601 (login: elastic/check .env file)"
else
  echo -e "${RED}❌ Elasticsearch security not configured${NC}"
  echo "   Run: make setup-elastic-security"
fi

echo "============================================" 
echo "Check out the frontend at:"
echo "https://localhost:8443"


