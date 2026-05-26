# Agents

Espaco reservado para regras especificas do PetroAgent.

Nao executar IA a cada acesso publico no MVP 1. Chamadas de IA devem ser
pontuais, cacheadas e sempre respeitar o limite de nao recomendar compra, venda
ou manutencao de ativos.

## Perfil inicial

O perfil modular inicial fica no servidor MCP em
`mcp-server/src/agents/registry.ts`.

- Agente ativo: `PetroAgent Petrobras`
- Ativo padrão: `PETR4`
- Empresa: `Petróleo Brasileiro S.A.`
- Prompt base: `prompts/prompt-base.md`

Novos agentes devem entrar como novos perfis no registry, com tickers, fontes e
guardrails próprios, sem quebrar o comportamento atual de Petrobras/PETR4.

## Executor manual

O executor manual fica em `services/agent-executor.ts` e pode ser iniciado por:

```bash
npm run agent:run
```

Fluxo atual:

1. Ler `sources`, `market_events`, `market_snapshots` e `agent_reports` no schema
   `petroagent`.
2. Montar um prompt/contexto operacional com guardrails explícitos.
3. Gerar relatório via IA quando configurada ou fallback determinístico.
4. Persistir o resultado em `petroagent.agent_reports`.

Este executor não é cron, não é endpoint público e não deve ser disparado em
acesso de usuário. Gatilho protegido e agendamento ficam para issues futuras.
