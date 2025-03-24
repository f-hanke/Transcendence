FROM node:18-alpine

WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Create data directory for SQLite
RUN mkdir -p ./data
RUN mkdir -p ./public/uploads

# Create default avatar
RUN echo "Default avatar will be created during container initialization"

# Expose the API port
EXPOSE 3001

# Set environment variables
ENV NODE_ENV=production

# Command to run the application
CMD ["npm", "start"]
