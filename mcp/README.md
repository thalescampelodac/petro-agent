# MCP

Estrutura reservada para a futura camada MCP do PetroAgent.

O MVP 2 podera expor ferramentas como `get_latest_report`,
`list_market_events`, `get_market_snapshot` e `search_agent_memory`. Esta camada
nao deve bloquear o MVP 1 nem interferir no build do frontend.

A implementação inicial do servidor fica em `mcp-server/`, com `package.json` e
`tsconfig.json` próprios para manter a camada MCP separada do app Next.js.

## Estado atual

O servidor MCP já registra tools de leitura para:

- perfil modular do agente;
- último relatório;
- eventos de mercado;
- snapshot de mercado;
- busca textual na memória persistida;
- comparação temporal de relatórios;
- sumarização contextual com fontes internas.

Todas as tools atuais são somente leitura, usam o schema `petroagent` e evitam
chamadas externas ou geração de IA em tempo real.
