import { describe, expect, it } from 'vitest';
import { buildApp } from '../app.js';
import { parseEnv } from '../config/env.js';
import { BusinessRuleError } from '../shared/domain/errors.js';

describe('Healthcheck & Foundation (Issue #22)', () => {
  it('GET /api/health deve retornar HTTP 200 com status ok e serverDate no formato YYYY-MM-DD (RN16)', async () => {
    const app = await buildApp();

    const response = await app.inject({
      method: 'GET',
      url: '/api/health',
    });

    expect(response.statusCode).toBe(200);
    const body = response.json<{ status: string; serverDate: string }>();
    expect(body.status).toBe('ok');
    expect(body.serverDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);

    await app.close();
  });

  it('Global Error Handler deve traduzir DomainError para o status HTTP correspondente sem try/catch no controller', async () => {
    const app = await buildApp();
    app.get('/api/test-domain-error', async () => {
      throw new BusinessRuleError('Violação simulada de regra de domínio.', 'TEST_RULE');
    });

    const response = await app.inject({
      method: 'GET',
      url: '/api/test-domain-error',
    });

    expect(response.statusCode).toBe(422);
    expect(response.json()).toEqual({
      code: 'TEST_RULE',
      message: 'Violação simulada de regra de domínio.',
    });

    await app.close();
  });

  it('parseEnv deve falhar rapidamente se variáveis obrigatórias estiverem ausentes fora de test', () => {
    expect(() =>
      parseEnv({
        NODE_ENV: 'production',
        DATABASE_URL: '',
        JWT_SECRET: 'curta',
      }),
    ).toThrow(/Falha na validação das variáveis de ambiente/);
  });
});
