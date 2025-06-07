FROM node:20-alpine AS shared-builder

WORKDIR /app/shared
COPY shared/package*.json ./
RUN npm install
COPY shared/tsconfig.json ./
COPY shared/src ./src
RUN npm run build

FROM node:20-alpine AS service-builder

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
RUN rm ./db/user_service.db
COPY usersAndAuth/lib ./lib
COPY usersAndAuth/public ./public

# Copy the built shared library
COPY --from=shared-builder /app/shared/dist /app/shared/dist
COPY --from=shared-builder /app/shared/package.json /app/shared/package.json

# Update the shared library path
RUN npm install --no-save ../shared

# Build the service
RUN npm run build
RUN npm run db

# Install health check tools
RUN apk add --no-cache curl

EXPOSE 10004

CMD ["node", "service.js"]