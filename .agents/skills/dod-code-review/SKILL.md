---
name: dod-code-review
description: >-
  Use this skill to perform a strict production-grade architectural and Definition of Done (DoD)
  code review on changes in the Valimenta repository before completing an issue or committing.
---

# Auditoria Arquitetural e Code Review do Definition of Done (Valimenta)

Esta skill executa uma inspeção rigorosa de qualidade de código, separação de camadas e aderência às regras de negócio (`RN01–RN21`, `RI01–RI04`, `RNF01–RNF06`).

## Como Executar a Auditoria

Sempre que uma issue técnica terminar de ser implementada (ou quando o usuário solicitar um code review), lance um subagente revisor (`invoke_subagent` com `TypeName: "research"` ou `TypeName: "self"`, `Role: "Arquiteto Revisor DoD"`) passando o `git diff` e a especificação da Issue para validar os **4 Portões de Qualidade** abaixo:

---

### Portão 1: Fronteiras Arquiteturais e Pureza das Camadas (Bloqueador)
Reprove imediatamente o código se encontrar qualquer uma das seguintes violações:
1. **Vazamento de Regra de Negócio no Controller (`*.controller.ts`):**
   * O Controller contém `if/else` de domínio (ex.: checando se o alimento está aberto, se a data é futura, se a quantidade é maior que a disponível ou se há movimentações)? $\rightarrow$ **REPROVAR** (mover para o `Service` ou `ValidadeCalculatorEngine`).
   * O Controller importa ou chama `prisma` ou `Repository` diretamente? $\rightarrow$ **REPROVAR**.
   * O Controller faz `try/catch` manual para retornar erros de negócio em vez de deixar o `errorHandler` global tratar `DomainError`? $\rightarrow$ **REPROVAR**.
2. **Vazamento de HTTP no Service (`*.service.ts`):**
   * O Service recebe `FastifyRequest`/`FastifyReply` ou manipula códigos HTTP/cookies diretamente? $\rightarrow$ **REPROVAR**.
3. **Vazamento de I/O no Domínio Puro (`ValidadeCalculatorEngine`):**
   * O motor de cálculo faz acesso a banco ou usa `new Date()` dependente do fuso local sem normalização UTC `YYYY-MM-DD`? $\rightarrow$ **REPROVAR**.

---

### Portão 2: Segurança Multi-tenant e Atomicidade (`RN17`, `RNF05`, `RNF06`)
1. **Isolamento Multi-tenant (`RN17` / Anti-IDOR):**
   * Toda query em `FoodRepository` e `MovementRepository` filtra obrigatoriamente por `contaId` vindo de `request.user.contaId`?
   * Algum endpoint aceita `contaId` pelo `body`, `params` ou `query`? $\rightarrow$ **REPROVAR**.
2. **Atomicidade Transacional (`RNF05`):**
   * A abertura parcial (`RN08`), a baixa com gravação de snapshot (`RN20`, `RN21`) e o uso de token de redefinição de senha (`US03`) estão encapsulados dentro de `prisma.$transaction`?
3. **Proteção de Credenciais (`RNF06`):**
   * O campo `senhaHash` é omitido de todos os DTOs/respostas HTTP e logs?

---

### Portão 3: Travas de Domínio e Acessibilidade (`RN01–RN21`, `RNF03`, `RNF04`)
1. **Datas Puras do Servidor (`RN01`, `RN10`, `RN16`):**
   * Comparações de validade e bloqueio de data futura usam a data de referência do servidor (`YYYY-MM-DD`)?
2. **Imutabilidade e Snapshots (`RN15`, `RN20`, `RN21`):**
   * Edição de quantidade (`US08`) e remoção física (`US09`) estão bloqueadas quando `movimentacoes.count > 0`?
   * O histórico (`US15`) lê `nomeSnapshot` e `categoriaSnapshot` e rejeita `PUT/PATCH/DELETE` com `HTTP 405`?
3. **Acessibilidade WCAG AA (`RNF03`) e Responsividade (`RNF04`):**
   * No Frontend, todos os indicadores de situação (`Normal`, `Próximo do vencimento`, `Vence hoje`, `Vencido`) exibem simultaneamente **ícone + rótulo textual + `aria-label`**?

---

### Portão 4: Tipagem Estrita e Cobertura de Testes BDD (`DoD`)
1. Existe algum `any`, `@ts-ignore` ou erro no `tsc --noEmit`? $\rightarrow$ **REPROVAR**.
2. Todos os cenários BDD (Gherkin) da User Story pai associados àquela Task Técnica possuem testes automatizados (`Vitest` / `Playwright`) passando?

---

## Formato do Veredito da Revisão

O revisor deve emitir um relatório objetivo:
* **Status:** `APROVADO` ou `REPROVADO (Ajustes Necessários)`
* **Checklist dos 4 Portões:** (`[x]` ou `[ ]` com arquivo e linha exata caso haja violação)
* Se `REPROVADO`, o agente desenvolvedor deve corrigir todas as violações apontadas e reexecutar os testes antes de mover o card para `Done`.
