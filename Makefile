.PHONY: start stop status clean setup

# Default target
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
	@echo "Waiting for services to initialize..."
	sleep 15
	@echo "============================================"
	@echo "All services are now running:"
	@echo "============================================"
	@echo "Elasticsearch: http://localhost:9200"
	@echo "Kibana:        http://localhost:5601"
	@echo "Prometheus:    http://localhost:9090"
	@echo "Grafana:       http://localhost:3000 (admin/admin)"
	@echo "RabbitMQ:      http://localhost:15672 (admin/admin)"
	@echo "============================================"
	@echo "Logstash ports:"
	@echo "  - TCP:       5000"
	@echo "  - UDP:       5000"
	@echo "  - Beats:     5044"
	@echo "RabbitMQ AMQP: 5672"
	@echo "============================================"

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
	@echo "============================================"

# Clean up all services and remove volumes
clean: stop
	@echo "Cleaning up..."
	docker network rm rabbitmq-network 2>/dev/null || true 