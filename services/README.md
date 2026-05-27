# Services

Camada para integracoes externas e regras de aplicacao reutilizaveis.

No MVP 1, manter esta pasta simples: leitores de dados, adapters de Supabase e
servicos sem dependencia paga obrigatoria.

No MVP 2, `services/mcp/` concentra adapters internos para consumir o contrato
MCP do PetroAgent sem acoplar o app Next.js diretamente ao servidor MCP.
