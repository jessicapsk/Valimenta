# Projeto Arquitetural — Modelo C4

> **Sistema:** Valimenta — Controle Doméstico de Validade de Alimentos  
> **Escopo:** MVP da aplicação web de gestão de alimentos, validade e desperdício  
> **Arquitetura adotada:** Monólito modular com backend em camadas, frontend SPA e banco relacional PostgreSQL

---

## Visão geral

O modelo C4 organiza a arquitetura em quatro níveis de abstração, permitindo descrever o sistema desde o contexto geral até a estrutura interna das classes e regras de domínio. Para o Valimenta, a escolha arquitetural já definida no ADR é um monólito modular, com separação funcional em módulos e persistência relacional.

---

## Nível 1 — Contexto

Este nível mostra a fronteira do sistema com seus usuários, agentes externos e dependências de infraestrutura.

```mermaid
C4Context
    title Contexto do Sistema Valimenta
    Person(usuario, "Usuário", "Responsável por gerir sua despensa, registrar alimentos e acompanhar vencimentos.")
    System_Boundary(valimenta, "Valimenta") {
        System(app, "Aplicação Valimenta", "Sistema web para cadastro de alimentos, controle de validade, baixas e análise de desperdício.")
    }
    System_Ext(email, "Serviço de e-mail", "Plataforma para recuperação de credenciais e comunicação transacional.")
    SystemDb(db, "PostgreSQL", "Banco relacional que armazena contas, alimentos, movimentações e histórico.")

    Rel(usuario, app, "Acessa painel, cadastra alimentos e registra baixas")
    Rel(app, db, "Lê e grava dados de conta, estoque e histórico")
    Rel(app, email, "Envia e-mail de autenticação e recuperação")
```

### Descrição

- O principal ator do sistema é o usuário residencial que administra a despensa pessoal.
- O sistema central é a aplicação Valimenta, responsável por gestão de contas, alimentos, validade e baixas.
- O banco de dados relacional garante consistência transacional e isolamento lógico entre contas.
- A comunicação com e-mail é tratada como dependência externa, sem tornar o sistema distribuído.

---

## Nível 2 — Contêineres

Neste nível, a aplicação é vista como conjunto de contêineres de software e infraestrutura tecnológica.

```mermaid
flowchart LR
    subgraph Usuario[Cliente]
        Browser[Frontend Web\nReact + TypeScript]
    end

    subgraph Sistema[Aplicação Valimenta]
        API[Backend API REST\nMonólito Modular]
        Auth[Auth Module]
        Estoque[Estoque e Validade Module]
        Baixas[Baixas e Análise Module]
    end

    subgraph Persistencia[Persistência]
        DB[(PostgreSQL)]
    end

    Browser -->|HTTPS| API
    API --> Auth
    API --> Estoque
    API --> Baixas

    Auth --> DB
    Estoque --> DB
    Baixas --> DB
```

### Descrição

- O frontend é uma SPA em React, responsável pela interface e pela interação com o usuário.
- O backend é um monólito modular, dividido em módulos funcionais para autenticação, estoque/validade e baixas/análise.
- O PostgreSQL atua como base única de persistência, preservando atomicidade e isolamento por conta.
- A arquitetura prioriza simplicidade operacional e entregabilidade no MVP, sem introduzir microsserviços.

---

## Nível 3 — Componentes

Este nível detalha os principais componentes internos do monólito modular e suas responsabilidades.

```mermaid
flowchart TB
    subgraph UI[Interface]
        Controller[Controllers / Routes]
        ViewModel[ViewModels / DTOs]
    end

    subgraph Auth[Auth Module]
        AuthService[AuthService]
        AccountRepo[AccountRepository]
        Session[SessionManager]
    end

    subgraph Estoque[Estoque e Validade Module]
        FoodService[FoodService]
        ValidityEngine[ValidadeCalculatorEngine]
        FoodRepo[FoodRepository]
    end

    subgraph Baixas[Baixas e Análise Module]
        MovementService[MovementService]
        WasteService[WasteAnalyticsService]
        MovementRepo[MovementRepository]
    end

    subgraph DB["Banco de Dados"]
        Tables[Tabelas: conta, alimento, categoria, movimentacao]
    end

    Controller --> ViewModel
    Controller --> AuthService
    Controller --> FoodService
    Controller --> MovementService
    Controller --> WasteService

    AuthService --> AccountRepo
    AuthService --> Session

    FoodService --> ValidityEngine
    FoodService --> FoodRepo
    MovementService --> MovementRepo
    WasteService --> MovementRepo

    AccountRepo --> Tables
    FoodRepo --> Tables
    MovementRepo --> Tables
```

### Componentes principais

- AuthModule: autenticação, autorização e isolamento de dados por conta.
- InventoryModule: cadastro de alimentos, cálculo de validade, estado, filtros e consulta.
- MovementModule: baixa de itens, registro de movimentações e histórico imutável.
- ValidadeCalculatorEngine: componente de domínio puro, responsável por calcular data limite efetiva e situação de vencimento.
- WasteAnalyticsService: consolida dados de consumo e descarte para painel de desperdício.

---

## Nível 4 — Código (Diagrama de Classes)

Este nível representa as entidades e relações centrais do domínio do sistema, com foco em regras de negócio e persistência.

```mermaid
classDiagram
    class Conta {
        +UUID id
        +string email
        +string senhaHash
        +criarConta()
        +autenticar()
    }

    class Categoria {
        +UUID id
        +string nome
        +int prazoPadraoDias
    }

    class Alimento {
        +UUID id
        +UUID contaId
        +UUID categoriaId
        +string nome
        +int quantidade
        +string estado
        +Date validadeOriginal
        +Date dataAbertura
        +int prazoAberturaDias
        +Date dataLimiteEfetiva
        +obterSituacaoValidade()
        +registrarBaixa()
    }

    class Movimentacao {
        +UUID id
        +UUID contaId
        +UUID alimentoId
        +string tipo
        +int quantidade
        +DateTime dataHora
        +string motivoDescarte
        +string descricaoOutro
        +string nomeSnapshot
        +string categoriaSnapshot
        +gerarSnapshot()
    }

    class ValidadeCalculatorEngine {
        +calcularDataLimiteEfetiva(alimento: Alimento) Date
        +avaliarSituacaoValidade(alimento: Alimento, dataReferencia: Date) string
    }

    Conta "1" --> "*" Alimento
    Categoria "1" --> "*" Alimento
    Alimento "1" --> "*" Movimentacao
    ValidadeCalculatorEngine ..> Alimento
```

### Regras refletidas no modelo

- Cada conta possui um conjunto próprio de alimentos e movimentações, preservando isolamento multiusuário.
- Uma categoria descreve o prazo padrão sugerido para alimentos do mesmo tipo.
- Alimento representa o item do estoque, com quantidade, estado, validade original e data limite efetiva.
- Movimentacao registra eventos imutáveis de consumo ou descarte, preservando o histórico da despensa.
- ValidadeCalculatorEngine encapsula a lógica de cálculo da data limite e da situação de vencimento, mantendo o domínio desacoplado de frameworks.

---

## Conclusão

O Modelo C4 do Valimenta demonstra que a solução segue a arquitetura escolhida no ADR: monólito modular, organizado por módulos de domínio e persistência relacional. A representação em níveis de contexto, contêineres, componentes e classes permite que a equipe tenha uma visão clara da estrutura do sistema e do alinhamento com os requisitos funcionais e não funcionais.
