FROM node:20-alpine as shared-builder

WORKDIR /app/shared
COPY shared/package*.json ./
RUN npm install
COPY shared/tsconfig.json ./
COPY shared/src ./src
RUN npm run build

FROM node:20-alpine as service-builder

WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install

COPY backend/tsconfig.json ./
COPY backend/src ./src
COPY backend/public ./public

# Copy the shared package build
COPY --from=shared-builder /app/shared/dist/ ../shared/dist/
COPY --from=shared-builder /app/shared/package.json ../shared/

# Link the shared package
RUN npm install --no-save ../shared
RUN npm run build

FROM node:20-alpine

WORKDIR /app
COPY --from=service-builder /app/backend/dist ./dist
COPY --from=service-builder /app/backend/node_modules ./node_modules
COPY --from=service-builder /app/backend/package.json ./
COPY --from=service-builder /app/backend/public ./public

# Copy the shared module to the final image
COPY --from=shared-builder /app/shared/dist/ /app/shared/dist/
COPY --from=shared-builder /app/shared/package.json /app/shared/

# Ensure the shared module is installed in the final image
RUN npm install --no-save ./shared

# Install wget for health checks
RUN apk add --no-cache wget

EXPOSE 10003

# Add health check
HEALTHCHECK --interval=10s --timeout=5s --start-period=30s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://0.0.0.0:10003/health || exit 1

CMD ["npm", "start"] 