import Fastify from 'fastify';
import fastifyHttpProxy from '@fastify/http-proxy';
import websocketPlugin from '@fastify/websocket';
import fastifyStatic from '@fastify/static';
import fs from 'fs';
import cors from '@fastify/cors';
import path from 'path';
import httpProxy from 'http-proxy';
import { fileURLToPath } from 'url';

import http from "http";

import { FastifyRequest, FastifyReply } from 'fastify';
import jwt from 'jsonwebtoken';
import chalk from 'chalk';
import { AuthErrors, AuthServiceTypes, transNetworkSettings } from 'transcendence';
import fastifyJwt from '@fastify/jwt'

import esClient, { checkElasticsearch } from './lib/elasticsearch.js';
import logger from './lib/logger.js';
import { setupMetrics } from './lib/metrics.js';
import { enableJwtCheck } from './authChecks.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use different paths for development and production
const certPath = process.env.NODE_ENV === 'production'
  ? path.join(__dirname, 'certs')  // Production: looking in 'dist/certs'
  : path.join(__dirname, '..', 'certs');  // Development: looking in 'src/certs' (or wherever the certs are)

const { createProxyServer } = httpProxy;

const fastify = Fastify({
  logger: true,
  https: {
    key: fs.readFileSync(path.join(certPath, 'key.pem')),
    cert: fs.readFileSync(path.join(certPath, 'cert.pem')),
  },
});

fastify.register(fastifyJwt, {
  secret: 'supersecret'
})


setupMetrics(fastify);
logger.info("Metrics and logger initialized.");
//keep commented out unless docker is running requires elsasticsearch to be running
await checkElasticsearch();


enableJwtCheck(fastify);

// Add health check endpoint for Docker
fastify.get('/health', async () => {
  return { status: 'ok' };
});

fastify.addHook('onRequest', async (request, reply) => {
  console.log("\n");
  console.log(chalk.green('GATEWAY RECEIVED REQUEST!'));
  console.log(chalk.blue(`[${new Date().toISOString()}] ${request.method} ${request.url} from ${request.ip}`));
  console.log("\n");
});

// 🔁 Microservice Proxies (with prefix stripping)
fastify.register(fastifyHttpProxy, {
  upstream: 'http://users-auth:10004',
  prefix: '/AUTHENTICATION',
  rewritePrefix: '', // removes /auth before forwarding
});

fastify.register(fastifyHttpProxy, {
  upstream: 'http://webserver:10005',
  prefix: '/',
  rewritePrefix: '/',
});

// Remote/Matchmaking service proxy
fastify.register(fastifyHttpProxy, {
  upstream: 'http://remote-matchmaking:10002',
  prefix: '/MM',
  rewritePrefix: '', // removes /MM before forwarding
});

// Game service proxy
fastify.register(fastifyHttpProxy, {
  upstream: 'http://game-service:10003',
  prefix: '/GAMESERVICE',
  rewritePrefix: '', // removes /GAMESERVICE before forwarding
});

// Chat service proxy
fastify.register(fastifyHttpProxy, {
  upstream: 'http://chat-service:10001',
  prefix: '/CHATSERVICE',
  rewritePrefix: '', // removes /CHATSERVICE before forwarding
});

// 🔁 Game Microservices Proxies
// Comment these out since we refactored the TransNetworkSettings
// fastify.register(fastifyHttpProxy, {
//   upstream: `http://localhost:${transNetworkSettings.matchmakingService.port}`,
//   prefix: '/MM',
//   rewritePrefix: '', // removes /matchmaking before forwarding
// });

// fastify.register(fastifyHttpProxy, {
//   upstream: `http://localhost:${transNetworkSettings.chatService.port}`,
//   prefix: '/CHAT',
//   rewritePrefix: '', // removes /chat before forwarding
// });

// fastify.register(fastifyHttpProxy, {
//   upstream: `http://localhost:${transNetworkSettings.gameService.port}`,
//   prefix: '/GAME',
//   rewritePrefix: '', // removes /game before forwarding
// });


// 🔁 WebSocket proxying
const wsProxy = createProxyServer({ ws: true });

fastify.server.on('upgrade', (req, socket, head) => {
  const url = req.url || '';
  let target = '';

  console.log("\n");
  console.log(chalk.yellow('INSIDE UPGRADE ROUTE!'));
  console.log("\n");

  if (url.startsWith('/CHATSERVICE')) target = `ws://chat-service:10001`;
  else if (url.startsWith('/GAMESERVICE')) target = `ws://game-service:10003`;
  else if (url.startsWith('/MATCHMAKING')) target = 'ws://remote-matchmaking:10002';
  else {
    socket.destroy();
    return;
  }

  // Optional: Strip prefix if backend expects it
  req.url = url.replace(/^\/(CHATSERVICE|GAMESERVICE|MATCHMAKING)/, '');

  wsProxy.ws(req, socket, head, { target });
});


// according to ChatGPT, shortest possible JWT is 27 characters
// Authorization: Bearer <token_without_quotes>
fastify.get<{
  Headers: {'authorization': string};
}>('/api/auth/verify-jwt', async (request, reply) => {
  try {
    if (!request.headers.authorization)
      return reply.code(400).send({ reason: AuthErrors.LackingAuthorizationHeader } satisfies AuthServiceTypes.ErrorResponseBody);
    const token = request.headers.authorization.split(' ')[1];
    if(token.length < 27)
      reply.code(401).send({ reason: AuthErrors.Unauthorized } satisfies AuthServiceTypes.ErrorResponseBody);
    const decoded = await fastify.jwt.verify(token) as AuthServiceTypes.JwtType;
    reply.code(200).send({ userId: decoded.userId });
  } catch (error) {
    console.error(error);
    reply.code(401).send({ reason: AuthErrors.Unauthorized } satisfies AuthServiceTypes.ErrorResponseBody);
  }
});

// Special endpoint for the webserver to get the connection info it
// needs to provide to clients.
fastify.get('/connectioninfo', async (request, reply) => {
  const result = {
    chat: {
      ip: 'chat-service', // Container name
      port: 10001 // From transNetworkSettings
    },
    game: {
      ip: 'game-service', // Container name
      port: 10003 // From transNetworkSettings
    },
    mm: {
      ip: 'remote-matchmaking', // Container name
      port: 10002 // From transNetworkSettings
    }
  };
  return result;
});

fastify.listen({
  port: transNetworkSettings.apiGateway.port,
  host: transNetworkSettings.apiGateway.ip
  }, (err, address) => {
  if (err) throw err;
  console.log(`✅ Gateway listening securely at ${address}`);
});

