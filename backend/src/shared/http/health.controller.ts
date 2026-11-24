import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { HealthService } from './health.service.js';

const healthResponseSchema = z.object({
  status: z.literal('ok'),
  serverDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export async function healthRoutes(app: FastifyInstance) {
  const healthService = new HealthService();
  const typedApp = app.withTypeProvider<ZodTypeProvider>();

  typedApp.get(
    '/api/health',
    {
      schema: {
        response: {
          200: healthResponseSchema,
        },
      },
    },
    async (_request, reply) => {
      const result = healthService.getHealthStatus();
      return reply.status(200).send(result);
    },
  );
}
