# Diretrizes de Engenharia e Arquitetura — Valimenta (AGENTS.md)

Este repositório contém o sistema **Valimenta** (Controle Doméstico de Validade de Alimentos). Todo código gerado ou editado por agentes de IA deve obedecer rigorosamente ao padrão de **código de produção (Production-Grade Clean Layered Architecture)** e às regras de negócio documentadas em `docs/`.

---

## 1. Stack Tecnológica Oficial

* **Arquitetura:** Monólito Modular em Camadas (Monorepo TypeScript com `/backend` e `/frontend`).
* **Backend:** Node.js + TypeScript (`strict: true`) + Fastify (`fastify-type-provider-zod`) + Prisma ORM + PostgreSQL + Zod + `@fastify/jwt` + `@fastify/cookie` (JWT em Cookie `HttpOnly`) + `bcrypt`.
* **Frontend:** React + TypeScript (`strict: true`) + Vite + Tailwind CSS + `shadcn/ui` (Radix UI).
* **Testes Automatizados:** `Vitest` (unitários e integração em todas as camadas) + `Playwright` (E2E).

---

## 2. Separação Estrita de Responsabilidades (Zero Vazamento entre Camadas)

O backend é dividido nos módulos do Modelo C4 (`auth`, `estoque`, `baixas`, `shared`). Cada camada possui fronteiras inegociáveis:

### 2.1. Controllers (`*.controller.ts`) — *Apenas Transporte HTTP*
* **Responsabilidade Única:** Extrair dados já validados pelo schema `Zod`, ler `request.user.contaId` (injetado pelo middleware `requireAuth`), invocar o método correspondente do `Service` e retornar o código HTTP adequado (`200`, `201`, `204`).
* **ESTRITAMENTE PROIBIDO NO CONTROLLER:**
  * Qualquer regra de negócio, `if/else` de domínio, validação de estado (`ABERTO`/`FECHADO`), cálculo de datas ou verificação de saldo/histórico;
  * Qualquer chamada ou importação direta do `prisma` ou de qualquer `*.repository.ts`;
  * Blocos `try/catch` manuais para mapear regras de negócio — erros de domínio devem ser capturados centralmente pelo **Global Error Handler** (`shared/http/error-handler.ts`).

### 2.2. Schemas / DTOs (`*.schema.ts`) — *Contratos de Entrada e Saída (`RI01–RI04`)*
* Validam formato, tipagem estrita e restrições sintáticas de entrada via `Zod` (ex.: `RI01` nome obrigatório com `trim()`, `RI02` formato `YYYY-MM-DD`, `RI03`/`RI04` quantidade inteira $\ge 1$ rejeitando decimais).

### 2.3. Domínio Puro (`domain/*.engine.ts`, `domain/errors.ts`) — *Coração Matemático Sem I/O*
* Componentes puros (como `ValidadeCalculatorEngine`) e classes de erro semântico (`DomainError`, `BusinessRuleError`, `ResourceNotFoundError`, `ConflictError`, `UnauthorizedError`).
* **ESTRITAMENTE PROIBIDO NO DOMÍNIO:** Importar Fastify, Prisma, variáveis de ambiente de rede ou realizar operações assíncronas de I/O. Funções devem ser 100% determinísticas e síncronas.

### 2.4. Services (`*.service.ts`) — *Orquestração de Regras de Negócio (`RN01–RN21`)*
* **Responsabilidade Única:** Orquestrar casos de uso, aplicar todas as travas de domínio (`RN01` a `RN21`), acionar o `ValidadeCalculatorEngine` e coordenar operações de escrita simples ou transacionais nos `Repositories`.
* **ESTRITAMENTE PROIBIDO NO SERVICE:**
  * Importar ou conhecer tipos de HTTP (`FastifyRequest`, `FastifyReply`, headers, cookies ou status codes numéricos);
  * Escrever queries do Prisma diretamente (`prisma.alimento.findMany`, etc.) fora do `Repository` (exceto ao orquestrar `unitOfWork` / transações via abstração do repositório).

### 2.5. Repositories (`*.repository.ts`) — *Persistência e Atomicidade (`RNF01`, `RNF05`, `RN17`)*
* **Responsabilidade Única:** Encapsular o acesso ao Prisma ORM e executar mutações atômicas via `prisma.$transaction` (`RNF05`).
* **Regra de Isolamento Multi-tenant (`RN17`):** Todos os métodos de consulta ou mutação em `FoodRepository` e `MovementRepository` **devem** exigir `contaId: string` como parâmetro obrigatório e incluí-lo na cláusula `where`.
* **ESTRITAMENTE PROIBIDO NO REPOSITORY:** Tomar decisões de negócio ou calcular validades.

### 2.6. Frontend (`pages/`, `features/*/components/`, `features/*/hooks/`, `features/*/api/`)
* **Componentes UI (`.tsx`):** Focados exclusivamente em apresentação acessível (`RNF03`) e responsiva (`RNF04`).
* **Hooks e API Client:** Toda comunicação HTTP fica isolada em `features/*/api/*.api.ts` (com `credentials: 'include'`), consumida via hooks customizados.
* **Proibido duplicar regras críticas no cliente como fonte da verdade:** A classificação de validade (`situacao`, `dataLimiteEfetiva`, `emAlerta`) vem calculada pelo servidor (`RN16`).

---

## 3. Leis Inegociáveis de Domínio (RN, RI e RNF)

1. **Referência Temporal do Servidor e Datas Puras (`RN01`, `RN10`, `RN16`):**
   * Todas as datas de calendário (`validadeOriginal`, `dataAbertura`, `dataLimiteEfetiva`) são tratadas como strings/datas puras `YYYY-MM-DD` sem deslocamento de fuso horário.
   * O alimento é válido até o último instante do dia limite ($\Delta t = 0 \rightarrow$ `VENCE_HOJE`), só passando a `VENCIDO` quando $\Delta t < 0$ (`RN01`, `RN04`).
   * A data de referência é obtida exclusivamente no servidor (`RN16`). Datas de abertura futuras (`dataAbertura > dataReferenciaServidor`) são bloqueadas (`RN10`).
2. **Menor Data Limite Efetiva (`RN02`, `RN03`):**
   * Para itens abertos: $\text{Data Limite Efetiva} = \min(\text{Validade Original}, \text{Data de Abertura} + \text{Prazo Pós-Abertura})$.
3. **Unidirecionalidade de Estado e Partição Atômica (`RN05`, `RN07`, `RN08`, `RNF05`):**
   * Transição `FECHADO -> ABERTO` é irreversível (`RN05`).
   * Abertura parcial (`quantidadeAberta < quantidadeDisponivel`) divide o lote dentro de uma transação atômica (`prisma.$transaction` — `RN08`, `RNF05`).
4. **Travas de Quantidade, Remoção e Imutabilidade do Histórico (`RN09`, `RN15`, `RN20`, `RN21`, `RNF05`):**
   * Se o grupo possui `movimentacoes > 0`, é **proibido** editar sua quantidade diretamente na edição (`RN15`) e é **proibido** removê-lo fisicamente via `DELETE` (`RN20`).
   * Toda baixa (`US14`) decrementa o saldo e grava na mesma transação um registro imutável em `Movimentacao` contendo `nomeSnapshot` e `categoriaSnapshot` (`RN20`, `RN21`, `RNF05`).
   * Edições em `Alimento` (`US08`) nunca alteram snapshots passados e nunca realizam fusão automática entre lotes existentes (`RN21`).
   * O histórico (`US15`) é estritamente somente leitura (`GET`); chamadas `PUT`, `PATCH` ou `DELETE` em movimentações retornam `HTTP 405`.
5. **Isolamento Multi-tenant e Segurança (`RN17`, `RN18`, `RN19`, `RNF06`):**
   * `contaId` nunca é lido de `body`, `query` ou `params`; vem sempre do token JWT em Cookie `HttpOnly`.
   * Senhas exigem mínimo de 8 caracteres (`RN19`), são armazenadas com hash `bcrypt` e `senhaHash` nunca é retornado pela API (`RNF06`).
6. **Acessibilidade WCAG AA e Responsividade (`RNF03`, `RNF04`):**
   * Nenhum status de validade (`Normal`, `Próximo do vencimento`, `Vence hoje`, `Vencido`) pode depender apenas de cor; deve exibir **ícone + rótulo textual explícito + `aria-label`** (`RNF03`).
   * Layout sem barra de rolagem horizontal a partir de `360px` de largura (`RNF04`).

---

## 4. Padrões de Qualidade de Código e Definition of Done (DoD)

* **TypeScript Estrito:** Proibido usar `any`, `@ts-ignore` ou asserções inseguras.
* **Código Limpo e Padronizado (`Prettier` + `ESLint`):** Funções pequenas e coesas, nomes semânticos alinhados ao Glossário (`docs/modelo-conceitual.md`), formatação padronizada via `Prettier` e zero código morto ou `console.log` esquecido.
* **Verificação Anti-Alucinação e Não-Regressão (Obrigatória no Terminal):**
  * **PROIBIDO** considerar qualquer alteração ou issue concluída apenas por inspeção visual do código.
  * Antes de encerrar qualquer tarefa ou fazer commit, o agente **DEVE** obrigatoriamente executar no terminal e comprovar saída sem erros (`exit code 0`):
    1. **Formatação (`Prettier`):** `npm run format` / `npm run format:check`
    2. **Linter (`ESLint`):** `npm run lint`
    3. **Tipagem (`TypeScript`):** `npm run typecheck` (`tsc --noEmit`)
    4. **Suíte Completa de Testes e Regressão (`Vitest`):** `npm test` (garantindo que os novos testes da tarefa **e todos os testes anteriores do projeto** continuam passando sem regressão).
