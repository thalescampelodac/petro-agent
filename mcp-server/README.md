# PetroAgent MCP Server

Servidor MCP inicial do PetroAgent. Esta camada pertence ao MVP 2 e permite que
agentes consultem, no futuro, relatórios, eventos, snapshots e memória do
projeto.

## Estrutura

```text
mcp-server/
  src/
    server.ts
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

### `get_latest_report`

Consulta `petroagent.agent_reports` e retorna o relatório mais recente em
conteúdo textual e `structuredContent`. Quando não houver relatório salvo,
retorna `found: false` sem quebrar a chamada.

## Próximas tools

As próximas issues da Fase 8 devem registrar novas tools em arquivos dedicados
dentro de `src/tools/`:

- `list_market_events`
- `get_market_snapshot`
- `search_agent_memory`
