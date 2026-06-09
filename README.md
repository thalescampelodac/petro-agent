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
- `mcp/`: notas da camada MCP futura, sem bloquear o MVP 1.
- `mcp-server/`: servidor MCP inicial do MVP 2, isolado do build do frontend.

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

1. Fase 8: servidor MCP e tools estruturadas de leitura.
2. Fase 9: ferramentas inteligentes como busca textual, comparacao temporal e
   sumarizacao contextual com dados persistidos.
3. Fase 10: arquitetura multiagente para outras empresas ou ativos.

## MCP Server

O servidor MCP inicial fica em `mcp-server/` e possui dependências, `tsconfig` e
scripts próprios. Ele não é executado pelo build do Next.js.

No MVP 2, o MCP passa a ser o contrato operacional do PetroAgent. Agentes
internos e externos devem usar suas tools para consultar contexto, registrar
dados e gerar análises. O app Next.js continua responsável apenas por exibir os
dados, lendo banco/cache server-side quando necessário.

```bash
cd mcp-server
npm install
npm run dev
```

Tools disponíveis:

- `get_agent_profile`: retorna o perfil modular ativo e a abstração inicial de
  empresa/ativo monitorado.
- `get_latest_report`: consulta `petroagent.agent_reports` e retorna o relatório
  mais recente em formato textual e estruturado.
- `list_market_events`: consulta `petroagent.market_events` e retorna eventos
  ordenados por data, com filtros simples por tipo e período.
- `get_market_snapshot`: consulta o último snapshot salvo por ticker em
  `petroagent.market_snapshots`, sem API externa em tempo real.
- `search_agent_memory`: busca texto em fontes, eventos e relatórios salvos.
- `compare_reports`: compara relatórios por período e aponta mudanças básicas
  de sentimento e quantidade de fontes.
- `summarize_context`: sintetiza fontes e eventos persistidos sem chamada de IA.
- `register_source`: registra fontes públicas no schema `petroagent`.
- `register_market_event`: registra eventos relevantes derivados de fontes.
- `upsert_market_snapshot`: salva snapshots de mercado por ticker e horário.
- `generate_informative_analysis`: gera análise curta no contrato MCP; no
  executor operacional real, dados persistidos devem vir de Gemini com busca
  fundamentada.
- `save_agent_report`: persiste relatórios estruturados em
  `petroagent.agent_reports`.

A busca semântica com embeddings permanece como evolução futura e só deve ser
ativada quando houver volume e necessidade real. Até lá, a busca textual mantém
custo zero e rastreabilidade.

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
npm run test:smoke
npm run build
npm run verify:mcp
npm run verify:ci
npm run agent:run
```

Camadas de teste:

- Unitarios: validam funcoes isoladas e utilitarios puros.
- Integracao: validam componentes interativos e comportamento de UI.
- Contexto: validam narrativa, limites de produto e mensagens essenciais da
  experiencia publica.
- Smoke visual: valida carregamento minimo da home e do painel `/petrobras` em
  larguras desktop e mobile via Vitest/jsdom, sem tornar o CI pesado.
- MCP: instala dependencias do `mcp-server`, roda testes unitarios, typecheck e
  build da camada MCP isolada.

Matriz de validacao atual:

- `npm run lint`: regras de qualidade do Next.js/TypeScript.
- `npm run test:unit`: services, coletores e utilitarios isolados.
- `npm run test:integration`: rotas e componentes com interacao.
- `npm run test:context`: narrativa, avisos e limites do produto.
- `npm run test:smoke`: smoke visual leve da home e do painel.
- `npm run build`: build de producao do Next.js.
- `npm run verify:mcp`: testes, typecheck e build do servidor MCP.
- `npm run verify:local`: validacao local principal sem MCP, mais rapida para
  iteracao visual.
- `npm run verify:ci`: esteira completa usada em PRs e producao, incluindo MCP.

## Execução manual do agente

O agente do PetroAgent começa de forma manual e segue o contrato MCP-first. Ele
consulta contexto por tools MCP, monta um contexto textual com guardrails de
produto, chama Gemini com busca fundamentada quando executado pelo caminho real
e salva o pacote operacional por capacidades MCP em `petroagent.sources`,
`petroagent.market_snapshots`, `petroagent.market_events` e
`petroagent.agent_reports`.

```bash
npm run agent:run
```

Requisitos:

- `NEXT_PUBLIC_SUPABASE_URL` ou `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `PETROAGENT_AGENT_RUN_TOKEN` para o gatilho HTTP manual
- `CRON_SECRET` para o gatilho via Vercel Cron
- `GEMINI_API_KEY`, `GEMINI_API_VERSION`, `GEMINI_MODEL` e
  `GEMINI_FALLBACK_MODELS` para IA real via Gemini free tier
- opcionalmente `OPENAI_API_KEY` para IA real

Sem chave de IA, o executor real não persiste fallback como dado operacional do
painel. Erros do provedor devem ser registrados em log operacional e tratados
como falha da execução. O comando não deve gerar recomendação financeira,
preço-alvo ou promessa de rentabilidade.

Configuração recomendada para Gemini:

```env
GEMINI_API_KEY=
GEMINI_API_VERSION=v1beta
GEMINI_MODEL=gemini-2.5-flash
GEMINI_FALLBACK_MODELS=gemini-2.0-flash,gemini-2.0-flash-lite
```

O executor tenta o modelo principal e, em erro transitório do provedor, como
alta demanda, indisponibilidade temporária ou limite momentâneo, tenta novamente
e então usa os modelos alternativos configurados em `GEMINI_FALLBACK_MODELS`.
Se todos falharem, a execução é registrada como falha e nenhum fallback é salvo
como dado real no painel.

### Gatilho protegido

O endpoint operacional fica em `/api/agent/run`:

- `POST /api/agent/run`: execução manual protegida por
  `PETROAGENT_AGENT_RUN_TOKEN`.
- `GET /api/agent/run`: execução via Vercel Cron, protegida por `CRON_SECRET`.

Exemplo manual:

```bash
curl -X POST "$APP_URL/api/agent/run" \
  -H "Authorization: Bearer $PETROAGENT_AGENT_RUN_TOKEN"
```

Cada execução grava um registro em `petroagent.agent_execution_logs` com
`started`, `saved` ou `failed`, origem, engine, relatório gerado, quantidade de
fontes e erro resumido quando existir. Essa tabela é operacional e fica restrita
ao backend com `service_role`.

Checklist de validação:

1. Rodar `npm run agent:run` em ambiente com variáveis server-side configuradas.
2. Confirmar novo registro em `petroagent.agent_execution_logs`.
3. Confirmar novo relatório em `petroagent.agent_reports`.
4. Confirmar que `/petrobras` reflete relatório, sentimento, snapshot ou eventos
   quando eles existirem no banco.
5. Confirmar que `/petrobras` exibe estado vazio explícito quando o banco ainda
   não tiver dados.

Rollback operacional: remover temporariamente `PETROAGENT_AGENT_RUN_TOKEN`,
`CRON_SECRET` ou o bloco `crons`; para código, reverter o merge da PR
correspondente.

### Agendamento

O agendamento oficial roda uma vez por dia após o fechamento do pregão. A Vercel
usa cron em UTC; por isso `0 22 * * *` equivale a 19:00 no horário de Brasília
em 28 de maio de 2026.

```json
{
  "crons": [
    {
      "path": "/api/agent/run",
      "schedule": "0 22 * * *"
    }
  ]
}
```

Antes de manter ativo:

1. Configurar `CRON_SECRET` na Vercel.
2. Confirmar que `GET /api/agent/run` retorna `401` sem token.
3. Confirmar que a execução real gera log, fonte, snapshot, evento e relatório.
4. Ter plano de rollback removendo o bloco `crons` do `vercel.json` ou zerando
   `CRON_SECRET`.
5. Em caso de erro `high demand` do Gemini, confirmar se
   `GEMINI_FALLBACK_MODELS` está configurado em produção.

## Status da landing

A home atual e uma landing page responsiva para apresentar o PetroAgent, exibir
um resumo público do painel e permitir apoio opcional ao projeto.

As variaveis esperadas para Supabase sao:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `PETROAGENT_COLLECTOR_TOKEN`
- `PETROAGENT_AGENT_RUN_TOKEN`
- `CRON_SECRET`

`SUPABASE_SERVICE_ROLE_KEY`, `PETROAGENT_COLLECTOR_TOKEN`,
`PETROAGENT_AGENT_RUN_TOKEN`, `CRON_SECRET`, `GEMINI_API_KEY` e `OPENAI_API_KEY`
são variáveis somente de servidor. Não exponha chaves privadas com prefixo
`NEXT_PUBLIC_`.

### Apoio PIX estático

A área de apoio da landing usa PIX estático, sem backend, sem API do Asaas, sem
cobrança dinâmica e sem persistência de pagamentos. O QR Code versionado fica em
`public/pix-qrcode.png`.

Para regenerar o asset:

```bash
npm run pix:generate
```

O script imprime o payload copia e cola no terminal e atualiza a imagem do QR
Code. Os dados públicos de pagamento seguem a especificação oficial da issue
#141.

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
schema `public`. As migrations versionadas ficam em `supabase/migrations` e devem
ser aplicadas pelo Supabase CLI no projeto conectado, não em `database/migrations`.
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

A migration de operação do agente cria:

- tabela `petroagent.agent_execution_logs`
- status `started`, `saved` e `failed`
- vínculo opcional com `petroagent.agent_reports`
- RLS e grants somente para `service_role`

O endpoint `POST /api/sources` registra fontes manualmente em
`petroagent.sources`. Ele exige `Authorization: Bearer <PETROAGENT_COLLECTOR_TOKEN>`
ou o header `x-petroagent-collector-token`.

O painel `/petrobras` tenta ler primeiro os dados persistidos em
`agent_reports`, `market_events` e `market_snapshots`. Se não houver dados ou se
o Supabase estiver indisponível, usa fallback demonstrativo.

O endpoint `POST /api/reports` gera relatórios e tenta persistir o resultado em
`petroagent.agent_reports`. O endpoint `GET /api/reports` lista relatórios
persistidos com paginação simples.

Para usar a tabela via Supabase Data API, adicione `petroagent` em Project
Settings > Data API > Exposed schemas no projeto Supabase existente.

## Relacao com o GitHub Project

O quadro oficial de gestao e o GitHub Project numero 3 do usuario
`thalescampelodac`. O fluxo de trabalho deve ser:

1. Criar um issue/card no GitHub antes de iniciar implementacao.
2. Documentar o escopo e criterios de aceite no issue.
3. Criar branch ligada ao issue: `issue-<numero>-descrição-curta`.
4. Referenciar o issue no titulo e no corpo do PR.

As issues devem seguir as fases do `AGENTES.md` e usar criterios de aceite
claros. A organizacao recomendada e:

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
