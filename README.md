# Valimenta

## 1. Visão do Produto

O Valimenta é uma plataforma **web**, com persistência em **nuvem**, que ajuda o usuário a controlar a validade dos alimentos armazenados em casa — da compra ao consumo ou descarte — com o objetivo central de **reduzir o desperdício doméstico de alimentos**.

O sistema é multiusuário: qualquer pessoa pode criar sua própria conta, e cada conta enxerga exclusivamente os próprios dados, sem compartilhamento entre contas.

O sistema permite ao usuário:

* criar uma conta e autenticar-se de forma segura;
* cadastrar alimentos, informando nome, categoria, quantidade e data de validade original;
* registrar a abertura de um alimento e acompanhar o prazo de consumo pós-abertura;
* ter a data limite de consumo calculada automaticamente, respeitando a validade original;
* acompanhar automaticamente a situação de cada alimento (normal, próximo do vencimento, vence hoje, vencido);
* visualizar um painel com os alimentos priorizados por urgência de validade;
* pesquisar, filtrar e ordenar os alimentos cadastrados;
* registrar o consumo ou o descarte de um alimento, com motivo quando aplicável;
* consultar o histórico de movimentações;
* visualizar indicadores de desperdício, para identificar padrões e reduzir perdas futuras.

---

## 2. Glossário

| Termo | Definição |
|---|---|
| **Alimento / Grupo** | Um alimento cadastrado pode existir em um ou mais grupos: unidades que compartilham nome, categoria, estado, data de abertura e data limite idênticos. Abrir parte de um lote, por exemplo, separa as unidades em dois grupos distintos. |
| **Conta** | Identidade do usuário no sistema, autenticada por e-mail e senha. Cada conta enxerga apenas seus próprios dados. |
| **Estado** | Indica se o alimento (ou grupo) está **Fechado** ou **Aberto**. |
| **Situação da validade** | Classificação temporal automática: Normal, Próximo do vencimento, Vence hoje ou Vencido. |
| **Data de validade original** | Data impressa na embalagem pelo fabricante. |
| **Data de abertura** | Data em que o alimento foi aberto. |
| **Prazo pós-abertura** | Período sugerido de consumo após a abertura. |
| **Data Limite Efetiva** | A menor data entre a validade original e a data calculada a partir da abertura — é a data que o sistema efetivamente usa para determinar a situação de validade. |
| **Baixa** | Ação de retirar unidades do controle ativo. Pode ser por **Consumo** ou por **Descarte**. |
| **Consumo** | Tipo de baixa em que o alimento foi utilizado; não exige motivo. |
| **Descarte** | Tipo de baixa em que o alimento foi jogado fora; exige um motivo (ex.: Vencimento, Estragado). |
| **Movimentação** | Registro histórico de uma baixa (consumo ou descarte), imutável após criado. |
| **Categoria** | Classificação fixa do alimento, usada para organização e sugestão de prazo pós-abertura. |

---

## 3. Premissas, Restrições e Escopo

### 3.1 Premissas

* O sistema será uma aplicação web.
* O sistema será baseado em armazenamento em nuvem.
* O sistema será multiusuário.
* Cada usuário possuirá uma conta própria.
* O acesso será realizado por e-mail e senha.
* Os dados de cada conta serão isolados.

### 3.2 Restrições Técnicas

* A quantidade será registrada apenas em unidades inteiras.
* Não serão utilizadas medidas de peso ou volume.
* As categorias serão definidas pelo sistema (lista fixa).
* O histórico de movimentações será somente para consulta.
* Movimentações já registradas não poderão ser editadas ou excluídas.
* O sistema utilizará HTTPS.
* Senhas deverão ser armazenadas de forma segura, utilizando hash.

### 3.3 Fora de Escopo

Não fazem parte do escopo atual:

* login social;
* verificação de e-mail;
* autenticação em dois fatores;
* notificações por SMS, e-mail ou push;
* compartilhamento de alimentos entre contas;
* perfis públicos ou feed social;
* cadastro por peso ou volume;
* alteração ou exclusão do histórico;
* exportação manual de dados;
* personalização do prazo padrão por categoria por conta — o prazo sugerido é fixo, definido pelo sistema (RN14).

---

## 4. Modelo Conceitual do Domínio

**Conta** — identificador, e-mail (único), senha (hash).

**Alimento** — nome, categoria, quantidade, estado, data de validade original, data de abertura (quando aplicável), prazo pós-abertura, data limite efetiva. Pertence a exatamente uma conta.

**Categoria** — nome, prazo pós-abertura padrão sugerido (fixo, definido pelo sistema).

**Movimentação** — alimento/grupo de origem, tipo (Consumo/Descarte), quantidade, data e hora, motivo (quando descarte). Guarda uma cópia (snapshot) do nome e da categoria do alimento no momento em que ocorreu (RN21) e pertence a exatamente uma conta.

```
Conta 1 ──── N Alimento 1 ──── N Movimentação
                  │
                  N
                  │
                  1
              Categoria
```

---

## 5. Regras de Negócio (RNs) e Regras de Integridade (RIs)

### 5.1 Regras de Negócio

**RN01 — Data de validade original**
O alimento permanece válido durante a data impressa na embalagem e passa a ser considerado vencido no dia seguinte à data limite.

**RN02 — Prazo pós-abertura**
Quando um alimento possuir prazo pós-abertura, o sistema calcula uma data limite a partir da data de abertura.
*Exemplo:* abertura dia 08 + prazo de 7 dias = data limite pós-abertura dia 15.

**RN03 — Data limite efetiva**
Quando houver simultaneamente validade original e prazo pós-abertura, a data limite efetiva é a **menor** entre as duas: `Data limite = menor(validade original, data limite pós-abertura)`.

**RN04 — Situação da validade**

| Situação | Condição |
|---|---|
| Normal | Mais de 3 dias restantes |
| Próximo do vencimento | De 1 a 3 dias restantes |
| Vence hoje | Data atual igual à data limite |
| Vencido | Data atual posterior à data limite |

**RN05 — Estado do alimento**
Estados possíveis: Fechado, Aberto. O usuário pode cadastrar um alimento já aberto. Uma vez aberto, o alimento nunca retorna ao estado Fechado.

**RN06 — Identificação do alimento**
Dentro de uma mesma conta, nome + categoria identificam o tipo de alimento. A comparação de nome é case-insensitive e ignora espaços nas bordas; a categoria é comparada por correspondência exata com a lista fixa (RN13).

**RN07 — Formação de grupos**
Unidades permanecem agrupadas quando compartilham alimento, categoria, estado, data de abertura e data limite.

**RN08 — Abertura parcial**
Ao abrir parte das unidades de um grupo, o sistema separa as unidades em grupos distintos conforme o novo estado. *Exemplo:* 3 fechadas → abre 1 → resultado: 2 fechadas + 1 aberta.

**RN09 — Motivo do descarte**
Todo descarte exige um motivo: Vencimento, Estragado, Embalagem danificada, Não será consumido, Outro. Quando "Outro", é exigida uma descrição.

**RN10 — Data de abertura**
Deve ser igual ou anterior à data atual; nunca futura.

**RN11 — Ordenação por validade**
A lista de alimentos prioriza os itens por proximidade da data limite (menor prazo primeiro). Em caso de empate, a ordenação segue por ordem alfabética do nome.

**RN12 — Período de alerta**
São sinalizados como alerta os alimentos que vencem hoje ou em até 3 dias. Alimentos vencidos permanecem identificados como vencidos, mas não contam como alerta de vencimento futuro.

**RN13 — Categorias**
Categorias predefinidas pelo sistema: Laticínios, Carne, Hortifruti, Padaria, Bebidas, Enlatados e Conservas, Congelados, Grãos e Cereais, Outros.

**RN14 — Prazo padrão por categoria**
Cada categoria possui um prazo pós-abertura padrão sugerido, usado no cadastro/abertura e ajustável pontualmente para um item específico, sem alterar o padrão da categoria. O padrão é definido pelo sistema e é o mesmo para todas as contas.

*Valores padrão de fábrica (suposição a validar — ver Matriz de Riscos 11.5):*

| Categoria | Prazo padrão pós-abertura |
|---|---|
| Laticínios | 7 dias |
| Carne | 2 dias |
| Hortifruti | 3 dias |
| Padaria | 5 dias |
| Bebidas | 5 dias |
| Enlatados e Conservas | 3 dias |
| Congelados | 30 dias |
| Grãos e Cereais | 60 dias |
| Outros | 7 dias |

**RN15 — Alteração de quantidade**
A quantidade só pode ser corrigida enquanto o grupo específico não tiver nenhuma movimentação associada — serve exclusivamente para corrigir erro de cadastro. Após qualquer movimentação no grupo, a quantidade não pode mais ser alterada diretamente; consumo/descarte passam a ser feitos pela funcionalidade de baixa.

**RN16 — Referência de data**
Os cálculos de validade usam a data local do dispositivo/navegador do usuário.

**RN17 — Isolamento de dados (multi-tenant)**
Cada conta acessa somente seus próprios alimentos e movimentações — tanto em leitura quanto em escrita (cadastro, edição, abertura, baixa, remoção).

**RN18 — E-mail único**
Não pode existir mais de uma conta com o mesmo e-mail.

**RN19 — Senha**
Mínimo de 8 caracteres. Regras adicionais de complexidade permanecem em aberto.

**RN20 — Remoção de alimento e preservação do histórico**
A remoção completa de um alimento só é permitida quando o grupo não possuir nenhuma movimentação registrada — é a correção de um erro de cadastro, não o encerramento normal do ciclo de vida do alimento. Havendo movimentação, a quantidade restante deve ser zerada via baixa, preservando o motivo no histórico. A remoção não apaga movimentações preexistentes de outros grupos do mesmo alimento.

**RN21 — Integridade da identificação (snapshot no histórico)**
Toda movimentação registra uma cópia do nome e da categoria do alimento no momento em que ocorreu; edições posteriores no alimento não alteram essa cópia. O sistema nunca funde automaticamente grupos existentes apenas porque nome/categoria passaram a coincidir após uma edição.

### 5.2 Regras de Integridade

**RI01 — Nome:** obrigatório no cadastro e na edição.

**RI02 — Validade:** a data de validade original é obrigatória no cadastro e na edição.

**RI03 — Quantidade:** número inteiro ≥ 1; se não informada, assume-se 1.

**RI04 — Unidade de medida:** exclusivamente unidades inteiras — não são aceitos kg, g, L, ml ou outras medidas de peso/volume.

---

## 6. Definição de Pronto (DoR)

### 6.1 Definition of Ready (DoR)

Uma User Story está pronta para desenvolvimento quando:

* possui objetivo e valor claramente definidos;
* possui ator identificado;
* possui escopo compreensível;
* possui critérios de aceitação claros e testáveis;
* possui regras de negócio aplicáveis identificadas;
* possui entradas e saídas relevantes definidas;
* não possui ambiguidades funcionais críticas;
* possui dependências conhecidas e suficientemente tratadas;
* possui tamanho adequado para planejamento;
* possui requisitos não funcionais relevantes identificados;
* está suficientemente refinada para permitir estimativa e planejamento técnico.

A DoR é uma definição geral do projeto e não precisa ser repetida integralmente em cada User Story. Dependências entre histórias são aceitáveis, desde que conhecidas e suficientemente especificadas.

---

## 7. User Stories (Épicos 0 a 4 — HU01 a HU16)

### Épico 0/1: Autenticação e Acesso

**HU01 — Criar Conta**
Como visitante, quero criar uma conta com e-mail e senha, para cadastrar e acompanhar meus alimentos.
*Critérios:* e-mail único e válido (RN18); senha atende ao mínimo (RN19); após criar, autenticação automática; conta nova inicia vazia; nenhum dado de outra conta é exposto (RN17).
**Prioridade:** Must Have

**HU02 — Login**
Como usuário cadastrado, quero entrar com minhas credenciais, para acessar meus alimentos.
*Critérios:* credenciais inválidas não revelam se o erro foi no e-mail ou na senha; após login, acesso apenas aos próprios dados (RN17); funcionalidades protegidas exigem autenticação.
**Prioridade:** Must Have

**HU03 — Recuperar Senha**
Como usuário sem acesso à conta, quero redefinir minha senha por e-mail, para recuperar o acesso.
*Critérios:* não revela se o e-mail existe na base; link de redefinição com prazo de validade e uso único; nova senha respeita RN19.
**Prioridade:** Should Have *(depende de serviço de e-mail — ver Matriz de Riscos 11.8)*

**HU04 — Logout**
Como usuário autenticado, quero sair da minha conta, para proteger meu acesso.
*Critérios:* encerra a sessão; redireciona ao login; funcionalidades protegidas ficam inacessíveis após o logout.
**Prioridade:** Must Have

---

### Épico 2: Gestão de Estoque

**HU05 — Cadastrar Alimento**
Como usuário, quero cadastrar um alimento com nome, categoria, quantidade e validade, para acompanhar seu ciclo de vida.
*Critérios:* nome e validade obrigatórios (RI01/RI02); quantidade inteira ≥ 1 (RI03), padrão 1; estado inicial Fechado (RN05), com opção de cadastrar já Aberto; prazo pós-abertura sugerido pela categoria (RN14); data limite calculada (RN02/RN03); alerta se a validade já estiver vencida no cadastro; alimento associado exclusivamente à conta autenticada (RN17).
**Prioridade:** Must Have

**HU06 — Marcar como Aberto**
Como usuário, quero registrar a abertura de um alimento fechado, para controlar o prazo de consumo pós-abertura.
*Critérios:* disponível só para alimentos fechados da própria conta (RN17); quantidade aberta ≥ 1 e ≤ disponível (RI03); data de abertura ≤ hoje (RN10); prazo sugerido pela categoria, editável; nova data limite calculada e exibida antes da confirmação; unidades abertas formam um novo grupo (RN07/RN08); alimento não retorna a Fechado (RN05).
**Prioridade:** Must Have

**HU07 — Editar Alimento**
Como usuário, quero editar os dados de um alimento — incluindo corrigir a data de abertura —, para manter o cadastro correto.
*Critérios:* disponível só para alimentos da própria conta (RN17); permite editar nome, categoria, validade original e, para alimentos abertos, data de abertura e prazo pós-abertura; data de abertura nunca futura (RN10); estado não pode voltar de Aberto para Fechado (RN05); alterações relevantes recalculam a data limite e a situação (RN02–RN04); histórico preservado, sem fusão automática de grupos (RN20/RN21); mesmas validações do cadastro (RI01–RI04) reaplicadas na edição.
**Prioridade:** Should Have

**HU08 — Editar Quantidade**
Como usuário, quero corrigir a quantidade cadastrada de um alimento, para reparar um erro de digitação.
*Critérios:* disponível só para alimentos da própria conta (RN17); permitida apenas enquanto o grupo não possuir nenhuma movimentação registrada (RN15); após qualquer baixa no grupo, a opção deixa de ser oferecida — o ajuste passa a ser feito via HU14; novo valor deve ser inteiro ≥ 1 (RI03/RI04).
**Prioridade:** Should Have

**HU09 — Remover Alimento**
Como usuário, quero remover um alimento que cadastrei por engano, para corrigir o erro sem deixar um registro incorreto.
*Critérios:* disponível só para alimentos da própria conta (RN17); permitida apenas quando o grupo não possuir nenhuma movimentação registrada (RN20) — cobre exclusivamente erro de cadastro; exige confirmação; não afeta o histórico de outros grupos do mesmo alimento (RN06).
**Prioridade:** Should Have

---

### Épico 3: Painel de Controle e Consultas

**HU10 — Visualizar Validades e Alertas (Dashboard)**
Como usuário, quero ver meus alimentos organizados por urgência de validade, para saber o que verificar primeiro.
*Critérios:* lista ordenada por RN11; situação exibida por texto e/ou ícone, nunca só por cor (RNF04); itens em período de alerta (RN12) recebem destaque adicional; vencidos continuam visíveis; atualização automática conforme passam os dias; lista vazia mostra mensagem própria, distinta de erro.
**Prioridade:** Must Have

**HU11 — Pesquisar Alimentos**
Como usuário, quero pesquisar alimentos pelo nome, para encontrar rapidamente o item procurado.
*Critérios:* correspondência parcial e case-insensitive (RN06); busca restrita à própria conta (RN17); combinável com os filtros de HU12; sem resultados, mensagem própria distinta de erro.
**Prioridade:** Should Have

**HU12 — Filtrar por Estado e Categoria**
Como usuário, quero filtrar meus alimentos por estado (Aberto/Fechado) e por categoria, para localizar mais facilmente o que procuro.
*Critérios:* seleção de Todos/Aberto/Fechado (RN05) e de uma categoria da lista fixa (RN13), combináveis entre si e com a pesquisa (HU11); ordenação por validade preservada (RN11); sem correspondências, mensagem própria distinta de erro.
**Prioridade:** Should Have

**HU13 — Ordenar Alimentos**
Como usuário, quero escolher um critério de ordenação alternativo (por nome ou por categoria), além da ordenação padrão por urgência, para visualizar minha lista da forma que fizer mais sentido no momento.
*Critérios:* a ordenação padrão continua sendo por urgência (RN11); o usuário pode alternar para ordem alfabética por nome ou agrupamento por categoria; a alteração vale apenas para a visualização atual, sem persistir entre sessões. *(Funcionalidade nova nesta reestruturação — comportamento de persistência sujeito a validação.)*
**Prioridade:** Could Have

---

### Épico 4: Baixas, Histórico e Indicadores

**HU14 — Registrar Consumo / Descarte**
Como usuário, quero registrar o consumo ou descarte de um alimento, para manter minha quantidade atualizada e rastrear o destino dos alimentos.
*Critérios:* disponível só para alimentos da própria conta (RN17); quantidade afetada entre 1 e a disponível (RI03/RI04); consumo sem motivo obrigatório; descarte exige motivo (RN09), com sugestão automática de "Vencimento" quando aplicável; gera uma movimentação com snapshot de nome/categoria (RN21); quantidade restante atualizada; ao chegar a zero, o alimento some da lista de ativos (RN07/RN08); redireciona o que RN15/RN20 impedem de ser feito por edição ou remoção direta.
**Prioridade:** Must Have

**HU15 — Consultar Histórico de Movimentações**
Como usuário, quero consultar meu histórico de consumo e descarte, para acompanhar o que aconteceu com os alimentos registrados.
*Critérios:* mostra apenas movimentações da própria conta (RN17); cada item exibe alimento, tipo, quantidade, data/hora e motivo (RN09), sempre com o nome/categoria do momento da movimentação, não o atual (RN21); somente leitura (RN20); filtrável por período; sem registros no período, mensagem própria distinta de erro.
**Prioridade:** Should Have

**HU16 — Visualizar Indicadores de Desperdício**
Como usuário, quero visualizar o que descartei e por quê, para identificar padrões e reduzir meu desperdício.
*Critérios:* considera apenas descartes; agrupável por motivo (RN09) e por categoria — usando a categoria registrada no momento da movimentação, não a atual do alimento (RN21); descartes por vencimento identificáveis separadamente; filtrável por período; restrito à própria conta (RN17); sem descartes no período, mensagem própria distinta de erro.
**Prioridade:** Could Have

---

## 8. Requisitos Não Funcionais (RNFs)

**RNF01 — Segurança e Criptografia**
HTTPS obrigatório; senhas armazenadas com hash seguro, nunca em texto plano; validação de autorização feita no backend, não apenas na interface.

**RNF02 — Persistência em Nuvem**
Os dados permanecem armazenados após o encerramento da sessão e ficam disponíveis a partir de qualquer navegador em que o usuário faça login.

**RNF03 — Desempenho do Dashboard**
Para até 200 alimentos ativos por conta, a listagem, filtragem, pesquisa e ordenação do painel devem responder em até **2 segundos** em condições normais de uso.

**RNF04 — Responsividade**
Utilizável em telas a partir de **360px** de largura até resoluções de desktop, sem quebra de layout.

**RNF05 — Tolerância a Falhas em Transações**
Se a conexão cair durante uma operação de escrita (cadastro, edição, abertura ou baixa), o sistema não grava registro parcial nem duplicado — a operação é concluída por inteiro ou não é gravada.

**RNF06 — Privacidade de Dados**
O isolamento entre contas (RN17) é garantido no backend, não apenas na interface — nenhuma consulta ou operação pode expor ou alterar dados de outra conta, mesmo em caso de falha de outra camada do sistema.

**RNF07 — Acessibilidade** *(mantida do escopo original — não fazia parte da lista-modelo de 6 itens, mas é uma exigência já validada, mantida aqui para não regredir o que foi definido)*
Nenhuma informação relevante depende exclusivamente de cor; a situação de validade sempre tem alternativa textual e/ou por ícone.

---

## 9. Matriz de Priorização (MoSCoW)

| Prioridade | HUs | Descrição |
|---|---|---|
| **Must Have** | HU01, HU02, HU04, HU05, HU06, HU10, HU14 | Escopo principal do MVP |
| **Should Have** | HU03, HU07, HU08, HU09, HU11, HU12, HU15 | Funcionalidades de suporte |
| **Could Have** | HU13, HU16 | Recursos avançados |
| **Won't Have** |

---

## 10. Matriz de Rastreabilidade

| História de Usuário | Regras de Negócio / Integridade Vinculadas |
|---|---|
| **HU01** — Criar Conta | RN17, RN18, RN19 |
| **HU02** — Login | RN17 |
| **HU03** — Recuperar Senha | RN19 |
| **HU04** — Logout | RN17 |
| **HU05** — Cadastrar Alimento | RN01, RN02, RN03, RN05, RN06, RN07, RN10, RN13, RN14, RN17, RI01, RI02, RI03, RI04 |
| **HU06** — Marcar como Aberto | RN02, RN03, RN05, RN07, RN08, RN10, RN14, RN17, RI03 |
| **HU07** — Editar Alimento | RN01, RN02, RN03, RN04, RN05, RN06, RN10, RN17, RN20, RN21, RI01, RI02 |
| **HU08** — Editar Quantidade | RN15, RN17, RI03, RI04 |
| **HU09** — Remover Alimento | RN06, RN17, RN20 |
| **HU10** — Dashboard | RN04, RN11, RN12, RN16, RN17 |
| **HU11** — Pesquisar Alimentos | RN06, RN17 |
| **HU12** — Filtrar por Estado e Categoria | RN05, RN13, RN17 |
| **HU13** — Ordenar Alimentos | RN11, RN17 |
| **HU14** — Registrar Consumo/Descarte | RN07, RN08, RN09, RN15, RN17, RN20, RN21, RI03, RI04 |
| **HU15** — Consultar Histórico | RN09, RN17, RN20, RN21 |
| **HU16** — Visualizar Desperdício | RN09, RN17, RN21 |

---

## 11. Matriz de Riscos

| ID | Risco | Impacto | Mitigação |
|---|---|---|---|
| **11.3** | Vazamento de dados entre contas de usuários | Crítico | Aplicação rigorosa da RN17 no backend (RNF06) |
| **11.5** | Valores de prazo por categoria (RN14) incorretos | Médio | Valores atuais são suposição; validar com dados reais antes do lançamento |
| **11.7** | Sessão sem expiração definida (HU02) | Médio | Definir tempo de expiração e comportamento por inatividade |
| **11.8** | Indisponibilidade do serviço de e-mail (HU03) | Alto | Escolher provedor de e-mail transacional confiável antes de habilitar HU03 |
