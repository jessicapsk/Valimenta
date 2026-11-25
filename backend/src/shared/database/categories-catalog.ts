export interface CategoriaSeedItem {
  readonly nome: string;
  readonly prazoPadraoDias: number;
}

/**
 * RN13 (Categorias fixas) e RN14 (Prazo padrão pós-abertura por categoria).
 */
export const CATEGORIAS_FIXAS_CATALOGO: readonly CategoriaSeedItem[] = [
  { nome: 'Carne', prazoPadraoDias: 2 },
  { nome: 'Hortifruti', prazoPadraoDias: 3 },
  { nome: 'Enlatados e Conservas', prazoPadraoDias: 3 },
  { nome: 'Bebidas', prazoPadraoDias: 5 },
  { nome: 'Padaria', prazoPadraoDias: 5 },
  { nome: 'Laticínios', prazoPadraoDias: 7 },
  { nome: 'Outros', prazoPadraoDias: 7 },
  { nome: 'Congelados', prazoPadraoDias: 30 },
  { nome: 'Grãos e Cereais', prazoPadraoDias: 60 },
] as const;

export interface CategoryUpsertPort {
  upsert(args: {
    where: { nome: string };
    update: { prazoPadraoDias: number };
    create: { nome: string; prazoPadraoDias: number };
  }): Promise<{ id: string; nome: string; prazoPadraoDias: number }>;
}

export async function seedCategoriasFixas(
  categoriaRepo: CategoryUpsertPort,
): Promise<Array<{ id: string; nome: string; prazoPadraoDias: number }>> {
  const results: Array<{ id: string; nome: string; prazoPadraoDias: number }> = [];

  for (const item of CATEGORIAS_FIXAS_CATALOGO) {
    const record = await categoriaRepo.upsert({
      where: { nome: item.nome },
      update: { prazoPadraoDias: item.prazoPadraoDias },
      create: {
        nome: item.nome,
        prazoPadraoDias: item.prazoPadraoDias,
      },
    });
    results.push(record);
  }

  return results;
}
