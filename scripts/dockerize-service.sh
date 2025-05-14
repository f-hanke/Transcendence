#!/bin/bash

# Check if a service name was provided
if [ -z "$1" ]; then
  echo "Usage: $0 <service-name>"
  echo "Example: $0 usersAndAuth"
  exit 1
fi

SERVICE_NAME=$1
SERVICE_DIR="./$SERVICE_NAME"

# Check if the service directory exists
if [ ! -d "$SERVICE_DIR" ]; then
  echo "Error: Service directory '$SERVICE_DIR' does not exist."
  exit 1
fi

# Determine the port based on service name
case "$SERVICE_NAME" in
  "apiGateway")
    PORT=8443
    PROTOCOL="https"
    ;;
  "usersAndAuth")
    PORT=10004
    PROTOCOL="http"
    ;;
  "matchmaking")
    PORT=10001
    PROTOCOL="http"
    ;;
  "remote" | "gameService")
    PORT=10002
    PROTOCOL="http"
    ;;
  "chat-service")
    PORT=10003
    PROTOCOL="http"
    ;;
  "webserver")
    PORT=10005
    PROTOCOL="http"
    ;;
  *)
    PORT=3000
    PROTOCOL="http"
    echo "Warning: Unknown service '$SERVICE_NAME', using default port 3000"
    ;;
esac

# Create a Dockerfile for the service
cat > "$SERVICE_DIR/Dockerfile" << EOF
FROM node:20-alpine AS shared-builder

WORKDIR /app/shared
COPY shared/package*.json ./
RUN npm install
COPY shared/tsconfig.json ./
COPY shared/src ./src
RUN npm run build

FROM node:20-alpine AS service-builder

WORKDIR /app/$SERVICE_NAME

# Copy service-specific files
COPY $SERVICE_NAME/package*.json ./
RUN npm install
COPY $SERVICE_NAME/tsconfig.json ./
COPY $SERVICE_NAME/src ./src

# Copy certificates if they exist
COPY $SERVICE_NAME/certs ./certs 2>/dev/null || true

# Copy the built shared library
COPY --from=shared-builder /app/shared/dist /app/shared/dist
COPY --from=shared-builder /app/shared/package.json /app/shared/package.json

# Update the shared library path
RUN npm install --no-save ../shared

# Build the service
RUN npm run build

# Copy certificates to the dist directory if they exist
RUN if [ -d "./certs" ]; then mkdir -p ./dist/certs && cp ./certs/* ./dist/certs/ 2>/dev/null || true; fi

# Install health check tools
RUN apk add --no-cache curl wget

EXPOSE $PORT

CMD ["node", "dist/index.js"]
EOF

echo "Created Dockerfile for $SERVICE_NAME with port $PORT"

# Determine health check command based on protocol
if [ "$PROTOCOL" == "https" ]; then
  HEALTH_CHECK="[\"CMD\", \"wget\", \"--no-verbose\", \"--tries=1\", \"--spider\", \"--no-check-certificate\", \"https://localhost:$PORT/health\"]"
else
  HEALTH_CHECK="[\"CMD\", \"wget\", \"--no-verbose\", \"--tries=1\", \"--spider\", \"http://localhost:$PORT/health\"]"
fi

# Update docker-compose.yml to include the new service
SERVICE_ENTRY=$(cat << EOF

  $SERVICE_NAME:
    build:
      context: .
      dockerfile: $SERVICE_NAME/Dockerfile
    ports:
      - "$PORT:$PORT"
    environment:
      - NODE_ENV=production
    networks:
      - monitoring-network
      - rabbitmq-network
      - app-network
    healthcheck:
      test: $HEALTH_CHECK
      interval: 10s
      timeout: 5s
      retries: 3
      start_period: 10s
EOF
)

# Insert the new service entry before the networks section
sed -i "/networks:/i\\$SERVICE_ENTRY" docker-compose.yml

echo "Updated docker-compose.yml with $SERVICE_NAME service using port $PORT"

# Remind the user to update network settings for Docker
echo "IMPORTANT: For Docker compatibility, make sure to update the IP in shared/src/networkSettings.ts to use '0.0.0.0' for the $SERVICE_NAME service."
echo "Also, implement a /health endpoint in your service for the Docker health check."
echo "Done! You may need to adjust other settings in docker-compose.yml." 