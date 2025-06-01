import Fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import path from 'path';
import { fileURLToPath } from 'url';
import { transNetworkSettings } from 'transcendence';
import logger from './lib/logger.js';
import { setupMetrics } from './lib/metrics.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fastify = Fastify({ logger: true });
const distFrontendPath = path.join(__dirname, '../distFrontend');
console.log(distFrontendPath);
setupMetrics(fastify);
logger.info("Metrics and logger initialized.");
//keep commented out unless docker is running requires elsasticsearch to be running
// await checkElasticsearch();
// Health check endpoint for Docker
fastify.get('/health', async (request, reply) => {
    return { status: 'ok', timestamp: new Date().toISOString() };
});
fastify.register(fastifyStatic, {
    root: distFrontendPath,
    prefix: '/', // Serve static files at root
    wildcard: false // Only match actual files
});
// Handle unknown routes by serving index.html (SPA fallback)
fastify.setNotFoundHandler((req, reply) => {
    if (req.raw.method === 'GET' && req.headers.accept?.includes('text/html')) {
        return reply.sendFile('index.html');
    }
    reply.code(404).send({ error: 'Not Found' });
});
fastify.listen({
    port: transNetworkSettings.webserver.port,
    host: transNetworkSettings.webserver.ip // Allow connections from any IP address, needed for Docker
}, (err, address) => {
    if (err)
        throw err;
    console.log(`🌐 Frontend server listening at ${address}`);
});
