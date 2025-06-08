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

import {
  AuthServiceTypes,
  GameResultTypes,
  RabbitMQTypes,
  AuthErrors,
  authServiceTypeGuards,
  rabbitMQTypeGuards,
  transNetworkSettings,
  monitoringEnabled,
} from "transcendence";

type JwtType = AuthServiceTypes.JwtType;
type RegSubmissionBody = AuthServiceTypes.RegSubmissionBody;
type LoginSubmissionBody = AuthServiceTypes.LoginSubmissionBody;
type UpdatePasswordBody = AuthServiceTypes.UpdatePasswordBody;
type UpdateEmailBody = AuthServiceTypes.UpdateEmailBody;
type UpdateDisplayNameBody = AuthServiceTypes.UpdateDisplayNameBody;
type UpdateImageBody = AuthServiceTypes.UpdateImageBody;
type UserType = AuthServiceTypes.UserType;
type UserIdsToNamesMapping = AuthServiceTypes.UserIdsToNamesMapping;
type ErrorResponseBody = AuthServiceTypes.ErrorResponseBody;
type AuthSuccessResponseBody = AuthServiceTypes.AuthSuccessResponseBody;
type VerifySuccessResponseBody = AuthServiceTypes.VerifySuccessResponseBody;
type LogoutSuccessResponseBody = AuthServiceTypes.LogoutSuccessResponseBody;
type RegSuccessResponseBody = AuthServiceTypes.RegSuccessResponseBody;
type MatchResult = GameResultTypes.MatchResult;
type TournamentResult = GameResultTypes.TournamentResult;
type UpdateLanguageBody = AuthServiceTypes.UpdateLanguageBody;

const queue = "auth-service-queue"; // for publishing

async function publishMessage(message: RabbitMQTypes.UserChange) {
  if (!rabbitMQTypeGuards.isUserChangeBody(message))
    logger.error("Trying to publish unknown type");
  // const connection = await amqp.connect(`amqp://admin:admin@rabbitmq-service:5672`);
  // const connection = await amqp.connect(`amqp://localhost`);

  let connection;
  try {
    const rabbitUser = process.env.RABBITMQ_DEFAULT_USER || 'admin';
    const rabbitPass = process.env.RABBITMQ_DEFAULT_PASS || 'admin';
    const rabbitHost = process.env.RABBITMQ_HOST || 'rabbitmq-service';
    const connectionString = `amqp://${rabbitUser}:${rabbitPass}@${rabbitHost}:5672`;
    connection = await amqp.connect(connectionString);
    logger.info(`✅ RabbitMQ Publisher connected at ${connectionString.replace(rabbitPass, '[REDACTED]')}`);
  } catch (err) {
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
  secret: process.env.JWT_SECRET || "supersecret",
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

server.get<{
  Body: RegSubmissionBody;
}>("/playground", async (request, reply) => {
  reply.code(201).send({ success: true });
  // .send() is:
  // - Serializing the body
  // - Writing it to the socket
  // - Ending the HTTP response
});

server.post<{
  Body: RegSubmissionBody;
  Reply: {
    201: RegSuccessResponseBody;
    400: ErrorResponseBody;
    500: ErrorResponseBody;
  };
}>("/api/auth/register", async (request, reply) => {
  if (!authServiceTypeGuards.isRegSubmissionBody(request.body))
    return reply
      .code(400)
      .send({ reason: AuthErrors.BadBodyFormat } satisfies ErrorResponseBody);
  if (!validators.isValidEmail(request.body.email))
    return reply.code(400).send({
      reason: AuthErrors.InvalidEmailFormat,
    } satisfies ErrorResponseBody);
  const passwordError = validators.identifyPasswordError(request.body.password);
  if (passwordError !== null)
    return reply
      .code(400)
      .send({ reason: passwordError } satisfies ErrorResponseBody);
  try {
    const newUser = (await User.create(request.body)) as UserType;
    const imgBuffer: Buffer = fs.readFileSync(config.DEFAULT_AVATAR);
    const smallImgBuffer: Buffer = await sharp(imgBuffer)
      .resize(264, 264, { fit: "inside", withoutEnlargement: true })
      .toBuffer();
    await User.setImage(newUser.id, imgBuffer, smallImgBuffer);

    // // TODO: publish for Flo
    const publication: RabbitMQTypes.UserChange = {
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
  } catch (e) {
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
        .send({ reason: AuthErrors.BackendError } satisfies ErrorResponseBody);
    } else logger.error(e);
  }
});

server.post<{
  Body: LoginSubmissionBody;
  Reply: {
    201: AuthSuccessResponseBody;
    400: ErrorResponseBody;
    500: ErrorResponseBody;
  };
}>("/api/auth/login", async (request, reply) => {
  if (!authServiceTypeGuards.isLoginSubmissionBody(request.body))
    return reply
      .code(400)
      .send({ reason: AuthErrors.BadBodyFormat } satisfies ErrorResponseBody);
  try {
    const user = (await User.findByEmail(request.body.email)) as UserType;
    if (!user)
      return reply
        .code(400)
        .send({ reason: AuthErrors.UnknownEmail } satisfies ErrorResponseBody);

    logger.info(user);
    const isPasswordValid = await passwordUtils.comparePassword(
      request.body.password,
      user.pw_hash
    );
    if (!isPasswordValid)
      return reply.code(400).send({
        reason: AuthErrors.InvalidPassword,
      } satisfies ErrorResponseBody);

    const token = server.jwt.sign(
      { userId: user.id } satisfies AuthServiceTypes.JwtType,
      { expiresIn: "60m" }
    );

    await User.updateOnlineStatus(user.id, 1);
    await User.incrementLoginCount(user.id);
    return reply.code(201).send({
      clientId: user.id,
      jwtToken: token,
    } satisfies AuthSuccessResponseBody);
  } catch (db_error) {
    logger.error(db_error);
    return reply
      .code(500)
      .send({ reason: AuthErrors.BackendError } satisfies ErrorResponseBody);
  }
});

// Authorization: Bearer <token_without_quotes>
server.get<{
  Headers: { authorization: string };
}>("/api/auth/verify-jwt", async (request, reply) => {
  try {
    if (!request.headers.authorization)
      return reply.code(401).send({
        reason: AuthErrors.LackingAuthorizationHeader,
      } satisfies ErrorResponseBody);
    const token = request.headers.authorization.split(" ")[1];
    const decoded = (await server.jwt.verify(token)) as JwtType;

    reply
      .code(200)
      .header(
        "content-security-policy",
        "default-src 'self'; script-src 'self'; object-src 'none'; base-uri 'self';"
      )
      .send({ userId: decoded.userId } satisfies VerifySuccessResponseBody);
  } catch (error) {
    logger.error(error);
    reply
      .code(401)
      .send({ reason: AuthErrors.Unauthorized } satisfies ErrorResponseBody);
  }
});

server.get<{
  Headers: { authorization: string };
  Reply: {
    200: AuthSuccessResponseBody;
    401: ErrorResponseBody;
  };
}>("/api/auth/refresh", async (request, reply) => {
  if (!request.headers.authorization)
    return reply.code(401).send({
      reason: AuthErrors.LackingAuthorizationHeader,
    } satisfies ErrorResponseBody);
  try {
    const oldToken = request.headers.authorization.split(" ")[1];
    const decoded = (await server.jwt.verify(oldToken)) as JwtType;

    const newToken = server.jwt.sign(
      { userId: decoded.userId } satisfies JwtType,
      { expiresIn: "30s" }
    );
    return reply.code(200).send({
      clientId: decoded.userId,
      jwtToken: newToken,
    } satisfies AuthSuccessResponseBody);
  } catch (error) {
    logger.error(error);
    reply
      .code(401)
      .send({ reason: AuthErrors.Unauthorized } satisfies ErrorResponseBody);
  }
});

server.get<{
  Headers: { authorization: string };
}>("/api/auth/logout/:inputUserId", async (request, reply) => {
  const { inputUserId } = request.params as { inputUserId: string };
  if (!inputUserId)
    return reply.code(400).send({
      reason: AuthErrors.LackingIdParamInUri,
    } satisfies ErrorResponseBody);

  try {
    const user = (await User.findById(inputUserId)) as UserType;
    if (user === null)
      return reply
        .code(400)
        .send({ reason: AuthErrors.UnknownUserId } satisfies ErrorResponseBody);
    if (user.online_status == 0)
      throw new Error(
        "User is already offline, meaning you're unauthorized to log out"
      );

    await User.updateOnlineStatus(user.id, 0);
    return reply.code(200).send({} satisfies LogoutSuccessResponseBody);
  } catch (error) {
    logger.error(error);
    return reply
      .code(500)
      .send({ reason: AuthErrors.BackendError } satisfies ErrorResponseBody);
  }
});

server.get<{
  Reply: {
    200: UserType;
    400: ErrorResponseBody;
    500: ErrorResponseBody;
  };
}>("/api/users/:inputUserId", async (request, reply) => {
  // location found when no inputUserId, but findById() correctly returns null for empty string input
  const { inputUserId } = request.params as { inputUserId: string };
  if (!inputUserId)
    return reply.code(400).send({
      reason: AuthErrors.LackingIdParamInUri,
    } satisfies ErrorResponseBody);

  try {
    const user = (await User.findById(inputUserId)) as UserType | null;
    if (user === null)
      return reply
        .code(400)
        .send({ reason: AuthErrors.UnknownUserId } satisfies ErrorResponseBody);
    return reply.code(200).send(user);
  } catch (error) {
    logger.error(error);
    reply
      .code(500)
      .send({ reason: AuthErrors.BackendError } satisfies ErrorResponseBody);
  }
});

server.post<{
  Body: string[];
  Reply: {
    200: UserIdsToNamesMapping;
    400: ErrorResponseBody;
    500: ErrorResponseBody;
  };
}>("/api/users/getusernames", async (request, reply) => {
  if (
    !Array.isArray(request.body) ||
    request.body.length === 0 ||
    request.body.length > 200
  )
    return reply
      .code(400)
      .send({ reason: AuthErrors.BadBodyFormat } satisfies ErrorResponseBody);
  try {
    const usersMap: UserIdsToNamesMapping = {};
    const usersList = (await User.findByIds(request.body)) as UserType[];
    for (const user of usersList) {
      usersMap[user.id] = user.display_name;
    }
    for (const userId of request.body) {
      if (!usersMap[userId]) usersMap[userId] = null;
    }
    return reply.code(200).send(usersMap);
  } catch (error) {
    logger.error(error);
    reply
      .code(500)
      .send({ reason: AuthErrors.BackendError } satisfies ErrorResponseBody);
  }
});

server.get<{
  Reply: {
    200: UserIdsToNamesMapping;
    400: ErrorResponseBody;
    500: ErrorResponseBody;
  };
}>("/api/users/alluseridsmappedtodisplaynames", async (request, reply) => {
  try {
    const users = (await User.findAll()) as UserType[];
    const usersMap: UserIdsToNamesMapping = {};
    for (const user of users) {
      usersMap[user.id] = user.display_name;
    }
    return reply.code(200).send(usersMap);
  } catch (error) {
    logger.error(error);
    reply
      .code(500)
      .send({ reason: AuthErrors.BackendError } satisfies ErrorResponseBody);
  }
});

server.post<{
  Body: UpdatePasswordBody;
  Reply: {
    201: null;
    400: ErrorResponseBody;
    500: ErrorResponseBody;
  };
}>("/api/users/updatepassword/:inputUserId", async (request, reply) => {
  const { inputUserId } = request.params as { inputUserId: string };
  if (!inputUserId)
    return reply.code(400).send({
      reason: AuthErrors.LackingIdParamInUri,
    } satisfies ErrorResponseBody);

  try {
    const passwordError = validators.identifyPasswordError(
      request.body.password
    );
    if (passwordError !== null)
      return reply
        .code(400)
        .send({ reason: passwordError } satisfies ErrorResponseBody);

    if (await User.setPassword(inputUserId, request.body.password))
      return reply.code(201).send();
    return reply
      .code(400)
      .send({ reason: AuthErrors.UnknownUserId } satisfies ErrorResponseBody);
  } catch (e) {
    logger.error(e);
    return reply.code(500).send({ reason: AuthErrors.BackendError });
  }
});

server.post<{
  Body: UpdateEmailBody;
  Reply: {
    201: null;
    400: ErrorResponseBody;
    500: ErrorResponseBody;
  };
}>("/api/users/updateemail/:inputUserId", async (request, reply) => {
  const { inputUserId } = request.params as { inputUserId: string };
  if (!inputUserId)
    return reply.code(400).send({
      reason: AuthErrors.LackingIdParamInUri,
    } satisfies ErrorResponseBody);
  if (!authServiceTypeGuards.isUpdateEmailBody(request.body))
    return reply
      .code(400)
      .send({ reason: AuthErrors.BadBodyFormat } satisfies ErrorResponseBody);

  try {
    if (!validators.isValidEmail(request.body.email))
      return reply.code(400).send({
        reason: AuthErrors.InvalidEmailFormat,
      } satisfies ErrorResponseBody);

    if (await User.setEmail(inputUserId, request.body.email))
      return reply.code(201).send();
    return reply
      .code(400)
      .send({ reason: AuthErrors.UnknownUserId } satisfies ErrorResponseBody);
  } catch (e) {
    if (e instanceof Error) {
      logger.error(e.message);
      if (e.message.includes("UNIQUE constraint failed: users.email"))
        return reply.code(400).send({ reason: AuthErrors.DuplicateEmail });
      return reply.code(500).send({ reason: AuthErrors.BackendError });
    } else logger.error(e);
  }
});

server.post<{
  Body: UpdateDisplayNameBody;
  Reply: {
    201: UserType;
    400: ErrorResponseBody;
    500: ErrorResponseBody;
  };
}>("/api/users/updatedisplayname/:inputUserId", async (request, reply) => {
  const { inputUserId } = request.params as { inputUserId: string };
  if (!inputUserId)
    return reply.code(400).send({
      reason: AuthErrors.LackingIdParamInUri,
    } satisfies ErrorResponseBody);
  if (!authServiceTypeGuards.isUpdateDisplayNameBody(request.body))
    return reply
      .code(400)
      .send({ reason: AuthErrors.BadBodyFormat } satisfies ErrorResponseBody);

  try {
    const updatedUser = (await User.setDisplayName(
      inputUserId,
      request.body.displayName
    )) as UserType;
    if (updatedUser === null)
      return reply
        .code(500)
        .send({ reason: AuthErrors.BackendError } satisfies ErrorResponseBody);
    const publication: RabbitMQTypes.UserChange = {
      id: updatedUser.id,
      displayName: updatedUser.display_name,
      smallImage: null,
      language: null,
    };
    publishMessage(publication).catch(logger.error);
    return reply.code(201).send(updatedUser);
  } catch (e) {
    if (e instanceof Error) {
      logger.error(e.message);
      if (e.message.includes("UNIQUE constraint failed: users.display_name"))
        return reply
          .code(400)
          .send({ reason: AuthErrors.DuplicateDisplayName });
      return reply
        .code(500)
        .send({ reason: AuthErrors.BackendError } satisfies ErrorResponseBody);
    } else logger.error(e);
  }
});

server.post<{
  Body: UpdateImageBody;
  Reply: {
    201: UserType;
    400: ErrorResponseBody;
    500: ErrorResponseBody;
  };
}>("/api/users/updateimage/:inputUserId", async (request, reply) => {
  const { inputUserId } = request.params as { inputUserId: string };
  if (!inputUserId)
    return reply.code(400).send({
      reason: AuthErrors.LackingIdParamInUri,
    } satisfies ErrorResponseBody);
  if (!authServiceTypeGuards.isUpdateImageBody(request.body))
    return reply
      .code(400)
      .send({ reason: AuthErrors.BadBodyFormat } satisfies ErrorResponseBody);
  try {
    const { image } = request.body;
    const nodeJsImageBuffer = Buffer.from(image.data);
    const smallImgBuffer: Buffer = await sharp(nodeJsImageBuffer)
      .resize(264, 264, { fit: "inside", withoutEnlargement: true })
      .toBuffer();
    const updatedUser = (await User.setImage(
      inputUserId,
      nodeJsImageBuffer,
      smallImgBuffer
    )) as UserType;
    if (updatedUser === null)
      return reply
        .code(500)
        .send({ reason: AuthErrors.BackendError } satisfies ErrorResponseBody);
    // TODO: publish for Flo
    const publication: RabbitMQTypes.UserChange = {
      id: updatedUser.id,
      displayName: null,
      smallImage: smallImgBuffer,
      language: null,
    };
    publishMessage(publication).catch(logger.error);

    return reply.code(201).send(updatedUser);
  } catch (e) {
    if (e instanceof Error) {
      logger.error(e.message);
      if (e.message.includes("UNIQUE constraint failed: users.display_name"))
        return reply
          .code(400)
          .send({ reason: AuthErrors.DuplicateDisplayName });
      return reply
        .code(500)
        .send({ reason: AuthErrors.BackendError } satisfies ErrorResponseBody);
    } else logger.error(e);
  }
});

server.post<{
  Body: UpdateLanguageBody;
  Reply: {
    201: UserType;
    400: ErrorResponseBody;
    500: ErrorResponseBody;
  };
}>("/api/users/updatelanguage/:inputUserId", async (request, reply) => {
  const { inputUserId } = request.params as { inputUserId: string };
  if (!inputUserId)
    return reply.code(400).send({
      reason: AuthErrors.LackingIdParamInUri,
    } satisfies ErrorResponseBody);
  if (!authServiceTypeGuards.isUpdateLanguageBody(request.body))
    return reply
      .code(400)
      .send({ reason: AuthErrors.BadBodyFormat } satisfies ErrorResponseBody);
  try {
    const updatedUser = (await User.setLanguage(
      inputUserId,
      request.body.language
    )) as UserType;
    if (updatedUser === null)
      return reply
        .code(500)
        .send({ reason: AuthErrors.BackendError } satisfies ErrorResponseBody);
    const publication: RabbitMQTypes.UserChange = {
      id: updatedUser.id,
      displayName: null,
      smallImage: null,
      language: updatedUser.language,
    };
    publishMessage(publication).catch(logger.error);
    return reply.code(201).send(updatedUser);
  } catch (e) {
    if (e instanceof Error) {
      logger.error(e.message);
      if (e.message.includes("UNIQUE constraint failed: users.display_name"))
        return reply
          .code(400)
          .send({ reason: AuthErrors.DuplicateDisplayName });
      return reply
        .code(500)
        .send({ reason: AuthErrors.BackendError } satisfies ErrorResponseBody);
    } else logger.error(e);
  }
});

server.get<{
  Reply: {
    204: null;
    400: ErrorResponseBody;
    500: ErrorResponseBody;
  };
}>("/api/users/delete/:inputUserId", async (request, reply) => {
  const { inputUserId } = request.params as { inputUserId: string };
  if (!inputUserId)
    return reply.code(400).send({
      reason: AuthErrors.LackingIdParamInUri,
    } satisfies ErrorResponseBody);

  try {
    if (await User.delete(inputUserId)) return reply.code(204).send();
    return reply
      .code(400)
      .send({ reason: AuthErrors.UnknownUserId } satisfies ErrorResponseBody);
  } catch (e) {
    if (e instanceof Error) {
      logger.error(e.message);
      return reply.code(500).send({ reason: AuthErrors.BackendError });
    } else logger.error(e);
  }
});

// The two below can be modified to return objects as Steffen wants or needs them
server.get<{
  Reply: {
    200: MatchResult[];
    400: ErrorResponseBody;
    500: ErrorResponseBody;
  };
}>("/api/users/:inputUserId/matches", async (request, reply) => {
  const { inputUserId } = request.params as { inputUserId: string };
  if (!inputUserId)
    return reply.code(400).send({
      reason: AuthErrors.LackingIdParamInUri,
    } satisfies ErrorResponseBody);

  try {
    const matches = (await GameResultModel.fetchUserMatches(
      inputUserId
    )) as MatchResult[];
    return reply.code(200).send(matches);
  } catch (e) {
    logger.error(e);
    return reply.code(500).send({ reason: AuthErrors.BackendError });
  }
});

server.get<{
  Reply: {
    200: TournamentResult[];
    400: ErrorResponseBody;
    500: ErrorResponseBody;
  };
}>("/api/users/:inputUserId/tournaments", async (request, reply) => {
  const { inputUserId } = request.params as { inputUserId: string };
  if (!inputUserId)
    return reply.code(400).send({
      reason: AuthErrors.LackingIdParamInUri,
    } satisfies ErrorResponseBody);

  try {
    const tournaments = (await GameResultModel.fetchUserTournaments(
      inputUserId
    )) as TournamentResult[];
    return reply.code(200).send(tournaments);
  } catch (e) {
    logger.error(e);
    return reply.code(500).send({ reason: AuthErrors.BackendError });
  }
});

// Sync all users to chat service - useful after chat service restarts
server.post<{
  Reply: {
    200: { message: string; userCount: number };
    500: ErrorResponseBody;
  };
}>("/api/admin/sync-users", async (request, reply) => {
  try {
    const allUsers = (await User.findAll()) as UserType[];
    logger.info(`Syncing ${allUsers.length} users to chat service...`);
    
    for (const user of allUsers) {
      let smallImageBuffer: Buffer | null = null;
      if (user.image && user.image.type === 'Buffer') {
        smallImageBuffer = Buffer.from(user.image.data);
      }
      
      const publication: RabbitMQTypes.UserChange = {
        id: user.id,
        displayName: user.display_name,
        smallImage: smallImageBuffer,
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
    return reply.code(500).send({ reason: AuthErrors.BackendError } satisfies ErrorResponseBody);
  }
});

server.setNotFoundHandler((req, res) => {
  res.code(404).send({ route: req.url, method: req.method });
});

server.listen(
  {
    port: transNetworkSettings.authService.port,
    host: transNetworkSettings.authService.ip,
  },
  (err, address) => {
    if (err) {
      logger.error(err);
      process.exit(1);
    }
    logger.info(`Server listening at ${address}`);
  }
);
