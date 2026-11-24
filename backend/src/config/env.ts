import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3333),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL é obrigatória.'),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET deve ter ao menos 16 caracteres.'),
  FRONTEND_ORIGIN: z.string().url().default('http://localhost:5173'),
});

export type EnvConfig = z.infer<typeof envSchema>;

export function parseEnv(rawEnv: NodeJS.ProcessEnv = process.env): EnvConfig {
  const parsed = envSchema.safeParse({
    NODE_ENV: rawEnv.NODE_ENV ?? 'development',
    PORT: rawEnv.PORT ?? 3333,
    DATABASE_URL:
      rawEnv.DATABASE_URL ??
      (rawEnv.NODE_ENV === 'test'
        ? 'postgresql://valimenta:valimenta_test_pass@localhost:5432/valimenta_test_db?schema=public'
        : undefined),
    JWT_SECRET:
      rawEnv.JWT_SECRET ??
      (rawEnv.NODE_ENV === 'test' ? 'valimenta-test-jwt-secret-min-32-chars' : undefined),
    FRONTEND_ORIGIN: rawEnv.FRONTEND_ORIGIN ?? 'http://localhost:5173',
  });

  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('; ');
    throw new Error(`Falha na validação das variáveis de ambiente: ${details}`);
  }

  return parsed.data;
}
