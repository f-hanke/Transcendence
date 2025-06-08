#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Setting up Monitoring Infrastructure${NC}"
echo "============================================"

# Step 1: Generate environment variables
echo -e "${BLUE}Step 1: Generating environment variables...${NC}"
if ./scripts/create-env.sh; then
    echo -e "${GREEN}✅ Environment variables setup complete${NC}"
else
    echo -e "${RED}❌ Failed to setup environment variables${NC}"
    exit 1
fi

echo ""

# Step 2: Generate SSL certificates
echo -e "${BLUE}Step 2: Generating SSL certificates...${NC}"
if ./scripts/setup-elasticsearch-certs.sh; then
    echo -e "${GREEN}✅ SSL certificates setup complete${NC}"
else
    echo -e "${RED}❌ Failed to setup SSL certificates${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}🎉 Monitoring infrastructure setup complete!${NC}"
echo ""
echo "🚀 You can now start the services with:"
echo "   docker compose up -d"
echo ""
echo "🔗 Service URLs (after startup):"
echo "   - Elasticsearch: https://localhost:9200 (user: elastic)"
echo "   - Kibana: http://localhost:5601 (user: elastic)" 
echo "   - Prometheus: http://localhost:9090 (user: admin, pass: admin123)"
echo "   - Grafana: http://localhost:3000 (user: admin)"
echo "   - RabbitMQ: http://localhost:15672 (user: admin)"
echo ""
echo "🔑 To view passwords: cat .env" 