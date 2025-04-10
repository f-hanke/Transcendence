import { FastifySchema } from 'fastify'

// 'body', 'response', 'querystring', 'params', 'headers' match the FastifySchema interface
const RegSubmissionBodySchema: FastifySchema = {
  body: {
    type: 'object',
    required: ['email', 'displayName', 'password'],
    properties:
    {
      email: { type: 'string', format: 'email' },
      displayName: { type: 'string', minLength: 2 },
      password: {
                  type: 'string',
                  minLength: 8,
                  // pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*()_+\\-=\\[\\]{};:"\\\\|,.<>\\/?]).+$'  // or, do such checks manually in a Util
                }
    },
  }
}

const LoginSubmissionBodySchema: FastifySchema = {
  body: {
    type: 'object',
    required: ['email', 'password'],
    properties:
    {
      email: { type: 'string', format: 'email' },
      password: {
                  type: 'string',
                  minLength: 8,
                }
    }
  }
}

module.exports = RegSubmissionBodySchema
module.exports = LoginSubmissionBodySchema