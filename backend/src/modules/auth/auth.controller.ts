import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { authAccountResponseSchema, registerBodySchema } from './auth.schema.js';
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
}
