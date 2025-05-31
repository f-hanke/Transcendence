import client from 'prom-client';
client.collectDefaultMetrics();
const httpRequestCounter = new client.Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code'],
});
export function setupMetrics(app) {
    app.addHook('onResponse', async (request, reply) => {
        httpRequestCounter.inc({
            method: request.method,
            route: request.url,
            status_code: reply.statusCode,
        });
    });
    app.get('/metrics', async (request, reply) => {
        reply.header('Content-Type', client.register.contentType);
        reply.send(await client.register.metrics());
    });
}
