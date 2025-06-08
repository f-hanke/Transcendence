FROM node:20-alpine

# Create working directory
WORKDIR /app

# Set up and build the webserver
WORKDIR /app/webserver
COPY webserver/package*.json ./
RUN npm install

# Copy pre-built shared package (built by build_all.sh)
COPY shared/dist /app/shared/dist
COPY shared/package.json /app/shared/package.json

# Install the shared package
RUN npm install --no-save ../shared

COPY webserver/tsconfig.json ./
COPY webserver/src ./src

# Copy pre-built frontend (built by build_all.sh)
COPY webserver/distFrontend ./distFrontend

# Build the webserver
RUN npm run build

# Install health check tools
RUN apk add --no-cache curl wget

EXPOSE 10005

CMD ["node", "distWebserver/server.js"]
