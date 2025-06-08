#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo "🔐 Setting up Elasticsearch certificates (simplified)..."

# Check if .env file exists and has required passwords
if [ ! -f .env ]; then
    echo -e "${RED}❌ .env file not found. Run ./scripts/create-env.sh first${NC}"
    exit 1
fi

# Load environment variables
source .env

if [ -z "${ELASTIC_PASSWORD}" ]; then
    echo -e "${RED}❌ ELASTIC_PASSWORD not found in .env file${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Environment variables validated${NC}"

# Create certificates directly in Docker volume using a temporary container
echo "Creating certificates directly in Docker volume..."

# Create CA certificate and instance certificates in one go
docker run --rm \
    -v "tranrecent_elasticsearch-certs:/usr/share/elasticsearch/config/certs" \
    --user root \
    docker.elastic.co/elasticsearch/elasticsearch:8.12.1 \
    bash -c '
        # Create CA certificate
        echo "Creating CA certificate..."
        /usr/share/elasticsearch/bin/elasticsearch-certutil ca --silent --pem -out /tmp/ca.zip
        cd /usr/share/elasticsearch/config/certs && unzip -o /tmp/ca.zip
        
        # Create instances.yml
        echo "Creating instances configuration..."
        cat > /tmp/instances.yml << EOF
instances:
  - name: elasticsearch
    dns:
      - elasticsearch
      - localhost
    ip:
      - 127.0.0.1
  - name: kibana
    dns:
      - kibana
      - localhost
    ip:
      - 127.0.0.1
EOF
        
        # Create instance certificates
        echo "Creating instance certificates..."
        /usr/share/elasticsearch/bin/elasticsearch-certutil cert --silent --pem \
            -out /tmp/certs.zip \
            --in /tmp/instances.yml \
            --ca-cert /usr/share/elasticsearch/config/certs/ca/ca.crt \
            --ca-key /usr/share/elasticsearch/config/certs/ca/ca.key
        
        # Extract certificates
        cd /usr/share/elasticsearch/config/certs && unzip -o /tmp/certs.zip
        
        # Set permissions (run as root, so this should work)
        chmod -R 644 /usr/share/elasticsearch/config/certs/ca/*.crt
        chmod -R 644 /usr/share/elasticsearch/config/certs/ca/*.key
        chmod -R 644 /usr/share/elasticsearch/config/certs/elasticsearch/*.crt  
        chmod -R 644 /usr/share/elasticsearch/config/certs/elasticsearch/*.key
        chmod -R 644 /usr/share/elasticsearch/config/certs/kibana/*.crt
        chmod -R 644 /usr/share/elasticsearch/config/certs/kibana/*.key
        
        echo "Certificate generation completed successfully"
    '

if [ $? -eq 0 ]; then
    echo -e "${GREEN}🎉 Certificate setup complete!${NC}"
    echo ""
    echo "📁 Certificates created in Docker volume tranrecent_elasticsearch-certs"
    echo "   - ca/ca.crt (Certificate Authority)"
    echo "   - elasticsearch/elasticsearch.crt"
    echo "   - elasticsearch/elasticsearch.key"
    echo "   - kibana/kibana.crt"
    echo "   - kibana/kibana.key"
else
    echo -e "${RED}❌ Certificate generation failed${NC}"
    exit 1
fi 