"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const validators = require('./utils/validators');
const passwordUtils = require('./utils/password');
const cors = require('@fastify/cors');
const RegSubmissionBodySchema = require('./schemas/schemas');
const LoginSubmissionBodySchema = require('./schemas/schemas');
const User = require('./orm/user');
const Match = require('./orm/match');
const authTypesCopy_1 = require("./authTypesCopy");
const transcendence_1 = require("transcendence");
const server = (0, fastify_1.default)({
    logger: {
        transport: {
            target: 'pino-pretty',
            options: {
                translateTime: 'HH:MM:ss Z',
                ignore: 'pid,hostname',
            },
        },
    },
});
server.register(require('@fastify/jwt'), {
    secret: 'supersecret'
});
server.register(cors, { origin: "*" });
server.get('/ping', async (request, reply) => {
    // the more "automatic" way of fastify handling the entire response
    return 'pong\n';
});
server.get('/playground', async (request, reply) => {
    reply.code(201).send({ success: true });
    // .send() is:
    // - Serializing the body
    // - Writing it to the socket
    // - Ending the HTTP response
});
server.post('/api/auth/register', { schema: RegSubmissionBodySchema }, async (request, reply) => {
    // schema is evaluated before the code below is ever looked at, so schema-responses are handled as pre-process
    const passwordError = validators.identifyPasswordError(request.body.password);
    if (passwordError !== null)
        return reply.code(400).send({ reason: passwordError });
    try {
        await User.create(request.body);
        return reply.code(201).send();
    }
    catch (e) {
        console.error(e);
        return reply.code(500).send({ reason: authTypesCopy_1.AuthErrors.BackendError });
    }
});
server.post('/api/auth/login', { schema: LoginSubmissionBodySchema }, async (request, reply) => {
    try {
        const user = await User.findByEmail(request.body.email);
        if (!user)
            return reply.code(400).send({ reason: authTypesCopy_1.AuthErrors.UnknownEmail });
        console.log(user);
        const isPasswordValid = await passwordUtils.comparePassword(request.body.password, user.pw_hash);
        if (!isPasswordValid)
            return reply.code(400).send({ reason: authTypesCopy_1.AuthErrors.InvalidPassword });
        const token = server.jwt.sign({ userId: user.id, expiresIn: '12h' });
        User.updateOnlineStatus(user.id, 1);
        User.incrementLoginCount(user.id);
        return reply.send({ clientId: user.id, jwtToken: token });
    }
    catch (db_error) {
        console.error(db_error);
        return reply.code(500).send({ reason: authTypesCopy_1.AuthErrors.BackendError });
    }
});
// Authorization: Bearer <token_without_quotes>
server.get('/api/auth/verify-jwt', async (request, reply) => {
    try {
        if (!request.headers.authorization)
            return reply.code(400).send({ reason: authTypesCopy_1.AuthErrors.LackingAuthorizationHeader });
        const token = request.headers.authorization.split(' ')[1];
        const decoded = await server.jwt.verify(token);
        reply.code(200).send({ userId: decoded.userId });
    }
    catch (error) {
        console.error(error);
        reply.code(401).send({ reason: authTypesCopy_1.AuthErrors.Unauthorized });
    }
});
server.setNotFoundHandler((req, res) => {
    res.code(404).send({ route: req.url, method: req.method });
});
server.listen({
    port: transcendence_1.transNetworkSettings.authService.port,
    host: transcendence_1.transNetworkSettings.authService.ip
}, (err, address) => {
    console.log(address);
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log(`Server listening at ${address}`);
});
