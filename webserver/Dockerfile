FROM node:20-alpine

# Create working directory
WORKDIR /app

# Now build the shared package
WORKDIR /app/shared
COPY shared/package*.json ./
RUN npm install
COPY shared/tsconfig.json ./
COPY shared/src ./src
RUN npm run build

# Set up and build the webserver
WORKDIR /app/webserver
COPY webserver/package*.json ./
RUN npm install
# Install the shared package
RUN npm install --no-save ../shared
COPY webserver/tsconfig.json ./
COPY webserver/src ./src
# Copy the existing frontend files
COPY webserver/distFrontend ./distFrontend

# Build the webserver
RUN npm run build

# Install health check tools
RUN apk add --no-cache curl wget

EXPOSE 10005

CMD ["node", "distWebserver/server.js"]
