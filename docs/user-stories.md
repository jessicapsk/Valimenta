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
| **US17** | Cadastrar alimento por código de barras | Épico 1: Gestão de Estoque | Won't Have | — |

---

## Épico 0 — Acesso e Autenticação (Issue Agrupadora #17)

### US01 — Criar conta (Issue #1)
**Prioridade MoSCoW:** Must Have  
**Regras Vinculadas:** RN17 (Isolamento de dados), RN18 (E-mail único), RN19 (Requisito de senha), RNF06 (Segurança)

#### Declaração de Valor (INVEST)
**Como** visitante,  
**Quero** criar uma conta utilizando meu e-mail e uma senha,  
**Para** ter um espaço seguro e isolado onde possa gerenciar meus próprios alimentos.

#### Critérios de Aceitação (BDD / Gherkin)
* **Cenário 1: Cadastro realizado com sucesso (Caminho Feliz)**
  * **Dado** que o visitante está na página de cadastro,
  * **Quando** informa um e-mail válido não cadastrado anteriormente e uma senha com 8 ou mais caracteres,
  * **E** confirma o envio do formulário,
  * **Então** o sistema cria a nova conta, autentica o usuário automaticamente,
  * **E** redireciona o usuário para o painel principal exibindo a lista vazia (sem alimentos de terceiros).
* **Cenário 2: Tentativa de cadastro com e-mail já existente (RN18)**
  * **Dado** que o e-mail `"usuario@teste.com"` já está cadastrado no sistema,
  * **Quando** um visitante tenta criar uma nova conta utilizando esse mesmo e-mail,
  * **Então** o sistema bloqueia o cadastro e exibe a mensagem: *"Este e-mail já está em uso."*.
* **Cenário 3: Tentativa de cadastro com senha fraca (RN19)**
  * **Dado** que o visitante informa um e-mail válido,
  * **Quando** preenche uma senha com menos de 8 caracteres,
  * **Então** o sistema impede a submissão e sinaliza o campo com a exigência mínima de 8 caracteres.

#### Checklist INVEST
* **I (Independente):** Não depende de nenhuma outra história; pode ser desenvolvida e testada como ponto inicial do fluxo.
* **N (Negociável):** Deixa aberto se haverá confirmação de senha (campo duplo) ou força de caracteres adicionais.
* **V (Valor):** Estabelece a fronteira de privacidade e identificação do usuário.
* **E (Estimável):** Fluxo clássico de cadastro com persistência e hash.
* **S (Pequena):** Escopo delimitado a validação e persistência do usuário (1 a 2 dias).
* **T (Testável):** Casos de teste cobrem sucesso, e-mail duplicado, formato inválido e senha curta.

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
  * **Então** o sistema rejeita o acesso e exibe a mensagem genérica: *"E-mail ou senha incorretos."*, sem revelar se o e-mail existe no banco.
* **Cenário 3: Bloqueio de rotas protegidas sem autenticação**
  * **Dado** que um visitante não autenticado tenta acessar diretamente uma URL interna (ex.: `/alimentos`),
  * **Quando** a rota é requisitada,
  * **Então** o sistema redireciona a requisição para a tela de login.

#### Checklist INVEST
* **I (Independente):** Testável isoladamente gerando registros de usuários prévios no banco de testes.
* **N (Negociável):** Permite negociar a estratégia de sessão (JWT em cookie HttpOnly ou session token).
* **V (Valor):** Garante a barreira de acesso e a segurança das informações privadas.
* **E (Estimável):** Validação de hash criptográfico e emissão de credencial/cookie de sessão.
* **S (Pequena):** Focada estritamente no formulário de autenticação e proteção de middleware (1 dia).
* **T (Testável):** Cenários cobrem credenciais válidas, inválidas, campos vazios e rotas bloqueadas.

---

### US03 — Recuperar senha (Issue #3)
**Prioridade MoSCoW:** Should Have  
**Regras Vinculadas:** RN18 (E-mail único), RN19 (Requisito de senha), RNF06 (Segurança)

#### Declaração de Valor (INVEST)
**Como** usuário que esqueceu ou perdeu a senha,  
**Quero** solicitar a redefinição da minha credencial de acesso via e-mail,  
**Para** restabelecer meu acesso à despensa sem perder meus alimentos e históricos cadastrados.

#### Critérios de Aceitação (BDD / Gherkin)
* **Cenário 1: Solicitação de redefinição com resposta segura (Caminho Feliz)**
  * **Dado** que o usuário está na tela de recuperação de senha,
  * **Quando** informa um e-mail (cadastrado ou não) e clica em enviar,
  * **Então** o sistema exibe a mensagem neutra: *"Se o endereço estiver cadastrado, você receberá as instruções de redefinição."*,
  * **E** para contas existentes, gera um token de uso único com prazo de expiração.
* **Cenário 2: Redefinição efetiva com token válido**
  * **Dado** que o usuário acessa o link com um token de redefinição válido e dentro do prazo,
  * **Quando** digita uma nova senha com no mínimo 8 caracteres (RN19) e confirma,
  * **Então** o sistema atualiza o hash da senha, invalida o token utilizado e permite o login imediato com a nova credencial.
* **Cenário 3: Tentativa de uso de token expirado ou já utilizado**
  * **Dado** que o usuário tenta utilizar um link cujo token já expirou ou já foi consumido,
  * **Quando** carrega a página de redefinição ou tenta enviar a nova senha,
  * **Então** o sistema rejeita a operação e exibe o aviso: *"O link de redefinição expirou ou é inválido. Solicite um novo."*.

#### Checklist INVEST
* **I (Independente):** Pode ser desenvolvida simulando o disparo de token/link via mock de serviço de e-mail.
* **N (Negociável):** Mecanismo de entrega do token (link mágico vs. código numérico de 6 dígitos).
* **V (Valor):** Evita o abandono da plataforma em caso de esquecimento de credenciais.
* **E (Estimável):** Rotina padronizada de geração de token efêmero com TTL e atualização de registro.
* **S (Pequena):** Escopo dividido em formulário de solicitação e formulário de redefinição (2 dias).
* **T (Testável):** Cenários cobrem token válido, token expirado, token reutilizado e senhas fora da RN19.

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
  * **Dado** que o usuário está autenticado e navegando no sistema,
  * **Quando** aciona a opção "Sair" / "Logout",
  * **Então** o sistema revoga o token/cookie de sessão,
  * **E** redireciona o usuário para a tela inicial de login,
  * **E** impede o retorno às páginas protegidas através do botão "Voltar" do navegador.

#### Checklist INVEST
* **I (Independente):** Não possui acoplamentos; validação estrita de expiração/limpeza de credencial.
* **N (Negociável):** Permite negociar mensagem de despedida ou redirecionamento para página institucional.
* **V (Valor):** Garante a privacidade física e a segurança do usuário em ambientes compartilhados.
* **E (Estimável):** Implementação direta de invalidação de cookie/token (menos de 1 dia).
* **S (Pequena):** Funcionalidade atômica.
* **T (Testável):** Teste ponta a ponta validando a exclusão do token e o bloqueio de requisições subsequentes.

---

## Épico 1 — Gestão de Estoque (Issue Agrupadora #18)

### US05 — Cadastrar alimento (Issue #5)
**Prioridade MoSCoW:** Must Have  
**Regras Vinculadas:** RN01, RN02, RN03, RN05, RN06, RN07, RN10, RN13, RN14, RN17, RI01 a RI04

#### Declaração de Valor (INVEST)
**Como** usuário autenticado,  
**Quero** cadastrar um alimento informando seus dados,  
**Para** acompanhar sua validade e quantidade sob controle do sistema.

#### Critérios de Aceitação (BDD / Gherkin)
* **Cenário 1: Cadastro padrão de alimento fechado com quantidade omitida (Caminho Feliz)**
  * **Dado** que o usuário preenche o nome *"Leite Integral"*, seleciona a categoria *"Laticínios"*,
  * **E** informa uma validade original futura, mantendo o estado *"Fechado"* e deixando a quantidade em branco,
  * **Quando** confirma o cadastro,
  * **Então** o sistema assume quantidade igual a 1 unidade (RI03),
  * **E** define a data limite efetiva igual à validade original (RN01, RN03),
  * **E** grava o alimento sem data de abertura associado à conta autenticada (RN17).
* **Cenário 2: Cadastro de alimento já aberto com cálculo pós-abertura (RN02, RN03, RN14)**
  * **Dado** que o usuário preenche a validade original para daqui a 10 dias e seleciona a categoria *"Carne"* (sugestão de 2 dias),
  * **Quando** marca a opção *"Já está aberto"*, informa a data de abertura como a data atual e confirma o prazo sugerido de 2 dias,
  * **Então** o sistema calcula a data limite pós-abertura (data atual + 2 dias),
  * **E** define a data limite efetiva como a menor data entre a original e a pós-abertura (RN03),
  * **E** salva o item no estado *"Aberto"*.
* **Cenário 3: Tentativa de cadastro com data de abertura futura (RN10)**
  * **Dado** que o usuário marca o alimento como aberto,
  * **Quando** preenche uma data de abertura posterior à data atual local,
  * **Então** o sistema impede o salvamento e exibe o aviso: *"A data de abertura não pode ser uma data futura."*.
* **Cenário 4: Cadastro de alimento com validade já vencida**
  * **Dado** que o usuário informa uma data de validade original anterior à data atual,
  * **Quando** tenta submeter o formulário,
  * **Então** o sistema exibe um alerta de confirmação: *"A validade informada já expirou. Deseja cadastrar o item mesmo assim?"*,
  * **E** só conclui a gravação se o usuário confirmar explicitamente.
* **Cenário 5: Bloqueio de submissão sem campos obrigatórios (RI01, RI02)**
  * **Dado** que o usuário está no formulário de cadastro,
  * **Quando** tenta salvar com nome vazio ou sem validade original,
  * **Então** o sistema bloqueia o envio e sinaliza os campos obrigatórios.

#### Checklist INVEST
* **I (Independente):** Desenvolvível com injeção direta de conta em testes de integração.
* **N (Negociável):** Formato visual do modal de confirmação para itens já vencidos.
* **V (Valor):** Ponto de entrada primordial do estoque de alimentos.
* **E (Estimável):** Regras matemáticas claras e catálogo de categorias pré-estabelecido.
* **S (Pequena):** Focada na inserção do registro inicial (2 dias).
* **T (Testável):** BDD valida caminhos fechado, aberto, datas futuras e validações obrigatórias.

---

### US06 — Registrar abertura (Issue #6)
**Prioridade MoSCoW:** Must Have  
**Regras Vinculadas:** RN02, RN03, RN05, RN07, RN08, RN10, RN14, RN17, RI03

#### Declaração de Valor (INVEST)
**Como** usuário autenticado,  
**Quero** registrar a abertura de um alimento fechado,  
**Para** começar a controlar o prazo de consumo após a abertura.

#### Critérios de Aceitação (BDD / Gherkin)
* **Cenário 1: Abertura total de unidades (Caminho Feliz)**
  * **Dado** que o usuário possui um grupo com 2 unidades fechadas de *"Molho de Tomate"*,
  * **Quando** aciona a ação de registrar abertura, informa quantidade 2, data de abertura atual e confirma o prazo sugerido,
  * **Então** o sistema calcula e apresenta o resumo da nova data limite antes da confirmação,
  * **E** após a confirmação, atualiza o grupo para o estado *"Aberto"*, sem permitir reversão para *"Fechado"*.
* **Cenário 2: Abertura parcial com divisão de grupo/lote (RN08)**
  * **Dado** que o usuário possui um grupo com 3 unidades fechadas de *"Leite Integral"*,
  * **Quando** informa que abriu apenas 1 unidade,
  * **Então** o sistema mantém 2 unidades no grupo original fechado,
  * **E** instancia um novo grupo contendo 1 unidade no estado *"Aberto"* com a data de abertura e a nova data limite calculada.
* **Cenário 3: Validação de quantidade superior à disponível**
  * **Dado** que o lote possui 2 unidades fechadas,
  * **Quando** o usuário informa quantidade 3 para abertura,
  * **Então** o sistema rejeita a operação com o erro: *"A quantidade informada não pode ser superior à disponível (2 unidades)."*.
* **Cenário 4: Bloqueio para alimento já aberto (RN05)**
  * **Dado** que o alimento já se encontra no estado *"Aberto"*,
  * **Quando** o usuário inspeciona o item na interface,
  * **Então** a opção de marcar como aberto não é exibida, e qualquer tentativa direta via endpoint é bloqueada.

#### Checklist INVEST
* **I (Independente):** Testável via fixtures de grupos fechados no banco de dados.
* **N (Negociável):** Apresentação do cálculo antes da confirmação (modal ou popover).
* **V (Valor):** Fundamental para prevenção de perdas pós-abertura.
* **E (Estimável):** Lógica delimitada pela divisão de quantidade e recálculo da menor data.
* **S (Pequena):** Escopo cirúrgico sobre a transição de estado de estoque (2 dias).
* **T (Testável):** Cenários cobrem abertura total, parcial, estouro de quantidade e datas futuras.

---

### US07 — Corrigir data de abertura (Issue #7)
**Prioridade MoSCoW:** Should Have  
**Regras Vinculadas:** RN02, RN03, RN04, RN05, RN10, RN17, RN20

#### Declaração de Valor (INVEST)
**Como** usuário autenticado,  
**Quero** corrigir a data de abertura de um alimento,  
**Para** manter correta a data limite de consumo caso tenha errado a data inicial.

#### Critérios de Aceitação (BDD / Gherkin)
* **Cenário 1: Retificação com recálculo imediato (Caminho Feliz)**
  * **Dado** que o usuário possui um alimento no estado *"Aberto"*,
  * **Quando** informa uma nova data de abertura válida (passada ou presente),
  * **E** salva a alteração,
  * **Então** o sistema recalcula a data limite efetiva com base no prazo cadastrado (RN02, RN03),
  * **E** atualiza a situação da validade (RN04),
  * **E** preserva integralmente qualquer movimentação de baixa preexistente no histórico (RN20).
* **Cenário 2: Rejeição de data futura (RN10)**
  * **Dado** que o usuário está corrigindo a abertura,
  * **Quando** informa uma data posterior à data atual do sistema,
  * **Então** a operação é impedida exibindo a mensagem: *"A data de abertura não pode ser uma data futura."*.
* **Cenário 3: Indisponibilidade para itens fechados (RN05)**
  * **Dado** que o alimento encontra-se no estado *"Fechado"*,
  * **Quando** o usuário acessa as opções do item,
  * **Então** a funcionalidade de corrigir data de abertura permanece indisponível.

#### Checklist INVEST
* **I (Independente):** Dependência de itens abertos resolvida facilmente por mocks de teste.
* **N (Negociável):** Local da ação (botão ao lado da data no card ou opção no menu de contexto).
* **V (Valor):** Permite correções de digitação sem necessidade de excluir o item.
* **E (Estimável):** Atualização de um único campo de data seguido de chamada ao serviço de cálculo.
* **S (Pequena):** Esforço reduzido (1 dia).
* **T (Testável):** Validação de cálculo determinístico e rejeição de datas futuras.

---

### US08 — Editar alimento (Issue #8)
**Prioridade MoSCoW:** Should Have  
**Regras Vinculadas:** RN01, RN02, RN03, RN05, RN06, RN10, RN15, RN17, RN20, RN21, RI01 a RI04

#### Declaração de Valor (INVEST)
**Como** usuário autenticado,  
**Quero** editar os dados de um alimento,  
**Para** corrigir ou atualizar informações cadastradas incorretamente.

#### Critérios de Aceitação (BDD / Gherkin)
* **Cenário 1: Edição completa em lote sem histórico prévio (Caminho Feliz)**
  * **Dado** que o usuário possui um grupo de alimentos sem nenhuma movimentação associada,
  * **Quando** altera o nome, categoria, validade original e corrige a quantidade disponível,
  * **E** salva as modificações,
  * **Então** o sistema persiste as alterações, recalcula a data limite efetiva (RN03),
  * **E** não realiza fusão automática com outros grupos existentes na conta (RN21).
* **Cenário 2: Bloqueio de edição direta de quantidade quando há movimentações (RN15)**
  * **Dado** que o grupo já possui ao menos uma movimentação registrada de consumo ou descarte,
  * **Quando** o usuário abre a tela de edição,
  * **Então** o campo de quantidade permanece desabilitado para alteração manual,
  * **E** qualquer payload com quantidade alterada é rejeitado pela API com aviso para utilizar a baixa.
* **Cenário 3: Impossibilidade de reversão de estado Aberto para Fechado (RN05)**
  * **Dado** que o alimento encontra-se no estado *"Aberto"*,
  * **Quando** o usuário edita suas propriedades,
  * **Então** a opção de selecionar o estado *"Fechado"* não é exibida nem