FROM node:20-alpine

# Create working directory
WORKDIR /app

# Build the shared package
WORKDIR /app/shared
COPY shared/package*.json ./
RUN npm install
COPY shared/tsconfig.json ./
COPY shared/src ./src
RUN npm run build

# Build the frontend
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
# Install the shared package
RUN npm install --no-save ../shared
COPY frontend/tsconfig.json ./
COPY frontend/vite.config.js ./
COPY frontend/src ./src
COPY frontend/index.html ./
COPY frontend/index.css ./
COPY frontend/postcss.config.js ./
COPY frontend/tailwind.config.js ./
RUN npm run build

# Set up and build the webserver
WORKDIR /app/webserver
COPY webserver/package*.json ./
RUN npm install
# Install the shared package
RUN npm install --no-save ../shared
COPY webserver/tsconfig.json ./
COPY webserver/src ./src
# The frontend build is already in the correct location from the frontend build step

# Build the webserver
RUN npm run build

# Install health check tools
RUN apk add --no-cache curl wget

EXPOSE 10005

CMD ["node", "distWebserver/server.js"]
