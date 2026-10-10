# 5. Governança, Rastreabilidade e Decisões

> **Valimenta — Sistema de Controle de Validade de Alimentos**  
> Este documento formaliza os critérios de qualidade para o fluxo de desenvolvimento ágil (DoR e DoD), a rastreabilidade bidirecional dos requisitos, a priorização por valor de negócio e o registro de decisões de Engenharia de Requisitos.

---

## 1. Critérios de Governança Ágil

### 1.1 Definition of Ready (DoR) — Preparado para Desenvolvimento
Uma User Story (US) é considerada pronta para entrar no planejamento da Sprint e ter sua implementação iniciada apenas quando satisfizer os seguintes critérios:
* **Persona e Valor Definidos:** Possui papel do usuário, necessidade e objetivo de negócio claramente descritos no formato INVEST.
* **Critérios de Aceitação em BDD:** Apresenta cenários em linguagem estruturada (Gherkin: *Dado/Quando/Então*), cobrindo o caminho feliz, fluxos de exceção e limites de validação.
* **Regras de Negócio Mapeadas:** Todas as RNs e RIs aplicáveis estão explicitamente referenciadas.
* **Entradas, Saídas e Comportamentos Delimitados:** Os dados exigidos, as mensagens de retorno e os estados da interface estão acordados.
* **Dependências Identificadas:** Interações com outras histórias ou serviços estão conhecidas e viabilizadas (seja por implementação prévia ou por estratégias de mocks/fixtures de testes).
* **Independência e Granularidade:** O escopo da história é pequeno o suficiente para ser estimado e finalizado dentro de uma única iteração de desenvolvimento.
* **Requisitos Não Funcionais Atrelados:** Critérios de segurança, responsividade ou acessibilidade relevantes para a história estão apontados.

### 1.2 Definition of Done (DoD) — Concluído e Entregue
Uma User Story é considerada terminada e apta para homologação e deploy apenas quando satisfizer os seguintes critérios:
* **Critérios Atendidos:** Todos os cenários de aceitação (BDD) descritos na especificação foram validados com sucesso.
* **Regras de Negócio Implementadas:** Todas as travas de domínio (RN01 a RN21 e RI01 a RI04) foram codificadas na camada de negócio e no backend.
* **Testes Automatizados Aprovados:** A suíte de testes unitários e de integração correspondente foi escrita, executada e aprovada na esteira de integração contínua (CI).
* **Garantia dos RNFs:** O comportamento atende aos critérios não funcionais (isolamento multi-tenant RN17/RNF06, atomicidade transacional RNF05 e acessibilidade RNF03).
* **Revisão de Código (*Code Review*):** O código foi submetido via *Pull Request*, inspecionado e aprovado por outro desenvolvedor sem apontamentos críticos.
* **Integração na Branch Principal:** O branch da funcionalidade foi mesclado (*merge*) na branch principal (`main`) sem gerar regressões nos testes preexistentes.

---

## 2. Matriz de Rastreabilidade de Requisitos

A matriz estabelece o vínculo bidirecional entre cada User Story e as Regras de Negócio (RN), Requisitos de Informação (RI) e Requisitos Não Funcionais (RNF) que a sustentam:

| User Story (US) | Regras de Negócio (RN) | Requisitos de Informação (RI) | Requisitos Não Funcionais (RNF) |
| :--- | :--- | :--- | :--- |
| **US01** — Criar conta | RN17, RN18, RN19 | — | RNF01, RNF06 |
| **US02** — Fazer login | RN17 | — | RNF06 |
| **US03** — Recuperar senha | RN18, RN19 | — | RNF06 |
| **US04** — Fazer logout | RN17 | — | RNF06 |
| **US05** — Cadastrar alimento | RN01, RN02, RN03, RN05, RN06, RN07, RN10, RN13, RN14, RN17 | RI01, RI02, RI03, RI04 | RNF01, RNF04, RNF05, RNF06 |
| **US06** — Registrar abertura | RN02, RN03, RN05, RN07, RN08, RN10, RN14, RN17 | RI03 | RNF01, RNF04, RNF05, RNF06 |
| **US07** — Corrigir data de abertura | RN02, RN03, RN04, RN05, RN10, RN17, RN20 | — | RNF01, RNF05, RNF06 |
| **US08** — Editar alimento | RN01, RN02, RN03, RN05, RN06, RN10, RN15, RN17, RN20, RN21 | RI01, RI02, RI03, RI04 | RNF01, RNF04, RNF05, RNF06 |
| **US09** — Remover alimento | RN06, RN17, RN20 | — | RNF01, RNF05, RNF06 |
| **US10** — Visualizar alimentos por validade | RN04, RN11, RN12, RN16, RN17 | — | RNF02, RNF03, RNF04, RNF06 |
| **US11** — Filtrar por estado | RN05, RN11, RN17 | — | RNF02, RNF04, RNF06 |
| **US12** — Pesquisar por nome | RN06, RN11, RN17 | — | RNF02, RNF04, RNF06 |
| **US13** — Filtrar por categoria | RN11, RN13, RN17 | — | RNF02, RNF04, RNF06 |
| **US14** — Registrar consumo ou descarte | RN07, RN08, RN09, RN15, RN17, RN20, RN21 | RI03 | RNF01, RNF04, RNF05, RNF06 |
| **US15** — Consultar histórico | RN09, RN17, RN20, RN21 | — | RNF01, RNF02, RNF04, RNF06 |
| **US16** — Visualizar desperdício | RN09, RN17, RN20 | — | RNF01, RNF02, RNF04, RNF06 |
| **US17** — Cadastrar por código de barras | RN06, RN13, RN17 | RI01, RI03 | RNF04, RNF06 |

---

## 3. Priorização de Escopo — Técnica MoSCoW

A priorização orienta o planejamento do MVP, garantindo a viabilidade do núcleo funcional antes da incorporação de recursos analíticos ou auxiliares:

### Must Have (Essencial para o MVP)
*Sem estas histórias, o sistema não cumpre sua proposta de valor básica ou não opera com segurança:*
* **US01** — Criar conta: garante a base de acesso e isolamento dos estoques.
* **US02** — Fazer login: autenticação e proteção dos endpoints.
* **US05** — Cadastrar alimento: entrada de dados e cálculo de validade.
* **US06** — Registrar abertura: controle de perecibilidade pós-abertura do lacre.
* **US10** — Visualizar alimentos por prioridade: tela central de acompanhamento e alertas.
* **US14** — Registrar consumo ou descarte: baixa de estoque e fechamento do ciclo de vida.

### Should Have (Importante, mas com alternativas manuais provisórias)
*Recursos que agregam grande valor operacional e corrigem falhas de uso:*
* **US03** — Recuperar senha: recuperação de contas sem intervenção no banco de dados.
* **US04** — Fazer logout: encerramento explícito de sessão em dispositivos compartilhados.
* **US07** — Corrigir data de abertura: retificação rápida de equívocos de digitação de datas.
* **US08** — Editar alimento: retificação geral de dados cadastrais.
* **US09** — Remover alimento: exclusão de erros cadastrais imediatos sem movimentação.
* **US11** — Filtrar por estado: segmentação visual de itens abertos vs. fechados.
* **US12** — Pesquisar por nome: localização rápida em estoques volumosos.

### Could Have (Desejável para enriquecer a experiência)
*Recursos analíticos e refinamentos que não bloqueiam a gestão de estoque básica:*
* **US13** — Filtrar por categoria: organização visual temática.
* **US15** — Consultar histórico: auditoria cronológica das movimentações.
* **US16** — Visualizar desperdício: painel analítico de perdas por motivo.

### Won't Have (Nesta Release — Escopo Futuro V2)
*Funcionalidades expressamente descartadas do ciclo de entrega atual:*
* **US17** — Cadastrar alimento por código de barras (evita acoplamento com APIs externas e câmera).
* Login social (Google/OAuth).
* Verificação de e-mail por link de confirmação e autenticação em dois fatores (2FA).
* Notificações ativas por e-mail, SMS ou Push Notification.
* Gestão compartilhada de despensa (despensa colaborativa multiusuário).
* Entrada de estoque por medidas de pesagem ou volume fracionário (kg/litros).
* Customização dos prazos padrão de fábrica por conta.

---

## 4. Registro de Decisões de Engenharia de Requisitos (ADR de Requisitos)

Durante o processo de elicitação, análise e refinamento das histórias, as seguintes decisões técnicas e conceituais foram deliberadas:

1. **Separação Rigorosa entre Valor de Negócio e Requisitos Técnicos:**  
   As User Stories expressam estritamente o valor percebido pelo usuário final. Regras estruturais, como isolamento estrito de conta (RN17) e segurança de senhas (RN19/RNF06), foram modeladas como Regras de Negócio e Requisitos Não Funcionais transversais, evitando histórias técnicas artificiais.

2. **Centralização da Definition of Ready (DoR):**  
   A DoR foi definida de forma corporativa e consolidada na governança do projeto, evitando repetições desnecessárias no corpo de cada uma das User Stories e mantendo o backlog limpo.

3. **Independência Prática (INVEST) e Tratamento de Dependências:**  
   Reconheceu-se que certas jornadas possuem dependências contextuais (ex.: abrir um alimento requer que ele tenha sido cadastrado). No entanto, garantiu-se a independência técnica de desenvolvimento e testes unitários/integrados por meio de injeção de massa prévia de testes (*fixtures* e *mocks*).

4. **Remoção de Alimento vs. Baixa Operacional (Ciclo de Vida):**  
   Estabeleceu-se uma fronteira estrita entre a remoção (US09) e a baixa (US14). A remoção física de um lote é autorizada exclusivamente enquanto não houver movimentações, servindo para sanar enganos imediatos de digitação. Uma vez que o item possui movimentação, seu encerramento deve ocorrer obrigatoriamente por baixa (consumo/descarte), preservando a integridade das métricas históricas de desperdício (RN20).

5. **Critério Temporal e Vigência de Vencimento:**  
   Adotou-se a convenção de que o alimento permanece plenamente válido até o último minuto da data impressa na embalagem, sendo considerado vencido apenas a partir do primeiro instante do dia seguinte (RN01).

6. **Resolução Determinística da Concorrência de Prazos:**  
   Para eliminar ambiguidades quando um produto aberto possui validade original e prazo pós-abertura conflitantes, determinou-se matematicamente que a data limite efetiva assume sempre o menor valor entre as duas datas projetadas (RN03).

7. **Imutabilidade e Snapshotting de Auditoria:**  
   Para garantir que alterações cadastrais futuras (US08) não distorçam relatórios históricos e métricas analíticas, definiu-se que o registro de movimentação congela uma cópia textual (*snapshot*) do nome e categoria do item no exato momento da baixa (RN21).