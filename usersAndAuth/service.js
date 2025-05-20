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
import { AuthErrors, authServiceTypeGuards, rabbitMQTypeGuards, transNetworkSettings, } from "transcendence";
const queue = "auth-ChatService"; // for publishing
async function publishMessage(message) {
    if (!rabbitMQTypeGuards.isUserChangeBody(message))
        console.error("Trying to publish unknown type");
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
<<<<<<< HEAD
<<<<<<< HEAD
=======
=======
<<<<<<< HEAD
>>>>>>> origin/main
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
    const connection = await amqp.connect(`amqp://${process.env.RABBITMQ_HOST || 'localhost'}`);
=======
<<<<<<< HEAD
=======
>>>>>>> 16b64d1 (cleanup after rebase)
>>>>>>> origin/main
>>>>>>> origin/main
<<<<<<< HEAD
=======
>>>>>>> 52a4f32ea79ef32a3638ebd7634672b27a9cb1c1
>>>>>>> origin/main
>>>>>>> origin/main
>>>>>>> origin/main
    // const connection = await amqp.connect(`amqp://admin:admin@rabbitmq-service:5672`);
    // const connection = await amqp.connect(`amqp://localhost`);
    let connection;
    try {
        connection = await amqp.connect("amqp://admin:admin@rabbitmq-service:5672");
    }
    catch (err) {
        console.warn("Failed to connect to rabbitmq-service, trying localhost...");
        connection = await amqp.connect("amqp://localhost");
    }
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
=======
        connection = await amqp.connect('amqp://admin:admin@rabbitmq-service:5672');
    }
    catch (err) {
        console.warn('Failed to connect to rabbitmq-service, trying localhost...');
        connection = await amqp.connect('amqp://localhost');
    }
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
    const connection = await amqp.connect(`amqp://${process.env.RABBITMQ_HOST || 'localhost'}`);
>>>>>>> f85dc2c (chore(remote): shovel it carefully onto new main)
>>>>>>> c8ff778 (chore(remote): shovel it carefully onto new main)
=======
    const connection = await amqp.connect(`amqp://${process.env.RABBITMQ_HOST || 'localhost'}`);
>>>>>>> 1053fd9 (set up test environment)
=======
    const connection = await amqp.connect(`amqp://${process.env.RABBITMQ_HOST || 'localhost'}`);
>>>>>>> f85dc2c (chore(remote): shovel it carefully onto new main)
=======
>>>>>>> 16b64d1 (cleanup after rebase)
>>>>>>> origin/main
>>>>>>> origin/main
<<<<<<< HEAD
=======
>>>>>>> 52a4f32ea79ef32a3638ebd7634672b27a9cb1c1
>>>>>>> origin/main
>>>>>>> origin/main
>>>>>>> origin/main
    const channel = await connection.createChannel();
    await channel.assertQueue(queue, { durable: false });
    channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
    console.log("[Publisher] Sent:", message);
}
startConsumer().catch(console.error);
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
        return reply
            .code(400)
            .send({
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
        };
        publishMessage(publication).catch(console.error);
        // HACK: hardcoded publication
        //   const publication: RabbitMQTypes.UserChange = {
        //     id: "13",
        //     displayName: "Florian",
        //     smallImage: smallImgBuffer,
        // }
        // publishMessage(publication).catch(console.error);
        // return reply.code(201).send({ displayName: newUser.display_name, userId: newUser.id } as RegSuccessResponseBody);
    }
    catch (e) {
        if (e instanceof Error) {
            console.error(e.message);
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
            console.error(e);
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
        console.log(user);
        const isPasswordValid = await passwordUtils.comparePassword(request.body.password, user.pw_hash);
        if (!isPasswordValid)
            return reply
                .code(400)
                .send({
                reason: AuthErrors.InvalidPassword,
            });
        const token = server.jwt.sign({ userId: user.id }, { expiresIn: "60m" });
        await User.updateOnlineStatus(user.id, 1);
        await User.incrementLoginCount(user.id);
        return reply
            .code(201)
            .send({
            clientId: user.id,
            jwtToken: token,
        });
    }
    catch (db_error) {
        console.error(db_error);
        return reply
            .code(500)
            .send({ reason: AuthErrors.BackendError });
    }
});
// Authorization: Bearer <token_without_quotes>
server.get("/api/auth/verify-jwt", async (request, reply) => {
    try {
        if (!request.headers.authorization)
            return reply
                .code(401)
                .send({
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
        console.error(error);
        reply
            .code(401)
            .send({ reason: AuthErrors.Unauthorized });
    }
});
server.get("/api/auth/refresh", async (request, reply) => {
    if (!request.headers.authorization)
        return reply
            .code(401)
            .send({
            reason: AuthErrors.LackingAuthorizationHeader,
        });
    try {
        const oldToken = request.headers.authorization.split(" ")[1];
        const decoded = (await server.jwt.verify(oldToken));
        const newToken = server.jwt.sign({ userId: decoded.userId }, { expiresIn: "30s" });
        return reply
            .code(200)
            .send({
            clientId: decoded.userId,
            jwtToken: newToken,
        });
    }
    catch (error) {
        console.error(error);
        reply
            .code(401)
            .send({ reason: AuthErrors.Unauthorized });
    }
});
server.get("/api/auth/logout/:inputUserId", async (request, reply) => {
    const { inputUserId } = request.params;
    if (!inputUserId)
        return reply
            .code(400)
            .send({
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
        console.error(error);
        return reply
            .code(500)
            .send({ reason: AuthErrors.BackendError });
    }
});
server.get("/api/users/:inputUserId", async (request, reply) => {
    // location found when no inputUserId, but findById() correctly returns null for empty string input
    const { inputUserId } = request.params;
    if (!inputUserId)
        return reply
            .code(400)
            .send({
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
        console.error(error);
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
        console.error(error);
        reply
            .code(500)
            .send({ reason: AuthErrors.BackendError });
    }
});
server.post("/api/users/updatepassword/:inputUserId", async (request, reply) => {
    const { inputUserId } = request.params;
    if (!inputUserId)
        return reply
            .code(400)
            .send({
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
        console.error(e);
        return reply.code(500).send({ reason: AuthErrors.BackendError });
    }
});
server.post("/api/users/updateemail/:inputUserId", async (request, reply) => {
    const { inputUserId } = request.params;
    if (!inputUserId)
        return reply
            .code(400)
            .send({
            reason: AuthErrors.LackingIdParamInUri,
        });
    if (!authServiceTypeGuards.isUpdateEmailBody(request.body))
        return reply
            .code(400)
            .send({ reason: AuthErrors.BadBodyFormat });
    try {
        if (!validators.isValidEmail(request.body.email))
            return reply
                .code(400)
                .send({
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
            console.error(e.message);
            if (e.message.includes("UNIQUE constraint failed: users.email"))
                return reply.code(400).send({ reason: AuthErrors.DuplicateEmail });
            return reply.code(500).send({ reason: AuthErrors.BackendError });
        }
        else
            console.error(e);
    }
});
server.post("/api/users/updatedisplayname/:inputUserId", async (request, reply) => {
    const { inputUserId } = request.params;
    if (!inputUserId)
        return reply
            .code(400)
            .send({
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
        return reply.code(201).send(updatedUser);
    }
    catch (e) {
        if (e instanceof Error) {
            console.error(e.message);
            if (e.message.includes("UNIQUE constraint failed: users.display_name"))
                return reply
                    .code(400)
                    .send({ reason: AuthErrors.DuplicateDisplayName });
            return reply
                .code(500)
                .send({ reason: AuthErrors.BackendError });
        }
        else
            console.error(e);
    }
});
server.post("/api/users/updateimage/:inputUserId", async (request, reply) => {
    const { inputUserId } = request.params;
    if (!inputUserId)
        return reply
            .code(400)
            .send({
            reason: AuthErrors.LackingIdParamInUri,
        });
    console.log("HELLO WORLD!");
    console.log(request.body);
    console.log(authServiceTypeGuards.isUpdateImageBody(request.body));
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
        return reply.code(201).send(updatedUser);
    }
    catch (e) {
        if (e instanceof Error) {
            console.error(e.message);
            if (e.message.includes("UNIQUE constraint failed: users.display_name"))
                return reply
                    .code(400)
                    .send({ reason: AuthErrors.DuplicateDisplayName });
            return reply
                .code(500)
                .send({ reason: AuthErrors.BackendError });
        }
        else
            console.error(e);
    }
});
server.get("/api/users/delete/:inputUserId", async (request, reply) => {
    const { inputUserId } = request.params;
    if (!inputUserId)
        return reply
            .code(400)
            .send({
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
            console.error(e.message);
            return reply.code(500).send({ reason: AuthErrors.BackendError });
        }
        else
            console.error(e);
    }
});
// The two below can be modified to return objects as Steffen wants or needs them
server.get("/api/users/:inputUserId/matches", async (request, reply) => {
    const { inputUserId } = request.params;
    if (!inputUserId)
        return reply
            .code(400)
            .send({
            reason: AuthErrors.LackingIdParamInUri,
        });
    try {
        const matches = (await GameResultModel.fetchUserMatches(inputUserId));
        return reply.code(200).send(matches);
    }
    catch (e) {
        console.error(e);
        return reply.code(500).send({ reason: AuthErrors.BackendError });
    }
});
server.get("/api/users/:inputUserId/tournaments", async (request, reply) => {
    const { inputUserId } = request.params;
    if (!inputUserId)
        return reply
            .code(400)
            .send({
            reason: AuthErrors.LackingIdParamInUri,
        });
    try {
        const tournaments = (await GameResultModel.fetchUserTournaments(inputUserId));
        return reply.code(200).send(tournaments);
    }
    catch (e) {
        console.error(e);
        return reply.code(500).send({ reason: AuthErrors.BackendError });
    }
});
server.setNotFoundHandler((req, res) => {
    res.code(404).send({ route: req.url, method: req.method });
});
server.listen({
    port: transNetworkSettings.authService.port,
    host: transNetworkSettings.authService.ip,
}, (err, address) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log(`Server listening at ${address}`);
});
