import { prisma } from '../src/shared/database/prisma.js';
import { seedCategoriasFixas } from '../src/shared/database/categories-catalog.js';

async function main() {
  await seedCategoriasFixas(prisma.categoria);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error: unknown) => {
    process.stderr.write(`Erro ao executar seed de categorias: ${String(error)}\n`);
    await prisma.$disconnect();
    process.exit(1);
  });
