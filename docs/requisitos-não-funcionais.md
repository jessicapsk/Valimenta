# 4. Requisitos Não Funcionais (RNF)

> **Valimenta — Sistema de Controle de Validade de Alimentos**  
> Este documento especifica as restrições de arquitetura, qualidade de software, desempenho, segurança e critérios de experiência de uso (UX/Acessibilidade) que governam a implementação do sistema Valimenta.

---

## 1. Catálogo de Requisitos Não Funcionais

### RNF01 — Persistência e Durabilidade de Dados
* **Categoria:** Confiabilidade / Arquitetura
* **Descrição:** Todos os dados cadastrados (alimentos, lotes, parâmetros pós-abertura e histórico de movimentações) devem ser persistidos em banco de dados hospedado em infraestrutura de nuvem.
* **Critério de Aceitação:** As informações inseridas devem permanecer preservadas e consistentes após o encerramento da sessão ou reinicialização do dispositivo/servidor, sendo recuperadas com sucesso a qualquer momento pelo usuário proprietário autenticado.

---

### RNF02 — Desempenho e Tempo de Resposta
* **Categoria:** Desempenho (*Performance*)
* **Descrição:** As consultas interativas na interface com o usuário devem responder de maneira ágil sob volumes operacionais típicos de uso doméstico.
* **Métrica Quantitativa:** Para um volume de até 200 alimentos ativos vinculados a uma mesma conta, as operações de carregamento da listagem inicial, ordenação por validade, aplicação de filtros (estado e categoria) e pesquisa textual por nome devem retornar e renderizar o resultado na tela em **até 1,0 segundo** sob condições normais de conexão de rede.

---

### RNF03 — Acessibilidade e Inclusão Visual
* **Categoria:** Usabilidade / Acessibilidade (Diretrizes WCAG 2.1 - Nível AA)
* **Descrição:** A interface com o usuário não deve depender exclusivamente de diferenciação por cores para transmitir informações sobre o estado do alimento, alertas de proximidade do vencimento ou situações de validade.
* **Critério de Aceitação:**
  * Toda sinalização de status (Normal, Próximo do vencimento, Vence hoje e Vencido) deve apresentar simultaneamente um **rótulo textual explícito** e/ou um **ícone representativo** padronizado com atributos de acessibilidade (ex.: `aria-label` ou texto legível para leitores de tela).
  * O contraste entre texto e fundo deve atender à proporção mínima de contraste recomendada (mínimo de 4.5:1 para texto normal).

---

### RNF04 — Responsividade e Adaptação de Tela
* **Categoria:** Usabilidade / Portabilidade
* **Descrição:** A aplicação deve adotar design responsivo e adaptável, suportando a navegação em dispositivos móveis e computadores convencionais sem degradação funcional.
* **Métrica Quantitativa:** O layout da aplicação deve ser perfeitamente utilizável em larguras de tela a partir de **360 pixels** (resolução base de smartphones modernos) até resoluções típicas de desktop (1920×1080 ou superior), sem ocorrência de rolagem horizontal involuntária, quebra de elementos visuais ou indisponibilidade de botões e ações de formulário.

---

### RNF05 — Confiabilidade Transacional e Atomicidade
* **Categoria:** Integridade / Confiabilidade
* **Descrição:** As operações de alteração de estado e saldo do sistema devem seguir rigorosamente o princípio de atomicidade transacional (*tudo ou nada*).
* **Critério de Aceitação:** Caso a conexão com a rede ou com o servidor seja interrompida durante uma operação de escrita (cadastro de alimento, registro de abertura, edição cadastral ou baixa operacional):
  * O sistema não deve persistir registros incompletos, duplicados ou inconsistentes no banco de dados;
  * Se a transação falhar em qualquer etapa, todas as alterações parciais daquela requisição devem ser revertidas (*rollback* total), retornando aviso de erro explícito para o usuário.

---

### RNF06 — Segurança, Privacidade e Proteção de Dados
* **Categoria:** Segurança da Informação
* **Descrição:** A arquitetura do sistema deve adotar salvaguardas rigorosas para proteger a comunicação de rede, a privacidade dos dados e as credenciais dos usuários.
* **Critérios de Aceitação:**
  * **Comunicação Segura:** Todas as trocas de informação entre cliente e servidor devem trafegar sob protocolo criptografado HTTPS/TLS.
  * **Armazenamento de Senhas:** Nenhuma credencial deve ser armazenada em texto puro; senhas devem ser processadas com algoritmos seguros de derivação de chave e proteção contra ataques de força bruta (*bcrypt*, *Argon2* ou *PBKDF2*) com uso de *salt* individual.
  * **Isolamento de Tenant (RN17):** O backend deve verificar autorizativamente, em cada endpoint de consulta ou mutação, se o registro acessado pertence à conta do usuário autenticado no token/sessão, prevenindo vulnerabilidades de injeção de identificadores (IDOR - *Insecure Direct Object Reference*).
  * **Proteção de Rotas:** Endpoints de API e rotas de interface protegidas devem bloquear requisições não autenticadas, retornando código de status HTTP apropriado (401 Unauthorized ou 403 Forbidden).

---

## 2. Matriz de Verificação de Requisitos Não Funcionais

| Requisito | Método de Validação | Critério de Sucesso |
| :--- | :--- | :--- |
| **RNF01 (Persistência)** | Teste de ciclo de vida (Login $\rightarrow$ Cadastro $\rightarrow$ Logout $\rightarrow$ Novo Login) | Alimentos e movimentações persistem intactos e acessíveis. |
| **RNF02 (Desempenho)** | Teste de carga e *benchmark* de frontend com massa de 200 itens | Renderização e filtragem concluídas em $\le 1000\text{ ms}$. |
| **RNF03 (Acessibilidade)** | Auditoria com ferramenta de acessibilidade (Lighthouse / Axe Core) e modo tons de cinza | Sem alertas bloqueadores; rótulos textuais e ícones presentes em 100% dos status. |
| **RNF04 (Responsividade)** | Teste de renderização cross-device via emulador de viewport (360px a 1920px) | Layout adaptativo fluido, sem barra de rolagem horizontal no corpo da página. |
| **RNF05 (Confiabilidade)** | Injeção de falhas de conexão/simulação de timeout de rede durante POST/PATCH | Reversão completa da transação; saldo e dados inalterados no banco. |
| **RNF06 (Segurança)** | Teste de invasão / IDOR em chamadas REST e auditoria de hash no banco | Tentativa de acesso com token de outro usuário retorna 403/404; hashes seguros sem reversão. |