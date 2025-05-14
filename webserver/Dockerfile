FROM node:20-alpine AS shared-builder

WORKDIR /app/shared
COPY shared/package*.json ./
RUN npm install
COPY shared/tsconfig.json ./
COPY shared/src ./src
RUN npm run build

FROM node:20-alpine AS service-builder

WORKDIR /app/webserver

# Copy service-specific files
COPY webserver/package*.json ./
RUN npm install
COPY webserver/tsconfig.json ./
COPY webserver/src ./src

# Copy the built shared library
COPY --from=shared-builder /app/shared/dist /app/shared/dist
COPY --from=shared-builder /app/shared/package.json /app/shared/package.json

# Update the shared library path
RUN npm install --no-save ../shared

# Build the service
RUN npm run build

# Install health check tools
RUN apk add --no-cache curl wget

EXPOSE 10005

CMD ["node", "distWebserver/server.js"]
