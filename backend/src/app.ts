import Fastify, { type FastifyInstance } from 'fastify';
import cookie from '@fastify/cookie';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';
import { parseEnv, type EnvConfig } from './config/env.js';
import { globalErrorHandler } from './shared/http/error-handler.js';
import { healthRoutes } from './shared/http/health.controller.js';

export async function buildApp(customEnv?: Partial<EnvConfig>): Promise<FastifyInstance> {
  const env = { ...parseEnv(), ...customEnv };

  const app = Fastify({
    logger: env.NODE_ENV !== 'test',
  });

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);
  app.setErrorHandler(globalErrorHandler);

  await app.register(cors, {
    origin: env.FRONTEND_ORIGIN,
    credentials: true,
  });

  await app.register(cookie);
  await app.register(jwt, {
    secret: env.JWT_SECRET,
    cookie: {
      cookieName: 'valimenta_token',
      signed: false,
    },
  });

  await app.register(healthRoutes);

  return app;
}
