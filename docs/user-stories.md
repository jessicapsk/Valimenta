# 3. Catálogo de User Stories (US)

> **Valimenta — Sistema de Controle de Validade de Alimentos**  
> Este documento cataloga todas as User Stories (US01 a US17) do projeto, estruturadas no padrão INVEST com regras de negócio vinculadas e critérios de aceitação executáveis no padrão BDD (Gherkin).

---

## Sumário das User Stories

| ID | Título | Épico | Prioridade MoSCoW | Issue |
| :---: | :--- | :--- | :---: | :---: |
| **US01** | Criar conta | Épico 0: Acesso e Autenticação | Must Have | `#1` |
| **US02** | Fazer login | Épico 0: Acesso e Autenticação | Must Have | `#2` |
| **US03** | Recuperar senha | Épico 0: Acesso e Autenticação | Should Have | `#3` |
| **US04** | Fazer logout | Épico 0: Acesso e Autenticação | Should Have | `#4` |
| **US05** | Cadastrar alimento | Épico 1: Gestão de Estoque | Must Have | `#5` |
| **US06** | Registrar abertura | Épico 1: Gestão de Estoque | Must Have | `#6` |
| **US07** | Corrigir data de abertura | Épico 1: Gestão de Estoque | Should Have | `#7` |
| **US08** | Editar alimento | Épico 1: Gestão de Estoque | Should Have | `#8` |
| **US09** | Remover alimento | Épico 1: Gestão de Estoque | Should Have | `#9` |
| **US10** | Visualizar alimentos por validade | Épico 2: Painel de Controle e Consultas | Must Have | `#10` |
| **US11** | Filtrar por estado | Épico 2: Painel de Controle e Consultas | Should Have | `#11` |
| **US12** | Pesquisar por nome | Épico 2: Painel de Controle e Consultas | Should Have | `#12` |
| **US13** | Filtrar por categoria | Épico 2: Painel de Controle e Consultas | Could Have | `#13` |
| **US14** | Registrar consumo ou descarte | Épico 3: Consumo e Descarte | Must Have | `#14` |
| **US15** | Consultar histórico | Épico 4: Histórico e Análise | Could Have | `#15` |
| **US16** | Visualizar desperdício | Épico 4: Histórico e Análise | Could Have | `#16` |
| **US17** | Cadastrar alimento por código de barras | Épico 1: Gestão de Estoque | Won't Have | `#21` |

---

## Épico 0 — Acesso e Autenticação (Issue Agrupadora #17)

### US01 — Criar conta (Issue #1)
**Prioridade MoSCoW:** Must Have  
**Regras Vinculadas:** RN17 (Isolamento de dados), RN18 (E-mail único), RN19 (Requisito de senha), RNF01 (Persistência), RNF06 (Segurança)

#### Declaração de Valor (INVEST)
**Como** visitante,  
**Quero** criar uma conta utilizando meu e-mail e uma senha,  
**Para** ter um espaço seguro e isolado onde possa gerenciar meus próprios alimentos.

#### Critérios de Aceitação (BDD / Gherkin)
* **Cenário 1: Cadastro realizado com sucesso (Caminho Feliz)**
  * **Dado** que o visitante está na página de cadastro,
  * **Quando** informa um e-mail válido não cadastrado anteriormente e uma senha com 8 ou mais caracteres,
  * **E** confirma o envio do formulário,
  * **Então** o sistema cria a nova conta com a senha criptografada via hash, autentica o usuário automaticamente,
  * **E** redireciona o usuário para o painel principal exibindo a lista vazia (sem alimentos de terceiros).
* **Cenário 2: Tentativa de cadastro com e-mail já existente (RN18)**
  * **Dado** que o e-mail `"usuario@teste.com"` já está cadastrado no sistema,
  * **Quando** um visitante tenta criar uma nova conta utilizando esse mesmo e-mail,
  * **Então** o sistema bloqueia o cadastro e exibe a mensagem: *"Este e-mail já está em uso."*.
* **Cenário 3: Validação de formato incorreto de e-mail**
  * **Dado** que o visitante preenche o campo de e-mail com formato inválido (ex.: sem `@` ou sem domínio),
  * **Quando** tenta submeter o formulário,
  * **Então** o sistema bloqueia o envio da requisição e exibe junto ao campo a mensagem: *"Informe um endereço de e-mail válido."*.
* **Cenário 4: Tentativa de cadastro com senha fraca (RN19)**
  * **Dado** que o visitante informa um e-mail válido,
  * **Quando** preenche uma senha com menos de 8 caracteres,
  * **Então** o sistema impede a submissão e sinaliza o campo com o alerta: *"A senha deve conter no mínimo 8 caracteres."*.
* **Cenário 5: Garantia de isolamento no primeiro acesso (RN17)**
  * **Dado** que um usuário concluiu seu cadastro com sucesso,
  * **Quando** acessa a tela de listagem de alimentos,
  * **Então** a lista deve conter zero alimentos ativos (estado vazio),
  * **E** nenhum alimento ou movimentação de outras contas pode ser retornado visualmente ou por meio de requisições diretas à API.

#### Checklist INVEST
* **I (Independente):** Não depende de nenhuma outra história; pode ser desenvolvida e testada como ponto inicial do fluxo.
* **N (Negociável):** Deixa aberta a escolha de implementação técnica para o mecanismo de sessão (JWT ou cookies de sessão) e biblioteca de hash.
* **V (Valor):** Estabelece a fronteira de privacidade e identificação do usuário.
* **E (Estimável):** Fluxo clássico de cadastro com persistência e hash.
* **S (Pequena):** Escopo delimitado a validação e persistência do usuário (1 a 2 dias).
* **T (Testável):** Casos de teste cobrem sucesso, e-mail duplicado, formato inválido, senha curta e isolamento inicial.

---

### US02 — Fazer login (Issue #2)
**Prioridade MoSCoW:** Must Have  
**Regras Vinculadas:** RN17 (Isolamento de dados), RNF06 (Segurança)

#### Declaração de Valor (INVEST)
**Como** usuário cadastrado,  
**Quero** autenticar-me com meu e-mail e senha,  
**Para** acessar meus alimentos cadastrados de qualquer dispositivo com segurança.

#### Critérios de Aceitação (BDD / Gherkin)
* **Cenário 1: Autenticação com credenciais válidas (Caminho Feliz)**
  * **Dado** que o usuário possui uma conta ativa,
  * **Quando** preenche seu e-mail e senha corretos na tela de login e submete,
  * **Então** o sistema inicializa a sessão autenticada,
  * **E** redireciona o usuário diretamente para a listagem dos seus alimentos.
* **Cenário 2: Tentativa de login com credenciais incorretas**
  * **Dado** que o usuário está na tela de login,
  * **Quando** informa uma senha incorreta ou um e-mail não existente,
  * **Então** o sistema rejeita o acesso (HTTP 401) e exibe a mensagem genérica: *"E-mail ou senha incorretos."*, sem revelar se o e-mail existe no banco.
* **Cenário 3: Campos obrigatórios em branco**
  * **Dado** que o usuário está na tela de login,
  * **Quando** tenta entrar deixando e-mail ou senha vazios,
  * **Então** o sistema bloqueia o envio e sinaliza visualmente os campos obrigatórios.
* **Cenário 4: Isolamento de dados pós-login (RN17)**
  * **Dado** que o usuário fez login com sucesso,
  * **Quando** visualiza a lista de alimentos,
  * **Então** o sistema exibe apenas os registros pertencentes à sua própria conta.
* **Cenário 5: Bloqueio de rotas protegidas sem autenticação**
  * **Dado** que um visitante não autenticado tenta acessar diretamente uma URL interna (ex.: `/alimentos`),
  * **Quando** a rota é requisitada,
  * **Então** o sistema bloqueia o acesso e redireciona a requisição para a tela de login.

#### Checklist INVEST
* **I (Independente):** Apresenta dependência conceitual da US01 para a jornada final, mas é testável isoladamente gerando registros de usuários prévios (fixtures/mocks) no banco de testes.
* **N (Negociável):** Permite negociar a estratégia de sessão (JWT em cookie HttpOnly ou session token).
* **V (Valor):** Garante a barreira de acesso e a segurança das informações privadas.
* **E (Estimável):** Validação de hash criptográfico e emissão de credencial/cookie de sessão.
* **S (Pequena):** Focada estritamente no formulário de autenticação e proteção de middleware (1 a 2 dias).
* **T (Testável):** Cenários cobrem credenciais válidas, inválidas, campos vazios, isolamento e rotas bloqueadas.

---

### US03 — Recuperar senha (Issue #3)
**Prioridade MoSCoW:** Should Have  
**Regras Vinculadas:** RN18 (E-mail único), RN19 (Requisito de senha), RNF06 (Segurança)

#### Declaração de Valor (INVEST)
**Como** usuário que esqueceu ou perdeu a senha,  
**Quero** solicitar a redefinição da minha credencial de acesso via e-mail,  
**Para** restabelecer meu acesso à despensa sem perder meus alimentos e históricos cadastrados.

#### Critérios de Aceitação (BDD / Gherkin)
* **Cenário 1: Solicitação de redefinição para conta cadastrada (Caminho Feliz)**
  * **Dado** que o usuário está na tela de recuperação de senha,
  * **Quando** informa o endereço de e-mail de uma conta existente e aciona a opção de envio,
  * **Então** o sistema gera um token temporário de uso único com prazo de expiração (até 15 minutos),
  * **E** envia o link de redefinição para o e-mail informado,
  * **E** exibe a mensagem neutra: *"Se o e-mail informado estiver cadastrado, você receberá as instruções em instantes."*.
* **Cenário 2: Solicitação para e-mail não cadastrado (Prevenção de enumeração de contas)**
  * **Dado** que o visitante está na tela de recuperação de senha,
  * **Quando** submete um e-mail inexistente no banco de dados,
  * **Então** o sistema não gera token nem envia mensagem,
  * **E** exibe exatamente a mesma mensagem neutra: *"Se o e-mail informado estiver cadastrado, você receberá as instruções em instantes."*, sem confirmar se a conta existe ou não.
* **Cenário 3: Redefinição efetiva com token válido**
  * **Dado** que o usuário acessa o link com um token de redefinição válido e dentro do prazo,
  * **Quando** digita uma nova senha com no mínimo 8 caracteres (RN19) e confirma,
  * **Então** o sistema atualiza o hash da senha no banco de dados, invalida imediatamente o token utilizado (uso único) e redireciona para a tela de login com confirmação de sucesso.
* **Cenário 4: Tentativa de uso de token expirado ou já utilizado**
  * **Dado** que o usuário tenta utilizar um link cujo token já expirou ou já foi consumido,
  * **Quando** carrega a página de redefinição ou tenta enviar a nova senha,
  * **Então** o sistema rejeita a operação e exibe o aviso: *"Este link de redefinição expirou ou já foi utilizado. Solicite um novo acesso."*.
* **Cenário 5: Tentativa de cadastro de nova senha com menos de 8 caracteres (RN19)**
  * **Dado** que o usuário está na tela de definição de nova senha via link válido,
  * **Quando** digita uma senha com menos de 8 caracteres e tenta salvar,
  * **Então** o sistema impede a submissão e exibe o alerta: *"A senha deve conter no mínimo 8 caracteres."*.

#### Checklist INVEST
* **I (Independente):** Apresenta dependência conceitual da US01, mas pode ser desenvolvida e testada simulando o disparo de token/link via mock de serviço de e-mail.
* **N (Negociável):** Deixa aberta a escolha técnica da biblioteca/provedor de e-mail transacional e do tempo exato de TTL do token.
* **V (Valor):** Evita o abandono da plataforma e a perda do inventário em caso de esquecimento de credenciais.
* **E (Estimável):** Rotina padronizada de geração de token efêmero com TTL e atualização de registro.
* **S (Pequena):** Escopo dividido em formulário de solicitação e formulário de redefinição (2 dias).
* **T (Testável):** Cenários cobrem token válido, token expirado/reutilizado, e-mail inexistente e senhas fora da RN19.

---

### US04 — Fazer logout (Issue #4)
**Prioridade MoSCoW:** Should Have  
**Regras Vinculadas:** RN17 (Isolamento de dados), RNF06 (Segurança)

#### Declaração de Valor (INVEST)
**Como** usuário autenticado,  
**Quero** encerrar minha sessão ativa explicitamente,  
**Para** impedir que terceiros visualizem ou alterem meus alimentos em computadores compartilhados.

#### Critérios de Aceitação (BDD / Gherkin)
* **Cenário 1: Encerramento de sessão com sucesso (Caminho Feliz)**
  * **Dado** que o usuário está autenticado e navegando em qualquer tela do sistema,
  * **Quando** aciona a opção "Sair" (Logout),
  * **Então** o sistema revoga/invalida o token ou cookie de sessão atual,
  * **E** redireciona o usuário imediatamente para a tela de login.
* **Cenário 2: Tentativa de acesso a telas protegidas após o logout**
  * **Dado** que o usuário realizou logout com sucesso,
  * **Quando** tenta navegar para uma rota interna utilizando o botão "Voltar" do navegador ou digitando a URL diretamente,
  * **Então** o sistema bloqueia a exibição dos dados e redireciona o usuário para a tela de login exigindo nova autenticação.
* **Cenário 3: Preservação integral dos dados após logout**
  * **Dado** que o usuário possuía alimentos, movimentações e histórico cadastrados,
  * **Quando** efetua o logout e posteriormente realiza login novamente com as mesmas credenciais,
  * **Então** todos os dados previamente cadastrados permanecem intactos e disponíveis para consulta.

#### Checklist INVEST
* **I (Independente):** Apresenta dependência conceitual da autenticação (US02), mas pode ser implementada e testada isoladamente por meio de mocks de sessão ativa e testes de revogação de tokens.
* **N (Negociável):** Deixa aberta a decisão técnica de implementar blacklist/revogação de tokens no backend ou remoção e expiração do cookie `HttpOnly` no cliente.
* **V (Valor):** Garante a privacidade física e digital do usuário em dispositivos compartilhados.
* **E (Estimável):** Implementação direta de invalidação de cookie/token (menos de 1 dia).
* **S (Pequena):** Funcionalidade atômica de encerramento de sessão.
* **T (Testável):** Cenários claros cobrindo invalidação do token, redirecionamento para o login, bloqueio do botão "Voltar" e preservação dos dados.

---

## Épico 1 — Gestão de Estoque (Issue Agrupadora #18)

### US05 — Cadastrar alimento (Issue #5)
**Prioridade MoSCoW:** Must Have  
**Regras Vinculadas:** RN01, RN02, RN03, RN05, RN06, RN07, RN10, RN13, RN14, RN16, RN17, RI01 a RI04, RNF01, RNF04, RNF05, RNF06

#### Declaração de Valor (INVEST)
**Como** usuário autenticado,  
**Quero** cadastrar um alimento informando seus dados de validade, estado e categoria,  
**Para** acompanhar sua validade e quantidade sob controle do sistema e evitar desperdícios.

#### Critérios de Aceitação (BDD / Gherkin)
* **Cenário 1: Cadastro padrão de alimento fechado com quantidade omitida (Caminho Feliz)**
  * **Dado** que o usuário preenche o nome *"Leite Integral"*, seleciona a categoria *"Laticínios"*,
  * **E** informa uma validade original futura, mantendo o estado *"Fechado"* e deixando a quantidade em branco,
  * **Quando** confirma o cadastro,
  * **Então** o sistema assume quantidade igual a 1 unidade (RI03),
  * **E** define a data limite efetiva igual à validade original (RN01, RN03),
  * **E** grava o alimento sem data de abertura associado à conta autenticada (RN17),
  * **E** exibe mensagem de sucesso redirecionando para a listagem.
* **Cenário 2: Cadastro de alimento já aberto com cálculo pós-abertura (RN02, RN03, RN14)**
  * **Dado** que o usuário preenche a validade original para daqui a 10 dias e seleciona a categoria *"Carne"* (prazo padrão sugerido de 2 dias),
  * **Quando** marca a opção *"Já está aberto"*, informa a data de abertura igual à data de referência do sistema (RN16) e confirma o prazo sugerido de 2 dias,
  * **Então** o sistema calcula a data limite pós-abertura (data de referência do sistema + 2 dias),
  * **E** define a data limite efetiva como a menor data entre a original e a pós-abertura (RN03),
  * **E** salva o item no estado *"Aberto"*.
* **Cenário 3: Tentativa de cadastro com data de abertura futura (RN10, RN16)**
  * **Dado** que o usuário marca o alimento como aberto,
  * **Quando** preenche uma data de abertura posterior à data de referência do sistema (RN16),
  * **Então** o sistema impede o salvamento e exibe o aviso: *"A data de abertura não pode ser uma data futura."*.
* **Cenário 4: Cadastro de alimento com validade original já vencida**
  * **Dado** que o usuário informa uma data de validade original anterior à data de referência do sistema (RN16),
  * **Quando** tenta submeter o formulário,
  * **Então** o sistema exibe um alerta de confirmação: *"A data informada já está vencida. Deseja cadastrar este alimento mesmo assim?"*,
  * **E** só conclui a gravação se o usuário confirmar explicitamente.
* **Cenário 5: Bloqueio de submissão sem campos obrigatórios (RI01, RI02)**
  * **Dado** que o usuário está no formulário de cadastro,
  * **Quando** tenta salvar com nome vazio ou sem preencher a data de validade original,
  * **Então** o sistema impede o envio e sinaliza visualmente a obrigatoriedade dos respectivos campos.
* **Cenário 6: Validação de quantidade inválida (RI03, RI04)**
  * **Dado** que o usuário preenche os campos do formulário,
  * **Quando** informa uma quantidade menor que 1 (ex.: 0 ou número negativo) ou valor decimal,
  * **Então** o sistema bloqueia o salvamento e exibe a mensagem: *"A quantidade deve ser um número inteiro igual ou superior a 1."*.

#### Checklist INVEST
* **I (Independente):** Apresenta dependência conceitual da autenticação (US01/US02), mas é desenvolvível e testável de forma isolada com mocks de sessão e injeção direta de conta.
* **N (Negociável):** Deixa aberta a escolha de interface para seleção de categoria e o formato visual do alerta para itens já vencidos (modal ou banner de confirmação).
* **V (Valor):** Ponto de entrada primordial do estoque de alimentos, viabilizando todo o controle e prevenção de perdas.
* **E (Estimável):** Regras matemáticas claras e catálogo de categorias pré-estabelecido.
* **S (Pequena):** Focada estritamente na criação inicial do registro do alimento (2 a 3 dias).
* **T (Testável):** Cenários em Gherkin cobrem fluxo fechado, aberto, datas passadas e futuras, campos obrigatórios e integridade de tipos numéricos.

---

### US06 — Registrar abertura (Issue #6)
**Prioridade MoSCoW:** Must Have  
**Regras Vinculadas:** RN02, RN03, RN05, RN07, RN08, RN10, RN14, RN16, RN17, RI03, RNF01, RNF04, RNF05, RNF06

#### Declaração de Valor (INVEST)
**Como** usuário autenticado,  
**Quero** registrar a abertura de uma ou mais unidades de um alimento fechado,  
**Para** iniciar o controle do prazo de consumo pós-abertura e consumir o alimento antes que estrague.

#### Critérios de Aceitação (BDD / Gherkin)
* **Cenário 1: Abertura total de unidades (Caminho Feliz)**
  * **Dado** que o usuário possui um grupo com 2 unidades fechadas de *"Molho de Tomate"*,
  * **Quando** aciona a ação de registrar abertura, informa quantidade 2, data de abertura igual à data de referência do sistema (RN16) e confirma o prazo sugerido pela categoria,
  * **Então** o sistema calcula a nova data limite efetiva (RN03) e apresenta o resumo antes da confirmação,
  * **E** após a confirmação, atualiza o grupo inteiro para o estado *"Aberto"*, sem permitir reversão para *"Fechado"*.
* **Cenário 2: Abertura parcial com divisão de grupo/lote (RN08)**
  * **Dado** que o usuário possui um grupo com 3 unidades fechadas de *"Leite Integral"*,
  * **Quando** informa que abriu apenas 1 unidade e confirma a operação após visualizar o cálculo da nova data limite,
  * **Então** o sistema mantém 2 unidades no grupo original no estado *"Fechado"*,
  * **E** cria um novo grupo contendo 1 unidade no estado *"Aberto"* com a respectiva data de abertura e nova data limite calculada.
* **Cenário 3: Tentativa de abrir quantidade superior à disponível**
  * **Dado** que o grupo possui 2 unidades fechadas,
  * **Quando** o usuário tenta registrar a abertura informando 3 unidades,
  * **Então** o sistema bloqueia a submissão com a mensagem: *"A quantidade informada não pode ser superior à quantidade disponível (2 unidades)."*.
* **Cenário 4: Tentativa de registrar data de abertura futura (RN10, RN16)**
  * **Dado** que o usuário está no formulário de abertura de unidades,
  * **Quando** seleciona uma data de abertura posterior à data de referência do sistema (RN16),
  * **Então** o sistema impede a confirmação e exibe o aviso: *"A data de abertura não pode ser uma data futura."*.
* **Cenário 5: Bloqueio para alimento já aberto (RN05)**
  * **Dado** que um grupo de alimentos já se encontra no estado *"Aberto"*,
  * **Quando** o usuário visualiza o alimento no painel ou tenta acessar a ação de abertura,
  * **Então** a opção de registrar abertura não é exibida, e qualquer tentativa direta via endpoint é rejeitada.

#### Checklist INVEST
* **I (Independente):** Apresenta dependência conceitual da existência prévia de um alimento fechado (US05), mas é testável isoladamente via fixtures de grupos fechados no banco de dados.
* **N (Negociável):** Apresentação do resumo prévio do cálculo antes da confirmação (modal ou popover).
* **V (Valor):** Essencial para a prevenção de perdas, já que grande parte dos alimentos perece mais rápido após o rompimento do lacre.
* **E (Estimável):** Lógica matemática e divisão de grupos bem delimitadas pelas regras de domínio RN07 e RN08.
* **S (Pequena):** Escopo focado na transição de estado e divisão de quantidade (2 dias).
* **T (Testável):** Cenários cobrem abertura total, abertura parcial com partição de grupo, limites de quantidade, datas futuras e bloqueio de item já aberto.

---

### US07 — Corrigir data de abertura (Issue #7)
**Prioridade MoSCoW:** Should Have  
**Regras Vinculadas:** RN02, RN03, RN04, RN05, RN10, RN16, RN17, RN20, RNF01, RNF05, RNF06

#### Declaração de Valor (INVEST)
**Como** usuário autenticado,  
**Quero** corrigir a data de abertura de um alimento aberto,  
**Para** manter o cálculo da data limite de consumo preciso caso tenha informado a data errada anteriormente.

#### Critérios de Aceitação (BDD / Gherkin)
* **Cenário 1: Correção bem-sucedida da data de abertura (Caminho Feliz)**
  * **Dado** que o usuário possui um alimento no estado *"Aberto"* pertencente à sua conta,
  * **Quando** informa uma nova data de abertura válida (igual ou anterior à data de referência do sistema — RN16),
  * **E** confirma a alteração,
  * **Então** o sistema recalcula a data limite efetiva com base no prazo pós-abertura cadastrado (RN02, RN03),
  * **E** atualiza a situação da validade do item (RN04),
  * **E** mantém o alimento no estado *"Aberto"*,
  * **E** preserva integralmente quaisquer movimentações de baixa preexistentes no histórico (RN20).
* **Cenário 2: Tentativa de informar data de abertura futura (RN10, RN16)**
  * **Dado** que o usuário está no formulário de correção da data de abertura,
  * **Quando** informa uma data posterior à data de referência do sistema (RN16),
  * **Então** o sistema bloqueia a submissão exibindo a mensagem: *"A data de abertura não pode ser uma data futura."*.
* **Cenário 3: Tentativa de acionar a funcionalidade para alimento fechado (RN05)**
  * **Dado** que o alimento encontra-se no estado *"Fechado"*,
  * **Quando** o usuário visualiza as opções do item ou tenta disparar a requisição de correção de abertura,
  * **Então** a opção de corrigir data de abertura não fica disponível, e o sistema rejeita a operação com erro de validação.

#### Checklist INVEST
* **I (Independente):** Apresenta dependência conceitual da existência de um alimento aberto (US06), mas pode ser implementada e testada isoladamente por meio de mocks de itens abertos no banco de dados.
* **N (Negociável):** Deixa aberta a escolha de interface (edição inline na listagem ou via modal de edição rápida).
* **V (Valor):** Garante a confiabilidade dos dados e alertas quando o usuário comete um engano de digitação ao abrir um produto.
* **E (Estimável):** Atualização de um único campo de data seguido de chamada ao serviço determinístico de cálculo.
* **S (Pequena):** Esforço reduzido e escopo cirúrgico (1 dia).
* **T (Testável):** Cenários em Gherkin cobrem recálculo de data, bloqueio de datas futuras, restrição de estado do alimento e integridade do histórico.

---

### US08 — Editar alimento (Issue #8)
**Prioridade MoSCoW:** Should Have  
**Regras Vinculadas:** RN01, RN02, RN03, RN04, RN05, RN06, RN10, RN15, RN16, RN17, RN20, RN21, RI01 a RI04, RNF01, RNF04, RNF05, RNF06

#### Declaração de Valor (INVEST)
**Como** usuário autenticado,  
**Quero** editar as informações cadastradas de um alimento,  
**Para** retificar dados incorretos e manter o inventário e as validades sempre atualizados.

#### Critérios de Aceitação (BDD / Gherkin)
* **Cenário 1: Edição bem-sucedida de dados gerais sem movimentação prévia (Caminho Feliz)**
  * **Dado** que o usuário possui um grupo de alimentos sem nenhuma movimentação registrada,
  * **Quando** altera o nome, categoria, validade original e ajusta a quantidade disponível para um número inteiro maior ou igual a 1,
  * **E** salva as modificações,
  * **Então** o sistema persiste os novos dados, recalcula a data limite efetiva e a situação da validade (RN03, RN04),
  * **E** não realiza fusão automática com nenhum outro grupo existente na conta (RN21).
* **Cenário 2: Bloqueio de alteração direta de quantidade quando há movimentações (RN15)**
  * **Dado** que o grupo de alimentos já possui pelo menos uma movimentação registrada de consumo ou descarte,
  * **Quando** o usuário abre a tela de edição do alimento,
  * **Então** o campo de quantidade deve permanecer desabilitado para edição direta,
  * **E** qualquer tentativa de requisição com alteração de quantidade é bloqueada pelo backend com a mensagem: *"A quantidade não pode ser alterada diretamente após o registro de movimentações. Utilize a opção de baixa."*.
* **Cenário 3: Impossibilidade de reversão de estado Aberto para Fechado (RN05)**
  * **Dado** que o alimento encontra-se no estado *"Aberto"*,
  * **Quando** o usuário está no formulário de edição,
  * **Então** o campo de estado não permite a seleção da opção *"Fechado"*,
  * **E** qualquer tentativa de payload com reversão para fechado é rejeitada pela API com erro de validação.
* **Cenário 4: Edição de dados de pós-abertura com data futura (RN10, RN16)**
  * **Dado** que o usuário está editando um alimento aberto,
  * **Quando** altera a data de abertura para uma data posterior à data de referência do sistema (RN16),
  * **Então** o sistema bloqueia o salvamento e exibe a mensagem de validação: *"A data de abertura não pode ser uma data futura."*.
* **Cenário 5: Tentativa de salvar edição violando campos obrigatórios (RI01 a RI04)**
  * **Dado** que o usuário está no formulário de edição,
  * **Quando** limpa o campo de nome deixando-o vazio ou remove a data de validade original e tenta salvar,
  * **Então** o sistema impede a persistência e sinaliza os campos com erro reaplicando as regras do cadastro (RI01 a RI04).

#### Checklist INVEST
* **I (Independente):** Apresenta dependência conceitual da existência de alimentos prévios (US05), mas pode ser desenvolvida e testada de forma isolada por meio de mocks de grupos com e sem histórico de movimentações.
* **N (Negociável):** Deixa aberta a escolha de interface sobre edição por modal ou página dedicada, assim como o layout dos campos bloqueados.
* **V (Valor):** Permite correções cadastrais sem forçar o usuário a excluir ou descartar itens inteiros desnecessariamente.
* **E (Estimável):** Escopo completo e delimitado pelas travas de domínio (RN15, RN20 e RN21), sem incertezas de fluxo.
* **S (Pequena):** Focada estritamente nas regras de validação de formulário de atualização e bloqueio condicional de campos (2 dias).
* **T (Testável):** Cenários em Gherkin cobrem fluxo com e sem movimentação prévia, bloqueio de reversão de estado, recálculo de prazo e integridade de identificação.

---

### US09 — Remover alimento (Issue #9)
**Prioridade MoSCoW:** Should Have  
**Regras Vinculadas:** RN06, RN17, RN20, RNF01, RNF05, RNF06

#### Declaração de Valor (INVEST)
**Como** usuário autenticado,  
**Quero** remover um alimento que cadastrei por engano,  
**Para** corrigir o erro de cadastro sem poluir meu controle nem gerar dados falsos de consumo ou descarte.

#### Critérios de Aceitação (BDD / Gherkin)
* **Cenário 1: Solicitação de remoção de alimento sem movimentações (Caminho Feliz)**
  * **Dado** que o usuário seleciona um grupo de alimentos pertencente à sua conta que não possui nenhuma movimentação registrada de consumo ou descarte (RN20),
  * **Quando** aciona a ação de remover alimento,
  * **Então** o sistema exibe uma caixa de diálogo solicitando confirmação explícita da exclusão.
* **Cenário 2: Confirmação da remoção e atualização da listagem**
  * **Dado** que o diálogo de confirmação de remoção está sendo exibido,
  * **Quando** o usuário confirma a exclusão,
  * **Então** o sistema remove o registro do grupo do banco de dados,
  * **E** deixa de exibir o alimento na lista de alimentos ativos,
  * **E** exibe uma mensagem de sucesso confirmando a remoção.
* **Cenário 3: Cancelamento da remoção**
  * **Dado** que o diálogo de confirmação de remoção está sendo exibido,
  * **Quando** o usuário clica em cancelar ou fecha a caixa de diálogo,
  * **Então** a operação é abortada e o alimento permanece inalterado na lista com todas as suas informações intactas.
* **Cenário 4: Bloqueio de remoção para alimento com movimentações vinculadas (RN20)**
  * **Dado** que o grupo de alimentos possui pelo menos 1 registro histórico de consumo ou descarte,
  * **Quando** o usuário visualiza as opções do alimento ou tenta enviar uma requisição direta de remoção,
  * **Então** a opção de remoção direta não é exibida na interface,
  * **E** o backend rejeita qualquer requisição de exclusão (HTTP 422/400), orientando que a quantidade deve ser encerrada por meio da funcionalidade de baixa (US14).
* **Cenário 5: Preservação de outros grupos do mesmo alimento (RN06, RN20)**
  * **Dado** que existem dois grupos distintos do mesmo alimento (ex.: 1 grupo fechado sem histórico e 1 grupo aberto com movimentações prévias),
  * **Quando** o usuário remove com sucesso o grupo fechado sem movimentações,
  * **Então** o grupo aberto e todo o histórico prévio de consumo/descarte continuam existindo e íntegros no sistema.

#### Checklist INVEST
* **I (Independente):** Apresenta dependência conceitual da existência de um alimento (US05), mas pode ser desenvolvida e testada de forma isolada utilizando mocks de grupos com e sem movimentações vinculadas.
* **N (Negociável):** Deixa livre a definição do design visual da confirmação de remoção (modal, bottom sheet ou alerta em tela).
* **V (Valor):** Permite sanar enganos de digitação/cadastro imediato sem distorcer as métricas analíticas de desperdício do usuário.
* **E (Estimável):** Regras de validação estritas e determinísticas (checagem booleana de existência de movimentações antes do `DELETE`).
* **S (Pequena):** Funcionalidade direta de remoção com validação condicional simples (1 dia).
* **T (Testável):** Cenários em Gherkin cobrem exclusão com confirmação, cancelamento, rejeição quando há histórico prévio e garantia de isolamento de lote.

---

### US17 — Cadastrar alimento por código de barras (Issue #21)
**Prioridade MoSCoW:** Won't Have (Escopo Futuro — V2)  
**Regras Vinculadas:** RN06, RN13, RN17, RI01, RI03, RNF04, RNF06

> **Justificativa de Escopo:** Funcionalidade mapeada para versões futuras (V2). Para a entrega atual do MVP do Valimenta, o foco é a precisão do ciclo de vida, das regras de cálculo de validade (RN01–RN03) e do isolamento multiusuário (RN17). O cadastro manual via US05 atende integralmente ao fluxo funcional básico sem introduzir dependências de APIs externas de catálogo de produtos (ex.: Cosmos/Bluesoft) ou permissões de hardware no navegador.

#### Declaração de Valor (INVEST)
**Como** usuário autenticado,  
**Quero** escanear o código de barras da embalagem utilizando a câmera do dispositivo,  
**Para** autopreencher os dados de nome e categoria do alimento e agilizar o cadastro.

#### Critérios de Aceitação (BDD / Gherkin)
* **Cenário 1: Leitura bem-sucedida de código existente na base de dados**
  * **Dado** que o usuário está na tela de cadastro de alimentos e aciona o leitor de código de barras,
  * **Quando** aponta a câmera para um código de barras comercial válido (EAN-13) e o código é identificado com sucesso em uma base externa de produtos,
  * **Então** o sistema preenche automaticamente os campos de nome e categoria correspondente (RN06, RN13),
  * **E** mantém os campos de validade original e estado para preenchimento manual do usuário.
* **Cenário 2: Código de barras não localizado na base de dados**
  * **Dado** que a câmera realizou a leitura do código de barras,
  * **Quando** o código não possui correspondência na base consultada,
  * **Então** o sistema exibe a mensagem informativa: *"Produto não encontrado na base. Preencha os dados manualmente."*,
  * **E** libera os campos do formulário para digitação padrão sem travar o cadastro.
* **Cenário 3: Câmera indisponível ou permissão negada pelo navegador**
  * **Dado** que o usuário tenta abrir o leitor de código de barras,
  * **Quando** o dispositivo não possui câmera ou o usuário nega a permissão de acesso,
  * **Então** o sistema exibe aviso sobre a indisponibilidade do recurso e direciona o usuário diretamente para o formulário de cadastro manual convencional.

#### Checklist INVEST
* **I (Independente):** Funcionalidade desacoplada do fluxo central; sua exclusão da release atual não impacta nenhuma das demais histórias (US01 a US16).
* **N (Negociável):** Permite negociar futuramente o fornecedor da API de catálogo de produtos ou o uso de bibliotecas de leitura direta no cliente (ex.: QuaggaJS ou Html5-QRCode).
* **V (Valor):** Agrega conveniência e redução de tempo de digitação no fluxo de entrada de itens.
* **E (Estimável):** Complexidade de implementação média/alta devido a integrações com serviços terceiros e variações de compatibilidade de hardware/câmera.
* **S (Pequena):** Pode ser dividida futuramente entre captura do código via scanner e integração com base de dados externa de produtos.
* **T (Testável):** Cenários em Gherkin cobrem leitura com sucesso, código desconhecido, recusa de permissão de câmera e fallback para digitação manual.

---

## Épico 2 — Painel de Controle e Consultas (Issue Agrupadora #19)

### US10 — Visualizar alimentos por validade (Issue #10)
**Prioridade MoSCoW:** Must Have  
**Regras Vinculadas:** RN04, RN11, RN12, RN16, RN17, RNF02, RNF03, RNF04, RNF06

#### Declaração de Valor (INVEST)
**Como** usuário autenticado,  
**Quero** visualizar meus alimentos organizados pela proximidade da data limite,  
**Para** saber exatamente quais itens vencem primeiro e priorizar o consumo antes que estraguem.

#### Critérios de Aceitação (BDD / Gherkin)
* **Cenário 1: Listagem com ordenação cronológica e desempate alfabético (Caminho Feliz — RN11)**
  * **Dado** que o usuário autenticado possui múltiplos alimentos ativos cadastrados,
  * **Quando** acessa a tela principal de listagem de alimentos,
  * **Então** o sistema exibe os itens ordenados da menor para a maior data limite efetiva,
  * **E** caso dois ou mais alimentos possuam a mesma data limite, aplica a ordenação em ordem alfabética ascendente pelo nome como critério de desempate.
* **Cenário 2: Sinalização visual e acessível de situação e alertas (RN04, RN12, RN16, RNF03)**
  * **Dado** que existem alimentos com diferentes datas de validade na lista,
  * **Quando** a listagem é calculada com base na data de referência do sistema obtida no servidor (RN16) e renderizada,
  * **Então** cada item exibe sua situação (*Normal*, *Próximo do vencimento*, *Vence hoje* ou *Vencido*) por meio de texto descritivo e ícone representativo, sem depender exclusivamente de cores (RNF03),
  * **E** alimentos que vencem hoje ou entre 1 e 3 dias recebem sinalização visual de alerta de prioridade (RN12),
  * **E** alimentos vencidos permanecem visíveis na lista enquanto possuírem quantidade maior que zero.
* **Cenário 3: Exibição de estado vazio quando não há itens**
  * **Dado** que o usuário não possui nenhum alimento ativo cadastrado em sua conta,
  * **Quando** acessa a tela principal,
  * **Então** o sistema exibe uma mensagem contextual amigável informando que a lista está vazia (ex.: *"Nenhum alimento cadastrado no momento."*),
  * **E** essa mensagem é visualmente distinta de qualquer alerta de erro do sistema, sugerindo o cadastro do primeiro item.
* **Cenário 4: Isolamento estrito de dados entre contas (RN17)**
  * **Dado** que existem alimentos cadastrados por outros usuários na base de dados,
  * **Quando** o usuário visualiza a lista,
  * **Então** apenas os itens associados ao identificador da sua própria conta são retornados,
  * **E** nenhuma informação de alimentos de terceiros fica visível ou acessível por inspeção de requisições.

#### Checklist INVEST
* **I (Independente):** Apresenta dependência conceitual da existência de alimentos (US05), mas pode ser desenvolvida e testada de forma isolada utilizando fixtures ou mocks de listas no banco de testes.
* **N (Negociável):** Deixa aberta a escolha de interface para o formato de exibição dos cartões/tabela e o estilo gráfico dos ícones e tags de alerta.
* **V (Valor):** É a tela central de consulta do sistema, entregando o valor imediato de prevenir perdas por esquecimento.
* **E (Estimável):** Lógica de ordenação (sort por data e nome) e mapeamento condicional de tags com complexidade algorítmica clara e bem definida.
* **S (Pequena):** Focada estritamente na consulta, ordenação e exibição dos dados já persistidos (2 dias).
* **T (Testável):** Cenários em Gherkin cobrem ordenação cronológica, desempate alfabético, renderização de badges/ícones de alerta, tratamento de lista vazia e isolamento de tenant.

---

### US11 — Filtrar por estado (Issue #11)
**Prioridade MoSCoW:** Should Have  
**Regras Vinculadas:** RN05, RN11, RN17, RNF02, RNF04, RNF06

#### Declaração de Valor (INVEST)
**Como** usuário autenticado,  
**Quero** filtrar meus alimentos pelo estado (Todos, Aberto ou Fechado),  
**Para** focar rapidamente nos itens que já foram abertos e precisam de atenção imediata ou checar os fechados no estoque.

#### Critérios de Aceitação (BDD / Gherkin)
* **Cenário 1: Filtrar alimentos por estado "Aberto" (Caminho Feliz)**
  * **Dado** que o usuário possui itens cadastrados nos estados *"Aberto"* e *"Fechado"*,
  * **Quando** seleciona a opção de filtro *"Aberto"*,
  * **Então** a listagem é atualizada para exibir unicamente os alimentos que possuem o estado igual a *"Aberto"*,
  * **E** mantém a ordenação dos itens por proximidade de validade conforme RN11.
* **Cenário 2: Filtrar alimentos por estado "Fechado"**
  * **Dado** que o usuário possui itens em múltiplos estados na lista,
  * **Quando** seleciona a opção de filtro *"Fechado"*,
  * **Então** o sistema exibe apenas os alimentos no estado *"Fechado"*, mantendo rigorosamente a ordenação prioritária por data limite (RN11).
* **Cenário 3: Restaurar visualização padrão com a opção "Todos"**
  * **Dado** que um filtro de estado (*"Aberto"* ou *"Fechado"*) está aplicado na tela,
  * **Quando** o usuário seleciona a opção *"Todos"*,
  * **Então** a listagem volta a apresentar todos os alimentos ativos da conta, independentemente do estado.
* **Cenário 4: Nenhum alimento corresponde ao estado filtrado**
  * **Dado** que o usuário possui apenas alimentos fechados cadastrados,
  * **Quando** seleciona o filtro *"Aberto"*,
  * **Então** o sistema exibe uma mensagem contextual neutra informando que não há alimentos abertos no momento, visualmente distinta de falha técnica ou erro de conexão.

#### Checklist INVEST
* **I (Independente):** Apresenta dependência conceitual da tela de consulta de alimentos (US10), mas pode ser desenvolvida e testada de forma isolada tanto no frontend quanto no backend (`?estado=ABERTO`).
* **N (Negociável):** Deixa aberta a escolha de interface para a seleção (abas/tabs, botões de alternância ou select dropdown).
* **V (Valor):** Agiliza a tomada de decisão do usuário no dia a dia, permitindo priorizar o consumo de itens perecíveis já abertos.
* **E (Estimável):** Operação simples de predicado de filtragem condicional sobre a listagem principal, com esforço de desenvolvimento bem conhecido.
* **S (Pequena):** Envolve apenas a aplicação de parâmetro de filtro e tratamento de mensagem de lista vazia (1 dia).
* **T (Testável):** Cenários em Gherkin cobrem seleção de cada estado, retorno a "Todos", preservação de ordenação e tratamento de ausência de itens para o filtro selecionado.

---

### US12 — Pesquisar por nome (Issue #12)
**Prioridade MoSCoW:** Should Have  
**Regras Vinculadas:** RN06, RN11, RN17, RNF02, RNF04, RNF06

#### Declaração de Valor (INVEST)
**Como** usuário autenticado,  
**Quero** pesquisar alimentos pelo nome com correspondência flexível,  
**Para** localizar rapidamente um item específico na despensa sem precisar rolar por toda a lista.

#### Critérios de Aceitação (BDD / Gherkin)
* **Cenário 1: Pesquisa por correspondência parcial e case-insensitive (Caminho Feliz — RN06)**
  * **Dado** que o usuário possui cadastrados os alimentos *"Leite Desnatado"* e *"Queijo Minas"*,
  * **Quando** digita no campo de busca o termo *"lei"* ou *"LEITE"*,
  * **Então** o sistema filtra a visualização para exibir apenas *"Leite Desnatado"*,
  * **E** mantém a ordenação prioritária pela proximidade da data limite (RN11).
* **Cenário 2: Combinação da busca por nome com outros filtros**
  * **Dado** que o usuário já aplicou o filtro de estado *"Aberto"* (US11) ou filtro de categoria (US13),
  * **Quando** insere um termo de busca no campo de pesquisa,
  * **Então** o sistema aplica as condições cumulativamente (`E` lógico) e exibe apenas os alimentos que correspondam simultaneamente ao nome buscado e aos filtros ativos.
* **Cenário 3: Nenhum resultado correspondente**
  * **Dado** que o usuário está na tela de consulta de alimentos,
  * **Quando** pesquisa por um termo inexistente (ex.: *"Iogurte de Morango"*),
  * **Então** o sistema exibe a mensagem informativa: *"Nenhum alimento encontrado para o termo pesquisado."*, visualmente distinta de alertas de falha técnica ou erro no sistema.
* **Cenário 4: Limpeza do campo de pesquisa**
  * **Dado** que uma busca com resultados filtrados está ativa na tela,
  * **Quando** o usuário apaga o texto digitado ou aciona o botão de limpar pesquisa,
  * **Então** a tela restaura a exibição da lista completa de alimentos ativos (respeitando eventuais filtros de estado/categoria ainda ativos).
* **Cenário 5: Isolamento de dados na busca (RN17)**
  * **Dado** que existem alimentos de outros usuários com nomes semelhantes no banco de dados,
  * **Quando** o usuário autenticado realiza uma pesquisa,
  * **Então** o sistema busca unicamente entre os alimentos da sua própria conta, sem retornar ou inferir dados de terceiros.

#### Checklist INVEST
* **I (Independente):** Apresenta dependência conceitual da consulta principal (US10), mas pode ser desenvolvida e testada de forma isolada tanto no frontend (filtro sobre a lista já carregada) quanto no backend (`WHERE LOWER(nome) LIKE %termo% AND conta_id = ?`).
* **N (Negociável):** Deixa aberta a escolha de implementação de filtragem instantânea durante a digitação (*debounce*) ou acionamento via tecla Enter/botão de busca.
* **V (Valor):** Proporciona localização imediata de itens em despensas com dezenas ou centenas de alimentos cadastrados.
* **E (Estimável):** Lógica simples de correspondência textual normalizada (*trim* e *case-insensitive*) com baixa complexidade técnica.
* **S (Pequena):** Escopo restrito ao campo de entrada de busca, combinação com predicados ativos e estado vazio (1 dia).
* **T (Testável):** Cenários em Gherkin cobrem correspondência parcial/insensível a caixa, combinação com filtros, busca sem resultados, limpeza de campo e isolamento entre contas.

---

### US13 — Filtrar por categoria (Issue #13)
**Prioridade MoSCoW:** Could Have  
**Regras Vinculadas:** RN11, RN13, RN17, RNF02, RNF04, RNF06

#### Declaração de Valor (INVEST)
**Como** usuário autenticado,  
**Quero** filtrar meus alimentos por categoria,  
**Para** localizar com agilidade os itens de um mesmo grupo alimentar e planejar o preparo das refeições.

#### Critérios de Aceitação (BDD / Gherkin)
* **Cenário 1: Filtrar alimentos por categoria específica (Caminho Feliz — RN13)**
  * **Dado** que o usuário possui alimentos de diferentes categorias cadastrados,
  * **Quando** seleciona a categoria *"Laticínios"* no seletor de filtros,
  * **Então** a visualização é atualizada para exibir unicamente os alimentos dessa categoria, mantendo a ordenação cronológica por proximidade da data limite (RN11).
* **Cenário 2: Restaurar visualização com a opção "Todas as categorias"**
  * **Dado** que o usuário está visualizando a listagem filtrada por uma categoria específica,
  * **Quando** seleciona a opção *"Todas as categorias"*,
  * **Então** o sistema restaura a exibição de todos os alimentos cadastrados, independentemente da categoria associada.
* **Cenário 3: Combinação de filtros (Categoria, Estado e Pesquisa)**
  * **Dado** que o usuário já aplicou um filtro de estado (ex.: *"Aberto"*) ou realizou uma pesquisa por texto,
  * **Quando** seleciona uma categoria no filtro,
  * **Então** o sistema combina todos os critérios ativos simultaneamente e apresenta apenas os itens que atendem a todas as condições selecionadas.
* **Cenário 4: Nenhum alimento cadastrado na categoria selecionada**
  * **Dado** que o usuário não possui nenhum item ativo na categoria *"Congelados"*,
  * **Quando** aplica o filtro para essa categoria,
  * **Então** o sistema exibe a mensagem informativa: *"Nenhum alimento cadastrado nesta categoria."*, visualmente distinta de erros de carregamento ou falhas do sistema.

#### Checklist INVEST
* **I (Independente):** Apresenta dependência conceitual da listagem de alimentos (US10), mas pode ser desenvolvida e testada de forma isolada tanto no frontend quanto no backend (`WHERE categoria = ? AND conta_id = ?`).
* **N (Negociável):** Deixa aberta a escolha do componente visual de seleção (dropdown select, pills deslizáveis ou menu lateral).
* **V (Valor):** Facilita a gestão visual e a organização do estoque doméstico por tipo de refeição ou armazenamento (geladeira, despensa, freezer).
* **E (Estimável):** Operação direta de filtragem baseada em valor exato do conjunto fixo de categorias (RN13).
* **S (Pequena):** Envolve a renderização do seletor de categorias e a aplicação do predicado de filtro (1 dia).
* **T (Testável):** Cenários em Gherkin cobrem filtragem simples, restauração para o conjunto total, combinação com estado/busca e estado de lista vazia por categoria.

---

## Épico 3 — Consumo e Descarte (Issue Agrupadora #20)

### US14 — Registrar consumo ou descarte (Issue #14)
**Prioridade MoSCoW:** Must Have  
**Regras Vinculadas:** RN07, RN08, RN09, RN15, RN17, RN20, RN21, RI03, RNF01, RNF04, RNF05, RNF06

#### Declaração de Valor (INVEST)
**Como** usuário autenticado,  
**Quero** registrar o consumo ou o descarte de unidades de um alimento informando a quantidade e o motivo quando aplicável,  
**Para** manter meu controle de estoque rigoroso e acompanhar os padrões de consumo e desperdício na minha casa.

#### Critérios de Aceitação (BDD / Gherkin)
* **Cenário 1: Registro bem-sucedido de consumo parcial ou total (Caminho Feliz — Consumo)**
  * **Dado** que o usuário possui um alimento com 3 unidades ativas,
  * **Quando** seleciona a opção "Registrar Baixa", escolhe o tipo *"Consumo"*, informa a quantidade 2 sem informar motivo (opcional para consumo) e confirma a operação,
  * **Então** o sistema cria um registro de movimentação contendo alimento, snapshot de nome e categoria, tipo *"Consumo"*, quantidade 2 e data/hora da operação (RN20, RN21),
  * **E** atualiza atomicamente a quantidade restante do alimento ativo para 1 unidade (RNF05).
* **Cenário 2: Registro de descarte de alimento vencido com sugestão automática de motivo (RN09)**
  * **Dado** que o usuário seleciona para baixa um alimento com situação classificada como *"Vencido"*,
  * **Quando** seleciona o tipo *"Descarte"*,
  * **Então** o sistema sugere automaticamente o motivo *"Vencimento"*, permitindo ao usuário confirmar a sugestão ou selecionar outro motivo válido da lista predefinida.
* **Cenário 3: Exigência de descrição ao selecionar o motivo de descarte "Outro" (RN09)**
  * **Dado** que o usuário está registrando um descarte de alimento,
  * **Quando** seleciona o motivo *"Outro"*, deixa o campo de descrição textual em branco e tenta confirmar a baixa,
  * **Então** o sistema impede a conclusão da operação e exibe a mensagem de validação: *"Para o motivo 'Outro', é obrigatório preencher uma descrição."*.
* **Cenário 4: Baixa total com remoção da listagem de ativos (RN20)**
  * **Dado** que o usuário possui um alimento com 2 unidades disponíveis,
  * **Quando** registra o consumo ou descarte da quantidade total (2 unidades),
  * **Então** o sistema subtrai a quantidade zerando o saldo do grupo, remove o alimento da visualização da lista de alimentos ativos e mantém o histórico de movimentação persistido e imutável.
* **Cenário 5: Tentativa de registrar quantidade maior que a disponível ou inválida (RI03)**
  * **Dado** que o usuário possui um grupo com 2 unidades cadastradas,
  * **Quando** tenta registrar uma baixa informando quantidade 3, quantidade 0 ou valor negativo,
  * **Então** o sistema bloqueia o envio da operação e exibe a mensagem de erro: *"A quantidade deve ser um número inteiro entre 1 e o total disponível (2)."*.

#### Checklist INVEST
* **I (Independente):** Apresenta dependência conceitual da existência de alimentos cadastrados (US05), mas pode ser desenvolvida e testada de forma isolada por meio de mocks de itens e testes diretos de mutação transacional de saldo no banco de dados.
* **N (Negociável):** Deixa aberta a escolha de interface para o formulário de baixa (modal rápido sobre a lista de alimentos ou tela dedicada).
* **V (Valor):** É a história-chave para fechar o ciclo de vida do alimento e gerar a base de dados analítica de consumo e desperdício do sistema.
* **E (Estimável):** Regras de validação estritas (subtração de saldo, obrigatoriedade condicional de motivo e persistência de snapshot histórico), com complexidade delimitada.
* **S (Pequena):** Envolve a captura de quantidade/tipo/motivo, atualização de saldo e escrita no log de movimentação (2 dias).
* **T (Testável):** Cenários em Gherkin cobrem consumo, descarte com motivo sugerido, validação do motivo "Outro", baixa total e bloqueio de estouro de quantidade disponível.

---

## Épico 4 — Histórico e Análise (Issue Agrupadora #20)

### US15 — Consultar histórico (Issue #15)
**Prioridade MoSCoW:** Could Have  
**Regras Vinculadas:** RN09, RN17, RN20, RN21, RNF01, RNF02, RNF04, RNF06

#### Declaração de Valor (INVEST)
**Como** usuário autenticado,  
**Quero** consultar o histórico de baixas filtrando por período,  
**Para** auditar com clareza o destino dos meus alimentos ao longo do tempo e entender meus hábitos de consumo e descarte.

#### Critérios de Aceitação (BDD / Gherkin)
* **Cenário 1: Consulta de histórico com dados completos (Caminho Feliz — RN09, RN21)**
  * **Dado** que o usuário possui movimentações de consumo e descarte registradas em sua conta,
  * **Quando** acessa a tela de histórico de movimentações,
  * **Então** o sistema apresenta a listagem de registros em ordem cronológica decrescente (mais recentes primeiro),
  * **E** exibe para cada registro o snapshot gravado no momento da baixa (nome do alimento e categoria), tipo (*Consumo* ou *Descarte*), quantidade afetada, data e hora da operação, além do motivo cadastrado caso seja do tipo *"Descarte"*.
* **Cenário 2: Filtragem de movimentações por período**
  * **Dado** que o usuário está na tela de histórico de movimentações,
  * **Quando** define um intervalo de datas (data inicial e data final) no filtro de período e aciona a aplicação do filtro,
  * **Então** o sistema atualiza a visualização apresentando exclusivamente as movimentações ocorridas dentro do intervalo informado.
* **Cenário 3: Ausência de movimentações no período selecionado**
  * **Dado** que o usuário seleciona um período no qual não houve nenhuma baixa registrada,
  * **Quando** a consulta filtrada é executada,
  * **Então** o sistema exibe a mensagem informativa: *"Nenhuma movimentação registrada no período selecionado."*, visualmente distinta de alertas de falha técnica ou erros de requisição.
* **Cenário 4: Garantia de imutabilidade do histórico (RN20)**
  * **Dado** que o usuário está visualizando a listagem de histórico,
  * **Quando** inspeciona os registros na tela,
  * **Então** a interface não disponibiliza botões, links ou ações de edição ou exclusão de registros,
  * **E** qualquer tentativa de envio de métodos HTTP `PUT`, `PATCH` ou `DELETE` para a rota de movimentações é rejeitada pelo backend (HTTP 405 ou 403).
* **Cenário 5: Isolamento de dados no histórico (RN17)**
  * **Dado** que existem movimentações de múltiplos usuários persistidas no banco de dados,
  * **Quando** o usuário autenticado consulta o histórico,
  * **Então** o sistema filtra estritamente pelo identificador da conta do usuário logado, sem retornar ou inferir registros de terceiros.

#### Checklist INVEST
* **I (Independente):** Apresenta dependência conceitual da existência prévia de registros de baixa (US14), mas pode ser desenvolvida e testada de forma isolada utilizando fixtures ou mocks de eventos de movimentação no banco de testes.
* **N (Negociável):** Deixa aberta a escolha do formato visual do histórico (tabela com paginação, cartões em lista ou visualização em linha do tempo).
* **V (Valor):** Oferece transparência e rastreabilidade total sobre o uso e destino dos alimentos da residência.
* **E (Estimável):** Consulta padrão de leitura sobre a tabela de movimentações (`SELECT ... WHERE conta_id = ? AND data_hora BETWEEN ? AND ? ORDER BY data_hora DESC`), sem regras de escrita.
* **S (Pequena):** Focada unicamente na busca, filtragem por data e renderização estática dos registros em tela (1 a 2 dias).
* **T (Testável):** Cenários em Gherkin cobrem renderização de snapshots e campos condicionais, filtro por intervalo de datas, estado vazio no período, imutabilidade e isolamento de conta.

---

### US16 — Visualizar desperdício (Issue #16)
**Prioridade MoSCoW:** Could Have  
**Regras Vinculadas:** RN09, RN17, RN20, RNF01, RNF02, RNF04, RNF06

#### Declaração de Valor (INVEST)
**Como** usuário autenticado,  
**Quero** visualizar o volume total de alimentos descartados agrupados por motivo e período,  
**Para** diagnosticar minhas principais fontes de desperdício e tomar decisões mais conscientes de consumo e compra.

#### Critérios de Aceitação (BDD / Gherkin)
* **Cenário 1: Visualização consolidada de descartes com agrupamento por motivo (Caminho Feliz — RN09)**
  * **Dado** que o usuário autenticado possui movimentações de consumo e descarte cadastradas,
  * **Quando** acessa o painel de visualização de desperdício,
  * **Então** o sistema desconsidera as baixas por consumo e analisa unicamente as movimentações de descarte,
  * **E** exibe a soma total de unidades descartadas,
  * **E** apresenta os descartes consolidados por motivo, destacando separadamente o volume e a proporção de descartes causados por *"Vencimento"*.
* **Cenário 2: Filtragem de indicadores por período**
  * **Dado** que o usuário está no painel de visualização de desperdício,
  * **Quando** define um intervalo de datas (data inicial e data final) no filtro de período e aplica o filtro,
  * **Então** o sistema recalcula as métricas e os agrupamentos por motivo considerando unicamente os descartes ocorridos dentro do intervalo selecionado.
* **Cenário 3: Ausência de registros de descarte no período**
  * **Dado** que o usuário não registrou nenhum descarte no período filtrado (ou apenas registrou consumos),
  * **Quando** a consulta é executada,
  * **Então** o sistema exibe a mensagem contextual neutra: *"Nenhum descarte registrado no período selecionado."*, visualmente distinta de falhas na aplicação ou erros de rede.
* **Cenário 4: Isolamento estrito de métricas entre contas (RN17)**
  * **Dado** que existem registros de descarte cadastrados por outros usuários na aplicação,
  * **Quando** o usuário logado visualiza os indicadores de desperdício,
  * **Então** os dados e gráficos refletem estritamente as movimentações associadas à sua própria conta, sem que nenhuma soma ou dado de terceiros influencie os relatórios calculados.

#### Checklist INVEST
* **I (Independente):** Apresenta dependência conceitual da existência de baixas por descarte (US14), mas pode ser desenvolvida e testada de forma isolada utilizando mocks de agregações de banco de dados (`COUNT`, `SUM` e `GROUP BY motivo`).
* **N (Negociável):** Deixa aberta a forma de exibição visual dos motivos (gráficos em pizza/barra, tabela resumida ou cartões de métrica).
* **V (Valor):** Entrega a proposta de valor ecológica e financeira central do Valimenta, conscientizando o usuário sobre o desperdício doméstico.
* **E (Estimável):** Consulta analítica direta de agregação sobre a tabela de movimentações com predicado simples (`WHERE tipo = 'DESCARTE' AND conta_id = ?`).
* **S (Pequena):** Focada na agregação quantitativa e apresentação dos dados consolidados por motivo e período (1 a 2 dias).
* **T (Testável):** Cenários em Gherkin cobrem soma total, isolamento exclusivo de descarte, agrupamento por motivo, filtro por intervalo de datas e tratamento de ausência de registros.
