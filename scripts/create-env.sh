# Check if .env file exists
if [ ! -f .env ]; then
    echo "Creating .env file..."
    touch .env
fi

# Generate secure passwords
generate_password() {
    openssl rand -base64 32 | tr -d "=+/" | cut -c1-32
}

# Check if variables already exist in .env
check_env_var() {
    local var_name=$1
    if grep -q "^${var_name}=" .env; then
        echo "✓ ${var_name} already exists in .env"
        return 0
    else
        return 1
    fi
}

echo "Setting up environment variables..."
echo ""

# ELASTIC_PASSWORD
if ! check_env_var "ELASTIC_PASSWORD"; then
    ELASTIC_PASS=$(generate_password)
    echo "ELASTIC_PASSWORD=${ELASTIC_PASS}" >> .env
    echo "✓ Generated ELASTIC_PASSWORD"
else
    ELASTIC_PASS=$(grep "^ELASTIC_PASSWORD=" .env | cut -d'=' -f2)
fi

# KIBANA_PASSWORD  
if ! check_env_var "KIBANA_PASSWORD"; then
    KIBANA_PASS=$(generate_password)
    echo "KIBANA_PASSWORD=${KIBANA_PASS}" >> .env
    echo "✓ Generated KIBANA_PASSWORD"
else
    KIBANA_PASS=$(grep "^KIBANA_PASSWORD=" .env | cut -d'=' -f2)
fi

# ENCRYPTION_KEY
if ! check_env_var "ENCRYPTION_KEY"; then
    ENCRYPTION_KEY=$(generate_password)
    echo "ENCRYPTION_KEY=${ENCRYPTION_KEY}" >> .env
    echo "✓ Generated ENCRYPTION_KEY"
else
    ENCRYPTION_KEY=$(grep "^ENCRYPTION_KEY=" .env | cut -d'=' -f2)
fi

# LICENSE (optional)
if ! check_env_var "LICENSE"; then
    echo "LICENSE=basic" >> .env
    echo "✓ Set LICENSE to basic"
fi

# JWT_SECRET (for API Gateway and Users Auth)
if ! check_env_var "JWT_SECRET"; then
    JWT_SECRET=$(generate_password)
    echo "JWT_SECRET=${JWT_SECRET}" >> .env
    echo "✓ Generated JWT_SECRET"
fi

# GRAFANA_ADMIN_PASSWORD
if ! check_env_var "GRAFANA_ADMIN_PASSWORD"; then
    GRAFANA_ADMIN_PASSWORD=$(generate_password)
    echo "GRAFANA_ADMIN_PASSWORD=${GRAFANA_ADMIN_PASSWORD}" >> .env
    echo "✓ Generated GRAFANA_ADMIN_PASSWORD"
fi

# RABBITMQ_DEFAULT_USER
if ! check_env_var "RABBITMQ_DEFAULT_USER"; then
    echo "RABBITMQ_DEFAULT_USER=admin" >> .env
    echo "✓ Set RABBITMQ_DEFAULT_USER"
fi

# RABBITMQ_DEFAULT_PASS
if ! check_env_var "RABBITMQ_DEFAULT_PASS"; then
    RABBITMQ_DEFAULT_PASS=$(generate_password)
    echo "RABBITMQ_DEFAULT_PASS=${RABBITMQ_DEFAULT_PASS}" >> .env
    echo "✓ Generated RABBITMQ_DEFAULT_PASS"
fi

# LOGSTASH_HTTP_USER (new)
if ! check_env_var "LOGSTASH_HTTP_USER"; then
    echo "LOGSTASH_HTTP_USER=logstash" >> .env
    echo "✓ Set LOGSTASH_HTTP_USER"
fi

# LOGSTASH_HTTP_PASSWORD (new)
if ! check_env_var "LOGSTASH_HTTP_PASSWORD"; then
    LOGSTASH_HTTP_PASSWORD=$(generate_password)
    echo "LOGSTASH_HTTP_PASSWORD=${LOGSTASH_HTTP_PASSWORD}" >> .env
    echo "✓ Generated LOGSTASH_HTTP_PASSWORD"
fi

# PROMETHEUS_PASSWORD (new)
if ! check_env_var "PROMETHEUS_PASSWORD"; then
    PROMETHEUS_PASSWORD=$(generate_password)
    echo "PROMETHEUS_PASSWORD=${PROMETHEUS_PASSWORD}" >> .env
    echo "✓ Generated PROMETHEUS_PASSWORD"
else
    PROMETHEUS_PASSWORD=$(grep "^PROMETHEUS_PASSWORD=" .env | cut -d'=' -f2)
fi

# Generate hash for Prometheus password (regardless of whether it's new or existing)
if ! check_env_var "PROMETHEUS_PASSWORD_HASH" && [ -n "$PROMETHEUS_PASSWORD" ]; then
    # Generate bcrypt hash for the password
    if command -v python3 >/dev/null 2>&1; then
        # Try to install bcrypt if not available
        python3 -c "import bcrypt" 2>/dev/null || pip3 install bcrypt 2>/dev/null || echo "⚠️ bcrypt not available, hash generation skipped"
        if python3 -c "import bcrypt" 2>/dev/null; then
            PROMETHEUS_HASH=$(python3 -c "import bcrypt; print(bcrypt.hashpw('${PROMETHEUS_PASSWORD}'.encode('utf-8'), bcrypt.gensalt(rounds=12)).decode('utf-8'))")
            # Escape dollar signs for Docker Compose
            PROMETHEUS_HASH_ESCAPED=$(echo "$PROMETHEUS_HASH" | sed 's/\$/\$\$/g')
            echo "PROMETHEUS_PASSWORD_HASH=${PROMETHEUS_HASH_ESCAPED}" >> .env
            echo "✓ Generated PROMETHEUS_PASSWORD_HASH (escaped for Docker Compose)"
        fi
    else
        echo "⚠️ Python3 not available, will generate hash in container"
    fi
fi

echo ""
echo "🔐 Environment setup complete!"
echo "All passwords and secrets have been generated and stored in .env"
echo ""
echo "🔑 To view your passwords:"
echo "  Elasticsearch: grep ELASTIC_PASSWORD .env"
echo "  Kibana: grep KIBANA_PASSWORD .env"  
echo "  Grafana: grep GRAFANA_ADMIN_PASSWORD .env"
echo "  RabbitMQ: grep RABBITMQ_DEFAULT .env"
echo "  Logstash: grep LOGSTASH_HTTP .env"
echo "  Prometheus: grep PROMETHEUS_PASSWORD .env"
echo "  Prometheus Hash: grep PROMETHEUS_PASSWORD_HASH .env"
