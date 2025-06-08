FROM node:20-alpine

WORKDIR /app/usersAndAuth

# Copy service-specific files
COPY usersAndAuth/package*.json ./
RUN npm install
COPY usersAndAuth/tsconfig.json ./
COPY usersAndAuth/service.ts ./
COPY usersAndAuth/utils ./utils
COPY usersAndAuth/orm ./orm
COPY usersAndAuth/config ./config
COPY usersAndAuth/rabbitMQ ./rabbitMQ
COPY usersAndAuth/db ./db
COPY usersAndAuth/lib ./lib
COPY usersAndAuth/public ./public

# Copy the pre-built shared library (built by build_all.sh)
COPY shared/dist /app/shared/dist
COPY shared/package.json /app/shared/package.json

# Update the shared library path
RUN npm install --no-save ../shared

# Build the service
RUN npm run build

# Initialize database
RUN npm run db

# Install health check tools
RUN apk add --no-cache curl

EXPOSE 10004

CMD ["node", "service.js"]