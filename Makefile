all: wipe-docker-everything setup up

wipe-docker-everything:
	@echo "⚠️  WARNING (eval only): deleting ALL Docker containers, images, volumes, and networks..."
	@docker stop $$(docker ps -qa) 2>/dev/null || true;
	@docker rm $$(docker ps -qa) 2>/dev/null || true;
	@docker rmi -f $$(docker images -qa) 2>/dev/null || true;
	@docker volume rm $$(docker volume ls -q) 2>/dev/null || true;
	@docker network rm $$(docker network ls -q) 2>/dev/null || true;
	
# Elasticsearch security setup 
create_env:
	@echo "Setting up .ENV..."
	@chmod +x scripts/create-env.sh
	@./scripts/create-env.sh

# Build shared dependencies & frontend
build-deps:
	@echo "Building shared dependencies..."
	@echo "Building shared package..."
	npm install --prefix ./shared
	npm run build --prefix ./shared
	@echo "Building frontend..."
	npm install --prefix ./frontend
	npm run build --prefix ./frontend
	@echo "Dependencies built successfully!"

# Setup directories, network, and security
setup: create_env build-deps

# Ensure Kibana system password is properly set
# ensure-kibana-password:
# 	@echo "Ensuring kibana_system password is properly set..."
# 	@chmod +x scripts/ensure-kibana-password.sh
# 	@./scripts/ensure-kibana-password.sh

# Basic Docker Compose operations
up: setup
	docker compose up -d --build --remove-orphans
	@echo "All services are ready. Check status with 'make status'"
	@cat service-info.txt

# Fresh start - complete rebuild without cache (recommended after clean-volumes)
fresh-start: setup
	docker compose build --no-cache
	docker compose up -d --remove-orphans
	@echo "✅ Fresh start complete! All services rebuilt and started."
	@cat service-info.txt

down:
	@echo "Stopping all services (keeping volumes)..."
	docker compose down
	@echo "All services stopped. Data volumes preserved."

restart: down up

# Service rebuilding
rebuild-webserver:
	@echo "Rebuilding webserver..."
	docker compose stop webserver
	docker compose rm -f webserver
	docker compose build --no-cache webserver
	docker compose up -d webserver

rebuild: down build-deps
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
	@read -p "" dummy;
	docker compose down -v
	docker volume prune -f
	@echo "All volumes removed!"

clean-all: clean clean-npm clean-volumes
	@echo "⚠️  WARNING: This will delete everything including data!"
	@echo "Press Ctrl+C to cancel, or Enter to continue..."
	@read -p "" dummy;
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

# Complete reset - volumes + fresh rebuild (what you probably want!)
reset-all: clean-volumes fresh-start
	@echo "🎉 Complete reset finished! Everything rebuilt from scratch."

help:
	@echo "Docker Operations:"
	@echo "  up           - Start all services (docker compose up)"
	@echo "  fresh-start  - Complete rebuild with --no-cache (recommended after clean-volumes)"
	@echo "  down         - Stop all services (preserving data)"
	@echo "  restart      - Stop and start all services"
	@echo "  rebuild      - Rebuild and restart all services"
	@echo "  status       - Check status of all services"
	@echo "  logs         - Follow logs from all services"
	@echo ""
	@echo "Build Operations:"
	@echo "  build-deps   - Build shared dependencies only (required for Docker)"
	@echo ""
	@echo "Security Setup:"
	@echo "  create_env - Configure Elasticsearch security (run first!)"
	@echo "  ensure-kibana-password - Ensure kibana_system password is set"
	@echo ""
	@echo "Service Management:"
	@echo "  rebuild-webserver    - Rebuild webserver only"
	@echo "  Individual services: docker compose up -d --build SERVICE_NAME"
	@echo ""
	@echo "Cleanup (Safe):"
	@echo "  clean        - Clean containers/images (preserve data)"
	@echo "  clean-npm    - Clean npm build files"
	@echo ""
	@echo "Cleanup (Destructive):"
	@echo "  clean-volumes - DELETE all data volumes"
	@echo "  clean-all     - DELETE everything"
	@echo ""
	@echo "Aliases:"
	@echo "  start/stop   - Aliases for up/down"
	@echo "  reset        - Clean and rebuild"
	@echo "  reset-all    - Clean volumes + fresh rebuild (complete reset)"
	@echo ""
	@echo "Security Notes:"
	@echo "  • Run 'make create_env' before first startup"
	@echo "  • Kibana login: username 'elastic', password from .env file"
	@echo "  • Elasticsearch API requires authentication with certificates"

.PHONY: all setup up down restart start stop reset rebuild status logs clean clean-npm clean-volumes clean-all help rebuild-webserver build-deps
