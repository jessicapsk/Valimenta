# Projeto Arquitetural de Software — Valimenta

> **Etapa 2 do Ciclo de Vida:** Projeto Arquitetural e Decisões Técnicas  
> **Sistema:** Valimenta — Controle Doméstico de Validade de Alimentos  
> **Artefatos:** Atributos de Qualidade, Elicitação com IA, ADR (Architecture Decision Record) e Modelo C4  
> **Apresentação de Slides:** [Apresentação de Slides - Projeto Arquitetural (PDF)](./apresentacao-arquitetura.pdf) *(ou link do visualizador)*

---

## 1. Visão Geral da Etapa

Esta etapa materializa a transição entre a **Engenharia de Requisitos** (documentada na Etapa 1) e o **Design Arquitetural** do sistema. O objetivo central é traduzir as necessidades funcionais, os cenários BDD e os Requisitos Não Funcionais (RNFs) em decisões estruturais, trade-offs técnicos e diagramas executáveis de engenharia.

O projeto arquitetural foi construído com o apoio de ferramentas de Inteligência Artificial generativa sob governança *Human-in-the-Loop* (HITL), garantindo que a equipe humana conduzisse a avaliação crítica, a escolha final e a validação do isolamento de domínio.

---

## 2. Atributos de Qualidade e Drivers Arquiteturais

Os principais atributos de qualidade identificados a partir das User Stories e Regras de Negócio que mais pressionam o desenho técnico da solução são:

1. **Segurança e Isolamento Multi-tenant (RN17, RNF06):**
   * *Justificativa:* O sistema armazena estoques privados por conta; nenhuma falha de autorização ou vazamento de parâmetros de rota pode permitir a visualização ou alteração de alimentos pertencentes a outros usuários (**US01, US02**).
2. **Confiabilidade e Consistência Transacional (RNF05):**
   * *Justificativa:* As rotinas de baixa de itens e divisão física de lote exigem atomicidade estrita (*tudo ou nada*); interrupções no meio da requisição não podem duplicar itens nem causar perda de saldo (**US06, US14**).
3. **Desempenho e Latência de Consulta (RNF02):**
   * *Justificativa:* O painel principal e as combinações de busca flexível e múltiplos filtros exigem renderização imediata ($\le 1,0\text{ s}$) para despensas com até 200 itens ativos (**US10, US11, US12**).
4. **Usabilidade e Acessibilidade (RNF03, RNF04):**
   * *Justificativa:* A identificação de prazos e alertas não pode depender unicamente de diferenciação por cores e o layout deve operar de forma fluida a partir de telas mobile com 360px (**US10**).
5. **Manutenibilidade e Baixa Complexidade Operacional:**
   * *Justificativa:* O escopo do MVP precisa de arquitetura simples e desacoplada que permita a escrita rápida de testes determinísticos para as rotinas de vigência (RN01–RN03) com equipe e prazo enxutos.

---

## 3. Estrutura Modular da Documentação de Arquitetura

Os artefatos desta etapa estão divididos nos seguintes arquivos de detalhamento técnico:

* 📄 **[1. Elicitação Arquitetural com IA](elicitacao-ia.md):** Registro transparente do prompt utilizado, das duas alternativas arquiteturais geradas pela IA (Monólito Modular vs. Microsserviços Orientados a Eventos) e da análise comparativa de atributos.
* 📄 **[2. Decisão Arquitetural — Adoção do Monólito Modular](escolha-arquitetural.md):** Registro de Decisão Arquitetural formal contendo o contexto, decisão fundamentada, alternativas descartadas e trade-offs assumidos.
* 📄 **[3. Projeto Arquitetural — Modelo C4](modelo-c4.md):** Diagramas e especificações técnicas nos 4 níveis de abstração:
  * **Nível 1 (Contexto):** Fronteira do sistema Valimenta com usuários e serviços externos.
  * **Nível 2 (Contêineres):** Tecnologias do Frontend SPA, Backend e Banco de Dados Relacional.
  * **Nível 3 (Componentes):** Arquitetura interna do módulo de gestão de estoque e motor de cálculo.
  * **Nível 4 (Código):** Diagrama estrutural das classes e entidades de domínio.
* 📄 **[4. Roteiro de Apresentação da Arquitetura](apresentacao-arquitetura.md):** Versão resumida e pronta para uso em aula, defesa ou reunião de revisão.

---

## 4. Rastreabilidade com a Etapa 1 (Requisitos)

| Elemento de Requisitos (Etapa 1) | Decisão Arquitetural Correspondente (Etapa 2) |
| :--- | :--- |
| **RN17 (Isolamento de Dados)** | Injeção de middleware de autorização e escopo obrigatório de `conta_id` no repositório. |
| **RN08 / RN15 / RNF05 (Atomicidade)** | Adoção de banco relacional (PostgreSQL) com suporte a transações ACID nativas no mesmo nó. |
| **RN01–RN04 (Motor de Validade)** | Criação de um componente puro de domínio (`ValidadeCalculatorEngine`) sem acoplamento a frameworks. |
| **RN20 / RN21 (Snapshots Históricos)** | Tabela de movimentação com campos imutáveis independentes da entidade principal de alimentos. |
| **US17 (Código de Barras - Won't Have)** | Isolação de integrações com APIs externas de catálogo de terceiros fora do pipeline de produção do MVP. |

---

## 5. Resumo Executivo para Apresentação

A arquitetura do Valimenta foi definida como um monólito modular em camadas, com frontend SPA em React, backend em uma única aplicação web e banco de dados relacional PostgreSQL. Essa decisão foi tomada para equilibrar simplicidade operacional, consistência transacional, isolamento por conta e velocidade de entrega no contexto do MVP.

A escolha se justifica pelo fato de que as regras de negócio mais críticas, como baixa de estoque com histórico imutável, divisão parcial de lote e isolamento lógico entre contas, exigem transações ACID. O uso de um único banco relacional resolve esse requisito de maneira mais direta e previsível do que uma arquitetura distribuída, que introduziria complexidade excessiva e risco operacional desproporcional.

O sistema foi organizado em módulos funcionais: autenticação, estoque e validade, e baixas/análise. O módulo de validade é apoiado por um componente puro de domínio, o `ValidadeCalculatorEngine`, responsável por determinar a data limite efetiva e a situação de vencimento. Isso reduz acoplamento com frameworks e facilita a criação de testes determinísticos.

Em síntese, a arquitetura atende ao escopo do projeto porque oferece uma base simples, segura e fácil de evoluir, sem comprometer desempenho, confiabilidade e organização do código para a entrega do MVP.

### Frase de fechamento para apresentação

> O Valimenta adota uma arquitetura de monólito modular com PostgreSQL porque combina simplicidade, consistência, isolamento de dados e entregabilidade, sendo a opção mais adequada para um MVP com regras de negócio sensíveis e equipe enxuta.
