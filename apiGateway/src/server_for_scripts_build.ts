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
import {  enableJwtCheck } from './authChecks.js';

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

enableJwtCheck(fastify);

fastify.addHook('onRequest', async (request, reply) => {
  console.log("\n");
  console.log(chalk.green('GATEWAY RECEIVED REQUEST!'));
  console.log(chalk.blue(`[${new Date().toISOString()}] ${request.method} ${request.url} from ${request.ip}`));
  console.log("\n");
});

// 🔁 Microservice Proxies (with prefix stripping)
fastify.register(fastifyHttpProxy, {
  upstream: `http://localhost:${transNetworkSettings.authService.port}`,
  prefix: '/AUTHENTICATION',
  rewritePrefix: '', // removes /auth before forwarding
});

fastify.register(fastifyHttpProxy, {
  upstream: `http://localhost:${transNetworkSettings.gameMatchmaking.port}`,
  prefix: '/MATCHMAKING',
  rewritePrefix: '',
});

fastify.register(fastifyHttpProxy, {
  upstream: `http://localhost:${transNetworkSettings.chatService.port}`,
  prefix: '/CHATSERVICE',
  rewritePrefix: '',
});

fastify.register(fastifyHttpProxy, {
  upstream: `http://localhost:${transNetworkSettings.gamePlay.port}`,
  prefix: '/GAMESERVICE',
  rewritePrefix: '',
});

fastify.register(fastifyHttpProxy, {
  upstream: `http://localhost:${transNetworkSettings.webserver.port}`,
  prefix: '/',
  rewritePrefix: '/',
  // httpMethods: ['GET', 'POST', 'PUT', 'DELETE'],
});


// 🔁 WebSocket proxying
const wsProxy = createProxyServer({ ws: true });

fastify.server.on('upgrade', (req, socket, head) => {
  const url = req.url || '';
  let target = '';

  console.log("\n");
  console.log(chalk.yellow('INSIDE UPGRADE ROUTE!'));
  // console.log(chalk.red(`[${new Date().toISOString()}] ${request.method} ${request.url} from ${request.ip}`));
  console.log("\n");

  if (url.startsWith('/CHATSERVICE')) target = `ws://localhost:${transNetworkSettings.chatService.port}`;
  else if (url.startsWith('/GAMESERVICE')) target = `ws://localhost:${transNetworkSettings.gamePlay.port}`;
  else if (url.startsWith('/MATCHMAKING')) target = `ws://localhost:${transNetworkSettings.gameMatchmaking.port}`;
  else {
    ;
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

fastify.listen({
  port: transNetworkSettings.apiGateway.port,
  host: transNetworkSettings.apiGateway.ip
  }, (err, address) => {
  if (err) throw err;
  console.log(`✅ Gateway listening securely at ${address}`);
});

