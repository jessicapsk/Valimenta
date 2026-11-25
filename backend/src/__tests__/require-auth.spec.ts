import { describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { buildApp } from '../app.js';
import { SESSION_COOKIE_NAME, SessionManager } from '../modules/auth/session.manager.js';
import { requireAuth } from '../shared/http/middlewares/require-auth.js';

const TEST_CONTA_A = {
  contaId: '11111111-1111-4111-8111-111111111111',
  email: 'usuario.a@valimenta.com',
};

const TEST_CONTA_B_ID = '22222222-2222-4222-8222-222222222222';

describe('SessionManager & requireAuth Multi-tenant Middleware (Issue #24 — RN17, RNF06)', () => {
  it('deve permitir acesso com cookie HttpOnly válido e injetar contaId exclusivamente do JWT (RN17)', async () => {
    const app = await buildApp();
    const sessionManager = new SessionManager({ isProduction: false });
    const typedApp = app.withTypeProvider<ZodTypeProvider>();

    typedApp.post('/api/test-issue-session', async (_request, reply) => {
      await sessionManager.issueSessionCookie(reply, TEST_CONTA_A);
      return reply.status(200).send({ ok: true });
    });

    typedApp.post(
      '/api/test-protected-tenant',
      {
        preHandler: [requireAuth],
        schema: {
          body: z
            .object({
              contaId: z.string().optional(),
            })
            .optional(),
        },
      },
      async (request, reply) => {
        return reply.status(200).send({
          authenticatedContaId: request.user.contaId,
          authenticatedEmail: request.user.email,
        });
      },
    );

    const loginResponse = await app.inject({
      method: 'POST',
      url: '/api/test-issue-session',
    });

    expect(loginResponse.statusCode).toBe(200);
    const setCookieHeader = loginResponse.headers['set-cookie'];
    expect(setCookieHeader).toBeDefined();
    expect(String(setCookieHeader)).toContain(`${SESSION_COOKIE_NAME}=`);
    expect(String(setCookieHeader)).toContain('HttpOnly');
    expect(String(setCookieHeader)).toContain('SameSite=Lax');

    const sessionCookie = loginResponse.cookies.find((c) => c.name === SESSION_COOKIE_NAME);
    expect(sessionCookie).toBeDefined();

    // Tenta enviar outro contaId no body e query para validar que request.user.contaId vem 100% do JWT
    const protectedResponse = await app.inject({
      method: 'POST',
      url: `/api/test-protected-tenant?contaId=${TEST_CONTA_B_ID}`,
      cookies: {
        [SESSION_COOKIE_NAME]: sessionCookie?.value ?? '',
      },
      payload: {
        contaId: TEST_CONTA_B_ID,
      },
    });

    expect(protectedResponse.statusCode).toBe(200);
    expect(protectedResponse.json()).toEqual({
      authenticatedContaId: TEST_CONTA_A.contaId,
      authenticatedEmail: TEST_CONTA_A.email,
    });

    await app.close();
  });

  it('deve bloquear com HTTP 401 e { message: "Não autenticado." } quando o cookie não for enviado (RNF06)', async () => {
    const app = await buildApp();
    app.get('/api/test-protected', { preHandler: [requireAuth] }, async () => ({ ok: true }));

    const response = await app.inject({
      method: 'GET',
      url: '/api/test-protected',
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toEqual({
      code: 'UNAUTHORIZED',
      message: 'Não autenticado.',
    });

    await app.close();
  });

  it('deve bloquear com HTTP 401 quando o token JWT estiver adulterado ou com assinatura inválida (RNF06)', async () => {
    const app = await buildApp();
    app.get('/api/test-protected', { preHandler: [requireAuth] }, async () => ({ ok: true }));

    const response = await app.inject({
      method: 'GET',
      url: '/api/test-protected',
      cookies: {
        [SESSION_COOKIE_NAME]:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjb250YUlkIjoiMTExMSJ9.invalido',
      },
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toEqual({
      code: 'UNAUTHORIZED',
      message: 'Não autenticado.',
    });

    await app.close();
  });

  it('deve bloquear com HTTP 401 quando o token JWT estiver expirado (RNF06)', async () => {
    vi.useFakeTimers();
    try {
      const app = await buildApp();
      app.get('/api/test-protected', { preHandler: [requireAuth] }, async () => ({ ok: true }));
      await app.ready();

      const expiredToken = app.jwt.sign(TEST_CONTA_A, { expiresIn: 5 });
      vi.advanceTimersByTime(10_000);

      const response = await app.inject({
        method: 'GET',
        url: '/api/test-protected',
        cookies: {
          [SESSION_COOKIE_NAME]: expiredToken,
        },
      });

      expect(response.statusCode).toBe(401);
      expect(response.json()).toEqual({
        code: 'UNAUTHORIZED',
        message: 'Não autenticado.',
      });

      await app.close();
    } finally {
      vi.useRealTimers();
    }
  });

  it('SessionManager.clearSessionCookie deve expirar o cookie HttpOnly preservando path e SameSite', async () => {
    const app = await buildApp();
    const sessionManager = new SessionManager({ isProduction: false });

    app.post('/api/test-clear-session', async (_request, reply) => {
      sessionManager.clearSessionCookie(reply);
      return reply.status(200).send({ cleared: true });
    });

    const response = await app.inject({
      method: 'POST',
      url: '/api/test-clear-session',
    });

    expect(response.statusCode).toBe(200);
    const setCookieHeader = String(response.headers['set-cookie']);
    expect(setCookieHeader).toContain(`${SESSION_COOKIE_NAME}=;`);
    expect(setCookieHeader).toContain('HttpOnly');
    expect(setCookieHeader).toContain('Path=/');

    await app.close();
  });
});
