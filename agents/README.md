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
5. Registrar a execução em `petroagent.agent_execution_logs`.

## Gatilho protegido

O endpoint `/api/agent/run` permite disparo operacional controlado:

- `POST`: execução manual usando `PETROAGENT_AGENT_RUN_TOKEN`.
- `GET`: reservado para Vercel Cron usando `CRON_SECRET`.

O endpoint não deve ser chamado por telas públicas. Ele retorna `401` sem token
válido e `503` se a variável esperada não estiver configurada.

## Logs operacionais

A tabela `petroagent.agent_execution_logs` registra:

- `started_at` e `finished_at`
- `status`: `started`, `saved` ou `failed`
- `origin`: `manual-cli`, `manual-api` ou `vercel-cron`
- `engine`
- `report_id`
- `source_count`
- `error_message` resumido

Não registrar secrets, tokens, payload completo da IA ou dados sensíveis nos
logs.

## Agendamento futuro

O cron ainda não está ativo. Quando aprovado, usar Vercel Cron apontando para
`GET /api/agent/run` com `CRON_SECRET`. No plano Hobby, manter no máximo uma
execução diária. Rollback: remover o bloco `crons` do `vercel.json` ou remover
`CRON_SECRET` do ambiente.
