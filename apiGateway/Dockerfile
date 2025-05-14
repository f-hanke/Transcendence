FROM node:20-alpine AS shared-builder

WORKDIR /app/shared
COPY shared/package*.json ./
RUN npm install
COPY shared/tsconfig.json ./
COPY shared/src ./src
RUN npm run build

FROM node:20-alpine AS api-gateway

WORKDIR /app/apiGateway
COPY apiGateway/package*.json ./
RUN npm install
COPY apiGateway/tsconfig.json ./
COPY apiGateway/src ./src
COPY apiGateway/certs ./certs

# Copy the built shared library
COPY --from=shared-builder /app/shared/dist /app/shared/dist
COPY --from=shared-builder /app/shared/package.json /app/shared/package.json

# Update the shared library path
RUN npm install --no-save ../shared

# Build the API gateway
RUN npm run build

# Copy certificates to the dist directory where they're expected
RUN mkdir -p ./dist/certs && cp ./certs/* ./dist/certs/

EXPOSE 8443

CMD ["node", "dist/server.js"] 