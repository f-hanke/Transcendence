FROM node:20-alpine

WORKDIR /app/apiGateway
COPY apiGateway/package*.json ./
RUN npm install
COPY apiGateway/tsconfig.json ./
COPY apiGateway/src ./src
COPY apiGateway/certs ./certs

# Copy the pre-built shared library (built by build_all.sh)
COPY shared/dist /app/shared/dist
COPY shared/package.json /app/shared/package.json

# Update the shared library path
RUN npm install --no-save ../shared

# Build the API gateway
RUN npm run build

# Copy certificates to the dist directory where they're expected
RUN mkdir -p ./dist/certs && cp ./certs/* ./dist/certs/

# Install health check tools
RUN apk add --no-cache curl

EXPOSE 8443

CMD ["node", "dist/server.js"] 