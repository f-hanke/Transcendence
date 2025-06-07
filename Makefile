# Default Make command
all: setup up

# Setup directories and network
setup:
	@echo "Creating required directories..."
	mkdir -p grafana/dashboards
	mkdir -p grafana/provisioning/datasources
	mkdir -p grafana/provisioning/dashboards
	@echo "Building shared dependencies..."
	npm install --prefix ./shared
	npm run build --prefix ./shared

# Basic Docker Compose operations
up: setup
	@echo "Starting all services..."
	docker compose up -d --build
	@echo "Services are starting up. Check status with 'make status'"
	@cat service-info.txt

down:
	@echo "Stopping all services (keeping volumes)..."
	docker compose down
	@echo "All services stopped. Data volumes preserved."

restart: down up

# Individual service management
start-api-gateway:
	@echo "Building and starting the api gateway..."
	docker compose up -d --build api-gateway

start-webserver:
	@echo "Building and starting the webserver..."
	docker compose up -d --build webserver

start-users-auth:
	@echo "Building and starting the users auth service..."
	docker compose up -d --build users-auth

start-remote:
	@echo "Building and starting the remote service..."
	docker compose up -d --build remote

start-game-service:
	@echo "Building and starting the game service..."
	docker compose up -d --build game-service

start-chat-service:
	@echo "Building and starting the chat service..."
	docker compose up -d --build chat-service

# Frontend development
start-frontend:
	@echo "Starting frontend development server..."
	cd frontend && npm install && npm run dev

build-frontend:
	@echo "Building frontend for production..."
	cd shared && npm install && npm run build
	cd frontend && npm install && npm run build

build-frontend-skip-ts-check:
	@echo "Building frontend for production (skipping TypeScript checks)..."
	cd shared && npm install && npm run build
	cd frontend && npm install && npm run build-skip-ts-check

# Service rebuilding
rebuild-webserver:
	@echo "Rebuilding webserver..."
	docker compose stop webserver
	docker compose rm -f webserver
	docker compose build --no-cache webserver
	docker compose up -d webserver

rebuild: down
	@echo "Rebuilding all services..."
	docker compose build --no-cache
	docker compose up -d
	@echo "Services rebuilt and started. Check status with 'make status'"

# Status and monitoring
status:
	@./scripts/health_check.sh

logs:
	docker compose logs -f

# Cleanup commands (non-destructive by default)
clean:
	@echo "Cleaning up containers and images (preserving volumes)..."
	docker compose down
	docker container prune -f
	docker image prune -f
	docker network prune -f
	@echo "Cleanup complete. Data volumes preserved."

clean-npm:
	@echo "Cleaning npm build files..."
	find . -name "node_modules" -type d -prune -exec rm -rf '{}' +
	find . -name "dist" -type d -prune -exec rm -rf '{}' +
	find . -name ".cache" -type d -prune -exec rm -rf '{}' +
	find . -name "*.tsbuildinfo" -type f -delete
	@echo "NPM build files cleaned!"

# Destructive cleanup commands (separate section)
clean-volumes:
	@echo "⚠️  WARNING: This will delete ALL data volumes!"
	@echo "Press Ctrl+C to cancel, or Enter to continue..."
	@read
	docker compose down -v
	docker volume prune -f
	@echo "All volumes removed!"

clean-all: clean clean-npm clean-volumes
	@echo "⚠️  WARNING: This will delete everything including data!"
	@echo "Press Ctrl+C to cancel, or Enter to continue..."
	@read
	docker system prune -a -f --volumes
	@echo "Everything cleaned!"

# Aliases for common operations
start: 
	@echo "Starting all services..."
	docker compose up -d
	@echo "Services started. Check status with 'make status'"

stop: 
	@echo "Stopping all services..."
	docker compose down

reset: clean rebuild

help:
	@echo "🐋 Docker Operations:"
	@echo "  up           - Start all services (docker compose up)"
	@echo "  down         - Stop all services (preserving data)"
	@echo "  restart      - Stop and start all services"
	@echo "  rebuild      - Rebuild and restart all services"
	@echo "  status       - Check status of all services"
	@echo "  logs         - Follow logs from all services"
	@echo ""
	@echo "🔧 Individual Services:"
	@echo "  start-api-gateway    - Start API gateway"
	@echo "  start-webserver      - Start webserver"
	@echo "  start-users-auth     - Start auth service"
	@echo "  start-remote         - Start remote service"
	@echo "  start-game-service   - Start game service"
	@echo "  start-chat-service   - Start chat service"
	@echo "  rebuild-webserver    - Rebuild webserver"
	@echo ""
	@echo "🎨 Frontend:"
	@echo "  start-frontend       - Start frontend dev server"
	@echo "  build-frontend       - Build frontend for production"
	@echo ""
	@echo "🧹 Cleanup (Safe):"
	@echo "  clean        - Clean containers/images (preserve data)"
	@echo "  clean-npm    - Clean npm build files"
	@echo ""
	@echo "💥 Cleanup (Destructive):"
	@echo "  clean-volumes - ⚠️  DELETE all data volumes"
	@echo "  clean-all     - ⚠️  DELETE everything"
	@echo ""
	@echo "📚 Aliases:"
	@echo "  start/stop   - Aliases for up/down"
	@echo "  reset        - Clean and rebuild"


.PHONY: all setup up down restart start stop reset rebuild status logs clean clean-npm clean-volumes clean-all help start-api-gateway start-webserver start-users-auth start-remote start-game-service start-chat-service start-frontend build-frontend build-frontend-skip-ts-check rebuild-webserver
