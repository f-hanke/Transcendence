import fastify from 'fastify'

const validators = require('./utils/validators')
import { AuthServiceTypes } from './authTypesCopy'
import { AuthErrors } from './authTypesCopy'
const RegSubmissionBodySchema = require('./schemas/schemas')

const User = require('./orm/user');
const Match = require('./orm/match');

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
      201: AuthServiceTypes.RegSuccessResponseBody;
      400: { passwordError: AuthErrors };
      500: { passwordError: AuthErrors.BackendError };
    }
  }>('/api/auth/register', { schema: RegSubmissionBodySchema }, async (request, reply) => {
    // schema is evaluated before the code below is ever looked at, so schema-responses are handled as pre-process
    const passwordError = validators.identifyPasswordError(request.body.password);
    if (passwordError !== null)
      reply.code(400).send(passwordError);
    try {
      await User.create(request.body);
      reply.code(201).send();
    }
    catch (e) {
      console.error(e);
      reply.code(500).send();
    }
})

server.setNotFoundHandler((req, res) => {
  res.code(404).send({ route: req.url, method: req.method });
});
  

server.listen({ port: 8080 }, (err, address) => {
    if (err) {
        console.error(err)
        process.exit(1)
    }
    console.log(`Server listening at ${address}`)
})
