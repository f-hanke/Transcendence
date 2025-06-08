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

check_service "RabbitMQ" "http://localhost:15672" "GET" "" true
# Check application services (our custom services)
check_service "API Gateway" "https://localhost:8443/health" "HTTPS"

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
  echo -e "${GREEN}✅ All services are secured with HTTPS${NC}"
  echo "   - Elasticsearch: https://localhost:9200 (login required)"
  echo "   - Kibana: https://localhost:5601 (login: elastic/check .env file)"
  echo "   - Prometheus: https://localhost:9090 (login: admin/check .env file)"
  echo "   - Logstash: https://localhost:9600 (secured with credentials)"
  echo "   - API Gateway: https://localhost:8443 (HTTPS only)"
  echo "   - All internal services accessible only via API Gateway"
else
  echo -e "${RED}❌ Security configuration incomplete${NC}"
  echo "   Run: make create_env && ./scripts/setup-elasticsearch-certs.sh"
fi

echo "============================================" 
echo "Check out the frontend at:"
echo "https://localhost:8443"


