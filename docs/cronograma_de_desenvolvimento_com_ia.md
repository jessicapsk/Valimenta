# Cronograma de Desenvolvimento e Planejamento Acelerado por IA

> **Valimenta — Sistema de Controle de Validade de Alimentos**  
> **Abordagem:** Engenharia de Software Ágil assistida por Inteligência Artificial (Human-in-the-Loop)  
> **Quadro de Gestão:** [GitHub Projects — Valimenta](https://github.com/users/jessicapsk/projects/1)

---

## 1. Parâmetros de Estimativa e Margem de Segurança (*Buffer*)

Para assegurar previsibilidade e rigor técnico, o planejamento adota premissas conservadoras:

* **Fator de Revisão Humana:** Ferramentas de IA aceleram a geração de boilerplate, migrações e cascas de testes, mas exigem depuração ativa, adequação a regras de negócio e validação arquitetural. Cerca de **30% do esforço de cada ciclo** é reservado para revisão manual, testes de borda e garantia de isolamento entre contas.
* **Margem de Segurança Explícita (*Buffer/Gordura*):** Cada sprint incorpora de 20% a 25% de margem temporal ao final para mitigar falhas de integração contínua (CI/CD), problemas com fuso horário local e ajustes finos de CSS/responsividade.
* **Janela Final de Estabilização:** O último quarto da quarta sprint é dedicado a congelamento de código (*code freeze*), homologação e testes de regressão antes da entrega.

---

## 2. Visão Consolidada do Cronograma (Ciclo de 8 Semanas)

O ciclo de desenvolvimento do MVP é distribuído em **4 Sprints de 2 semanas cada (8 semanas / 40 dias úteis)**:

```text
[Semanas 1-2] Sprint 1: Fundação, Infraestrutura e Autenticação (US01, US02, US04)
[Semanas 3-4] Sprint 2: Core de Estoque, Lógica de Validade e Baixa (US05, US06, US14)
[Semanas 5-6] Sprint 3: Consultas, Filtros, Edições e Remoção (US07, US08, US09, US10, US11, US12, US13)
[Semanas 7-8] Sprint 4: Histórico, Indicadores, Recuperação e Estabilização (US03, US15, US16)
```

---

## 3. Matriz de Responsabilidades (IA vs. Engenharia Humana)

| Atividade do Ciclo de Vida | Papel da Ferramenta de IA | Responsabilidade da Engenheira (Humana) |
| :--- | :--- | :--- |
| **Modelagem de Dados** | Geração de scripts DDL/migrations e schemas de validação | Revisão de integridade referencial, normalização e índices |
| **Lógica de Domínio** | Implementação inicial de funções de cálculo de vigência | Validação manual estrita das regras RN01, RN02, RN03 e RN16 |
| **Segurança e Tenant** | Geração de middlewares e esqueletos de interceptores | Auditoria rigorosa contra falhas IDOR e vazamento de dados (RN17) |
| **Testes Automatizados** | Geração de cenários de teste unitário e fixtures BDD | Definição de casos de borda críticos e aprovação de cobertura |
| **Interface / Frontend** | Esboço de componentes UI responsivos e acessíveis | Validação de contraste WCAG, usabilidade e responsividade fluida |

---

## 4. Detalhamento Operacional das Sprints

### Sprint 1: Fundação Arquitetural, Banco de Dados e Autenticação
* **Duração:** Semanas 1 e 2 (10 dias úteis)
* **Objetivo:** Estabelecer a base tecnológica segura, pipeline de entrega contínua e fluxo básico de sessão.
* **Escopo:** US01 (Criar conta), US02 (Fazer login), US04 (Fazer logout).

| Dias | Atividade Planejada | Apoio de IA | Ponto Crítico / Risco |
| :---: | :--- | :--- | :--- |
| **D01–D02** | Configuração do repositório, pipeline CI/CD, linting e migrations do banco relacional. | Geração de templates DDL e workflow do GitHub Actions. | Problemas de compatibilidade em variáveis de ambiente na nuvem. |
| **D03–D04** | Implementação de US01 e US02 (endpoints de auth, hash seguro e validação de credenciais). | Boilerplate de serviços de autenticação e esquemas de validação. | Tratamento correto de hash (bcrypt) e respostas neutras de erro. |
| **D05–D06** | Implementação de US04 (logout) e middleware de proteção de rotas e isolamento (RN17, RNF06). | Esqueleto de interceptor HTTP e proteção de rotas no frontend. | Garantir que o cookie/token seja devidamente invalidado. |
| **D07–D08** | Construção das telas de Login e Cadastro no frontend integradas ao protótipo do Figma. | Geração de componentes estilizados com validações básicas. | Ajuste fino de layout responsivo (RNF04 - 360px). |
| **D09–D10** | **Buffer Técnico / Margem de Segurança:** Testes ponta a ponta da auth, revisão de código e homologação da Sprint 1. | Geração de cenários de teste automatizado de integração. | **Gordura para absorver gargalos de configuração de deploy e CI.** |

---

### Sprint 2: Núcleo de Estoque e Regras de Validade (Core MVP)
* **Duração:** Semanas 3 e 4 (10 dias úteis)
* **Objetivo:** Implementar o motor de cálculo de validade determinístico, ciclo de vida do item e baixas.
* **Escopo:** US05 (Cadastrar alimento), US06 (Registrar abertura), US14 (Registrar consumo/descarte).

| Dias | Atividade Planejada | Apoio de IA | Ponto Crítico / Risco |
| :---: | :--- | :--- | :--- |
| **D11–D12** | Implementação de US05 (Cadastro de alimento, validação de campos RI01–RI04 e sugestão de prazos RN14). | Schemas de validação e mock de dados de categorias. | Tratamento de datas com fuso horário local do navegador (RN16). |
| **D13–D14** | Implementação da rotina de cálculo determinístico (RN01, RN02, RN03) e transição de estado da US06. | Funções utilitárias de datas com testes unitários. | Resolução da menor data efetiva e bloqueio de data futura (RN10). |
| **D15–D16** | Implementação de abertura parcial com partição de lotes (RN08) e US14 (Baixa por consumo ou descarte). | Esqueleto de rotinas transacionais no banco de dados. | Falha de integridade: a baixa precisa ser estritamente atômica (RNF05). |
| **D17–D18** | Telas de cadastro, modal de abertura e modal de baixa com sugestão de motivo de descarte (RN09). | Geração de componentes interativos e modais de confirmação. | Manter formulários limpos, rápidos e acessíveis. |
| **D19–D20** | **Buffer Técnico / Margem de Segurança:** Depuração de edge cases de datas e integridade do histórico (RN20, RN21). | Geração de testes de estresse para divisão de grupos. | **Gordura para mitigar regressões nas regras de cálculo e isolamento de lote.** |

---

### Sprint 3: Consultas Prioritárias, Filtros e Gestão de Alterações
* **Duração:** Semanas 5 e 6 (10 dias úteis)
* **Objetivo:** Entregar a experiência central de acompanhamento da despensa e manutenção do estoque.
* **Escopo:** US10 (Listagem prioritária), US11 (Filtro por estado), US12 (Busca por nome), US13 (Filtro por categoria), US07 (Corrigir abertura), US08 (Editar alimento), US09 (Remover alimento).

| Dias | Atividade Planejada | Apoio de IA | Ponto Crítico / Risco |
| :---: | :--- | :--- | :--- |
| **D21–D22** | Implementação da listagem central (US10) com ordenação cronológica e desempate alfabético (RN11). | Geração de queries com ordenação composta e tags visuais. | Cumprir acessibilidade (RNF03) com texto/ícone sem depender de cor. |
| **D23–D24** | Implementação de filtros combinados: estado (US11), busca textual flexível (US12) e categoria (US13). | Predicados de filtragem combinada e debounce na busca. | Degradação de desempenho ao combinar múltiplos filtros (RNF02). |
| **D25–D26** | Implementação de US07 (Corrigir abertura) e US08 (Edição cadastral com travas de quantidade - RN15). | Validações de formulário e recálculo dinâmico de vigência. | Evitar que a edição de quantidade burle histórico existente. |
| **D27–D28** | Implementação de US09 (Remover alimento sem histórico - RN20) e mensagens de lista vazia. | Geração de diálogos de confirmação de exclusão física. | Proteger o backend para rejeitar exclusão caso haja movimentações. |
| **D29–D30** | **Buffer Técnico / Margem de Segurança:** Ajustes de responsividade mobile e refatoração de componentes. | Auditoria de layout mobile e linter de acessibilidade. | **Gordura para corrigir inconsistências de UI e lentidão em filtros.** |

---

### Sprint 4: Análise, Exceções de Acesso, Testes Regressivos e Fechamento
* **Duração:** Semanas 7 e 8 (10 dias úteis)
* **Objetivo:** Concluir histórico, relatórios de desperdício, recuperação de senha e homologação final do sistema.
* **Escopo:** US03 (Recuperar senha), US15 (Consultar histórico), US16 (Visualizar desperdício) e Estabilização.

| Dias | Atividade Planejada | Apoio de IA | Ponto Crítico / Risco |
| :---: | :--- | :--- | :--- |
| **D31–D32** | Implementação de US15 (Histórico imutável com snapshots - RN21) e US16 (Painel analítico de desperdício). | Geração de queries agregadas (`GROUP BY motivo`, `SUM`). | Divergência entre dados atuais e snapshots gravados no passado. |
| **D33–D34** | Implementação de US03 (Recuperação de senha via e-mail com token temporário de uso único). | Template de e-mail e rotina de hash efêmero com TTL. | Dependência de serviço de envio de e-mails ou simulação estável. |
| **D35–D36** | Auditoria de segurança multi-tenant (RN17) e varredura contra vulnerabilidades IDOR. | Geração de scripts de teste automatizado de invasão de tenant. | Qualquer vazamento de dados entre contas é falha bloqueadora de entrega. |
| **D37–D38** | Testes regressivos completos de ponta a ponta (E2E) cobrindo todos os cenários BDD das 16 US ativas. | Execução de suítes de teste de ponta a ponta via Playwright/Cypress. | Identificação tardia de regressões nas transações de baixa de estoque. |
| **D39–D40** | **Buffer Final / Fechamento:** Congelamento de código (*code freeze*), deploy estável e sincronização da documentação. | Revisão textual e consistência de links entre artefatos. | **Gordura final para imprevistos de deploy ou requisitos de entrega acadêmica.** |

---

## 5. Matriz de Contingência e Mitigação de Prazos

Caso atrasos imprevisíveis ocorram durante a execução, o plano de contingência aplica o corte negociado com base na classificação MoSCoW:

| Nível de Atraso Acumulado | Ação de Mitigação Imediata | Impacto no Produto |
| :--- | :--- | :--- |
| **Até 2 dias de atraso** | Absorver integralmente no buffer técnico da própria sprint em andamento. | Nenhum impacto no escopo ou na entrega. |
| **De 3 a 4 dias de atraso** | Simplificar componentes visuais (substituir gráficos elaborados da US16 por cartões de métrica e tabela simples). | Mantém os requisitos funcionais intactos, reduzindo esforço de UI. |
| **Superior a 5 dias de atraso** | Adiar histórias classificadas como *Could Have* (US13 - Filtro por categoria ou US16 - Visualização de desperdício) para o backlog futuro. | Protege o núcleo vital (*Must Haves* e *Should Haves*) sem comprometer a avaliação acadêmica. |