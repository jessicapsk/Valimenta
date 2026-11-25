import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  CATEGORIAS_FIXAS_CATALOGO,
  seedCategoriasFixas,
  type CategoryUpsertPort,
} from '../shared/database/categories-catalog.js';

describe('Database Modeling, Migrations & Categories Seed (Issue #23)', () => {
  it('deve conter exatamente as 9 categorias fixas (RN13) com seus prazos padrão pós-abertura (RN14)', () => {
    expect(CATEGORIAS_FIXAS_CATALOGO).toEqual([
      { nome: 'Carne', prazoPadraoDias: 2 },
      { nome: 'Hortifruti', prazoPadraoDias: 3 },
      { nome: 'Enlatados e Conservas', prazoPadraoDias: 3 },
      { nome: 'Bebidas', prazoPadraoDias: 5 },
      { nome: 'Padaria', prazoPadraoDias: 5 },
      { nome: 'Laticínios', prazoPadraoDias: 7 },
      { nome: 'Outros', prazoPadraoDias: 7 },
      { nome: 'Congelados', prazoPadraoDias: 30 },
      { nome: 'Grãos e Cereais', prazoPadraoDias: 60 },
    ]);
  });

  it('seedCategoriasFixas deve ser idempotente via upsert sem duplicar registros (RN13, RN14)', async () => {
    const store = new Map<string, { id: string; nome: string; prazoPadraoDias: number }>();

    const fakeRepo: CategoryUpsertPort = {
      async upsert({ where, update, create }) {
        const existing = store.get(where.nome);
        if (existing) {
          const updated = { ...existing, prazoPadraoDias: update.prazoPadraoDias };
          store.set(where.nome, updated);
          return updated;
        }
        const created = {
          id: `uuid-${store.size + 1}`,
          nome: create.nome,
          prazoPadraoDias: create.prazoPadraoDias,
        };
        store.set(where.nome, created);
        return created;
      },
    };

    const firstRun = await seedCategoriasFixas(fakeRepo);
    const secondRun = await seedCategoriasFixas(fakeRepo);

    expect(firstRun).toHaveLength(9);
    expect(secondRun).toHaveLength(9);
    expect(store.size).toBe(9);
    expect(store.get('Carne')?.prazoPadraoDias).toBe(2);
    expect(store.get('Laticínios')?.prazoPadraoDias).toBe(7);
    expect(store.get('Grãos e Cereais')?.prazoPadraoDias).toBe(60);
  });

  it('schema.prisma e migration.sql devem impor RN05, RN09, RN11, RN16 (@db.Date), RN18 (@unique email), RN20 (Restrict) e RN21 (snapshots sem FK para Categoria)', () => {
    const schemaPath = resolve(import.meta.dirname, '../../prisma/schema.prisma');
    const migrationPath = resolve(
      import.meta.dirname,
      '../../prisma/migrations/20261012000000_init/migration.sql',
    );

    const schemaContent = readFileSync(schemaPath, 'utf-8');
    const migrationContent = readFileSync(migrationPath, 'utf-8');

    // RN18: E-mail único em Conta
    expect(schemaContent).toMatch(/email\s+String\s+@unique/);
    expect(migrationContent).toContain('CREATE UNIQUE INDEX "conta_email_key" ON "conta"("email")');

    // RN16: Datas de calendário puras sem hora (@db.Date / DATE)
    expect(schemaContent).toMatch(
      /validadeOriginal\s+DateTime\s+@map\("validade_original"\)\s+@db\.Date/,
    );
    expect(schemaContent).toMatch(
      /dataAbertura\s+DateTime\?\s+@map\("data_abertura"\)\s+@db\.Date/,
    );
    expect(schemaContent).toMatch(
      /dataLimiteEfetiva\s+DateTime\s+@map\("data_limite_efetiva"\)\s+@db\.Date/,
    );

    // RN11 e RNF02: Índice composto de ordenação e isolamento multi-tenant
    expect(schemaContent).toContain('@@index([contaId, dataLimiteEfetiva, nome])');
    expect(schemaContent).toContain('@@index([contaId, dataHora])');

    // RN20 e RN21: Movimentacao com onDelete: Restrict e snapshots sem FK para Categoria
    expect(schemaContent).toContain('nomeSnapshot');
    expect(schemaContent).toContain('categoriaSnapshot');
    expect(migrationContent).not.toContain('movimentacao_categoria_id_fkey');
    expect(migrationContent).toContain(
      'FOREIGN KEY ("alimento_id") REFERENCES "alimento"("id") ON DELETE RESTRICT',
    );
  });
});
