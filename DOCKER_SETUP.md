# Docker Setup for Microservices

This document explains how to containerize and run the microservices using Docker.

## Services Architecture

The application consists of the following services:
- shared (common library used by all services)
- apiGateway (port 8443)
- usersAndAuth (port 10004)
- remote/gameService (port 10002)
- matchmaking (port 10001)
- chat-service (port 10003)
- webserver (port 10005)

## How to Dockerize a Service

We've created a helper script to make it easy to dockerize each service:

```bash
./scripts/dockerize-service.sh <service-name>
```

For example:
```bash
./scripts/dockerize-service.sh usersAndAuth
```

This will:
1. Create a Dockerfile in the service directory
2. Add the service to docker-compose.yml
3. Configure the correct port based on the service type (from shared/src/networkSettings.ts)

## Important: Network Settings for Docker

When running services in Docker containers, you must update the IP address in `shared/src/networkSettings.ts` to use `0.0.0.0` instead of specific IP addresses or `localhost`. This allows the service to bind to all network interfaces inside the container.

For example:
```typescript
// Before
apiGateway: {
  ip: "10.15.12.9",
  port: 8443,
}

// After
apiGateway: {
  ip: "0.0.0.0",
  port: 8443,
}
```

After updating the network settings, rebuild the shared library:
```bash
cd shared && npm run build
```

Then rebuild the affected service:
```bash
docker-compose build <service-name>
```

## Running the Services

To run all services:

```bash
docker-compose up
```

To run specific services:

```bash
docker-compose up api-gateway elasticsearch kibana
```

To rebuild services after making changes:

```bash
docker-compose build
```

Or rebuild a specific service:

```bash
docker-compose build api-gateway
```

## Shared Library

The shared library is built into each service container during the Docker build process. This ensures that:

1. Each service has its own copy of the shared library
2. Services are self-contained and don't depend on external volumes
3. The correct version of the shared library is always used

## Development Workflow

1. Make changes to the shared library
2. Run `npm run build` in the shared directory
3. Rebuild the affected service containers:
   ```bash
   docker-compose build <service-name>
   ```
4. Restart the services:
   ```bash
   docker-compose up -d
   ```

## Port Mappings

The port mappings in docker-compose.yml are automatically set based on the network settings defined in `shared/src/networkSettings.ts`. If you change the ports in the network settings, you should rebuild the affected services.

## Environment Variables

Add any required environment variables in the docker-compose.yml file under the corresponding service section. 