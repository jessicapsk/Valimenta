# 2. Regras de Negócio e Requisitos de Informação

> **Valimenta — Sistema de Controle de Validade de Alimentos**  
> Este documento cataloga de forma formal e determinística todas as Regras de Negócio (RN01 a RN21) e Requisitos de Informação (RI01 a RI04) que orientam a arquitetura, as validações e as rotinas de cálculo do sistema.

---

## 1. Regras de Negócio (RN)

### 1.1 Cálculo de Prazos, Vigência e Situação

#### RN01 — Data de validade original
* O sistema deve utilizar a data de validade informada pelo usuário como a referência base impressa pelo fabricante na embalagem.
* O alimento permanece no estado válido durante todo o decorrer do dia impresso na embalagem, passando a ser considerado vencido a partir do primeiro instante do dia seguinte à data limite.

#### RN02 — Prazo pós-abertura
* Quando um alimento possuir prazo pós-abertura, o sistema deve calcular a data limite pós-abertura projetando o prazo sobre a data em que o item foi aberto:
  $$\text{Data Limite Pós-Abertura} = \text{Data de Abertura} + \text{Prazo Pós-Abertura (dias)}$$
* *Exemplo:* Data de abertura no dia 08 com prazo de 7 dias resulta na data limite pós-abertura no dia 15.

#### RN03 — Data limite efetiva
* Havendo simultaneamente uma data de validade original de fábrica e uma limitação decorrente de abertura, a data limite efetiva de controle do sistema deverá ser a menor entre as duas:
  $$\text{Data Limite Efetiva} = \min(\text{Data de Validade Original}, \text{Data Limite Pós-Abertura})$$
* Essa menor data calculada é a referência única utilizada para classificação de situação, ordenação e disparo de alertas.

#### RN04 — Situação da validade
* O sistema classifica dinamicamente o alimento comparando a data atual com a sua data limite efetiva:

| Situação | Condição Cronológica |
| :--- | :--- |
| **Normal** | Mais de 3 dias restantes para a data limite ($\Delta t > 3 \text{ dias}$) |
| **Próximo do vencimento** | De 1 a 3 dias restantes para a data limite ($1 \le \Delta t \le 3 \text{ dias}$) |
| **Vence hoje** | Data atual rigorosamente igual à data limite ($\Delta t = 0$) |
| **Vencido** | Data atual posterior à data limite ($\Delta t < 0$) |

#### RN10 — Data de abertura
* A data de abertura deve ser menor ou igual à data atual local.
* É expressamente proibido registrar ou salvar uma data de abertura com valor futuro.

#### RN12 — Período de alerta
* O sistema deve aplicar sinalização destacada de prioridade/atenção para alimentos que:
  * Vencem hoje ($\Delta t = 0$);
  * Vencem em 1, 2 ou 3 dias ($1 \le \Delta t \le 3$).
* Alimentos já vencidos permanecem identificados explicitamente como "Vencido", mas não compõem a categoria de alerta de vencimento iminente.

#### RN16 — Referência de data
* Todas as rotinas de cálculo de vigência, ordenação por proximidade e transição automática de situação utilizam como referência o fuso e a data local do dispositivo/navegador do cliente.

---

### 1.2 Gestão de Estoque, Ciclo de Vida e Estados

#### RN05 — Estado do alimento
* Um alimento assume exclusivamente um de dois estados físicos:
  * **Fechado** (lacre intacto);
  * **Aberto** (lacre rompido).
* No momento do cadastro (US05), o usuário pode indicar que o item já se encontra aberto.
* Uma vez no estado "Aberto", a transição é estritamente unidirecional — o alimento nunca poderá retornar ao estado "Fechado".

#### RN06 — Identificação do alimento
* A identidade lógica de um alimento dentro da conta é estabelecida pela combinação de seu **Nome** e sua **Categoria**.
* A comparação do nome é insensível a maiúsculas/minúsculas (*case-insensitive*) e ignora espaços extras nas extremidades (*trim*). Ex.: `"Leite"`, `"leite"` e `" Leite "` identificam o mesmo produto. A categoria é avaliada por correspondência exata com o catálogo fixo (RN13).

#### RN07 — Formação de grupos (lotes)
* Unidades do mesmo alimento permanecem agrupadas no mesmo registro quando compartilham simultaneamente as seguintes características:
  * Mesmo alimento (nome normalizado);
  * Mesma categoria;
  * Mesmo estado (Fechado ou Aberto);
  * Mesma data de abertura (quando aplicável);
  * Mesma data limite efetiva.

#### RN08 — Abertura parcial de lote
* Quando apenas uma fração das unidades de um lote fechado for aberta, o sistema realiza a separação física do grupo:
  * O saldo aberto é transferido para um novo grupo com estado "Aberto", recebendo a data de abertura e a nova data limite calculada;
  * As unidades remanescentes mantêm-se no grupo original no estado "Fechado" com suas características inalteradas.
* *Exemplo:* Um grupo com 3 unidades fechadas, tendo 1 unidade aberta, resulta em: 2 unidades fechadas (grupo de origem) + 1 unidade aberta (novo grupo).

#### RN11 — Ordenação por validade
* As listagens de estoque ativo priorizam os itens pela proximidade da data limite efetiva (menor prazo restante primeiro).
* Em caso de empate na data limite, o desempate é realizado por ordem alfabética ascendente baseada no nome do alimento.

#### RN15 — Alteração de quantidade
* A edição direta do valor de quantidade só é permitida enquanto o grupo não possuir nenhuma movimentação de consumo ou descarte vinculada (cenário restrito à correção de erro de cadastro).
* A existência de movimentações em outro grupo do mesmo alimento (ex.: baixa em unidades abertas) não impede a correção de quantidade em um grupo fechado sem movimentações.
* Após o registro de qualquer movimentação no grupo, alterações quantitativas só podem ocorrer via baixa operacional (US14).

---

### 1.3 Categorização e Prazos Sugeridos

#### RN13 — Categorias fixas
* O sistema opera com uma lista fixa e padronizada de categorias predefinidas:
  1. Laticínios
  2. Carne
  3. Hortifruti
  4. Padaria
  5. Bebidas
  6. Enlatados e Conservas
  7. Congelados
  8. Grãos e Cereais
  9. Outros

#### RN14 — Prazo padrão por categoria
* Cada categoria possui um prazo pós-abertura de fábrica predefinido, sugerido automaticamente pelo sistema durante o cadastro ou abertura:

| Categoria | Prazo Padrão Pós-Abertura |
| :--- | :---: |
| **Carne** | 2 dias |
| **Hortifruti** | 3 dias |
| **Enlatados e Conservas** | 3 dias |
| **Bebidas** | 5 dias |
| **Padaria** | 5 dias |
| **Laticínios** | 7 dias |
| **Outros** | 7 dias |
| **Congelados** | 30 dias |
| **Grãos e Cereais** | 60 dias |

* O usuário pode alterar o prazo sugerido pontualmente para o item manipulado, sem modificar a regra geral do sistema.

---

### 1.4 Baixas, Auditoria e Integridade Histórica

#### RN09 — Motivo do descarte
* Todo descarte exige a seleção de um motivo padronizado:
  * *Vencimento*;
  * *Estragado*;
  * *Embalagem danificada*;
  * *Não será consumido*;
  * *Outro*.
* Caso o motivo selecionado seja "Outro", o preenchimento de uma justificativa textual torna-se estritamente obrigatório.
* Para itens com situação "Vencido", o sistema deve sugerir automaticamente o motivo "Vencimento", permitindo alteração pelo usuário se aplicável.

#### RN20 — Remoção de alimento e preservação do histórico
* A remoção completa do cadastro de um alimento (US09) só é permitida se o grupo não possuir nenhuma movimentação associada, destinando-se unicamente à exclusão de erros de inserção.
* Se já existir ao menos uma movimentação registrada no lote, a remoção direta é bloqueada: o encerramento do saldo deve ser feito via baixa por consumo ou descarte motivado (US14).
* Movimentações registradas no histórico são imutáveis e permanentes — não admitem edição, retificação ou exclusão.
* A remoção de um lote sem histórico não afeta outros lotes ou movimentações preexistentes do mesmo alimento.

#### RN21 — Integridade da identificação (Snapshotting)
* Toda operação de baixa grava na movimentação uma cópia exata (*snapshot*) do nome e da categoria do alimento vigentes no momento da operação.
* Alterações cadastrais futuras de nome ou categoria no alimento original (US08) não modificam os registros históricos passados.
* O sistema não realiza fusão automática de grupos preexistentes caso suas identificações sejam editadas para valores coincidentes.

---

### 1.5 Segurança e Isolamento Multi-inquilino

#### RN17 — Isolamento de dados entre contas
* Cada conta autenticada possui acesso restrito aos seus próprios alimentos, lotes e movimentações.
* O isolamento é obrigatório em todas as camadas (leitura, escrita, edição, baixa e exclusão). Nenhum usuário poderá consultar ou alterar registros associados a outra conta.

#### RN18 — E-mail único
* O endereço de e-mail é o identificador único de acesso, sendo vedada a existência de mais de uma conta com o mesmo e-mail.

#### RN19 — Requisito de senha
* A senha informada no cadastro ou redefinição deve conter no mínimo 8 caracteres.

---

## 2. Requisitos de Informação (RI)

Os Requisitos de Informação definem a tipagem, obrigatoriedade e restrições dos campos manipulados na camada de entrada de dados:

* **RI01 — Nome:** O nome do alimento é de preenchimento obrigatório tanto no cadastro (US05) quanto na edição (US08).
* **RI02 — Validade Original:** A data de validade comercial impressa na embalagem é de preenchimento obrigatório.
* **RI03 — Quantidade:** A quantidade deve ser obrigatoriamente um número inteiro maior ou igual a 1. Caso o campo não seja preenchido no cadastro, o sistema assume o valor padrão de 1 unidade.
* **RI04 — Unidade de Medida:** A quantidade é representada exclusivamente em unidades discretas inteiras. Não são aceitas unidades de massa (kg, g), volume (l, ml) ou valores decimais/fracionários.