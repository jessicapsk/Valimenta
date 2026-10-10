# Valimenta — Sistema de Controle de Validade de Alimentos

> **Documento de Especificação de Requisitos de Software (SRS)**  
> **Abordagem:** Engenharia de Requisitos Ágil  
> **Quadro de Gestão do Projeto:** [GitHub Projects — Valimenta](https://github.com/users/jessicapsk/projects/1)  
> **Protótipo Interativo:** [Figma — Valimenta](https://gig-flame-34715391.figma.site/)

---

## 0. Artefatos da Atividade

Esta entrega é composta por dois artefatos complementares:

1. **Quadro de Histórias de Usuário (Priorizado):** Mantido no GitHub Projects/Issues do repositório, contendo as User Stories ativas (US01 a US16) e a história de escopo futuro (US17), organizadas por Épicos e priorizadas via técnica MoSCoW.
2. **Documentação de Engenharia de Requisitos:** Conjunto modular de especificações contido neste diretório (`docs/`), detalhando o processo de elicitação, modelagem conceitual, regras de negócio de domínio, catalogação de User Stories com cenários BDD/Gherkin, rastreabilidade e governança de desenvolvimento acelerado por Inteligência Artificial.

### Mapeamento dos Épicos no Quadro Ágil

| Épico no Quadro (GitHub) | Issue Agrupadora | User Stories Abrangidas | Bloco Temático |
| :--- | :---: | :---: | :--- |
| **Autenticação** | `#17` | US01 a US04 | Épico 0: Acesso e Autenticação |
| **Gestão de Estoque** | `#18` | US05 a US09 (e US17) | Épico 1: Cadastro e Gerenciamento de Alimentos |
| **Painel de Controle e Consultas** | `#19` | US10 a US13 | Épico 2: Consulta e Localização de Alimentos |
| **Baixas, Histórico e Indicadores** | `#20` | US14 | Épico 3: Consumo e Descarte |
| **Baixas, Histórico e Indicadores** | `#20` | US15 a US16 | Épico 4: Histórico e Análise |

*Nota: No quadro do GitHub as histórias estão agrupadas em 4 épicos macro. Na documentação técnica, o épico "Baixas, Histórico e Indicadores" é desdobrado internamente em dois blocos (Épico 3 e Épico 4) para isolar as regras transacionais de baixa das consultas analíticas e métricas de desperdício.*

---

## 1. Visão do Produto

O **Valimenta** é uma aplicação web voltada ao controle inteligente da validade de alimentos domésticos, visando à redução do desperdício de comida e à segurança alimentar.

O sistema permite ao usuário:
* Cadastrar alimentos com identificação padronizada por nome e categoria;
* Informar quantidade em unidades inteiras e data de validade comercial original;
* Registrar a abertura de alimentos lacrados, permitindo abertura parcial de lotes;
* Calcular automaticamente a data limite efetiva de consumo ponderando o prazo pós-abertura da categoria;
* Classificar em tempo real a situação da validade (Normal, Próximo do vencimento, Vence hoje e Vencido);
* Priorizar visualmente os alimentos por proximidade da data de vencimento com alertas acessíveis;
* Filtrar e pesquisar alimentos por estado (aberto/fechado), texto parcial ou categoria;
* Registrar baixas operacionais segregadas por consumo ou descarte motivado;
* Auditar o histórico imutável das movimentações realizadas;
* Visualizar relatórios e indicadores quantitativos de desperdício.

A solução é hospedada em nuvem, garantindo isolamento estrito de dados entre contas de usuários (multi-inquilino lógico), de modo que cada usuário acesse apenas o seu próprio estoque.

---

## 2. Estrutura Modular da Documentação

A documentação detalhada deste projeto foi dividida em módulos para facilitar a consulta, manutenção e rastreabilidade:

* 📄 **[1. Modelo Conceitual e Escopo](modelo-conceitual.md):** Glossário operacional, premissas, restrições arquiteturais, itens fora de escopo e modelo conceitual de entidades.
* 📄 **[2. Regras de Negócio e Requisitos de Informação](regras-de-negocio.md):** Catálogo formal das regras de vigência, cálculo de prazos, estados, agrupamentos e integridade (RN01 a RN21 e RI01 a RI04).
* 📄 **[3. Catálogo de User Stories](user-stories.md):** Especificação completa das histórias (US01 a US17) estruturadas no padrão INVEST com critérios de aceitação executáveis em BDD (Gherkin).
* 📄 **[4. Requisitos Não Funcionais](requisitos-nao-funcionais.md):** Critérios de persistência, desempenho, acessibilidade (WCAG), responsividade e segurança (RNF01 a RNF06).
* 📄 **[5. Governança, Rastreabilidade e Decisões](governanca-e-processo.md):** Definition of Ready (DoR), Definition of Done (DoD), Matriz de Rastreabilidade cruzada, priorização MoSCoW e registro das decisões de Engenharia de Requisitos.
* 📄 **[6. Cronograma de Desenvolvimento Acelerado por IA](cronograma-ia.md):** Metodologia de aceleração com ferramentas generativas, papéis humanos de validação e planejamento temporal por iterações.