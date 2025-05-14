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

// fastify.register(cors, { origin: "*" });

// await fastify.register(websocketPlugin);

async function authMiddleware(request: FastifyRequest, reply: FastifyReply) {
  try {
    const authHeader = request.headers.authorization;
    if (!authHeader) throw new Error('No token');

    const token = authHeader.split(' ')[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET!);

    (request as any).user = payload;
  } catch (err) {
    reply.code(401).send({ error: 'Unauthorized' });
  }
}

// // 🔐 JWT auth middleware (skip for static + auth)
// fastify.addHook('onRequest', async (req, reply) => {
//   const skipAuth = req.raw.url?.startsWith('/auth') || req.raw.url?.match(/\.(js|css|html|png)$/);
//   if (!skipAuth) {
//     await authMiddleware(req, reply);
//   }
// });

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

// >>>>>> for local testing only
// fastify.setNotFoundHandler((req, reply) => {
//   // Proxy all unmatched GET requests to Vite
//   if (req.raw.method === 'GET') {
//     const proxyReq = http.request(
//       {
//         hostname: 'localhost',
//         port: 9999,
//         path: req.raw.url,
//         method: req.raw.method,
//         headers: req.headers,
//       },
//       res => {
//         reply.status(res.statusCode!);
//         res.pipe(reply.raw);
//       }
//     );
//     req.raw.pipe(proxyReq);
//   } else {
//     reply.status(404).send({ error: 'Not found' });
//   }
// });
// <<<<<< for local testing only



// 🔁 WebSocket proxying
// Comment out for now since we refactored the TransNetworkSettings
// const wsProxy = createProxyServer({ ws: true });

// fastify.server.on('upgrade', (req, socket, head) => {
//   const url = req.url || '';
//   let target = '';

//   console.log("\n");
//   console.log(chalk.yellow('INSIDE UPGRADE ROUTE!'));
//   console.log("\n");

//   if (url.startsWith('/CHATSERVICE')) target = `ws://localhost:${transNetworkSettings.chatService.port}`;
//   else if (url.startsWith('/GAMESERVICE')) target = `ws://localhost:${transNetworkSettings.gameService.port}`;
//   else if (url.startsWith('/MATCHMAKING')) target = `ws://localhost:${transNetworkSettings.matchmakingService.port}`;
//   else {
//     socket.destroy();
//     return;
//   }

//   // Optional: Strip prefix if backend expects it
//   req.url = url.replace(/^\/(CHATSERVICE|GAMESERVICE|MATCHMAKING)/, '');

//   wsProxy.ws(req, socket, head, { target });
// });


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
// Comment out for now since we refactored the TransNetworkSettings
// get('/connectioninfo', async (request, reply) => {
//   const result = {
//     chat: {
//       ip: transNetworkSettings.chatService.ip,
//       port: transNetworkSettings.chatService.port
//     },
//     game: {
//       ip: transNetworkSettings.gameService.ip,
//       port: transNetworkSettings.gameService.port
//     },
//     mm: {
//       ip: transNetworkSettings.matchmakingService.ip,
//       port: transNetworkSettings.matchmakingService.port
//     }
//   };
//   return result;
// });

fastify.listen({
  port: transNetworkSettings.apiGateway.port,
  host: transNetworkSettings.apiGateway.ip
  }, (err, address) => {
  if (err) throw err;
  console.log(`✅ Gateway listening securely at ${address}`);
});

