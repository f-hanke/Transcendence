#!/bin/bash

# ANSI color codes
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting Frontend Development Server...${NC}"
echo "============================================"

# Explain the frontend/webserver relationship
echo -e "${YELLOW}Note: The frontend is built into the webserver's distFrontend directory${NC}"
echo -e "${YELLOW}This development server is for local development only${NC}"
echo -e "${YELLOW}For production, the frontend is served by the webserver container${NC}"
echo "============================================"

# Go to the frontend directory
cd frontend

# Check if dependencies are installed
if [ ! -d "node_modules" ] || [ ! -f "node_modules/.package-lock.json" ]; then
    echo -e "${YELLOW}Installing dependencies...${NC}"
    npm install
fi

# Start the development server
echo -e "${GREEN}Starting Vite dev server...${NC}"
npm run dev

echo "============================================" 