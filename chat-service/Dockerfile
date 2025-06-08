FROM node:20-alpine

WORKDIR /app/chat-service
COPY chat-service/package*.json ./
RUN npm install

COPY chat-service/tsconfig.json ./
COPY chat-service/src ./src
COPY chat-service/db ./db
RUN rm ./db/chat_service_db.db

# Copy pre-built shared package (built by build_all.sh)
COPY shared/dist /app/shared/dist
COPY shared/package.json /app/shared/package.json

# Link the shared package
RUN npm install --no-save ../shared
RUN npm run build
RUN npm run db

# Install wget for health checks
RUN apk add --no-cache wget

EXPOSE 10001

# Add health check
HEALTHCHECK --interval=10s --timeout=5s --start-period=30s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://0.0.0.0:10001/health || exit 1

CMD ["npm", "start"]
