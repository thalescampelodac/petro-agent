# PetroAgent

PetroAgent e um portal publico de um agente inteligente especializado no
acompanhamento informativo da Petrobras/PETR4. O produto funciona como um radar:
organiza dados publicos, registra eventos relevantes e prepara analises
automatizadas com linguagem clara, sem atuar como corretora, casa de analise ou
recomendacao de investimento.

GitHub Project oficial: <https://github.com/users/thalescampelodac/projects/3>
Link do app: <https://petro-agent.vercel.app/>

## Visao do produto

O objetivo e validar um portal gratuito, simples e evolutivo para pessoas que
querem acompanhar Petrobras/PETR4 com contexto. O PetroAgent deve explicar o que
observou, apontar pontos de atencao e manter transparencia sobre fontes,
fallbacks e limites do dado apresentado.

Aviso legal base:

> O PetroAgent e um projeto experimental e informativo. As informacoes exibidas
> sao geradas a partir de dados publicos, registros internos e processamento
> automatizado. Este projeto nao constitui recomendacao de compra, venda ou
> manutencao de ativos financeiros. Decisoes de investimento devem ser tomadas
> com responsabilidade e, quando necessario, com apoio de profissionais
> habilitados.

## Arquitetura

- `app/`: rotas Next.js App Router e paginas publicas.
- `components/`: componentes reutilizaveis, incluindo shadcn/ui.
- `lib/`: utilitarios compartilhados e clientes de infraestrutura.
- `lib/supabase/`: clientes Supabase para browser e server.
- `services/`: integracoes e regras de aplicacao.
- `agents/`: regras e configuracoes do PetroAgent.
- `database/`: migrations SQL, notas de schema e RLS.
- `prompts/`: prompts versionados do agente.
- `mcp/`: preparacao da camada MCP futura, sem bloquear o MVP 1.

Stack inicial:

- Next.js com App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- lucide-react
- Supabase preparado via `@supabase/ssr` e `@supabase/supabase-js`
- Vercel como alvo de deploy

## Roadmap

### MVP 1 - Portal publico inteligente

1. Fase 0: fundacao tecnica, Next.js, Tailwind, shadcn/ui, Supabase e Vercel.
2. Fase 1: landing page publica com hero, monitoramento, resumo inteligente
   mockado, como funciona, roadmap, criador e aviso legal.
3. Fase 2: interacao publica sem cadastro com botao de apoio e contador.
4. Fase 3: painel `/petrobras` com dados PETR4, resumo, sentimento e timeline.
5. Fase 4: banco de conhecimento com fontes, eventos, relatorios e snapshots.
6. Fase 5: rotinas de coleta inicialmente manuais e com cache.
7. Fase 6: geracao de relatorios com IA e fallback sem IA.
8. Fase 7: pagina do criador, apoio e roadmap publico.

### MVP 2 - Infraestrutura MCP do agente

1. Fase 8: servidor MCP futuro e tools estruturadas.
2. Fase 9: ferramentas inteligentes como busca semantica e comparacao temporal.
3. Fase 10: arquitetura multiagente para outras empresas ou ativos.

## Execucao local

Crie `.env.local` a partir de `.env.example` e preencha as variaveis quando
houver um projeto Supabase:

```bash
cp .env.example .env.local
npm install
npm run dev
```

Comandos principais:

```bash
npm run dev
npm run lint
npm test
npm run test:unit
npm run test:integration
npm run test:context
npm run build
```

Camadas de teste:

- Unitarios: validam funcoes isoladas e utilitarios puros.
- Integracao: validam componentes interativos e comportamento de UI.
- Contexto: validam narrativa, limites de produto e mensagens essenciais da
  experiencia publica.

## Status da landing

A home atual e uma landing page estatica e responsiva para validar UX,
branding e percepcao de produto. Ela usa dados mockados/simulados e ainda nao
executa backend complexo, coleta real ou IA em producao.

As variaveis esperadas para Supabase sao:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

`OPENAI_API_KEY` esta documentada apenas para uso futuro no servidor. Nao exponha
chaves privadas com prefixo `NEXT_PUBLIC_`.

## Deploy na Vercel

O projeto esta preparado para deploy padrao de Next.js na Vercel. Configure as
mesmas variaveis de ambiente do `.env.example` no projeto Vercel antes do build
de producao.

## CI/CD

O projeto usa GitHub Actions como esteira oficial de validacao e deploy:

- `.github/workflows/preview.yml`: roda em pull requests para `main`, executa
  `npm run verify:ci` e publica um deploy preview na Vercel.
- `.github/workflows/production.yml`: roda em push na `main`, executa
  `npm run verify:ci` e publica producao na Vercel com `--prod`.

Secrets esperados no GitHub:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

Para preencher `VERCEL_ORG_ID` e `VERCEL_PROJECT_ID`, vincule o projeto Vercel
localmente e consulte `.vercel/project.json`. O token deve ser criado nas
configuracoes da conta Vercel.

Se o deploy automatico da integracao GitHub/Vercel estiver ligado, desative-o
ou alinhe a configuracao para evitar deploy duplicado. A esteira oficial deste
repositorio deve ser o GitHub Actions.

## Banco de dados

As tabelas do PetroAgent devem ficar no schema `petroagent`, nao soltas no
schema `public`. As migrations versionadas ficam em `supabase/migrations`.
A primeira migration cria:

- schema `petroagent`
- tabela `petroagent.project_likes`
- RLS para insert/select publico do contador de apoio
- grants minimos para `anon` e `authenticated`

A migration de memória de mercado cria:

- tabela `petroagent.sources`
- tabela `petroagent.market_events`
- tabela `petroagent.agent_reports`
- tabela `petroagent.market_snapshots`
- RLS com leitura pública nas tabelas do painel e `sources` restrita ao backend
- escrita reservada ao backend com `service_role`

Para usar a tabela via Supabase Data API, adicione `petroagent` em Project
Settings > Data API > Exposed schemas no projeto Supabase existente.

## Relacao com o GitHub Project

O quadro oficial de gestao e o GitHub Project numero 3 do usuario
`thalescampelodac`. As issues devem seguir as fases do `AGENTES.md` e usar
criterios de aceite claros. A organizacao recomendada e:

- MVP por label (`mvp-1`, `mvp-2`)
- fase por label (`fase-0`, `fase-1`, ...)
- prioridade por Project field (`P0`, `P1`, `P2`)
- area por Project field (`Frontend`, `Backend`, `Infra`, `Design`, `Content`)
- dependencia descrita no corpo da issue quando existir

## Principios

- Priorizar MVP, simplicidade e custo zero.
- Nao implementar login, cadastro ou email no MVP 1.
- Nao criar funcionalidades pagas sem aprovacao explicita.
- Nao prometer rentabilidade nem emitir recomendacao financeira.
- Preparar expansao futura com MCP sem acoplar o MVP 1 a essa camada.
