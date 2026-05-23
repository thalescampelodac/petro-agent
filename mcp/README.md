# MCP

Estrutura reservada para a futura camada MCP do PetroAgent.

O MVP 2 podera expor ferramentas como `get_latest_report`,
`list_market_events`, `get_market_snapshot` e `search_agent_memory`. Esta camada
nao deve bloquear o MVP 1 nem interferir no build do frontend.

A implementação inicial do servidor fica em `mcp-server/`, com `package.json` e
`tsconfig.json` próprios para manter a camada MCP separada do app Next.js.
