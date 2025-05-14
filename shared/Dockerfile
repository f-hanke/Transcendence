FROM node:20-alpine

WORKDIR /app/shared

COPY package*.json ./
RUN npm install

COPY tsconfig.json ./
COPY src ./src

RUN npm run build

CMD ["echo", "This is a library container, not meant to be run directly"] 