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
                  minLength: 8
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