# Adoção do Monólito Modular com Banco Relacional para o MVP

> **Architecture Decision Record (ADR)**  
> **Status:** Aprovado  
> **Data:** Outubro de 2026  
> **Decisores:** Jéssica Pereira da Silva e equipe do projeto Valimenta  
> **Sistema:** Valimenta — Controle Doméstico de Validade de Alimentos  

---

## 1. Contexto e Declaração do Problema

O projeto Valimenta encontra-se em sua fase de desenvolvimento de Produto Mínimo Viável (MVP), sob um cronograma acadêmico estrito de 8 semanas e conduzido por uma equipe de engenharia enxuta.

O domínio da aplicação apresenta drivers de qualidade e requisitos funcionais que pressionam a escolha da arquitetura:
1. **Consistência Transacional Estrita (RNF05):** Operações como abertura parcial de lote com divisão de saldo (RN08) e baixa de estoque associada a registro de log histórico com congelamento de atributos (RN20, RN21) não toleram inconsistências. A baixa do estoque e a gravação da movimentação devem ser atômicas (*tudo ou nada*).
2. **Segurança e Isolamento Multi-tenant (RN17, RNF06):** Os dados de cada conta devem ser estritamente isolados em todas as operações de leitura e escrita.
3. **Volumetria Doméstica:** A carga estimada por usuário é de até 200 alimentos ativos, com transações simultâneas de baixa e consulta pontuais, tornando a alta escalabilidade distribuída um requisito secundário neste estágio.
4. **Viabilidade Operacional e de Entrega:** A equipe necessita de um ciclo ágil de feedback, facilidade de depuração em ambiente local e configuração direta de pipelines de integração contínua (CI/CD).

A equipe explorou duas alternativas arquiteturais geradas com auxílio de IA (conforme registrado em `exploracao-ia.md`):
* **Proposta 1:** Monólito Modular em Camadas (*Layered Modular Monolith*) com PostgreSQL.
* **Proposta 2:** Microsserviços Orientados a Eventos (*Event-Driven Microservices*) com mensageria assíncrona.

O desafio consiste em escolher a arquitetura que melhor atenda aos requisitos não funcionais críticos sem introduzir complexidade operacional desproporcional.

---

## 2. Decisão

O grupo deliberou e decidiu **adotar a Proposta 1: Monólito Modular em Camadas backed por Banco de Dados Relacional (PostgreSQL)** para a implementação do MVP do Valimenta.

### Diretrizes de Implementação da Decisão:
* **Frontend SPA:** Interface desacoplada desenvolvida em React com TypeScript, consumindo os endpoints via API REST/HTTPS.
* **Backend Monolítico Estruturado:** Uma única base de código organizada em módulos com fronteiras de contexto bem definidas:
  * `Módulo de Autenticação` (US01 a US04);
  * `Módulo de Estoque e Validade` (US05 a US09, US10 a US13);
  * `Módulo de Baixas e Análise` (US14 a US16).
* **Persistência Relacional com Transações ACID:** Uso do PostgreSQL gerenciado em nuvem, alavancando transações de banco nativas para garantir a atomicidade das mutações.
* **Isolamento de Domínio no Código:** Comunicação entre módulos realizada estritamente por interfaces de serviço públicas, impedindo acoplamento indevido ou chamadas circulares entre repositórios de dados distintos.

---

## 3. Alternativas Avaliadas e Motivos do Descarte

### Proposta 2 — Microsserviços Orientados a Eventos (Descartada)
A alternativa de decompor o sistema em microsserviços com comunicação via mensageria (RabbitMQ/Kafka) e persistência poliglota foi avaliada e expressamente descartada pelos seguintes motivos:
* **Sobrecarga de Transações Distribuídas:** A baixa de estoque (US14) gerando evento para gravação em um serviço de histórico independente exigiria o padrão Saga ou mecanismos de *two-phase commit* para garantir que uma falha no histórico não deixasse o estoque com saldo inconsistente. Para o escopo do projeto, isso configuraria sobre-engenharia (*overengineering*).
* **Custo e Complexidade de Infraestrutura:** Configurar múltiplos contêineres Docker, orquestração, service discovery, distributed tracing e múltiplos pipelines de CI/CD consumiria tempo excessivo da equipe, desviando o foco da codificação das regras de negócio (RN01 a RN21).
* **Latência Desnecessária de Rede:** A comunicação inter-serviços adicionaria overhead de rede para operações que rodam com baixíssima latência dentro da mesma instância de banco de dados.

---

## 4. Consequências da Decisão (Trade-offs)

### Consequências Positivas (Ganhos Obtidos):
* **Atomicidade Confiável (ACID):** A partição de grupos na abertura parcial (RN08) e a inserção simultânea da baixa e do snapshot histórico (RN20, RN21) são resolvidas dentro de uma transação SQL padrão (`BEGIN ... COMMIT`), satisfazendo o RNF05 de maneira determinística.
* **Alta Produtividade e Velocidade de Entrega:** Um único repositório (*monorepo/single codebase*) reduz o atrito com branches e releases, permitindo que a equipe entregue as 16 User Stories ativas dentro do cronograma de 8 semanas.
* **Facilidade de Testabilidade:** A suíte de testes unitários e testes de integração com instâncias efêmeras de banco de dados pode rodar de forma rápida e completa no GitHub Actions a cada pull request.
* **Simplicidade de Observabilidade:** Logs unificados e facilidade de depuração direta no ambiente de desenvolvimento local de cada membro da equipe.

### Consequências Negativas (Custos e Riscos Aceitos):
* **Disciplina Rigorosa de Arquitetura Modular:** Há o risco inerente de os desenvolvedores criarem acoplamentos acidentais (ex.: módulos importando entidades internas uns dos outros).  
  * *Mitigação:* Adoção de convenção de pastas rígida, separação de DTOs e inspeção de código (*code review*) obrigatória via pull request antes do merge.
* **Escala Compartilhada de Recursos:** Se o painel analítico de desperdício (US16) executar queries agregadas volumosas, elas competirão pelos mesmos recursos de CPU e conexões de banco com as operações de cadastro e baixa.  
  * *Mitigação:* Otimização de índices compostos no PostgreSQL cobrindo `(conta_id, data_hora)` e limites de paginação.
* **Deploy em Bloco Único:** Qualquer alteração no módulo analítico exige a reinicialização da aplicação inteira, impactando temporariamente as funções de cadastro caso haja indisponibilidade durante deploys.  
  * *Mitigação:* Estratégia de deploy com *zero-downtime* suportada nativamente pelas plataformas PaaS em nuvem (ex.: Render ou Railway).