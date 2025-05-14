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

# Stop all services
stop:
	@echo "Stopping the monitoring stack..."
	docker compose down -v
	@echo "Stopping RabbitMQ..."
	cd rabbitmq && docker compose down -v
	@echo "All services have been stopped and removed."

# Check status of all services
status:
	@echo "Checking status of all services..."
	@echo "============================================"
	@echo "CONTAINER STATUS:"
	docker ps --format "NAMES: {{.Names}}\tSTATUS: {{.Status}}\tPORTS: {{.Ports}}"
	@echo "============================================"
	@echo "SERVICE HEALTH CHECKS:"
	@if curl -s http://localhost:9200 > /dev/null; then \
		echo "Elasticsearch: ✅ (http://localhost:9200)"; \
	else \
		echo "Elasticsearch: ❌ (not responding)"; \
	fi
	@if curl -s http://localhost:5601 > /dev/null; then \
		echo "Kibana: ✅ (http://localhost:5601)"; \
	else \
		echo "Kibana: ❌ (not responding)"; \
	fi
	@if curl -s http://localhost:9090 > /dev/null; then \
		echo "Prometheus: ✅ (http://localhost:9090)"; \
	else \
		echo "Prometheus: ❌ (not responding)"; \
	fi
	@if curl -s http://localhost:3000 > /dev/null; then \
		echo "Grafana: ✅ (http://localhost:3000)"; \
	else \
		echo "Grafana: ❌ (not responding)"; \
	fi
	@if curl -s http://localhost:15672 > /dev/null; then \
		echo "RabbitMQ: ✅ (http://localhost:15672)"; \
	else \
		echo "RabbitMQ: ❌ (not responding)"; \
	fi
	@if curl -sk https://localhost:8443 > /dev/null; then \
		echo "API Gateway: ✅ (https://localhost:8443)"; \
	else \
		echo "API Gateway: ❌ (not responding)"; \
	fi
	@if curl -s http://localhost:10001 > /dev/null; then \
		echo "Matchmaking Service: ✅ (http://localhost:10001)"; \
	else \
		echo "Matchmaking Service: ❌ (not responding)"; \
	fi
	@if curl -s http://localhost:10002 > /dev/null; then \
		echo "Game Service: ✅ (http://localhost:10002)"; \
	else \
		echo "Game Service: ❌ (not responding)"; \
	fi
	@if curl -s http://localhost:10003 > /dev/null; then \
		echo "Chat Service: ✅ (http://localhost:10003)"; \
	else \
		echo "Chat Service: ❌ (not responding)"; \
	fi
	@if curl -s http://localhost:10004 > /dev/null; then \
		echo "Auth Service: ✅ (http://localhost:10004)"; \
	else \
		echo "Auth Service: ❌ (not responding)"; \
	fi
	@if curl -s http://localhost:10005 > /dev/null; then \
		echo "Webserver: ✅ (http://localhost:10005)"; \
	else \
		echo "Webserver: ❌ (not responding)"; \
	fi
	@echo "============================================"

# Clean up less aggressively (containers, volumes, and networks)
clean: stop
	@echo "Cleaning up Docker resources..."
	# Remove stopped containers and volumes
	docker container prune -f
	docker volume prune -f
	# Remove RabbitMQ network, but not other networks or images
	docker network rm rabbitmq-network 2>/dev/null || true
	@echo "Less aggressive Docker cleanup complete!"

# Clean everything (more aggressive cleanup)
fclean: stop
	@echo "Forcing full cleanup of Docker resources..."
	# Remove stopped containers, unused images, networks, and volumes
	docker container prune -f
	docker image prune -a -f
	docker network prune -f
	docker volume prune -f
	# Optionally, remove the .docker directory if you want to completely reset Docker's data
	# rm -rf ~/.docker
	# Remove RabbitMQ network (this will be removed in both clean and fclean)
	docker network rm rabbitmq-network 2>/dev/null || true
	@echo "Full Docker cleanup complete!"

re: fclean all

help:
	@echo "Available Commands:"
	@echo "  all      - Setup and start all services"
	@echo "  setup    - Setup directories and network"
	@echo "  start    - Start RabbitMQ and monitoring stack"
	@echo "  stop     - Stop all services"
	@echo "  status   - Check status of all services"
	@echo "  clean    - Clean up stopped containers and volumes"
	@echo "  fclean   - Clean up all Docker resources (containers, images, networks, volumes)"
	@echo "  re       - Run fclean and then start everything fresh"


.PHONY: start stop status clean fclean re help setup
