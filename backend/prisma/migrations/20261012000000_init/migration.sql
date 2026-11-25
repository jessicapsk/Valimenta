-- CreateEnum
CREATE TYPE "EstadoAlimento" AS ENUM ('FECHADO', 'ABERTO');

-- CreateEnum
CREATE TYPE "TipoMovimentacao" AS ENUM ('CONSUMO', 'DESCARTE');

-- CreateEnum
CREATE TYPE "MotivoDescarte" AS ENUM ('VENCIMENTO', 'ESTRAGADO', 'EMBALAGEM_DANIFICADA', 'NAO_SERA_CONSUMIDO', 'OUTRO');

-- CreateTable
CREATE TABLE "conta" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "senha_hash" TEXT NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "conta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categoria" (
    "id" UUID NOT NULL,
    "nome" TEXT NOT NULL,
    "prazo_padrao_dias" INTEGER NOT NULL,

    CONSTRAINT "categoria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alimento" (
    "id" UUID NOT NULL,
    "conta_id" UUID NOT NULL,
    "categoria_id" UUID NOT NULL,
    "nome" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "estado" "EstadoAlimento" NOT NULL DEFAULT 'FECHADO',
    "validade_original" DATE NOT NULL,
    "data_abertura" DATE,
    "prazo_abertura_dias" INTEGER,
    "data_limite_efetiva" DATE NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "alimento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "movimentacao" (
    "id" UUID NOT NULL,
    "conta_id" UUID NOT NULL,
    "alimento_id" UUID,
    "tipo" "TipoMovimentacao" NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "data_hora" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "motivo_descarte" "MotivoDescarte",
    "descricao_outro" TEXT,
    "nome_snapshot" TEXT NOT NULL,
    "categoria_snapshot" TEXT NOT NULL,

    CONSTRAINT "movimentacao_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "conta_email_key" ON "conta"("email");

-- CreateIndex
CREATE UNIQUE INDEX "categoria_nome_key" ON "categoria"("nome");

-- CreateIndex
CREATE INDEX "alimento_conta_id_data_limite_efetiva_nome_idx" ON "alimento"("conta_id", "data_limite_efetiva", "nome");

-- CreateIndex
CREATE INDEX "movimentacao_conta_id_data_hora_idx" ON "movimentacao"("conta_id", "data_hora");

-- AddForeignKey
ALTER TABLE "alimento" ADD CONSTRAINT "alimento_conta_id_fkey" FOREIGN KEY ("conta_id") REFERENCES "conta"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alimento" ADD CONSTRAINT "alimento_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "categoria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimentacao" ADD CONSTRAINT "movimentacao_conta_id_fkey" FOREIGN KEY ("conta_id") REFERENCES "conta"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimentacao" ADD CONSTRAINT "movimentacao_alimento_id_fkey" FOREIGN KEY ("alimento_id") REFERENCES "alimento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
