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

echo ""
echo "🔐 Environment setup complete!"
echo "All passwords and secrets have been generated and stored in .env"
echo ""
echo "🔑 To view your passwords:"
echo "  Elasticsearch: grep ELASTIC_PASSWORD .env"
echo "  Kibana: grep KIBANA_PASSWORD .env"  
echo "  Grafana: grep GRAFANA_ADMIN_PASSWORD .env"
echo "  RabbitMQ: grep RABBITMQ_DEFAULT .env"
