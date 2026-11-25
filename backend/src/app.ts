import Fastify, { type FastifyInstance } from 'fastify';
import cookie from '@fastify/cookie';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';
import { parseEnv, type EnvConfig } from './config/env.js';
import {
  PrismaAccountRepository,
  type IAccountRepository,
} from './modules/auth/account.repository.js';
import { authRoutes } from './modules/auth/auth.controller.js';
import { AuthService } from './modules/auth/auth.service.js';
import { SESSION_COOKIE_NAME, SessionManager } from './modules/auth/session.manager.js';
import { globalErrorHandler } from './shared/http/error-handler.js';
import { healthRoutes } from './shared/http/health.controller.js';

export interface BuildAppOptions {
  env?: Partial<EnvConfig>;
  accountRepository?: IAccountRepository;
}

export async function buildApp(
  options?: Partial<EnvConfig> | BuildAppOptions,
): Promise<FastifyInstance> {
  const isOptionsObject =
    options !== undefined && ('env' in options || 'accountRepository' in options);
  const customEnv = isOptionsObject ? options.env : options;
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
      cookieName: SESSION_COOKIE_NAME,
      signed: false,
    },
  });

  const accountRepository =
    (isOptionsObject ? options.accountRepository : undefined) ?? new PrismaAccountRepository();
  const authService = new AuthService(accountRepository);
  const sessionManager = new SessionManager({
    isProduction: env.NODE_ENV === 'production',
  });

  await app.register(healthRoutes);
  await app.register(authRoutes, { authService, sessionManager });

  return app;
}
