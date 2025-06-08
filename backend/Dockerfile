FROM node:20-alpine

WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install
COPY backend/tsconfig.json ./
COPY backend/src ./src
COPY backend/public ./public

# Copy the pre-built shared library (built by build_all.sh)
COPY shared/dist /app/shared/dist
COPY shared/package.json /app/shared/package.json

# Update the shared library path
RUN npm install --no-save ../shared

# Build the service
RUN npm run build

# Install health check tools
RUN apk add --no-cache wget

EXPOSE 10003

# Add health check
HEALTHCHECK --interval=10s --timeout=5s --start-period=30s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://0.0.0.0:10003/health || exit 1

CMD ["npm", "start"] 