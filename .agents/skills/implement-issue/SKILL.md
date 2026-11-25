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
4. Garanta que está atualizado na branch `develop` e crie uma branch dedicada para a Task Técnica:
   ```bash
   git checkout develop && git pull origin develop
   git checkout -b feat/<NUMERO_DA_ISSUE>-<slug-curto>
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

## Passo 3: Testes Automatizados (DoD), Prettier e Verificação de Não-Regressão

1. Implemente os testes automatizados (`Vitest`) exigidos na seção **"5. Critério de Pronto (DoD & Testes)"** da issue, cobrindo todos os cenários BDD (caminho feliz + fluxos de exceção).
2. **Regra Anti-Alucinação:** Nunca assuma que o código funciona sem rodar os comandos abaixo no terminal. Execute e valide que todos retornam código `0`:
   * **Prettier (Formatação):** `npm run format` seguido de `npm run format:check`
   * **ESLint (Análise Estática):** `npm run lint`
   * **Typecheck (`TypeScript`):** `npm run typecheck` (`tsc --noEmit`)
   * **Suíte Completa de Testes (Não-Regressão):** `npm test` (deve rodar todos os testes do repositório para garantir que nenhuma funcionalidade anterior foi quebrada).
3. Se qualquer um dos 4 comandos falhar, corrija o problema imediatamente e rode novamente até que todos os 4 passem.

## Passo 4: Auditoria de Code Review e Atualização do Board

1. Mova o card da issue para **`In Review`** no Board:
   ```bash
   python3 .agents/skills/implement-issue/scripts/update_board.py <NUMERO_DA_ISSUE> "In Review"
   ```
2. Ative e execute a skill **`dod-code-review`** (`../dod-code-review/SKILL.md`) para auditar o código gerado contra vazamento de camadas e regras de negócio.
3. Somente após a aprovação sem apontamentos críticos no Code Review:
   * Faça o commit na branch da feature (`feat(#<NUMERO_DA_ISSUE>): ...`), envie a branch (`git push -u origin feat/<NUMERO_DA_ISSUE>-...`) e abra o **Pull Request** apontando para a base **`develop`** (`gh pr create --base develop ...` referenciando `#<NUMERO_DA_ISSUE>` no corpo para vincular automaticamente à coluna `Linked pull requests` do Board).
   * Realize o merge do PR na `develop` usando `gh pr merge --merge` (**NUNCA** use `--delete-branch` — todas as branches devem permanecer salvas e visíveis no GitHub!) e mova o card da issue para **`Done`** no Board:
     ```bash
     python3 .agents/skills/implement-issue/scripts/update_board.py <NUMERO_DA_ISSUE> "Done"
     ```
