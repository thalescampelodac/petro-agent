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

1. Consultar o contrato MCP interno por `get_latest_report`,
   `list_market_events`, `get_market_snapshot` e `search_agent_memory`.
2. Montar um prompt/contexto operacional com guardrails explícitos.
3. No executor real, chamar Gemini com busca fundamentada para gerar pacote de
   fonte, snapshot, evento e relatório.
4. Persistir o pacote por `register_source`, `upsert_market_snapshot`,
   `register_market_event` e `save_agent_report`.
5. Registrar a execução em `petroagent.agent_execution_logs`.

O executor é o orquestrador. Ele não deve voltar a consultar ou persistir dados
operacionais por um caminho paralelo ao contrato MCP.

Quando o Gemini retornar erro transitório, como alta demanda ou indisponibilidade
temporária, o executor pode tentar novamente e usar modelos alternativos
configurados em `GEMINI_FALLBACK_MODELS`. Se todos os modelos falharem, a
execução deve ficar como falha operacional e não pode persistir fallback como
dado real do painel.

## Gatilho protegido

O endpoint `/api/agent/run` permite disparo operacional controlado:

- `POST`: execução manual usando `PETROAGENT_AGENT_RUN_TOKEN`.
- `GET`: execução agendada via Vercel Cron usando `CRON_SECRET`.

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

## Agendamento

O cron roda uma vez por dia pela Vercel em `GET /api/agent/run`, protegido por
`CRON_SECRET`. A agenda oficial é `0 22 * * *`, equivalente a 19:00 no horário
de Brasília em 28 de maio de 2026. No plano Hobby, manter no máximo uma execução
diária. Rollback: remover o bloco `crons` do `vercel.json` ou remover
`CRON_SECRET` do ambiente.
