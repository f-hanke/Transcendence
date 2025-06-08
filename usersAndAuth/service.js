import fastify from "fastify";
import cors from "@fastify/cors";
import fs from "fs";
import amqp from "amqplib";
import sharp from "sharp";
import fastifyJwt from "@fastify/jwt";
import { validators } from "./utils/validators.js";
import { passwordUtils } from "./utils/password.js";
import { config } from "./config/config.js";
import { User } from "./orm/user.js";
import { GameResultModel } from "./orm/gameResultModel.js";
import { startConsumer } from "./rabbitMQ/rabbitMQ.js";
import { setupMetrics } from "./lib/metrics.js";
import logger from "./lib/logger.js";
import { checkElasticsearch } from "./lib/elasticsearch.js";
import { AuthErrors, authServiceTypeGuards, rabbitMQTypeGuards, transNetworkSettings, monitoringEnabled, } from "transcendence";
const queue = "auth-service-queue"; // for publishing
async function publishMessage(message) {
    if (!rabbitMQTypeGuards.isUserChangeBody(message))
        logger.error("Trying to publish unknown type");
    let connection;
    try {
        const rabbitUser = process.env.RABBITMQ_DEFAULT_USER || 'admin';
        const rabbitPass = process.env.RABBITMQ_DEFAULT_PASS || 'admin';
        const rabbitHost = process.env.RABBITMQ_HOST || 'rabbitmq-service';
        const connectionString = `amqp://${rabbitUser}:${rabbitPass}@${rabbitHost}:5672`;
        connection = await amqp.connect(connectionString);
        logger.info(`Connected to RabbitMQ at ${connectionString.replace(rabbitPass, '[REDACTED]')}`);
    }
    catch (err) {
        logger.warn("Failed to connect to rabbitmq-service, trying localhost...");
        connection = await amqp.connect("amqp://localhost");
    }
    const channel = await connection.createChannel();
    await channel.assertQueue(queue, { durable: true });
    channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
    logger.info("[Publisher] Sent:", message);
}
startConsumer().catch(logger.error);
const server = fastify({
    logger: {
        transport: {
            target: "pino-pretty",
            options: {
                translateTime: "HH:MM:ss Z",
                ignore: "pid,hostname",
            },
        },
    },
});
if (monitoringEnabled) {
    setupMetrics(server);
    //keep commented out unless docker is running requires elsasticsearch to be running
    await checkElasticsearch();
    logger.info("Metrics and logger initialized.");
}
server.register(fastifyJwt, {
    secret: "supersecret",
});
server.register(cors, { origin: "*" });
server.get("/ping", async (request, reply) => {
    // the more "automatic" way of fastify handling the entire response
    return "pong\n";
});
// Health check endpoint for Docker
server.get("/health", async (request, reply) => {
    return { status: "ok" };
});
server.get("/playground", async (request, reply) => {
    reply.code(201).send({ success: true });
    // .send() is:
    // - Serializing the body
    // - Writing it to the socket
    // - Ending the HTTP response
});
server.post("/api/auth/register", async (request, reply) => {
    if (!authServiceTypeGuards.isRegSubmissionBody(request.body))
        return reply
            .code(400)
            .send({ reason: AuthErrors.BadBodyFormat });
    if (!validators.isValidEmail(request.body.email))
        return reply.code(400).send({
            reason: AuthErrors.InvalidEmailFormat,
        });
    const passwordError = validators.identifyPasswordError(request.body.password);
    if (passwordError !== null)
        return reply
            .code(400)
            .send({ reason: passwordError });
    try {
        const newUser = (await User.create(request.body));
        const imgBuffer = fs.readFileSync(config.DEFAULT_AVATAR);
        const smallImgBuffer = await sharp(imgBuffer)
            .resize(264, 264, { fit: "inside", withoutEnlargement: true })
            .toBuffer();
        await User.setImage(newUser.id, imgBuffer, smallImgBuffer);
        // // TODO: publish for Flo
        const publication = {
            id: newUser.id,
            displayName: newUser.display_name,
            smallImage: smallImgBuffer,
            language: newUser.language,
        };
        publishMessage(publication).catch(logger.error);
        // HACK: hardcoded publication
        //   const publication: RabbitMQTypes.UserChange = {
        //     id: "13",
        //     displayName: "Florian",
        //     smallImage: smallImgBuffer,
        // }
        // publishMessage(publication).catch(logger.error);
        // return reply.code(201).send({ displayName: newUser.display_name, userId: newUser.id } as RegSuccessResponseBody);
    }
    catch (e) {
        if (e instanceof Error) {
            logger.error(e.message);
            if (e.message.includes("UNIQUE constraint failed: users.display_name"))
                return reply
                    .code(400)
                    .send({ reason: AuthErrors.DuplicateDisplayName });
            else if (e.message.includes("UNIQUE constraint failed: users.email"))
                return reply.code(400).send({ reason: AuthErrors.DuplicateEmail });
            return reply
                .code(500)
                .send({ reason: AuthErrors.BackendError });
        }
        else
            logger.error(e);
    }
});
server.post("/api/auth/login", async (request, reply) => {
    if (!authServiceTypeGuards.isLoginSubmissionBody(request.body))
        return reply
            .code(400)
            .send({ reason: AuthErrors.BadBodyFormat });
    try {
        const user = (await User.findByEmail(request.body.email));
        if (!user)
            return reply
                .code(400)
                .send({ reason: AuthErrors.UnknownEmail });
        logger.info(user);
        const isPasswordValid = await passwordUtils.comparePassword(request.body.password, user.pw_hash);
        if (!isPasswordValid)
            return reply.code(400).send({
                reason: AuthErrors.InvalidPassword,
            });
        const token = server.jwt.sign({ userId: user.id }, { expiresIn: "60m" });
        await User.updateOnlineStatus(user.id, 1);
        await User.incrementLoginCount(user.id);
        return reply.code(201).send({
            clientId: user.id,
            jwtToken: token,
        });
    }
    catch (db_error) {
        logger.error(db_error);
        return reply
            .code(500)
            .send({ reason: AuthErrors.BackendError });
    }
});
// Authorization: Bearer <token_without_quotes>
server.get("/api/auth/verify-jwt", async (request, reply) => {
    try {
        if (!request.headers.authorization)
            return reply.code(401).send({
                reason: AuthErrors.LackingAuthorizationHeader,
            });
        const token = request.headers.authorization.split(" ")[1];
        const decoded = (await server.jwt.verify(token));
        reply
            .code(200)
            .header("content-security-policy", "default-src 'self'; script-src 'self'; object-src 'none'; base-uri 'self';")
            .send({ userId: decoded.userId });
    }
    catch (error) {
        logger.error(error);
        reply
            .code(401)
            .send({ reason: AuthErrors.Unauthorized });
    }
});
server.get("/api/auth/refresh", async (request, reply) => {
    if (!request.headers.authorization)
        return reply.code(401).send({
            reason: AuthErrors.LackingAuthorizationHeader,
        });
    try {
        const oldToken = request.headers.authorization.split(" ")[1];
        const decoded = (await server.jwt.verify(oldToken));
        const newToken = server.jwt.sign({ userId: decoded.userId }, { expiresIn: "30s" });
        return reply.code(200).send({
            clientId: decoded.userId,
            jwtToken: newToken,
        });
    }
    catch (error) {
        logger.error(error);
        reply
            .code(401)
            .send({ reason: AuthErrors.Unauthorized });
    }
});
server.get("/api/auth/logout/:inputUserId", async (request, reply) => {
    const { inputUserId } = request.params;
    if (!inputUserId)
        return reply.code(400).send({
            reason: AuthErrors.LackingIdParamInUri,
        });
    try {
        const user = (await User.findById(inputUserId));
        if (user === null)
            return reply
                .code(400)
                .send({ reason: AuthErrors.UnknownUserId });
        if (user.online_status == 0)
            throw new Error("User is already offline, meaning you're unauthorized to log out");
        await User.updateOnlineStatus(user.id, 0);
        return reply.code(200).send({});
    }
    catch (error) {
        logger.error(error);
        return reply
            .code(500)
            .send({ reason: AuthErrors.BackendError });
    }
});
server.get("/api/users/:inputUserId", async (request, reply) => {
    // location found when no inputUserId, but findById() correctly returns null for empty string input
    const { inputUserId } = request.params;
    if (!inputUserId)
        return reply.code(400).send({
            reason: AuthErrors.LackingIdParamInUri,
        });
    try {
        const user = (await User.findById(inputUserId));
        if (user === null)
            return reply
                .code(400)
                .send({ reason: AuthErrors.UnknownUserId });
        return reply.code(200).send(user);
    }
    catch (error) {
        logger.error(error);
        reply
            .code(500)
            .send({ reason: AuthErrors.BackendError });
    }
});
server.post("/api/users/getusernames", async (request, reply) => {
    if (!Array.isArray(request.body) ||
        request.body.length === 0 ||
        request.body.length > 200)
        return reply
            .code(400)
            .send({ reason: AuthErrors.BadBodyFormat });
    try {
        const usersMap = {};
        const usersList = (await User.findByIds(request.body));
        for (const user of usersList) {
            usersMap[user.id] = user.display_name;
        }
        for (const userId of request.body) {
            if (!usersMap[userId])
                usersMap[userId] = null;
        }
        return reply.code(200).send(usersMap);
    }
    catch (error) {
        logger.error(error);
        reply
            .code(500)
            .send({ reason: AuthErrors.BackendError });
    }
});
server.get("/api/users/alluseridsmappedtodisplaynames", async (request, reply) => {
    try {
        const users = (await User.findAll());
        const usersMap = {};
        for (const user of users) {
            usersMap[user.id] = user.display_name;
        }
        return reply.code(200).send(usersMap);
    }
    catch (error) {
        logger.error(error);
        reply
            .code(500)
            .send({ reason: AuthErrors.BackendError });
    }
});
server.post("/api/users/updatepassword/:inputUserId", async (request, reply) => {
    const { inputUserId } = request.params;
    if (!inputUserId)
        return reply.code(400).send({
            reason: AuthErrors.LackingIdParamInUri,
        });
    try {
        const passwordError = validators.identifyPasswordError(request.body.password);
        if (passwordError !== null)
            return reply
                .code(400)
                .send({ reason: passwordError });
        if (await User.setPassword(inputUserId, request.body.password))
            return reply.code(201).send();
        return reply
            .code(400)
            .send({ reason: AuthErrors.UnknownUserId });
    }
    catch (e) {
        logger.error(e);
        return reply.code(500).send({ reason: AuthErrors.BackendError });
    }
});
server.post("/api/users/updateemail/:inputUserId", async (request, reply) => {
    const { inputUserId } = request.params;
    if (!inputUserId)
        return reply.code(400).send({
            reason: AuthErrors.LackingIdParamInUri,
        });
    if (!authServiceTypeGuards.isUpdateEmailBody(request.body))
        return reply
            .code(400)
            .send({ reason: AuthErrors.BadBodyFormat });
    try {
        if (!validators.isValidEmail(request.body.email))
            return reply.code(400).send({
                reason: AuthErrors.InvalidEmailFormat,
            });
        if (await User.setEmail(inputUserId, request.body.email))
            return reply.code(201).send();
        return reply
            .code(400)
            .send({ reason: AuthErrors.UnknownUserId });
    }
    catch (e) {
        if (e instanceof Error) {
            logger.error(e.message);
            if (e.message.includes("UNIQUE constraint failed: users.email"))
                return reply.code(400).send({ reason: AuthErrors.DuplicateEmail });
            return reply.code(500).send({ reason: AuthErrors.BackendError });
        }
        else
            logger.error(e);
    }
});
server.post("/api/users/updatedisplayname/:inputUserId", async (request, reply) => {
    const { inputUserId } = request.params;
    if (!inputUserId)
        return reply.code(400).send({
            reason: AuthErrors.LackingIdParamInUri,
        });
    if (!authServiceTypeGuards.isUpdateDisplayNameBody(request.body))
        return reply
            .code(400)
            .send({ reason: AuthErrors.BadBodyFormat });
    try {
        const updatedUser = (await User.setDisplayName(inputUserId, request.body.displayName));
        if (updatedUser === null)
            return reply
                .code(500)
                .send({ reason: AuthErrors.BackendError });
        const publication = {
            id: updatedUser.id,
            displayName: updatedUser.display_name,
            smallImage: null,
            language: null,
        };
        publishMessage(publication).catch(logger.error);
        return reply.code(201).send(updatedUser);
    }
    catch (e) {
        if (e instanceof Error) {
            logger.error(e.message);
            if (e.message.includes("UNIQUE constraint failed: users.display_name"))
                return reply
                    .code(400)
                    .send({ reason: AuthErrors.DuplicateDisplayName });
            return reply
                .code(500)
                .send({ reason: AuthErrors.BackendError });
        }
        else
            logger.error(e);
    }
});
server.post("/api/users/updateimage/:inputUserId", async (request, reply) => {
    const { inputUserId } = request.params;
    if (!inputUserId)
        return reply.code(400).send({
            reason: AuthErrors.LackingIdParamInUri,
        });
    if (!authServiceTypeGuards.isUpdateImageBody(request.body))
        return reply
            .code(400)
            .send({ reason: AuthErrors.BadBodyFormat });
    try {
        const { image } = request.body;
        const nodeJsImageBuffer = Buffer.from(image.data);
        const smallImgBuffer = await sharp(nodeJsImageBuffer)
            .resize(264, 264, { fit: "inside", withoutEnlargement: true })
            .toBuffer();
        const updatedUser = (await User.setImage(inputUserId, nodeJsImageBuffer, smallImgBuffer));
        if (updatedUser === null)
            return reply
                .code(500)
                .send({ reason: AuthErrors.BackendError });
        // TODO: publish for Flo
        const publication = {
            id: updatedUser.id,
            displayName: null,
            smallImage: smallImgBuffer,
            language: null,
        };
        publishMessage(publication).catch(logger.error);
        return reply.code(201).send(updatedUser);
    }
    catch (e) {
        if (e instanceof Error) {
            logger.error(e.message);
            if (e.message.includes("UNIQUE constraint failed: users.display_name"))
                return reply
                    .code(400)
                    .send({ reason: AuthErrors.DuplicateDisplayName });
            return reply
                .code(500)
                .send({ reason: AuthErrors.BackendError });
        }
        else
            logger.error(e);
    }
});
server.post("/api/users/updatelanguage/:inputUserId", async (request, reply) => {
    const { inputUserId } = request.params;
    if (!inputUserId)
        return reply.code(400).send({
            reason: AuthErrors.LackingIdParamInUri,
        });
    if (!authServiceTypeGuards.isUpdateLanguageBody(request.body))
        return reply
            .code(400)
            .send({ reason: AuthErrors.BadBodyFormat });
    try {
        const updatedUser = (await User.setLanguage(inputUserId, request.body.language));
        if (updatedUser === null)
            return reply
                .code(500)
                .send({ reason: AuthErrors.BackendError });
        const publication = {
            id: updatedUser.id,
            displayName: null,
            smallImage: null,
            language: updatedUser.language,
        };
        publishMessage(publication).catch(logger.error);
        return reply.code(201).send(updatedUser);
    }
    catch (e) {
        if (e instanceof Error) {
            logger.error(e.message);
            if (e.message.includes("UNIQUE constraint failed: users.display_name"))
                return reply
                    .code(400)
                    .send({ reason: AuthErrors.DuplicateDisplayName });
            return reply
                .code(500)
                .send({ reason: AuthErrors.BackendError });
        }
        else
            logger.error(e);
    }
});
server.get("/api/users/delete/:inputUserId", async (request, reply) => {
    const { inputUserId } = request.params;
    if (!inputUserId)
        return reply.code(400).send({
            reason: AuthErrors.LackingIdParamInUri,
        });
    try {
        if (await User.delete(inputUserId))
            return reply.code(204).send();
        return reply
            .code(400)
            .send({ reason: AuthErrors.UnknownUserId });
    }
    catch (e) {
        if (e instanceof Error) {
            logger.error(e.message);
            return reply.code(500).send({ reason: AuthErrors.BackendError });
        }
        else
            logger.error(e);
    }
});
// The two below can be modified to return objects as Steffen wants or needs them
server.get("/api/users/:inputUserId/matches", async (request, reply) => {
    const { inputUserId } = request.params;
    if (!inputUserId)
        return reply.code(400).send({
            reason: AuthErrors.LackingIdParamInUri,
        });
    try {
        const matches = (await GameResultModel.fetchUserMatches(inputUserId));
        return reply.code(200).send(matches);
    }
    catch (e) {
        logger.error(e);
        return reply.code(500).send({ reason: AuthErrors.BackendError });
    }
});
server.get("/api/users/:inputUserId/tournaments", async (request, reply) => {
    const { inputUserId } = request.params;
    if (!inputUserId)
        return reply.code(400).send({
            reason: AuthErrors.LackingIdParamInUri,
        });
    try {
        const tournaments = (await GameResultModel.fetchUserTournaments(inputUserId));
        return reply.code(200).send(tournaments);
    }
    catch (e) {
        logger.error(e);
        return reply.code(500).send({ reason: AuthErrors.BackendError });
    }
});
server.setNotFoundHandler((req, res) => {
    res.code(404).send({ route: req.url, method: req.method });
});

// Sync all users to chat service - useful after chat service restarts
server.post("/api/admin/sync-users", async (request, reply) => {
    try {
        const allUsers = await User.findAll();
        logger.info(`Syncing ${allUsers.length} users to chat service...`);
        
        for (const user of allUsers) {
            const publication = {
                id: user.id,
                displayName: user.display_name,
                smallImage: user.small_image,
                language: user.language,
            };
            await publishMessage(publication);
        }
        
        return reply.code(200).send({ 
            message: `Successfully synced ${allUsers.length} users to chat service`,
            userCount: allUsers.length 
        });
    } catch (e) {
        logger.error("Failed to sync users:", e);
        return reply.code(500).send({ reason: AuthErrors.BackendError });
    }
});

server.listen({
    port: transNetworkSettings.authService.port,
    host: transNetworkSettings.authService.ip,
}, (err, address) => {
    if (err) {
        logger.error(err);
        process.exit(1);
    }
    logger.info(`Server listening at ${address}`);
});
