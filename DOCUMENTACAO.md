# Documentação do Projeto: My Street Burger SaaS

## Visão Geral e Estado Atual do Projeto
O projeto **My Street Burger SaaS** é um sistema projetado para gerenciamento e operação de hamburguerias, divido em uma arquitetura de cliente e servidor (`frontend` e `server`). Atualmente, o sistema conta com a infraestrutura inicial configurada com:
- **Frontend**: Aplicação web localizada no diretório `frontend/web`.
- **Backend**: Servidor localizado no diretório `server`, utilizando Node.js e Prisma ORM (evidenciado pelos arquivos `schema.prisma` e `prisma.config.ts` abertos no editor).
- **Hospedagem/Deploy**: Integração inicial configurada para deploy na Vercel (arquivo `vercel.json`).

O sistema permite a gestão inicial do estabelecimento, como o cardápio, porém encontra-se em uma fase em que precisa de aprimoramentos significativos em segurança, usabilidade, estética e novas funcionalidades de engajamento do usuário.

---

## Metas de Melhoria

Para evoluir a plataforma para o próximo nível, estabelecemos as seguintes metas prioritárias:

### 1. Melhoria na Segurança do Sistema
- **Autenticação e Autorização:** Reforçar os mecanismos de login e verificação de tokens (JWT).
- **Proteção de Dados:** Garantir que dados sensíveis de clientes e configurações de lojas estejam fortemente encriptados.
- **Validação:** Implementar validação rigorosa de dados tanto no front-end quanto no back-end para prevenir ataques como Injeção de SQL/NoSQL e XSS.
- **Rate Limiting:** Adicionar limites de requisições às rotas da API para mitigar tentativas de ataques DDoS ou força bruta.

### 2. Visual Mais Limpo e Estético (UI/UX)
- **Aperfeiçoamento do Design:** Adotar um design system moderno, focando no minimalismo, melhor contraste, hierarquia visual e uso de cores vibrantes apenas onde for necessário para chamar a atenção.
- **Microinterações:** Adicionar animações suaves nas transições de página, hovers e botões para garantir que a interface pareça viva e premium.
- **Responsividade:** Garantir que o painel de administração e a interface do cliente final sejam 100% otimizados para dispositivos móveis, tablets e desktops.

### 3. Aprimoramento da Gestão de Cardápio (Preview 3D)
- **Adição de Campo de Imagem/Modelo:** Atualização no banco de dados (Prisma) e na interface (`Menu.jsx`) para permitir a inclusão de imagens detalhadas e de um arquivo de modelo para cada produto.
- **Visualização 3D:** Implementação de um visualizador interativo em 3D para que os clientes possam ter uma prévia realista de como os produtos (ex: hambúrgueres) ficarão antes de fazer o pedido.

---

> [!IMPORTANT]  
> **Aviso de Registro de Mudanças**
> Fica estabelecido que **absolutamente toda mudança feita no projeto a partir de agora será rigorosamente documentada e registrada neste documento**. Esta página servirá como a única e principal fonte da verdade ("Single Source of Truth") para acompanhar o progresso, as alterações de código e as evoluções na arquitetura do sistema.

## Registro de Alterações (Changelog)

*(As futuras atualizações no sistema, incluindo o progresso das metas acima, serão adicionadas abaixo com a data e a descrição exata das mudanças implementadas).*

- **20/09/2026** - Criação da documentação inicial do projeto e definição das metas de segurança, estética e funcionalidades 3D para o cardápio.
- **20/09/2026 — FASE 1: Segurança** — Correções implementadas:
  - ✅ **CORS corrigido**: `origin: true` substituído por validação contra lista de origens permitidas (`app.js`)
  - ✅ **Rate Limiter Global**: Adicionado limite de 500 req/15min em todas as rotas `/api` (`app.js`)
  - ✅ **Rate Limiter de Pedidos**: Adicionado limite de 20 req/5min na rota pública de pedidos anti-spam (`app.js`)
  - ✅ **Rate Limiter de Auth**: Reduzido de 100 para 50 req/15min nas rotas de autenticação (`app.js`)
  - ✅ **JWT mais seguro**: Validade reduzida de 7 dias para 24 horas (`authController.js`)
  - ✅ **Senha mais forte**: Requisitos aumentados para 8 chars + maiúscula + número (`authSchemas.js`)
  - ✅ **Enum padronizado**: Removido `CANCELLED` duplicado, mantido apenas `CANCELED` (`orderSchemas.js`, `orderController.js`)
- **20/09/2026 — FASE 2: Visual Mais Limpo e Estético** — Mudanças implementadas:
  - ✅ **Design System Centralizado**: Extração de todos os estilos `<style>` inline dos componentes para o `index.css` global.
  - ✅ **Polimento Visual**: Implementação de micro-animações (fade-up, flicker, toast, badges flutuantes) de forma consistente em todo o SaaS.
  - ✅ **Toast Notifications**: Criação do `ToastContext` para substituir definitivamente os pop-ups feios de `alert()` nativos no Painel Admin, KDS, Login e Checkout.
- **20/09/2026 — FASE 3: Gestão de Cardápio e Preview 3D** — Mudanças implementadas:
  - ✅ **Atualização de Banco de Dados**: Adicionado o campo `modelUrl` na tabela `Product` no arquivo `schema.prisma`.
  - ✅ **Atualização de API**: Atualização do `menuSchemas.js` e `menuController.js` para salvar e retornar os campos `imageUrl` e `modelUrl`.
  - ✅ **Formulário Admin**: O Painel de Admin agora permite a inserção das URLs de imagem e modelo 3D (.glb/.gltf).
  - ✅ **Cardápio Interativo**: O `Menu.jsx` do cliente agora renderiza dinamicamente o modelo 3D interativo na tela de detalhes do produto utilizando o `<model-viewer>` do Google, e exibe o selo "3D" nas vitrines dos lanches contemplados.

