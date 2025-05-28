#!/bin/bash

# Check if username is provided
if [ -z "$1" ]; then
    echo "Usage: $0 <username>"
    echo "Example: $0 jskehan"
    exit 1
fi

USERNAME=$1
DOCKER_ROOT_DIR="$HOME/goinfre/docker"
DOCKER_CONFIG_DIR="$HOME/.config/docker"
DOCKER_DAEMON_CONFIG="$DOCKER_CONFIG_DIR/daemon.json"

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check if systemctl is available
if ! command_exists systemctl; then
    echo "Error: systemctl command not found. This script requires systemd."
    exit 1
fi

# Create goinfre directory if it doesn't exist
if [ ! -d "$HOME/goinfre" ]; then
    echo "Creating goinfre directory..."
    mkdir -p "$HOME/goinfre"
fi

# Remove existing Docker symlink if it exists
if [ -L "$HOME/.docker" ]; then
    echo "Removing existing Docker symlink..."
    rm "$HOME/.docker"
fi

# Create Docker directory in goinfre
echo "Creating Docker directory in goinfre..."
mkdir -p "$DOCKER_ROOT_DIR"

# Create symlink
echo "Creating symlink from .docker to goinfre/docker..."
ln -s "$DOCKER_ROOT_DIR" "$HOME/.docker"

# Create Docker config directory if it doesn't exist
mkdir -p "$DOCKER_CONFIG_DIR"

# Create or update daemon.json
echo "Updating Docker daemon configuration..."
cat > "$DOCKER_DAEMON_CONFIG" << EOF
{
    "data-root": "/home/$USERNAME/goinfre/docker"
}
EOF

# Restart Docker
echo "Restarting Docker..."
systemctl --user restart docker

echo "Docker root directory setup complete!"
echo "Docker data will now be stored in: $DOCKER_ROOT_DIR"
