# DOCUMENTO DE REQUISITOS
## Sistema de Controle de Validade de Alimentos (Valimenta)

**Tipo:** Documento de Requisitos
**Abordagem:** Engenharia de Requisitos
**Quadro de acompanhamento (GitHub Projects/Issues):** [github.com/jessicapsk/Valimenta](https://github.com/jessicapsk/Valimenta)

---

# 0. Artefatos da atividade

Esta entrega é composta por dois artefatos, conforme solicitado:

1. **Quadro de Histórias de Usuário (priorizado):** [GitHub Issues — Valimenta](https://github.com/jessicapsk/Valimenta) — contém as 16 HUs ativas, organizadas em 4 Épicos, cada uma com sua prioridade de desenvolvimento (ver Seção 12 — MoSCoW).
2. **Documento de Requisitos (este arquivo):** detalha o processo de Engenharia de Requisitos — elicitação, análise (modelo conceitual), documentação (HUs, regras de negócio e requisitos) e validação (testabilidade) — que fundamentou o quadro acima.

| Épico no quadro (GitHub) | Issue | HUs | Seção neste documento |
|---|---|---|---|
| Autenticação | [#17](https://github.com/jessicapsk/Valimenta/issues/17) | HU01–HU04 | Épico 0 |
| Gestão de estoque | [#18](https://github.com/jessicapsk/Valimenta/issues/18) | HU05–HU09 | Épico 1 |
| Painel de controle e consultas | [#19](https://github.com/jessicapsk/Valimenta/issues/19) | HU10–HU13 | Épico 2 |
| Baixas, histórico e indicadores | [#20](https://github.com/jessicapsk/Valimenta/issues/20) | HU14 | Épico 3 |
| Baixas, histórico e indicadores | [#20](https://github.com/jessicapsk/Valimenta/issues/20) | HU15–HU16 | Épico 4 |

> No quadro do GitHub as 16 HUs estão agrupadas em 4 Épicos; neste documento o quarto épico do quadro (*Baixas, histórico e indicadores*) é detalhado em dois blocos internos (Épico 3 — Consumo e Descarte; Épico 4 — Histórico e Análise) para separar o registro da baixa (HU14) das consultas analíticas (HU15–HU16). O conteúdo das HUs é idêntico ao do quadro.

---

# 1. Visão do Produto

O sistema consiste em uma aplicação web para controle da validade de alimentos.

O sistema permitirá ao usuário:

* cadastrar alimentos;
* informar quantidade e data de validade original;
* informar a categoria do alimento;
* registrar a abertura de alimentos;
* calcular a data limite de consumo considerando a abertura;
* acompanhar automaticamente a situação da validade;
* visualizar alimentos por proximidade do vencimento;
* pesquisar e filtrar alimentos;
* registrar consumo e descarte;
* consultar o histórico das movimentações;
* visualizar informações relacionadas ao desperdício.

O sistema será disponibilizado em ambiente web e utilizará armazenamento em nuvem.

Cada conta possuirá seus próprios dados, sem compartilhamento de alimentos entre contas.

---

# 2. Glossário

| Termo                     | Definição                                                                                                     |
| ------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Alimento                  | Item cadastrado pelo usuário para acompanhamento de validade e quantidade.                                    |
| Estado                    | Indica se o alimento está **Fechado** ou **Aberto**.                                                          |
| Situação da validade      | Classificação do alimento em relação à sua data limite: Normal, Próximo do vencimento, Vence hoje ou Vencido. |
| Data de validade original | Data de validade informada na embalagem do alimento.                                                          |
| Data de abertura          | Data em que o alimento foi aberto.                                                                            |
| Prazo pós-abertura        | Período durante o qual o alimento deve ser consumido após sua abertura.                                       |
| Data limite               | Data efetivamente utilizada pelo sistema para determinar a situação da validade.                              |
| Grupo                     | Conjunto de unidades do mesmo alimento que compartilham as mesmas características de controle.                |
| Baixa                     | Registro da retirada de uma ou mais unidades do controle ativo por consumo ou descarte.                       |
| Alimento ativo            | Alimento que ainda possui pelo menos uma unidade sob controle.                                                |
| Movimentação              | Registro de consumo ou descarte realizado pelo usuário.                                                       |
| Categoria                 | Classificação do alimento utilizada para organização e sugestão de prazo pós-abertura.                        |

---

# 3. Premissas, Restrições e Escopo

## 3.1 Premissas

* O sistema será uma aplicação web.
* O sistema será baseado em armazenamento em nuvem.
* O sistema será multiusuário.
* Cada usuário possuirá uma conta própria.
* O acesso será realizado por e-mail e senha.
* Os dados de cada conta serão isolados.
* A data utilizada pelo sistema será baseada na data local do dispositivo/navegador do usuário.

## 3.2 Restrições

* A quantidade será registrada apenas em unidades inteiras.
* Não serão utilizadas medidas de peso ou volume.
* As categorias serão definidas pelo sistema.
* O histórico de movimentações será somente para consulta.
* Movimentações já registradas não poderão ser editadas ou excluídas.
* O sistema utilizará HTTPS.
* Senhas deverão ser armazenadas de forma segura, utilizando hash.

## 3.3 Fora do escopo

Não fazem parte do escopo atual:

* login social;
* verificação de e-mail;
* autenticação em dois fatores;
* notificações por SMS;
* notificações por e-mail;
* notificações push;
* compartilhamento de alimentos entre contas;
* perfis públicos;
* feed social;
* cadastro por peso ou volume;
* alteração ou exclusão do histórico;
* exportação manual de dados;
* personalização do prazo padrão por categoria por conta — o prazo sugerido é fixo, definido pelo sistema (RN14).

---

# 4. Modelo Conceitual

## 4.1 Conta

Representa o usuário cadastrado no sistema.

Principais informações:

* identificador;
* e-mail;
* senha armazenada de forma segura.

## 4.2 Alimento

Representa o item controlado pelo usuário.

Principais informações:

* nome;
* categoria;
* quantidade;
* estado;
* data de validade original;
* data de abertura, quando aplicável;
* prazo pós-abertura;
* data limite.

## 4.3 Movimentação

Representa uma retirada de unidades do controle ativo.

Pode representar:

* consumo;
* descarte.

Uma movimentação registra:

* alimento/grupo relacionado;
* tipo da movimentação;
* quantidade;
* data e hora;
* motivo, quando for descarte.

## 4.4 Categoria

Representa a classificação utilizada pelo sistema.

Cada categoria possui um prazo pós-abertura padrão sugerido, definido pelo sistema. O usuário pode ajustar esse valor pontualmente para um alimento específico no momento do cadastro/abertura, sem alterar o padrão da categoria.

---

# 5. Requisitos de Negócio

## RN01 — Data de validade original

O sistema deve utilizar a data de validade informada pelo usuário como referência da validade original do alimento.

O alimento permanece válido durante a data impressa na embalagem e passa a ser considerado vencido no dia seguinte à data limite.

## RN02 — Prazo pós-abertura

Quando um alimento possuir prazo pós-abertura, o sistema deve calcular uma data limite a partir da data de abertura.

Exemplo:

* Data de abertura: dia 08;
* Prazo pós-abertura: 7 dias;
* Data limite pós-abertura: dia 15.

## RN03 — Data limite efetiva

Quando houver simultaneamente uma validade original e uma limitação pós-abertura, a data limite efetiva deverá ser a menor entre as duas.

**Data limite = menor(data de validade original, data limite pós-abertura).**

## RN04 — Situação da validade

O sistema deve classificar automaticamente cada alimento conforme a diferença entre a data atual e sua data limite:

| Situação              | Condição                           |
| --------------------- | ----------------------------------- |
| Normal                | Mais de 3 dias restantes           |
| Próximo do vencimento | De 1 a 3 dias restantes            |
| Vence hoje            | Data atual igual à data limite     |
| Vencido               | Data atual posterior à data limite |

## RN05 — Estado do alimento

Um alimento poderá possuir os seguintes estados:

* Fechado;
* Aberto.

Durante o cadastro, o usuário poderá informar que o alimento já está aberto.

Após aberto, o alimento não poderá retornar ao estado Fechado.

## RN06 — Identificação do alimento

Dentro de uma mesma conta, o nome e a categoria serão utilizados para identificar o tipo de alimento.

A comparação de nome é **case-insensitive** e ignora espaços extras no início/fim do texto (ex.: "Leite", "leite" e " Leite " são tratados como o mesmo nome). A categoria é comparada por correspondência exata com um dos valores da lista fixa (RN13).

## RN07 — Formação de grupos

Unidades poderão permanecer agrupadas quando possuírem as mesmas características de controle, incluindo:

* alimento;
* categoria;
* estado;
* data de abertura;
* data limite.

## RN08 — Abertura parcial

Quando apenas parte das unidades de um grupo for aberta, o sistema deverá separar as unidades em grupos de acordo com seus estados e respectivas informações de validade.

Exemplo:

* 3 unidades fechadas;
* usuário abre 1 unidade;
* resultado: 2 unidades fechadas + 1 unidade aberta.

## RN09 — Motivo do descarte

Todo descarte deverá possuir um motivo.

Os motivos disponíveis serão:

* Vencimento;
* Estragado;
* Embalagem danificada;
* Não será consumido;
* Outro.

Quando o usuário selecionar **Outro**, deverá informar uma descrição.

## RN10 — Data de abertura

A data de abertura deve ser igual ou anterior à data atual.

Não será permitido informar uma data futura.

## RN11 — Ordenação por validade

A lista de alimentos deverá priorizar os itens de acordo com a proximidade da data limite.

Alimentos com menor prazo restante deverão aparecer antes daqueles com maior prazo restante.

Em caso de empate na data limite, os alimentos são ordenados em ordem alfabética pelo nome.

## RN12 — Período de alerta

O sistema deverá sinalizar como alerta os alimentos que:

* vencem hoje;
* vencem em 1 dia;
* vencem em 2 dias;
* vencem em 3 dias.

Alimentos vencidos deverão permanecer identificados como vencidos, mas não serão considerados alertas de vencimento futuro.

## RN13 — Categorias

O sistema deverá possuir categorias predefinidas.

Categorias propostas:

* Laticínios;
* Carne;
* Hortifruti;
* Padaria;
* Bebidas;
* Enlatados e Conservas;
* Congelados;
* Grãos e Cereais;
* Outros.

## RN14 — Prazo padrão por categoria

Cada categoria deverá possuir um prazo pós-abertura padrão sugerido.

Esse prazo será utilizado como sugestão durante o cadastro ou abertura de alimentos.

Esse prazo será utilizado como sugestão durante o cadastro ou abertura de alimentos, podendo ser ajustado pelo usuário pontualmente para aquele item específico (RN02), sem alterar o padrão da categoria. O prazo padrão de cada categoria é definido pelo sistema e é o mesmo para todas as contas — não há configuração persistente por conta nesta versão.

**Valores padrão de fábrica** *(suposição para viabilizar teste — sujeita a validação, ver Riscos 13.2)*:

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

## RN15 — Alteração de quantidade

A quantidade cadastrada poderá ser corrigida enquanto não houver movimentação relacionada **àquele grupo específico** (RN07) — a existência de movimentação em outro grupo do mesmo alimento (ex.: baixa nas unidades abertas) não bloqueia a correção de quantidade das unidades fechadas, e vice-versa.

Após existir uma movimentação no grupo, a quantidade daquele grupo não poderá ser alterada diretamente.

Consumo e descarte deverão ser registrados por meio da funcionalidade de baixa.

## RN16 — Referência de data

O cálculo de validade e a mudança automática de situação deverão considerar a data local do dispositivo/navegador do usuário.

## RN17 — Isolamento de dados

Cada conta deverá acessar somente os alimentos e movimentações pertencentes à própria conta.

Um usuário não poderá visualizar, alterar ou excluir dados pertencentes a outra conta.

Esta regra se aplica tanto a operações de leitura quanto de escrita — cadastrar, editar, abrir, dar baixa ou remover um alimento são operações que também precisam validar a propriedade da conta, não apenas as telas de consulta.

## RN18 — E-mail único

Não poderá existir mais de uma conta cadastrada com o mesmo endereço de e-mail.

## RN19 — Senha

A senha deverá possuir no mínimo 8 caracteres.

Regras adicionais de complexidade permanecem como questão em aberto.

## RN20 — Remoção de alimento e preservação do histórico

A remoção completa de um alimento (HU09) só é permitida quando o grupo não possuir **nenhuma movimentação de consumo ou descarte registrada** — ou seja, a remoção existe para corrigir um erro de cadastro, não para encerrar o ciclo de vida normal de um alimento.

Quando já existir ao menos uma movimentação associada ao grupo, ele não pode mais ser removido diretamente: a quantidade restante deve ser zerada por meio da funcionalidade de baixa (HU14/RN09), preservando o motivo do descarte ou o registro de consumo no histórico.

A remoção, quando permitida, não apaga movimentações preexistentes de outros grupos do mesmo alimento (RN06) — apenas o grupo específico removido deixa de existir.

## RN21 — Integridade da identificação

Toda movimentação registra uma cópia do nome e da categoria do alimento no momento em que a movimentação ocorreu. Alterações posteriores no nome ou na categoria do alimento (via HU08) não modificam essa cópia — o histórico sempre exibe os dados como eram na data da movimentação, não os dados atuais do alimento.

O sistema não deverá realizar fusão automática entre grupos existentes apenas porque seus dados de identificação foram alterados.

---

# 6. Requisitos de Informação

## RI01 — Nome

O nome do alimento é obrigatório no cadastro.

## RI02 — Validade

A data de validade original é obrigatória no cadastro.

## RI03 — Quantidade

A quantidade deve ser um número inteiro maior ou igual a 1.

Caso o usuário não informe a quantidade, o sistema deverá considerar 1 unidade.

## RI04 — Unidade de medida

A quantidade deverá ser representada exclusivamente em unidades inteiras.

Não serão aceitos valores como:

* quilogramas;
* gramas;
* litros;
* mililitros;
* outras medidas de peso ou volume.

---

# 7. User Stories

## Épico 0 — Acesso e Autenticação (quadro: *Autenticação*, [Issue #17](https://github.com/jessicapsk/Valimenta/issues/17))

### HU01 — Criar conta — [Issue #1](https://github.com/jessicapsk/Valimenta/issues/1)

**Como visitante, quero criar uma conta utilizando e-mail e senha, para cadastrar e acompanhar meus alimentos no sistema.**

**Critérios de aceitação:**

* O sistema deve solicitar e-mail e senha.
* O e-mail deve possuir formato válido.
* O e-mail não poderá estar associado a outra conta.
* A senha deve atender ao requisito mínimo definido em RN19.
* Após o cadastro bem-sucedido, o usuário deverá ser autenticado.
* O usuário deverá ser direcionado para a área de alimentos.
* Uma nova conta deverá iniciar sem alimentos cadastrados.
* O usuário não deverá visualizar dados pertencentes a outras contas.

**Prioridade:** Must Have

---

### HU02 — Fazer login — [Issue #2](https://github.com/jessicapsk/Valimenta/issues/2)

**Como usuário cadastrado, quero entrar no sistema utilizando minhas credenciais, para acessar e acompanhar meus alimentos cadastrados.**

**Critérios de aceitação:**

* O sistema deve solicitar e-mail e senha.
* Credenciais válidas devem permitir o acesso.
* Credenciais inválidas devem impedir o acesso.
* Em caso de erro, o sistema deve apresentar uma mensagem sem revelar informações sensíveis sobre a conta.
* Após o login, o usuário deverá ser direcionado para a lista de alimentos.
* O usuário deverá visualizar somente os dados pertencentes à própria conta.
* Funcionalidades protegidas não deverão ser acessíveis sem autenticação.

**Prioridade:** Must Have

---

### HU03 — Recuperar senha — [Issue #3](https://github.com/jessicapsk/Valimenta/issues/3)

**Como usuário que não consegue acessar sua conta, quero redefinir minha senha, para recuperar o acesso ao sistema.**

**Critérios de aceitação:**

* O usuário deve informar o e-mail associado à conta.
* O sistema não deverá revelar se o e-mail informado está ou não cadastrado.
* Para uma conta existente, deverá ser disponibilizado um mecanismo para redefinição da senha.
* O mecanismo de redefinição deverá possuir prazo de validade.
* O mecanismo deverá ser utilizado uma única vez.
* A nova senha deverá respeitar as regras definidas para senha.
* Após a redefinição, o usuário deverá conseguir acessar a conta com a nova senha.

**Prioridade:** Should Have

**Questões pendentes:** serviço de envio de e-mail e validade do link.

---

### HU04 — Fazer logout — [Issue #4](https://github.com/jessicapsk/Valimenta/issues/4)

**Como usuário autenticado, quero sair da minha conta, para encerrar meu acesso ao sistema quando terminar de utilizá-lo.**

**Critérios de aceitação:**

* O sistema deve encerrar a sessão autenticada.
* O usuário deverá ser direcionado para a tela de login.
* Funcionalidades protegidas não deverão permanecer acessíveis após o logout.
* Os dados cadastrados não deverão ser alterados pelo logout.

**Prioridade:** Should Have

---

## Épico 1 — Cadastro e Gerenciamento de Alimentos (quadro: *Gestão de estoque*, [Issue #18](https://github.com/jessicapsk/Valimenta/issues/18))

### HU05 — Cadastrar alimento — [Issue #5](https://github.com/jessicapsk/Valimenta/issues/5)

**Como usuário, quero cadastrar um alimento informando seus dados, para acompanhar sua validade e quantidade.**

**Critérios de aceitação:**

* O nome do alimento deve ser obrigatório.
* A data de validade original deve ser obrigatória.
* A categoria deve ser informada.
* A quantidade deve ser um número inteiro maior ou igual a 1.
* Quando a quantidade não for informada, o sistema deverá considerar 1.
* O estado padrão deverá ser Fechado.
* O usuário poderá informar que o alimento já está aberto.
* Caso o alimento esteja aberto, a data de abertura deverá ser informada.
* A data de abertura não poderá ser futura.
* O sistema deverá sugerir o prazo pós-abertura correspondente à categoria.
* O usuário poderá alterar o prazo sugerido.
* O sistema deverá calcular a data limite efetiva.
* Caso a validade original já tenha passado, o sistema deverá alertar o usuário e solicitar confirmação antes de concluir o cadastro.
* Um alimento fechado não deverá possuir data de abertura.
* O alimento cadastrado é associado exclusivamente à conta autenticada (RN17).

**Prioridade:** Must Have

---

### HU06 — Registrar abertura — [Issue #6](https://github.com/jessicapsk/Valimenta/issues/6)

**Como usuário, quero registrar a abertura de um alimento fechado, para começar a controlar o prazo de consumo após a abertura.**

**Critérios de aceitação:**

* A funcionalidade deverá estar disponível somente para alimentos fechados **pertencentes à conta autenticada** (RN17).
* O usuário deverá informar quantas unidades foram abertas.
* A quantidade aberta deve ser maior ou igual a 1.
* A quantidade aberta não poderá ser superior à quantidade disponível.
* A data de abertura deverá ser igual ou anterior à data atual.
* O sistema deverá sugerir o prazo pós-abertura da categoria.
* O usuário poderá alterar o prazo sugerido.
* O sistema deverá calcular a nova data limite.
* O sistema deverá apresentar o resultado antes da confirmação.
* As unidades abertas deverão passar para o estado Aberto.
* As unidades restantes deverão permanecer Fechadas.
* O alimento não deverá retornar ao estado Fechado depois de aberto.

**Prioridade:** Must Have

---

### HU07 — Corrigir data de abertura — [Issue #7](https://github.com/jessicapsk/Valimenta/issues/7)

**Como usuário, quero corrigir a data de abertura de um alimento, para manter correta a data limite de consumo.**

**Critérios de aceitação:**

* A funcionalidade deverá estar disponível somente para alimentos abertos **pertencentes à conta autenticada** (RN17).
* A nova data deverá ser igual ou anterior à data atual.
* A alteração deverá recalcular a data limite.
* A situação da validade deverá ser atualizada.
* A alteração não poderá modificar ou apagar movimentações existentes.
* O alimento não poderá retornar ao estado Fechado.

**Prioridade:** Should Have

---

### HU08 — Editar alimento — [Issue #8](https://github.com/jessicapsk/Valimenta/issues/8)

**Como usuário, quero editar os dados de um alimento, para corrigir ou atualizar informações cadastradas.**

**Critérios de aceitação:**

* A edição só está disponível para alimentos **pertencentes à conta autenticada** (RN17).
* O usuário poderá editar nome.
* O usuário poderá editar categoria.
* O usuário poderá editar a validade original.
* Para alimentos abertos, o usuário poderá editar a data de abertura.
* Para alimentos abertos, o usuário poderá editar o prazo pós-abertura.
* Datas de abertura não poderão ser futuras.
* A quantidade poderá ser alterada apenas para corrigir erros de cadastro.
* A quantidade não poderá ser alterada diretamente depois que existir movimentação.
* O estado não poderá ser alterado de Aberto para Fechado.
* Alterações que afetem a validade deverão recalcular a data limite.
* A situação da validade deverá ser atualizada após alterações relevantes.
* O histórico deverá ser preservado.
* O sistema não deverá fundir automaticamente o alimento com outro grupo existente.
* As mesmas validações aplicadas ao cadastro (RI01–RI04) devem ser reaplicadas na edição — por exemplo, não é permitido salvar uma edição com nome vazio ou sem data de validade.

**Prioridade:** Should Have

---

### HU09 — Remover alimento — [Issue #9](https://github.com/jessicapsk/Valimenta/issues/9)

**Como usuário, quero remover um alimento que cadastrei por engano, para corrigir o erro sem deixar um registro incorreto no meu controle.**

**Critérios de aceitação:**

* A remoção só está disponível para alimentos **pertencentes à conta autenticada** (RN17).
* A remoção só está disponível quando o grupo não possuir nenhuma movimentação de consumo ou descarte associada (RN20) — cobre o cenário de erro de cadastro, não o encerramento normal do ciclo de vida do alimento.
* Quando já existir ao menos uma movimentação associada ao grupo, o sistema não deverá oferecer a opção de remoção diretamente; a quantidade restante deve ser zerada por meio de consumo/descarte (HU14).
* O sistema deverá solicitar confirmação antes da remoção.
* O cancelamento da operação não deverá modificar o alimento.
* Após a confirmação, o alimento deverá deixar de aparecer na lista de alimentos ativos.
* A remoção não afeta o histórico de outros grupos do mesmo alimento (RN06) que não estejam sendo removidos.

**Prioridade:** Should Have

---

## Épico 2 — Consulta e Localização de Alimentos (quadro: *Painel de controle e consultas*, [Issue #19](https://github.com/jessicapsk/Valimenta/issues/19))

### HU10 — Visualizar alimentos por prioridade de validade — [Issue #10](https://github.com/jessicapsk/Valimenta/issues/10)

**Como usuário, quero visualizar meus alimentos organizados pela proximidade do vencimento, para saber quais alimentos devo verificar primeiro.**

**Critérios de aceitação:**

* A lista deverá apresentar os alimentos ativos da conta.
* Os alimentos deverão ser ordenados de acordo com RN11.
* A situação da validade deverá ser apresentada de forma textual e/ou por ícone.
* A identificação não deverá depender exclusivamente de cores.
* Alimentos dentro do período de alerta deverão possuir sinalização adicional.
* Alimentos vencidos deverão continuar visíveis enquanto houver unidades ativas.
* A situação deverá ser atualizada automaticamente conforme a passagem dos dias.
* Caso não existam alimentos cadastrados, o sistema deverá apresentar uma mensagem indicando que a lista está vazia, distinta de uma mensagem de erro do sistema.

**Prioridade:** Must Have

---

### HU11 — Filtrar por estado — [Issue #11](https://github.com/jessicapsk/Valimenta/issues/11)

**Como usuário, quero filtrar meus alimentos pelo estado, para visualizar apenas alimentos abertos ou fechados quando necessário.**

**Critérios de aceitação:**

* O usuário deverá poder selecionar: Todos, Aberto ou Fechado.
* O sistema deverá apresentar somente os alimentos correspondentes ao filtro.
* A ordenação por validade deverá ser preservada.
* Caso nenhum alimento corresponda ao filtro, o sistema deverá apresentar uma mensagem indicando que não há alimentos com o estado selecionado, distinta de uma mensagem de erro do sistema.

**Prioridade:** Should Have

---

### HU12 — Pesquisar por nome — [Issue #12](https://github.com/jessicapsk/Valimenta/issues/12)

**Como usuário, quero pesquisar alimentos pelo nome, para encontrar rapidamente o item que estou procurando.**

**Critérios de aceitação:**

* A pesquisa deverá permitir correspondência parcial.
* A pesquisa não deverá diferenciar letras maiúsculas e minúsculas.
* Somente alimentos da conta autenticada deverão ser pesquisados.
* A pesquisa poderá ser combinada com filtros de estado e categoria.
* Caso nenhum resultado seja encontrado, o sistema deverá apresentar uma mensagem indicando que a busca não encontrou correspondências, distinta de uma mensagem de erro do sistema.

**Prioridade:** Should Have

---

### HU13 — Filtrar por categoria — [Issue #13](https://github.com/jessicapsk/Valimenta/issues/13)

**Como usuário, quero filtrar meus alimentos por categoria, para encontrar mais facilmente os itens de um determinado tipo.**

**Critérios de aceitação:**

* O sistema deverá apresentar as categorias disponíveis.
* O usuário poderá selecionar uma categoria.
* O usuário deverá possuir uma opção para visualizar todas as categorias.
* O filtro poderá ser combinado com pesquisa e filtro de estado.
* Caso nenhum resultado seja encontrado, o sistema deverá apresentar uma mensagem indicando que nenhum alimento pertence à categoria selecionada, distinta de uma mensagem de erro do sistema.

**Prioridade:** Could Have

---

## Épico 3 — Consumo e Descarte (quadro: *Baixas, histórico e indicadores*, [Issue #20](https://github.com/jessicapsk/Valimenta/issues/20))

### HU14 — Registrar consumo ou descarte — [Issue #14](https://github.com/jessicapsk/Valimenta/issues/14)

**Como usuário, quero registrar o consumo ou descarte de um alimento, para manter meu controle de quantidade atualizado e registrar o destino dos alimentos.**

**Critérios de aceitação:**

* A operação só está disponível para alimentos **pertencentes à conta autenticada** (RN17).
* O usuário deverá selecionar consumo ou descarte.
* O usuário deverá informar a quantidade afetada.
* A quantidade deverá ser maior ou igual a 1.
* A quantidade não poderá ser superior à quantidade disponível.
* O usuário poderá registrar parte ou toda a quantidade disponível.
* Para consumo, não será obrigatório informar motivo.
* Para descarte, o motivo deverá ser informado.
* Os motivos de descarte deverão seguir RN09.
* Quando o motivo for "Outro", deverá ser solicitada uma descrição.
* Para alimentos vencidos, o sistema deverá sugerir o motivo "Vencimento".
* O usuário poderá confirmar outro motivo quando aplicável.
* A operação deverá gerar uma movimentação.
* A movimentação deverá registrar alimento, tipo, quantidade e data/hora.
* Em caso de descarte, o motivo também deverá ser registrado.
* A quantidade restante deverá ser atualizada.
* Quando a quantidade restante chegar a zero, o alimento deverá deixar de aparecer na lista de ativos.

**Prioridade:** Must Have

---

## Épico 4 — Histórico e Análise (quadro: *Baixas, histórico e indicadores*, [Issue #20](https://github.com/jessicapsk/Valimenta/issues/20))

### HU15 — Consultar histórico — [Issue #15](https://github.com/jessicapsk/Valimenta/issues/15)

**Como usuário, quero consultar o histórico de consumo e descarte, para acompanhar o que aconteceu com os alimentos que registrei.**

**Critérios de aceitação:**

* O sistema deverá apresentar somente movimentações pertencentes à conta autenticada.
* Cada movimentação deverá apresentar: alimento, tipo, quantidade, data e hora, e motivo (quando for descarte).
* O usuário poderá filtrar as movimentações por período.
* O histórico deverá ser somente para consulta.
* O usuário não poderá editar movimentações.
* O usuário não poderá excluir movimentações.
* Caso não existam movimentações no período selecionado, o sistema deverá apresentar uma mensagem indicando ausência de registros naquele período, distinta de uma mensagem de erro do sistema.

**Prioridade:** Could Have

---

### HU16 — Visualizar desperdício — [Issue #16](https://github.com/jessicapsk/Valimenta/issues/16)

**Como usuário, quero visualizar os alimentos que descartei e seus motivos, para identificar quanto estou desperdiçando e entender as principais causas.**

**Critérios de aceitação:**

* A funcionalidade deverá considerar somente movimentações de descarte.
* O sistema deverá apresentar as quantidades descartadas.
* Os descartes deverão poder ser agrupados por motivo.
* O usuário poderá filtrar os dados por período.
* Descartes por vencimento deverão poder ser identificados separadamente.
* Os dados deverão considerar somente a conta autenticada.
* Caso não existam descartes no período selecionado, o sistema deverá apresentar uma mensagem indicando ausência de descartes naquele período, distinta de uma mensagem de erro do sistema.

**Prioridade:** Could Have

---

# 8. Requisitos Não Funcionais

## RNF01 — Persistência

Os dados cadastrados deverão permanecer armazenados após o encerramento da sessão e poderão ser recuperados posteriormente pelo usuário autenticado.

## RNF02 — Desempenho

Para até 200 alimentos ativos, operações de listagem, filtragem e pesquisa deverão apresentar resultado em até 1 segundo em condições normais de uso.

## RNF03 — Acessibilidade

As funcionalidades principais deverão ser utilizáveis sem depender exclusivamente de distinção por cores.

Informações importantes deverão possuir alternativas textuais e/ou visuais.

## RNF04 — Responsividade

A aplicação deverá ser utilizável em telas com largura a partir de 360px (smartphones comuns) até resoluções de desktop, sem quebra de layout ou perda de acesso a funcionalidades.

## RNF05 — Confiabilidade

Se a conexão do usuário cair durante uma operação de escrita (cadastro, edição, abertura ou baixa), o sistema não deverá gravar um registro parcial nem duplicado — a operação é concluída por inteiro ou não é gravada.

## RNF06 — Segurança

O sistema deverá:

* utilizar HTTPS;
* armazenar senhas utilizando mecanismos seguros de hash;
* impedir acesso de uma conta aos dados de outra;
* validar operações no backend;
* impedir acesso não autorizado a funcionalidades protegidas.

---

# 9. Definition of Ready — DoR

Uma User Story estará pronta para desenvolvimento quando:

* possuir objetivo e valor claramente definidos;
* possuir ator identificado;
* possuir escopo compreensível;
* possuir critérios de aceitação claros e testáveis;
* possuir regras de negócio aplicáveis identificadas;
* possuir entradas e saídas relevantes definidas;
* não possuir ambiguidades funcionais críticas;
* possuir dependências conhecidas e suficientemente tratadas;
* possuir tamanho adequado para planejamento;
* possuir requisitos não funcionais relevantes identificados;
* estiver suficientemente refinada para permitir estimativa e planejamento técnico.

A DoR é uma definição geral do projeto e não precisa ser repetida integralmente em cada User Story.

Uma história pode possuir dependências de outras histórias, desde que essas dependências sejam conhecidas e estejam suficientemente especificadas para o planejamento.

---

# 10. Definition of Done — DoD

Uma User Story será considerada concluída quando:

* todos os critérios de aceitação forem atendidos;
* as regras de negócio aplicáveis estiverem implementadas;
* as validações necessárias estiverem implementadas;
* os testes definidos para a funcionalidade forem aprovados;
* a funcionalidade estiver integrada ao sistema;
* não existirem defeitos bloqueadores conhecidos;
* os requisitos não funcionais aplicáveis forem atendidos;
* a implementação tiver sido revisada;
* o comportamento final estiver de acordo com o requisito especificado.

---

# 11. Matriz de Rastreabilidade

| User Story                        | Requisitos relacionados                                                            |
| ---------------------------------- | ------------------------------------------------------------------------------------ |
| HU01 — Criar conta                 | RN17, RN18, RN19, RNF06                                                             |
| HU02 — Fazer login                 | RN17, RNF06                                                                          |
| HU03 — Recuperar senha             | RN19, RNF06                                                                          |
| HU04 — Fazer logout                | RNF06                                                                                |
| HU05 — Cadastrar alimento          | RN01, RN02, RN03, RN05, RN06, RN07, RN10, RN13, RN14, RN17, RI01, RI02, RI03, RI04 |
| HU06 — Registrar abertura          | RN02, RN03, RN05, RN07, RN08, RN10, RN14, RN17, RI03                               |
| HU07 — Corrigir data de abertura   | RN02, RN03, RN05, RN10, RN17, RN20                                                  |
| HU08 — Editar alimento             | RN01, RN02, RN03, RN05, RN06, RN15, RN17, RN20, RN21, RI01, RI02, RI03, RI04       |
| HU09 — Remover alimento            | RN06, RN17, RN20                                                                     |
| HU10 — Visualizar alimentos        | RN04, RN11, RN12, RN16, RN17                                                        |
| HU11 — Filtrar por estado          | RN05, RN17                                                                           |
| HU12 — Pesquisar por nome          | RN06, RN17                                                                           |
| HU13 — Filtrar por categoria       | RN13, RN17                                                                           |
| HU14 — Registrar consumo/descarte  | RN07, RN08, RN09, RN15, RN17, RN20, RI03                                            |
| HU15 — Consultar histórico         | RN09, RN17, RN20                                                                     |
| HU16 — Visualizar desperdício      | RN09, RN17                                                                           |

---

# 12. Priorização — MoSCoW

## Must Have

* HU01 — Criar conta
* HU02 — Fazer login
* HU05 — Cadastrar alimento
* HU06 — Registrar abertura
* HU10 — Visualizar alimentos por prioridade de validade
* HU14 — Registrar consumo ou descarte

## Should Have

* HU03 — Recuperar senha
* HU04 — Fazer logout
* HU07 — Corrigir data de abertura
* HU08 — Editar alimento
* HU09 — Remover alimento
* HU11 — Filtrar por estado
* HU12 — Pesquisar por nome

## Could Have

* HU13 — Filtrar por categoria
* HU15 — Consultar histórico
* HU16 — Visualizar desperdício

## Won't Have — versão atual

Funcionalidades fora do escopo atual:

* login social;
* verificação de e-mail;
* autenticação em dois fatores;
* notificações por e-mail;
* notificações por SMS;
* notificações push;
* compartilhamento entre contas;
* cadastro por peso ou volume;
* edição/exclusão do histórico;
* exportação manual.

---

# 13. Decisões de Engenharia de Requisitos

As seguintes decisões foram adotadas durante o refinamento:

1. As User Stories devem representar valor para o usuário, e não regras técnicas ou características de arquitetura.
2. Informações como isolamento de dados entre contas permanecem como regras de negócio/requisitos de segurança, não como valor da User Story.
3. A DoR é definida de maneira geral, evitando sua repetição em todas as HUs.
4. A existência de dependência entre histórias não significa automaticamente que uma história não possa estar pronta para desenvolvimento.
5. A funcionalidade de visualização de validade e alertas foi consolidada na HU10, evitando duplicidade.
6. A abertura parcial de unidades deve ser explicitamente representada na HU06.
7. A quantidade afetada por consumo ou descarte deve ser explicitamente informada na HU14.
8. Consumo e descarte devem gerar movimentações no histórico.
9. Remover um alimento só é permitido quando ele ainda não possui movimentação registrada (correção de erro de cadastro); um alimento com histórico de consumo/descarte deve ser zerado via baixa (HU14), nunca removido diretamente, para que o motivo da baixa não se perca.
10. A situação "Vencido" é diferente do alerta de alimentos próximos do vencimento.
11. A validade original permanece válida durante a data impressa na embalagem, sendo considerada vencida somente no dia seguinte.
12. Quando houver validade original e prazo pós-abertura, a menor data será utilizada como data limite efetiva.
13. A data local do dispositivo/navegador será utilizada como referência para os cálculos de validade.
14. As alterações nos dados de um alimento não devem causar fusão automática com outros grupos.
15. O prazo padrão por categoria é definido pelo sistema (não configurável por conta); o usuário pode apenas sobrescrever a sugestão pontualmente para um alimento específico, no momento do cadastro/abertura.
