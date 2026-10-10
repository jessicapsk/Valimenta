# 1. Modelo Conceitual, Glossário e Escopo

> **Valimenta — Sistema de Controle de Validade de Alimentos**  
> Este documento estabelece a semântica operacional do domínio, as entidades estruturais do sistema, as premissas e os limites de escopo do projeto.

---

## 1. Glossário Operacional

| Termo | Definição |
| :--- | :--- |
| **Alimento** | Item cadastrado pelo usuário para acompanhamento de validade e quantidade. |
| **Estado** | Indicador do ciclo de vida físico da embalagem: *Fechado* ou *Aberto*. |
| **Situação da Validade** | Classificação dinâmica em relação à data limite: *Normal*, *Próximo do vencimento*, *Vence hoje* ou *Vencido*. |
| **Data de Validade Original** | Data de validade impressa na embalagem comercial pelo fabricante. |
| **Data de Abertura** | Data em que o lacre da embalagem foi rompido pelo usuário. |
| **Prazo Pós-Abertura** | Período (em dias) durante o qual o alimento deve ser consumido após sua abertura. |
| **Data Limite Efetiva** | Menor data calculada entre a validade original e o prazo pós-abertura, utilizada como parâmetro de controle pelo sistema. |
| **Grupo (Lote)** | Conjunto de unidades do mesmo alimento que compartilham rigorosamente as mesmas características de controle e validade. |
| **Baixa** | Registro da retirada de uma ou mais unidades do controle ativo por motivo de consumo ou descarte. |
| **Alimento Ativo** | Alimento que possui saldo disponível sob controle (quantidade $\ge 1$). |
| **Movimentação** | Registro imutável de evento de consumo ou descarte realizado pelo usuário. |
| **Categoria** | Classificação predefinida pelo sistema utilizada para organização e sugestão de prazo pós-abertura de fábrica. |

---

## 2. Premissas e Restrições

### 2.1 Premissas
* **Ambiente Web em Nuvem:** A aplicação será disponibilizada via web com persistência em banco de dados em nuvem.
* **Isolamento Multiusuário (*Multi-tenant* Lógico):** Cada usuário possuirá sua própria conta; os dados de alimentos, lotes e histórico são completamente isolados entre usuários.
* **Autenticação Padrão:** O acesso será realizado por meio de e-mail e senha.
* **Referência Temporal Local:** Todos os cálculos de vigência de validade e mudanças automáticas de situação baseiam-se na data local do navegador/dispositivo do usuário (RN16).

### 2.2 Restrições
* **Unidades Inteiras:** A quantidade é registrada unicamente em números inteiros ($\ge 1$). Não são suportadas medidas fracionárias, pesagem (kg/g) ou volume (litros/ml).
* **Taxonomia Fixa:** As categorias e seus prazos padrão sugeridos são definidos previamente pelo sistema (RN13 e RN14).
* **Imutabilidade do Histórico:** Movimentações de consumo ou descarte já persistidas são estritamente para consulta (somente leitura), sendo proibida qualquer alteração ou exclusão (RN20).
* **Segurança e Criptografia:** A aplicação operará sob o protocolo HTTPS e as credenciais de acesso serão persistidas utilizando algoritmos seguros de derivação de chave (*hash* criptográfico).

---

## 3. Escopo do Produto

### 3.1 Escopo da Release Atual (MVP)
* Gestão de contas com isolamento lógico estrito.
* Cadastro de alimentos fechados ou previamente abertos.
* Transição de estado com suporte à abertura parcial de lotes.
* Cálculo determinístico de data limite efetiva ponderando prazos pós-abertura.
* Painel de consulta priorizado pela proximidade do vencimento com alertas visuais acessíveis.
* Filtros rápidos por estado (Aberto/Fechado), categoria e pesquisa textual flexível.
* Registro de baixas operacionais com categorização de motivos de descarte.
* Consulta histórica cronológica com dados congelados no momento do evento (*snapshots*).
* Painel quantitativo de visualização de desperdício.

### 3.2 Fora de Escopo (*Out of Scope*)
Não fazem parte do escopo desta release:
* Login social via provedores terceiros (OAuth com Google, GitHub, etc.);
* Verificação de e-mail por link/código e autenticação em dois fatores (2FA);
* Notificações ativas externas (e-mail transacional periódico, SMS ou Web Push Notifications);
* Compartilhamento de despensa ou gestão colaborativa familiar multiusuário;
* Recursos sociais (perfis públicos, feeds ou compartilhamento de listas);
* Entrada de estoque por medidas fracionárias (peso ou volume);
* Exportação manual de relatórios (CSV, PDF, Excel);
* Customização permanente do catálogo de categorias ou alteração dos prazos padrão de fábrica por conta.

---

## 4. Modelo Conceitual de Entidades

O modelo conceitual descreve as entidades de domínio, seus atributos e suas relações estruturais:

```text
+-------------------+            1..* +-------------------+
|       Conta       | <------------> |      Alimento     |
+-------------------+ (RN17: Isola)  +-------------------+
| - id              |                | - id              |
| - email (RN18)    |                | - conta_id (FK)   |
| - senha_hash(RN19)|                | - categoria_id(FK)|
+-------------------+                | - nome (RN06)     |
                                     | - quantidade      |
                                     | - estado (RN05)   |
                                     | - val_original    |
                                     | - data_abertura   |
                                     | - prazo_abertura  |
                                     | - data_limite     |
                                     +-------------------+
                                               | 1
                                               |
                                               | 0..*
+-------------------+            1..*          v
|     Categoria     | <--------------+ +-------------------+
+-------------------+  (Snapshot:    | |    Movimentacao   |
| - id              |   RN21)        | +-------------------+
| - nome (RN13)     |                +-| - id              |
| - prazo_padrao    |                  | - conta_id (FK)   |
+-------------------+                  | - alimento_id(FK) |
                                       | - tipo (Cons/Desc)|
                                       | - quantidade      |
                                       | - data_hora       |
                                       | - motivo_descarte |
                                       | - descricao_outro |
                                       | - nome_snapshot   |
                                       | - categ_snapshot  |
                                       +-------------------+