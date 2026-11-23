---
name: implement-issue
description: >-
  Use this skill whenever the user asks to implement, develop, or execute a technical task issue
  from the Valimenta backlog/board (e.g., "implemente a issue #22", "faça a próxima task da Sprint 1").
---

# Implementação Estruturada de Issue Técnica (Valimenta)

Siga este procedimento passo a passo para implementar qualquer Task Técnica (`#22` a `#58`) com padrão de produção, mantendo o GitHub Project (`Valimenta's Board`) sincronizado em tempo real.

## Passo 1: Carregar Contexto da Issue e da User Story Pai

1. Leia os detalhes da Task Técnica no GitHub:
   ```bash
   gh issue view <NUMERO_DA_ISSUE> --repo jessicapsk/Valimenta
   ```
2. Identifique a **Parent Issue** citada no topo da descrição (ex.: `#1` a `#20`) e leia os cenários BDD (Gherkin) da User Story pai em `docs/user-stories.md` e as regras aplicáveis em `docs/regras-negocio.md`.
3. Mova imediatamente o card da issue (e da US pai, se estiver em `Todo`) para **`In Progress`** no Board executando o script auxiliar:
   [update_board.py](./scripts/update_board.py)
   ```bash
   python3 .agents/skills/implement-issue/scripts/update_board.py <NUMERO_DA_ISSUE> "In Progress"
   ```

## Passo 2: Implementação com Arquitetura Limpa em Camadas

Respeite rigorosamente as regras de `/AGENTS.md`:

1. **Zero Regra de Negócio no Controller:**
   * O `*.controller.ts` deve ter no máximo ~15 linhas por rota: extrai input validado pelo `Zod` (`*.schema.ts`), lê `request.user.contaId`, chama `this.service.executar(...)` e retorna `reply.status(...).send(...)`.
   * Nenhum `if` de regra de domínio e nenhuma chamada ao `prisma` pode existir no Controller.
2. **Erros Semânticos de Domínio:**
   * No `Service` ou `Engine`, lance erros tipados (`BusinessRuleError`, `ConflictError`, `ResourceNotFoundError`, `UnauthorizedError`).
   * O `errorHandler` global do Fastify converte esses erros nos códigos HTTP do contrato (`400`, `401`, `404`, `409`, `422`, `405`).
3. **Isolamento Multi-tenant (`RN17`) e Transações (`RNF05`):**
   * Passe `contaId` obrigatoriamente para todos os métodos do `Repository`.
   * Use `prisma.$transaction` em operações que alterem mais de um registro (como abertura parcial `RN08`, baixa com snapshot `RN20`/`RN21` e redefinição de senha com consumo de token `US03`).

## Passo 3: Testes Automatizados (DoD) e Verificação

1. Implemente os testes automatizados (`Vitest`) exigidos na seção **"5. Critério de Pronto (DoD & Testes)"** da issue, cobrindo todos os cenários BDD (caminho feliz + fluxos de exceção).
2. Execute a verificação completa:
   * Typecheck (`tsc --noEmit`)
   * Linter
   * Suíte de testes (`npm test`)

## Passo 4: Auditoria de Code Review e Atualização do Board

1. Mova o card da issue para **`In Review`** no Board:
   ```bash
   python3 .agents/skills/implement-issue/scripts/update_board.py <NUMERO_DA_ISSUE> "In Review"
   ```
2. Ative e execute a skill **`dod-code-review`** (`../dod-code-review/SKILL.md`) para auditar o código gerado contra vazamento de camadas e regras de negócio.
3. Somente após a aprovação sem apontamentos críticos no Code Review:
   * Mova o card da issue para **`Done`**:
     ```bash
     python3 .agents/skills/implement-issue/scripts/update_board.py <NUMERO_DA_ISSUE> "Done"
     ```
