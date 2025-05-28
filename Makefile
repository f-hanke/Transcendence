# Default Make command :-) MAKE MAKEFILES GREAT AGAIN LOL
all: setup start

# Setup directories and network
setup:
	@echo "Creating required directories..."
	mkdir -p grafana/dashboards
	mkdir -p grafana/provisioning/datasources
	mkdir -p grafana/provisioning/dashboards
	@echo "Creating RabbitMQ network..."
	docker network inspect rabbitmq-network >/dev/null 2>&1 || docker network create rabbitmq-network

# Start all services
start: setup
	@echo "Starting RabbitMQ service..."
	cd rabbitmq && ./start-rabbitmq.sh
	@echo "Starting monitoring stack with docker compose..."
	docker compose up -d
	@echo "Services are starting up. Check status with 'make status'"
	@cat service-info.txt


start-api-gateway:
	@echo "Building and starting the api gateway..."
	docker compose up -d --build api-gateway
	@echo "Api gateway starting. Check status with 'make status'"

start-webserver:
	@echo "Building and starting the webserver..."
	docker compose up -d --build webserver
	@echo "Webserver starting. Check status with 'make status'"

start-users-auth:
	@echo "Building and starting the users auth service..."
	docker compose up -d --build users-auth
	@echo "Users auth service starting. Check status with 'make status'"

# Build and start just the remote service (for testing)
start-remote:
	@echo "Building and starting the remote service..."
	docker compose up -d --build remote
	@echo "Remote service starting. Check status with 'make status'"

# Build and start just the game service (for testing)
start-game-service:
	@echo "Building and starting the game service..."
	docker compose up -d --build game-service
	@echo "Game service starting. Check status with 'make status'"

# Build and start just the chat service (for testing)
start-chat-service:
	@echo "Building and starting the chat service..."
	docker compose up -d --build chat-service
	@echo "Chat service starting. Check status with 'make status'"

# Build and start just the frontend service (for testing)
start-frontend:
	@echo "Starting frontend development server..."
	cd frontend && npm install && npm run dev

# Build the frontend (for production)
build-frontend:
	@echo "Building frontend for production..."
	cd frontend && npm install && npm run build

# Build the frontend with TypeScript checking skipped
build-frontend-skip-ts-check:
	@echo "Building frontend for production (skipping TypeScript checks)..."
	cd frontend && npm install && npm run build-skip-ts-check

# Rebuild just the webserver with the latest frontend
rebuild-webserver-with-frontend:
	@echo "Creating mock frontend build..."
	cd frontend && npm install && npm run mock-build
	@echo "Building and starting the webserver with the new frontend..."
	docker compose stop webserver
	docker compose rm -f webserver
	docker compose build --no-cache webserver
	docker compose up -d webserver
	@echo "Webserver rebuilt with frontend. Check status with 'make status'"

# Rebuild just the frontend service (for development)
rebuild-frontend:
	@echo "This is now just an alias for start-frontend for local development"
	make start-frontend

# Stop all services
stop:
	@echo "Stopping the monitoring stack..."
	docker compose down -v
	@echo "Stopping RabbitMQ..."
	cd rabbitmq && docker compose down -v
	@echo "All services have been stopped and removed."

# Check status of all services (improved version with colors)
status:
	@./scripts/health_check.sh

# Clean up less aggressively (containers, volumes, and networks)
clean: stop
	@echo "Cleaning up Docker resources..."
	# Remove stopped containers and volumes
	docker container prune -f
	docker volume prune -f
	# Remove RabbitMQ network, but not other networks or images
	docker network rm rabbitmq-network 2>/dev/null || true
	@echo "Less aggressive Docker cleanup complete!"

# Clean npm build files
clean-npm:
	@echo "Cleaning npm build files..."
	find . -name "node_modules" -type d -prune -exec rm -rf '{}' +
	find . -name "dist" -type d -prune -exec rm -rf '{}' +
	find . -name ".cache" -type d -prune -exec rm -rf '{}' +
	find . -name "*.tsbuildinfo" -type f -delete
	@echo "NPM build files cleaned!"

# Clean everything (more aggressive cleanup)
fclean: stop clean-npm
	@echo "Forcing full cleanup of Docker resources..."
	# Remove stopped containers, unused images, networks, and volumes
	docker container prune -f
	# docker image prune -a -f
	docker network prune -f
	docker volume prune -f
	# Optionally, remove the .docker directory if you want to completely reset Docker's data
	# rm -rf ~/.docker
	# Remove RabbitMQ network (this will be removed in both clean and fclean)
	docker network rm rabbitmq-network 2>/dev/null || true
	@echo "Full Docker cleanup complete!"

reDev:	clean-npm all

rebuild:fclean all

re:	stop
	@echo "Rebuilding services.."
	docker compose build --no-cache
	docker compose up -d
	@echo "Services have been rebuilt and started, check status with 'make status'"

help:
	@echo "Available Commands:"
	@echo "  all        - Setup and start all services"
	@echo "  setup      - Setup directories and network"
	@echo "  start      - Start RabbitMQ and monitoring stack"
	@echo "  start-remote - Build and start the remote service (for testing)"
	@echo "  start-game-service - Build and start the game service (for testing)"
	@echo "  start-chat-service - Build and start the chat service (for testing)"
	@echo "  start-frontend - Build and start the frontend service (for testing)"
	@echo "  rebuild-frontend - Rebuild and start the frontend service (for development)"
	@echo "  stop       - Stop all services"
	@echo "  status     - Check status of all services (with colorful output)"
	@echo "  clean      - Clean up stopped containers and volumes"
	@echo "  clean-npm  - Clean up npm build files (node_modules, dist, etc.)"
	@echo "  fclean     - Clean up all Docker resources and npm build files"
	@echo "  re         - Run fclean and then start everything fresh"


.PHONY: start stop status clean clean-npm fclean re help setup
