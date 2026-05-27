# AGENTES.md — PetroAgent

## 1. Identidade do projeto

**Nome do projeto:** PetroAgent
**Descrição curta:** portal público de um agente inteligente especializado no acompanhamento da Petrobras/PETR4.
**Objetivo:** criar uma plataforma web gratuita, simples e evolutiva que reúna dados públicos, registros internos, análises automatizadas e interações sociais leves em torno da ação da Petrobras.

O PetroAgent não é corretora, casa de análise, recomendação de investimento ou promessa de rentabilidade. Ele é um **radar informativo inteligente** para comunicação, acompanhamento e interpretação de dados públicos sobre Petrobras/PETR4.

---

## 2. Diretrizes gerais para o Codex

Sempre que trabalhar neste projeto:

1. Priorize MVP, simplicidade e custo zero sempre que possível.
2. Não implemente autenticação, cadastro de usuários ou envio de e-mail no MVP 1.
3. Não crie funcionalidades pagas ou dependentes de serviços pagos sem aprovação explícita.
4. Não transforme o produto em recomendação financeira.
5. Use linguagem clara, acessível e visualmente agradável.
6. Mantenha a arquitetura preparada para expansão futura com MCP, mas sem acoplar o MVP 1 a essa camada.
7. Prefira entregas pequenas, testáveis e versionáveis.
8. Sempre crie critérios de aceite claros para cada issue.
9. Sempre que possível, use componentes reutilizáveis.
10. Evite overengineering.
11. Sempre crie uma issue ou card antes de começar a implementação; nada deve avançar sem documentação clara do escopo.

---

## 3. Stack sugerida

### Frontend

- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui
- lucide-react

### Backend/Banco

- Supabase
- PostgreSQL
- Row Level Security quando aplicável

### Deploy

- Vercel

### Automação futura

- GitHub Actions
- Supabase scheduled jobs, se disponível no plano gratuito
- Rotinas manuais inicialmente, se necessário

### IA

- OpenAI ou outro provedor configurável por variável de ambiente
- Chamadas pontuais e com cache
- Nunca executar IA a cada acesso público do usuário no MVP 1

---

## 4. Estratégia de produto

O projeto será dividido em dois grandes blocos:

## MVP 1 — Portal público inteligente

Objetivo: validar interesse, apresentar o PetroAgent, criar presença pública, armazenar dados iniciais e exibir análises do agente.

## MVP 2 — Infraestrutura MCP do agente

Objetivo: permitir que agentes de IA acessem ferramentas estruturadas do PetroAgent, consultem memória, eventos, relatórios e fontes processadas.

---

# MVP 1 — Portal público inteligente

---

## Fase 0 — Fundação técnica

### Objetivo

Criar a base técnica do projeto.

### Issues sugeridas

#### Issue 0.1 — Criar projeto Next.js

**Descrição:**
Inicializar o projeto `petroagent` usando Next.js, TypeScript e estrutura moderna de app router.

**Critérios de aceite:**

- Projeto inicial criado.
- Aplicação roda localmente.
- Estrutura base organizada.
- README inicial criado.

**Sugestão técnica:**

```bash
npx create-next-app@latest petroagent --typescript --tailwind --eslint --app
```

---

#### Issue 0.2 — Configurar Tailwind e shadcn/ui

**Descrição:**
Configurar a base visual do projeto com Tailwind CSS e shadcn/ui.

**Critérios de aceite:**

- Tailwind funcionando.
- shadcn/ui instalado.
- Componentes base disponíveis.
- Página inicial renderizando sem erros.

---

#### Issue 0.3 — Configurar Supabase

**Descrição:**
Adicionar integração inicial com Supabase.

**Critérios de aceite:**

- Cliente Supabase configurado.
- Variáveis de ambiente documentadas.
- Arquivo `.env.example` criado.
- Conexão testável em ambiente local.

---

#### Issue 0.4 — Configurar deploy na Vercel

**Descrição:**
Preparar o projeto para deploy gratuito na Vercel.

**Critérios de aceite:**

- Projeto compatível com Vercel.
- Variáveis necessárias documentadas.
- Build local executado com sucesso.

---

#### Issue 0.5 — Criar identidade visual inicial

**Descrição:**
Criar identidade visual inicial do PetroAgent.

**Critérios de aceite:**

- Definição de paleta visual.
- Tipografia consistente.
- Componentes com aparência moderna.
- Visual inspirado em tecnologia, mercado financeiro e energia, sem copiar identidade oficial da Petrobras.

---

## Fase 1 — Landing page pública

### Objetivo

Apresentar o PetroAgent ao público.

### Issues sugeridas

#### Issue 1.1 — Criar hero principal

**Descrição:**
Criar seção inicial com nome, proposta e CTA visual.

**Texto sugerido:**

> PetroAgent: um agente inteligente acompanhando Petrobras/PETR4 para você.

**Critérios de aceite:**

- Hero responsivo.
- Título claro.
- Subtítulo explicativo.
- CTA para visualizar painel.

---

#### Issue 1.2 — Criar seção “Como funciona”

**Descrição:**
Explicar de forma simples como o agente coleta, registra, interpreta e apresenta informações.

**Critérios de aceite:**

- Seção com 3 ou 4 passos.
- Linguagem acessível.
- Sem prometer recomendação financeira.

---

#### Issue 1.3 — Criar seção “O que o agente monitora”

**Descrição:**
Listar os principais tipos de informação acompanhados.

**Itens sugeridos:**

- Fatos relevantes
- Comunicados de RI
- Notícias públicas
- Eventos corporativos
- Dados básicos de PETR4
- Resumos gerados por IA

**Critérios de aceite:**

- Cards visuais.
- Ícones simples.
- Layout responsivo.

---

#### Issue 1.4 — Criar seção “Última análise do agente”

**Descrição:**
Exibir um card com a análise mais recente salva no banco ou fallback estático.

**Critérios de aceite:**

- Card visível na home.
- Exibe título, resumo, data e status.
- Usa fallback se não houver dados.

---

#### Issue 1.5 — Criar footer institucional

**Descrição:**
Criar rodapé com links, aviso legal e contato básico.

**Critérios de aceite:**

- Footer responsivo.
- Aviso de que não é recomendação de investimento.
- Link para GitHub, LinkedIn ou contato do criador.

---

## Fase 2 — Interação pública sem cadastro

### Objetivo

Criar engajamento sem login, sem email e sem custo.

### Regras

- Não criar cadastro.
- Não pedir email.
- Não enviar notificações.
- Não usar serviço pago.
- A interação deve ser leve, divertida e pública.

### Issues sugeridas

#### Issue 2.1 — Criar botão “Gostei do projeto ❤️”

**Descrição:**
Criar botão público de interação onde qualquer visitante pode clicar para demonstrar apoio.

**Critérios de aceite:**

- Botão visível na home.
- Clique incrementa contador.
- Feedback visual após o clique.
- Usuário pode clicar mais de uma vez.

---

#### Issue 2.2 — Criar contador global de curtidas

**Descrição:**
Persistir e exibir o número total de cliques no botão de apoio.

**Critérios de aceite:**

- Contador global salvo no Supabase.
- Contador aparece no site.
- Atualização visual após clique.

**Tabela sugerida:**

```sql
create table public.project_likes (
  id bigint generated by default as identity primary key,
  created_at timestamp with time zone default now(),
  source text default 'web'
);
```

---

#### Issue 2.3 — Criar microinterações do botão

**Descrição:**
Adicionar animações simpáticas ao botão de gostei.

**Critérios de aceite:**

- Animação leve ao clicar.
- Mensagem amigável após clique.
- Não prejudica performance.

**Mensagens sugeridas:**

- “Valeu pelo apoio!”
- “O PetroAgent ficou feliz com isso.”
- “Mais um investidor curioso por aqui.”
- “Obrigado por fortalecer o projeto.”

---

#### Issue 2.4 — Criar proteção simples anti-abuso

**Descrição:**
Adicionar proteção mínima para evitar abuso excessivo, sem impedir a brincadeira.

**Critérios de aceite:**

- Rate limit simples por sessão ou localStorage.
- Não exige login.
- Não coleta dados pessoais sensíveis.

---

## Fase 3 — Painel Petrobras

### Objetivo

Criar o painel público principal do agente.

### Issues sugeridas

#### Issue 3.1 — Criar página `/petrobras`

**Descrição:**
Criar página dedicada ao painel do PetroAgent para Petrobras/PETR4.

**Critérios de aceite:**

- Página acessível por rota.
- Layout responsivo.
- Estrutura preparada para dados reais e fallback.

---

#### Issue 3.2 — Criar card de dados básicos PETR4

**Descrição:**
Exibir dados básicos da ação PETR4.

**Campos sugeridos:**

- Ticker
- Nome da empresa
- Último preço conhecido
- Variação
- Data/hora da última atualização
- Fonte

**Critérios de aceite:**

- Card visualmente claro.
- Indica quando dado é mock, cache ou dado real.
- Não promete tempo real.

---

#### Issue 3.3 — Criar seção “Resumo inteligente”

**Descrição:**
Exibir resumo mais recente gerado pelo agente.

**Critérios de aceite:**

- Mostra resumo salvo no banco.
- Mostra fallback se não houver relatório.
- Indica data da geração.

---

#### Issue 3.4 — Criar indicador de sentimento

**Descrição:**
Exibir sentimento textual do agente.

**Estados sugeridos:**

- Otimista
- Neutro
- Cauteloso
- Atenção elevada

**Critérios de aceite:**

- Indicador simples e visual.
- Baseado em relatório salvo.
- Não apresentado como recomendação.

---

#### Issue 3.5 — Criar timeline de eventos

**Descrição:**
Exibir últimos eventos relevantes acompanhados pelo agente.

**Critérios de aceite:**

- Timeline ordenada por data.
- Exibe tipo do evento.
- Exibe fonte quando disponível.
- Usa dados do banco ou fallback.

---

## Fase 4 — Banco de conhecimento do agente

### Objetivo

Criar a memória persistente do PetroAgent.

### Issues sugeridas

#### Issue 4.1 — Criar tabela `sources`

```sql
create table public.sources (
  id bigint generated by default as identity primary key,
  created_at timestamp with time zone default now(),
  source_type text not null,
  title text,
  url text,
  published_at timestamp with time zone,
  raw_content text,
  processed boolean default false
);
```

**Critérios de aceite:**

- Tabela criada.
- Campos documentados.
- Preparada para fontes públicas.

---

#### Issue 4.2 — Criar tabela `market_events`

```sql
create table public.market_events (
  id bigint generated by default as identity primary key,
  created_at timestamp with time zone default now(),
  event_date timestamp with time zone,
  event_type text not null,
  title text not null,
  summary text,
  source_id bigint references public.sources(id),
  relevance_score integer
);
```

---

#### Issue 4.3 — Criar tabela `agent_reports`

```sql
create table public.agent_reports (
  id bigint generated by default as identity primary key,
  created_at timestamp with time zone default now(),
  title text not null,
  summary text not null,
  sentiment text,
  attention_points text[],
  source_count integer default 0,
  model_used text
);
```

---

#### Issue 4.4 — Criar tabela `market_snapshots`

```sql
create table public.market_snapshots (
  id bigint generated by default as identity primary key,
  created_at timestamp with time zone default now(),
  ticker text not null,
  price numeric,
  variation numeric,
  volume numeric,
  source text,
  snapshot_time timestamp with time zone
);
```

---

## Fase 5 — Coleta de dados

### Objetivo

Criar rotinas de alimentação do agente.

### Issues sugeridas

#### Issue 5.1 — Criar coletor manual de fontes

**Descrição:**
Criar script ou endpoint administrativo simples para registrar manualmente fontes públicas.

**Critérios de aceite:**

- Permite inserir título, URL, tipo e conteúdo.
- Salva em `sources`.
- Não exige painel administrativo complexo.

---

#### Issue 5.2 — Criar coletor de RI Petrobras

**Descrição:**
Criar rotina para buscar publicações públicas de RI da Petrobras quando tecnicamente possível.

**Critérios de aceite:**

- Fonte documentada.
- Erros tratados.
- Dados salvos em `sources`.
- Sem scraping agressivo.

---

#### Issue 5.3 — Criar rotina de cache

**Descrição:**
Evitar chamadas repetidas a fontes externas.

**Critérios de aceite:**

- Dados coletados são persistidos.
- Frontend lê preferencialmente do banco.
- Reduz dependência de chamadas em tempo real.

---

## Fase 6 — Inteligência artificial

### Objetivo

Transformar dados coletados em interpretação simples.

### Issues sugeridas

#### Issue 6.1 — Criar prompt-base do PetroAgent

**Descrição:**
Criar prompt do agente com regras de segurança, tom e limites.

**Prompt-base sugerido:**

```text
Você é o PetroAgent, um agente informativo especializado no acompanhamento público da Petrobras/PETR4.

Sua função é resumir informações públicas, organizar eventos relevantes e explicar possíveis impactos de forma clara e acessível.

Regras:
- Não faça recomendação de compra, venda ou manutenção.
- Não prometa rentabilidade.
- Não use linguagem de certeza sobre o futuro.
- Diferencie fato, interpretação e hipótese.
- Cite as fontes analisadas quando disponíveis.
- Seja claro, objetivo e didático.
```

---

#### Issue 6.2 — Criar pipeline de geração de relatório

**Descrição:**
Criar função que recebe fontes não processadas, gera relatório e salva em `agent_reports`.

**Critérios de aceite:**

- Busca fontes recentes.
- Gera resumo.
- Gera sentimento textual.
- Gera pontos de atenção.
- Salva relatório.
- Marca fontes como processadas quando aplicável.

---

#### Issue 6.3 — Criar fallback sem IA

**Descrição:**
Criar fallback quando a IA estiver indisponível ou sem chave configurada.

**Critérios de aceite:**

- Sistema continua funcionando.
- Exibe mensagem transparente.
- Não quebra o painel público.

---

#### Issue 6.4 — Persistir relatórios gerados

**Descrição:**
Persistir relatórios gerados pelo agente na tabela `petroagent.agent_reports`
para histórico, auditoria e exibição pública.

**Critérios de aceite:**

- Serviço `services/reports.ts` com `saveReport()` e `listReports()`.
- Endpoint `POST /api/reports` grava relatório gerado.
- Endpoint `GET /api/reports` lista relatórios paginados.
- Testes automatizados cobrindo persistência e API.
- Documentação atualizada em `README.md` e `AGENTES.md`.

---

## Fase 7 — Página do criador e apoio

### Objetivo

Humanizar o projeto e permitir contato/doação.

### Issues sugeridas

#### Issue 7.1 — Criar seção “Apoie o projeto”

**Descrição:**
Criar seção explicando que o projeto é experimental, gratuito e pode ser apoiado.

**Critérios de aceite:**

- Texto claro e simpático.
- Sem paywall.
- Sem prometer benefício financeiro.

---

#### Issue 7.2 — Adicionar QRCode PIX

**Descrição:**
Adicionar área para QRCode de doação PIX.

**Critérios de aceite:**

- Exibe imagem do QRCode quando disponível.
- Exibe chave PIX textual opcional.
- Permite fallback se QRCode ainda não estiver configurado.

---

#### Issue 7.3 — Criar seção “Entre em contato com o criador”

**Descrição:**
Criar bloco com dados de contato do criador.

**Campos sugeridos:**

- Nome
- Email
- LinkedIn
- GitHub
- Mensagem pessoal

**Critérios de aceite:**

- Dados configuráveis por arquivo ou variável.
- Layout amigável.
- Sem expor informação sensível além da escolhida pelo criador.

---

#### Issue 7.4 — Criar roadmap público

**Descrição:**
Exibir roadmap resumido do projeto.

**Critérios de aceite:**

- Mostra MVP 1 e MVP 2.
- Indica funcionalidades futuras.
- Ajuda visitantes a entender evolução do projeto.

---

# MVP 2 — Infraestrutura MCP do agente

---

## Fase 8 — MCP Server

### Objetivo

Criar um servidor MCP para permitir que agentes de IA consultem e operem ferramentas do PetroAgent.

### Diretriz

O MCP não deve bloquear o MVP 1. Ele é uma evolução arquitetural.

### Issues sugeridas

#### Issue 8.1 — Criar estrutura do MCP Server

**Descrição:**
Criar diretório e estrutura inicial para servidor MCP.

**Estrutura sugerida:**

```text
mcp-server/
  src/
    server.ts
    tools/
    db/
  package.json
  tsconfig.json
```

**Critérios de aceite:**

- Servidor MCP inicial criado.
- Scripts de start documentados.
- Não interfere no build do frontend.

---

#### Issue 8.2 — Criar tool `get_latest_report`

**Descrição:**
Ferramenta MCP para recuperar o relatório mais recente do PetroAgent.

**Entrada:** nenhuma ou ticker opcional.
**Saída:** último relatório salvo.

**Critérios de aceite:**

- Consulta `agent_reports`.
- Retorna dados estruturados.
- Trata ausência de relatório.

---

#### Issue 8.3 — Criar tool `list_market_events`

**Descrição:**
Ferramenta MCP para listar eventos recentes da Petrobras/PETR4.

**Entrada sugerida:**

- limit
- event_type
- date_from
- date_to

**Critérios de aceite:**

- Consulta `market_events`.
- Permite filtros simples.
- Retorna eventos ordenados por data.

---

#### Issue 8.4 — Criar tool `get_market_snapshot`

**Descrição:**
Ferramenta MCP para recuperar último snapshot de mercado salvo.

**Critérios de aceite:**

- Consulta `market_snapshots`.
- Retorna último registro por ticker.
- Não depende de API externa em tempo real.

---

#### Issue 8.5 — Criar tool `search_agent_memory`

**Descrição:**
Ferramenta MCP para buscar fontes, eventos e relatórios por termo.

**Critérios de aceite:**

- Busca textual inicial.
- Retorna tipo do item encontrado.
- Retorna link/fonte quando disponível.

---

## Fase 9 — Ferramentas inteligentes

### Objetivo

Adicionar capacidades mais avançadas ao agente.

### Issues sugeridas

#### Issue 9.1 — Criar busca semântica futura

**Descrição:**
Planejar e implementar busca semântica usando embeddings quando houver necessidade real.

**Critérios de aceite:**

- Arquitetura documentada.
- Implementação opcional.
- Não obrigatória para MVP 1.

---

#### Issue 9.2 — Criar comparação temporal

**Descrição:**
Permitir comparar relatório atual com relatórios anteriores.

**Critérios de aceite:**

- Recupera relatórios por período.
- Aponta mudanças de sentimento.
- Resume diferenças principais.

---

#### Issue 9.3 — Criar sumarização contextual

**Descrição:**
Permitir que o agente gere respostas com base em múltiplas fontes salvas.

**Critérios de aceite:**

- Usa fontes persistidas.
- Evita chamadas externas desnecessárias.
- Cita fontes internas quando disponíveis.

---

## Fase 10 — Arquitetura multiagente

### Objetivo

Preparar o PetroAgent para expansão futura.

### Possibilidades

- ValeAgent
- WEGAgent
- BBAgent
- Radar setorial
- Multiagentes por empresa

### Issues sugeridas

#### Issue 10.1 — Criar abstração de empresa monitorada

**Descrição:**
Generalizar o modelo para suportar outras empresas no futuro.

**Critérios de aceite:**

- Criar conceito de `company` ou `asset`.
- Não quebrar Petrobras/PETR4.
- Preparar evolução sem migração traumática.

---

#### Issue 10.2 — Criar arquitetura modular de agentes

**Descrição:**
Separar regras específicas por empresa/agente.

**Critérios de aceite:**

- Cada agente pode ter prompt próprio.
- Cada agente pode ter fontes próprias.
- Estrutura extensível.

---

# Scripts operacionais para o Codex

## Script 1 — Criar o repositório base

```text
Crie a base do projeto PetroAgent conforme o arquivo AGENTES.md.

Implemente apenas a Fase 0 do MVP 1 neste primeiro momento.

Entregue:
- projeto Next.js com TypeScript
- Tailwind CSS configurado
- shadcn/ui configurado
- estrutura inicial de pastas
- README inicial
- .env.example
- build local funcionando

Não implemente Supabase real ainda se as credenciais não existirem. Apenas deixe a estrutura preparada e documentada.
```

---

## Script 2 — Criar landing page

```text
Implemente a Fase 1 do MVP 1 do PetroAgent.

Crie uma landing page moderna, responsiva e agradável para apresentar o PetroAgent como um agente inteligente especializado em Petrobras/PETR4.

Inclua:
- hero principal
- seção Como funciona
- seção O que o agente monitora
- seção Última análise do agente com fallback estático
- footer com aviso legal

Não crie cadastro, login ou envio de email.
Não faça recomendação financeira.
```

---

## Script 3 — Criar botão de interação pública

```text
Implemente a Fase 2 do MVP 1 do PetroAgent.

Crie um botão “Gostei do projeto ❤️” com contador global persistente.

Regras:
- sem login
- sem cadastro
- sem email
- usuário pode clicar mais de uma vez
- adicionar microinteração visual
- persistir contador no Supabase quando configurado
- criar fallback local quando Supabase não estiver configurado

Inclua a migration SQL necessária para a tabela project_likes.
```

---

## Script 4 — Criar painel Petrobras

```text
Implemente a Fase 3 do MVP 1 do PetroAgent.

Crie a rota /petrobras com o painel público do agente.

Inclua:
- card PETR4
- resumo inteligente
- indicador de sentimento
- timeline de eventos
- seção “O agente observou”

Use dados mockados/fallback inicialmente, mas estruture os componentes para receber dados reais do banco futuramente.
Indique visualmente quando os dados forem demonstrativos.
```

---

## Script 5 — Criar banco de conhecimento

```text
Implemente a Fase 4 do MVP 1 do PetroAgent.

Crie as migrations SQL para as tabelas:
- sources
- market_events
- agent_reports
- market_snapshots

Também crie tipos TypeScript correspondentes e funções simples de leitura para o frontend.

Não implemente coleta automática ainda.
```

---

## Script 6 — Criar página do criador e apoio

```text
Implemente a Fase 7 do MVP 1 do PetroAgent.

Crie uma seção ou página “Sobre o criador / Apoie o projeto”.

Inclua:
- espaço para QRCode PIX
- chave PIX opcional
- nome do criador
- email
- LinkedIn
- GitHub
- mensagem pessoal
- roadmap público resumido

Os dados devem ser configuráveis em um arquivo de configuração local, sem necessidade de banco.
```

---

## Script 7 — Preparar MCP Server futuro

```text
Prepare a estrutura inicial do MVP 2 sem integrar ao frontend ainda.

Crie o diretório mcp-server com estrutura TypeScript mínima para um servidor MCP futuro.

Inclua stubs documentados para as tools:
- get_latest_report
- list_market_events
- get_market_snapshot
- search_agent_memory

Não implemente lógica completa ainda.
Não quebre o build do projeto principal.
Documente no README como essa camada será usada no futuro.
```

---

# Aviso legal padrão

Usar este texto como base no site:

```text
O PetroAgent é um projeto experimental e informativo. As informações exibidas são geradas a partir de dados públicos, registros internos e processamento automatizado. Este projeto não constitui recomendação de compra, venda ou manutenção de ativos financeiros. Decisões de investimento devem ser tomadas com responsabilidade e, quando necessário, com apoio de profissionais habilitados.
```

---

# Tom de comunicação do PetroAgent

O PetroAgent deve se comunicar como:

- claro
- inteligente
- acessível
- confiável
- direto
- sem arrogância
- sem promessa de ganho

Evitar linguagem como:

- “compre agora”
- “venda agora”
- “oportunidade garantida”
- “sinal certeiro”
- “lucro certo”

Preferir linguagem como:

- “o agente observou”
- “há um ponto de atenção”
- “o dado sugere”
- “o mercado pode interpretar”
- “vale acompanhar”
- “não constitui recomendação”

---

# Histórico operacional

## Estado consolidado em 26/05/2026

O PetroAgent já possui a fundação do MVP 1 e a fundação inicial do MVP 2:

1. O portal público foi estruturado com landing page, identidade visual, painel `/petrobras`, botão de curtida, página/área do criador, roadmap e avisos de não recomendação financeira.
2. O banco usa o projeto Supabase existente do `comprovou`, sempre isolando as tabelas do PetroAgent no schema `petroagent`.
3. As tabelas principais do produto foram criadas em migrations versionadas, incluindo curtidas, fontes, eventos, snapshots e relatórios do agente.
4. O fluxo de deploy usa Vercel com esteiras de preview e produção.
5. O MCP Server foi iniciado no PR #70, com validação em CI via `verify:mcp` dentro de `verify:ci`.

Tools MCP consolidadas até este ponto:

- `get_agent_profile`
- `get_market_snapshot`
- `search_agent_memory`
- `compare_reports`
- `summarize_context`

O MCP ainda é fundação técnica. Ele não deve ser tratado como agente autônomo em produção até existir cobertura mínima de testes, execução manual, logs e gatilho protegido.

## Próxima leva de qualidade

Antes de avançar na execução real do agente, a próxima sequência oficial de issues é:

1. #71 — Cobrir tools MCP com testes unitários.
2. #72 — Validar registro das tools MCP.
3. #73 — Criar fixtures compartilhadas para Supabase.
4. #75 — Documentar matriz de cobertura e CI.
5. #74 — Adicionar smoke visual/e2e da home e painel.

A ordem acima deve respeitar dependências e custo de manutenção. O smoke visual/e2e pode ficar depois da matriz de testes para evitar peso prematuro no CI.

Matriz de testes esperada após esta leva:

- `test:unit`: serviços, coletores, utilitários e funções puras.
- `test:integration`: rotas e componentes interativos.
- `test:context`: narrativa, limites de produto e avisos essenciais.
- `test:smoke`: smoke visual leve da home e do painel em desktop/mobile.
- `verify:mcp`: testes, typecheck e build do servidor MCP.
- `verify:ci`: validação completa para PRs e produção.

## Próxima leva do agente

Depois da leva mínima de testes, o agente deve evoluir nesta ordem:

1. #77 — Criar executor manual do PetroAgent.
2. #78 — Registrar logs de execução.
3. #79 — Criar gatilho manual protegido.
4. #80 — Preparar agendamento futuro do radar.
5. #81 — Documentar runbook operacional.

Regras para esta etapa:

- Começar com execução manual, nunca com automação cega.
- Não acionar IA real em cada acesso público do usuário.
- Não criar recomendação financeira, preço-alvo ou promessa de rentabilidade.
- Persistir resultados em `petroagent.agent_reports`.
- Se criar novas tabelas, usar migrations em `supabase/migrations` e sempre no schema `petroagent`.
- Proteger qualquer endpoint operacional com variável de ambiente/token server-side.

Decisão da #77:

- O agente começa com `npm run agent:run`.
- O executor lê contexto persistido e salva novo relatório em `petroagent.agent_reports`.
- Sem chave de IA, usa fallback determinístico.
- Não há cron, endpoint público ou automação nesta etapa.

Decisões da leva #78-#81:

- Toda execução do agente deve registrar log em `petroagent.agent_execution_logs`.
- O gatilho manual protegido é `POST /api/agent/run` com `PETROAGENT_AGENT_RUN_TOKEN`.
- O gatilho futuro de cron é `GET /api/agent/run` com `CRON_SECRET`.
- O cron não fica ativo até validação manual em produção e aprovação explícita.
- O runbook operacional fica documentado no README e em `agents/README.md`.

---

# Prioridade atual

A prioridade atual é validar a operação manual do agente antes de ativar qualquer automação.

Sequência recomendada:

1. Validar manualmente `npm run agent:run` com secrets reais em ambiente controlado.
2. Validar `POST /api/agent/run` em preview com token.
3. Conferir registros em `petroagent.agent_execution_logs` e relatórios em `petroagent.agent_reports`.
4. Só ativar cron depois de aprovação explícita.

Cada issue deve ter branch própria, PR, preview validado e merge para `main` somente após aprovação.

---

# Definição de pronto

Uma entrega só deve ser considerada pronta quando:

- roda localmente
- passa no build
- não quebra rotas existentes
- tem layout responsivo
- tem fallback para ausência de dados
- evita dependência paga
- mantém aviso de não recomendação financeira quando necessário
