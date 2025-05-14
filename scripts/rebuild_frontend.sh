#!/bin/bash

# ANSI color codes
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Rebuilding Frontend Container${NC}"
echo "============================================"

# Stop the frontend container if it's running
echo -e "${BLUE}Stopping frontend container if running...${NC}"
docker-compose stop frontend

# Rebuild the frontend container
echo -e "${BLUE}Rebuilding frontend container...${NC}"
docker-compose build --no-cache frontend

# Start the frontend container
echo -e "${BLUE}Starting frontend container...${NC}"
docker-compose up -d frontend

echo -e "${GREEN}Frontend container rebuilt and restarted${NC}"
echo "============================================"
echo "Check status with: ./scripts/health_check.sh" 