import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { requireAuth } from '../../shared/http/middlewares/require-auth.js';
import {
  authAccountResponseSchema,
  loginBodySchema,
  logoutResponseSchema,
  registerBodySchema,
} from './auth.schema.js';
import type { AuthService } from './auth.service.js';
import type { SessionManager } from './session.manager.js';

export interface AuthRoutesDependencies {
  authService: AuthService;
  sessionManager: SessionManager;
}

export async function authRoutes(app: FastifyInstance, deps: AuthRoutesDependencies) {
  const typedApp = app.withTypeProvider<ZodTypeProvider>();

  typedApp.post(
    '/api/auth/register',
    {
      schema: {
        body: registerBodySchema,
        response: {
          201: authAccountResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const conta = await deps.authService.register(request.body);
      await deps.sessionManager.issueSessionCookie(reply, {
        contaId: conta.id,
        email: conta.email,
      });
      return reply.status(201).send({ conta });
    },
  );

  typedApp.post(
    '/api/auth/login',
    {
      schema: {
        body: loginBodySchema,
        response: {
          200: authAccountResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const conta = await deps.authService.login(request.body);
      await deps.sessionManager.issueSessionCookie(reply, {
        contaId: conta.id,
        email: conta.email,
      });
      return reply.status(200).send({ conta });
    },
  );

  typedApp.get(
    '/api/auth/me',
    {
      preHandler: [requireAuth],
      schema: {
        response: {
          200: authAccountResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const conta = await deps.authService.getProfile(request.user.contaId);
      return reply.status(200).send({ conta });
    },
  );

  typedApp.post(
    '/api/auth/logout',
    {
      schema: {
        response: {
          200: logoutResponseSchema,
        },
      },
    },
    async (_request, reply) => {
      deps.sessionManager.clearSessionCookie(reply);
      return reply.status(200).send({ message: 'Sessão encerrada com sucesso.' });
    },
  );
}
