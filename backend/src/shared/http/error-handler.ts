import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { hasZodFastifySchemaValidationErrors } from 'fastify-type-provider-zod';
import { ZodError } from 'zod';
import { DomainError } from '../domain/errors.js';

export function globalErrorHandler(
  error: FastifyError | Error,
  _request: FastifyRequest,
  reply: FastifyReply,
) {
  if (error instanceof DomainError) {
    return reply.status(error.statusCode).send({
      code: error.code,
      message: error.message,
    });
  }

  if (hasZodFastifySchemaValidationErrors(error)) {
    const firstIssue = error.validation[0];
    return reply.status(400).send({
      code: 'VALIDATION_ERROR',
      message: firstIssue?.message ?? 'Dados de entrada inválidos.',
      issues: error.validation,
    });
  }

  if (error instanceof ZodError) {
    const firstIssue = error.issues[0];
    return reply.status(400).send({
      code: 'VALIDATION_ERROR',
      message: firstIssue?.message ?? 'Dados de entrada inválidos.',
      issues: error.issues,
    });
  }

  return reply.status(500).send({
    code: 'INTERNAL_SERVER_ERROR',
    message: 'Erro interno do servidor.',
  });
}
