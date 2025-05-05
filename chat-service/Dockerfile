# Use official Node.js image
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app/chat-service

# Copy chat-service package files
COPY chat-service/package*.json ./

# Copy the shared module (required by "file:../shared" dependency)
COPY shared /app/shared

# Copy the rest of the chat-service source code
COPY chat-service .

# Install dependencies (resolves "file:../shared" correctly now)
RUN npm install

# Build TypeScript
#RUN npm run build

# Expose the port used by the service
EXPOSE 3002

# Start the application
CMD ["npm", "run", "dev"]

