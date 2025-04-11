import fastify from 'fastify'

const validators = require('./utils/validators')
const passwordUtils = require('./utils/password')
const cors = require('@fastify/cors')

const User = require('./orm/user');
const Match = require('./orm/match');

import { AuthServiceTypes, JwtType, AuthErrors, isRegSubmissionBody, isLoginSubmissionBody } from './authTypesCopy'
import { transNetworkSettings } from 'transcendence'
import { error } from 'console'
import fastifyJwt from '@fastify/jwt'

const server = fastify({
  logger: {
    transport: {
      target: 'pino-pretty',
      options: {
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
      },
    },
  },
})

server.register(require('@fastify/jwt'), {
  secret: 'supersecret'
})
server.register(cors, { origin: "*" });


server.get('/ping', async (request, reply) => {
  // the more "automatic" way of fastify handling the entire response
  return 'pong\n'
})

server.get<{
  Body: AuthServiceTypes.RegSubmissionBody
}>('/playground', async (request, reply) => {
    reply.code(201).send({ success: true });
    // .send() is:
    // - Serializing the body
    // - Writing it to the socket
    // - Ending the HTTP response
})


server.post<{
  Body: AuthServiceTypes.RegSubmissionBody;
  Reply: {
    201: Number;
    400: AuthServiceTypes.ErrorResponseBody;
    500: AuthServiceTypes.ErrorResponseBody;
  }
}>('/api/auth/register', async (request, reply) => {
  if (!isRegSubmissionBody(request.body))
    return reply.code(400).send({ reason: AuthErrors.BadBodyFormat} satisfies AuthServiceTypes.ErrorResponseBody );
  if (!validators.isValidEmail(request.body.email))
    return reply.code(400).send({ reason: AuthErrors.InvalidEmailFormat} satisfies AuthServiceTypes.ErrorResponseBody );
  const passwordError = validators.identifyPasswordError(request.body.password);
  if (passwordError !== null)
    return reply.code(400).send({ reason: passwordError } satisfies AuthServiceTypes.ErrorResponseBody );
  try {
    await User.create(request.body);
    return reply.code(201).send();
  } catch (e) {
    console.error(e);
    return reply.code(500).send({ reason: AuthErrors.BackendError } satisfies AuthServiceTypes.ErrorResponseBody );
  }
})

server.post<{
  Body: AuthServiceTypes.LoginSubmissionBody;
  Reply: {
    201: AuthServiceTypes.AuthSuccessResponseBody;
    400: AuthServiceTypes.ErrorResponseBody;
    500: AuthServiceTypes.ErrorResponseBody;
  }
}>('/api/auth/login', async (request, reply) => {
  if (!isLoginSubmissionBody(request.body))
    return reply.code(400).send({ reason: AuthErrors.BadBodyFormat} satisfies AuthServiceTypes.ErrorResponseBody );
  try {
    const user = await User.findByEmail(request.body.email);
    if (!user)
      return reply.code(400).send({ reason: AuthErrors.UnknownEmail } satisfies AuthServiceTypes.ErrorResponseBody);

    console.log(user);
    const isPasswordValid = await passwordUtils.comparePassword(request.body.password, user.pw_hash);
    if (!isPasswordValid)
      return reply.code(400).send({ reason: AuthErrors.InvalidPassword } satisfies AuthServiceTypes.ErrorResponseBody);

    const token = server.jwt.sign({ userId: user.id, expiresIn: '12h' } satisfies JwtType);
    
    User.updateOnlineStatus(user.id, 1);
    User.incrementLoginCount(user.id);
    return reply.code(201).send({ clientId: user.id, jwtToken: token } satisfies AuthServiceTypes.AuthSuccessResponseBody);
  } catch (db_error) {
    console.error(db_error);
    return reply.code(500).send({ reason: AuthErrors.BackendError } satisfies AuthServiceTypes.ErrorResponseBody);
  }
});

// Authorization: Bearer <token_without_quotes>
server.get<{
  Headers: {'authorization': string};
}>('/api/auth/verify-jwt', async (request, reply) => {
  try {
    if (!request.headers.authorization)
      return reply.code(400).send({ reason: AuthErrors.LackingAuthorizationHeader } satisfies AuthServiceTypes.ErrorResponseBody);
    const token = request.headers.authorization.split(' ')[1];
    const decoded = await server.jwt.verify(token) as JwtType;
    
    reply.code(200).send({ userId: decoded.userId });
  } catch (error) {
    console.error(error);
    reply.code(401).send({ reason: AuthErrors.Unauthorized } satisfies AuthServiceTypes.ErrorResponseBody);
  }
});

server.get<{
  Headers: {'authorization': string};
}>('/api/auth/refresh', async (request, reply) => {
  if (!request.headers.authorization)
    return reply.code(400).send({ reason: AuthErrors.LackingAuthorizationHeader } satisfies AuthServiceTypes.ErrorResponseBody);
  try {
    const oldToken = request.headers.authorization.split(' ')[1];
    const decoded = await server.jwt.verify(oldToken) as JwtType;

    const newToken = server.jwt.sign({ userId: decoded.userId, expiresIn: '12h' } satisfies JwtType);
    return reply.send({ clientId: decoded.userId, jwtToken: newToken } satisfies AuthServiceTypes.AuthSuccessResponseBody);
  } catch (error) {
    console.error(error);
    reply.code(401).send({ reason: AuthErrors.Unauthorized } satisfies AuthServiceTypes.ErrorResponseBody);
  }
})

server.get<{
  Headers: {'authorization': string};
}>('/api/auth/logout', async (request, reply) => {
  if (!request.headers.authorization)
    return reply.code(400).send({ reason: AuthErrors.LackingAuthorizationHeader } satisfies AuthServiceTypes.ErrorResponseBody);
  try {
    const oldToken = request.headers.authorization.split(' ')[1];
    const decoded = await server.jwt.verify(oldToken) as JwtType;

    const user = await User.findById(decoded.userId);
    if (user === null)
      return reply.code(500).send({ reason: AuthErrors.BackendError } satisfies AuthServiceTypes.ErrorResponseBody);
    // if (user.online_status == 0)
    //   reply.code(401).send({ reason: AuthErrors.Unauthorized } satisfies AuthServiceTypes.ErrorResponseBody);

    User.updateOnlineStatus(user.id, 0);
    return reply.code(200).send();
  } catch (error) {
    console.error(error);
    reply.code(401).send({ reason: AuthErrors.Unauthorized } satisfies AuthServiceTypes.ErrorResponseBody);
  }
})
  

server.setNotFoundHandler((req, res) => {
  res.code(404).send({ route: req.url, method: req.method });
});

server.listen({
  port: transNetworkSettings.authService.port,
  host: transNetworkSettings.authService.ip
  }, (err, address) => {
    if (err) {
      console.error(err)
      process.exit(1)
    }
      console.log(`Server listening at ${address}`)
})
