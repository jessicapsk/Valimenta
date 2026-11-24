import { buildApp } from './app.js';
import { parseEnv } from './config/env.js';

async function bootstrap() {
  const env = parseEnv();
  const app = await buildApp(env);

  await app.listen({
    port: env.PORT,
    host: '0.0.0.0',
  });
}

bootstrap().catch((err: unknown) => {
  process.stderr.write(`Erro ao iniciar o servidor: ${String(err)}\n`);
  process.exit(1);
});
