FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Create directory for avatar uploads
RUN mkdir -p ./public/img/avatars

# Run migrations and start application
CMD npm run migrate && npm start
