# PetroAgent MCP Server

Servidor MCP inicial do PetroAgent. Esta camada pertence ao MVP 2 e permite que
agentes consultem, no futuro, relatórios, eventos, snapshots e memória do
projeto.

## Estrutura

```text
mcp-server/
  src/
    server.ts
    agents/
      registry.ts
    db/
      supabase.ts
    tools/
      index.ts
  package.json
  tsconfig.json
```

## Execução

Instale as dependências dentro deste diretório:

```bash
cd mcp-server
npm install
```

Rode em desenvolvimento:

```bash
npm run dev
```

Valide tipos:

```bash
npm run typecheck
```

Gere build:

```bash
npm run build
```

## Variáveis

O servidor MCP usa variáveis já previstas pelo projeto principal:

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Essas variáveis devem ficar no ambiente do servidor MCP. A service role nunca
deve ser exposta no client.

## Tools

As tools ficam registradas em `src/tools/index.ts`.

### `get_agent_profile`

Retorna o perfil modular ativo do PetroAgent, com a abstração inicial de
empresa/ativo monitorado. Nesta etapa o perfil padrão é Petrobras/PETR4, mas a
estrutura já permite adicionar outros agentes sem migração traumática.

### `get_latest_report`

Consulta `petroagent.agent_reports` e retorna o relatório mais recente em
conteúdo textual e `structuredContent`. Quando não houver relatório salvo,
retorna `found: false` sem quebrar a chamada.

### `list_market_events`

Consulta `petroagent.market_events` e retorna eventos ordenados por
`event_date` em ordem decrescente. Aceita filtros simples:

- `limit`: quantidade máxima de eventos, de 1 a 50.
- `event_type`: tipo do evento.
- `date_from`: data inicial em ISO 8601.
- `date_to`: data final em ISO 8601.

### `get_market_snapshot`

Consulta `petroagent.market_snapshots` e retorna o último registro salvo por
ticker. O ticker padrão é `PETR4`. A tool não consulta APIs externas em tempo
real.

### `search_agent_memory`

Busca textual simples em `petroagent.sources`, `petroagent.market_events` e
`petroagent.agent_reports`. Retorna o tipo do item encontrado, título, trecho
textual e link/fonte interna quando disponível.

### `compare_reports`

Recupera relatórios salvos por período e compara o relatório mais recente com o
anterior. A comparação aponta mudança de sentimento e variação na quantidade de
fontes usadas.

### `summarize_context`

Gera uma sumarização contextual simples usando somente fontes e eventos
persistidos. Não chama IA externa; a saída é uma síntese determinística para
evitar custo e dependência no MVP.

## Busca semântica futura

A busca semântica com embeddings fica planejada para quando houver necessidade
real e volume suficiente de dados. Até lá, `search_agent_memory` cobre a busca
textual inicial sem custo adicional.

Quando a busca semântica for ativada, a recomendação é:

- criar embeddings em rotina assíncrona, nunca durante acesso público;
- manter cache e rastreabilidade do item original;
- limitar escopo por agente/ativo;
- preservar fallback textual quando embeddings não existirem.
