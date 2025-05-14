FROM node:20-alpine AS shared-builder

WORKDIR /app/shared
COPY shared/package*.json ./
RUN npm install
COPY shared/tsconfig.json ./
COPY shared/src ./src
RUN npm run build

FROM node:20-alpine AS service-builder

# Replace SERVICE_NAME with the actual service name (e.g., usersAndAuth, chat-service, etc.)
ARG SERVICE_NAME
WORKDIR /app/${SERVICE_NAME}

# Copy service-specific files
COPY ${SERVICE_NAME}/package*.json ./
RUN npm install
COPY ${SERVICE_NAME}/tsconfig.json ./
COPY ${SERVICE_NAME}/src ./src

# Copy certificates if they exist
COPY ${SERVICE_NAME}/certs ./certs 2>/dev/null || true

# Copy the built shared library
COPY --from=shared-builder /app/shared/dist /app/shared/dist
COPY --from=shared-builder /app/shared/package.json /app/shared/package.json

# Update the shared library path
RUN npm install --no-save ../shared

# Build the service
RUN npm run build

# Copy certificates to the dist directory if they exist
RUN if [ -d "./certs" ]; then mkdir -p ./dist/certs && cp ./certs/* ./dist/certs/ 2>/dev/null || true; fi

EXPOSE ${PORT:-3000}

CMD ["node", "dist/index.js"] 