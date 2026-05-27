# Matriz painel-banco-MCP

Esta matriz pertence à Fase 11 do MVP 2 e é bloqueadora para qualquer entrega que
remova mocks, altere o painel Petrobras ou implemente execução MCP-first.

Regra central:

```text
Agente PetroAgent -> contrato MCP -> banco petroagent -> painel /petrobras
```

O painel pode exibir textos estruturais da interface, como títulos, labels e
avisos legais, diretamente no código. Dados operacionais sobre Petrobras/PETR4
devem vir do banco ou de um estado vazio explícito.

## Estado atual

| Área do painel | Campo exibido | Origem atual | Status Fase 11 |
| --- | --- | --- | --- |
| Hero status | Dados: `Mock`/`Cache` | `market_snapshots` quando existe; mock no código quando vazio | Bloqueado por mock |
| Hero status | Atualização | `market_snapshots.snapshot_time` quando existe; mock no código quando vazio | Bloqueado por mock |
| Métricas | Ativo monitorado, empresa | `market_snapshots.ticker` quando existe; empresa fixa no código | Bloqueado por dado fixo |
| Métricas | Origem dos dados | `market_snapshots.source` quando existe; mock no código quando vazio | Bloqueado por mock |
| Métricas | Status do radar | Texto fixo `Preparado` | Bloqueado por dado fixo |
| Métricas | Última atualização | `market_snapshots.snapshot_time` quando existe; mock no código quando vazio | Bloqueado por mock |
| Dados básicos | Ticker | `market_snapshots.ticker` quando existe; `PETR4` fixo quando vazio | Bloqueado por mock |
| Dados básicos | Empresa | `Petrobras PN` fixo no código | Bloqueado por falta de tabela/campo |
| Dados básicos | Último preço | `market_snapshots.price` quando existe; preço mockado quando vazio | Bloqueado por mock |
| Dados básicos | Variação | `market_snapshots.variation` quando existe; variação mockada quando vazio | Bloqueado por mock |
| Dados básicos | Fonte | `market_snapshots.source` quando existe; mock no código quando vazio | Bloqueado por mock |
| Resumo inteligente | Resumo, geração, fonte | `agent_reports` quando existe; resumo fallback no código quando vazio | Bloqueado por mock |
| Relatórios recentes | Título, resumo, sentimento, modelo, fontes | `agent_reports` | Alinhado ao banco |
| Sentimento | Label | `agent_reports.sentiment` indiretamente; fallback fixo `Neutro` | Bloqueado por fallback fixo |
| Sentimento | Escore `52/100` | Fixo no código | Bloqueado por falta de campo |
| Sentimento | Confiabilidade, base, fonte | Derivado/fixo no código | Bloqueado por falta de campos |
| Sinais monitorados | Dividendos, fatos relevantes, notícias, sentimento | Lista e status fixos no código | Bloqueado por dado fixo |
| Pulso demonstrativo | Barras do gráfico | Array fixo no código | Bloqueado por mock |
| Eventos recentes | Eventos, datas, tipo, resumo, relevância | `market_events` quando existe; timeline fallback no código quando vazio | Bloqueado por mock |

## Matriz alvo

| Campo do painel | Tabela/coluna no `petroagent` | Tool MCP que grava/atualiza | Tool MCP que consulta | Origem esperada | Teste necessário |
| --- | --- | --- | --- | --- | --- |
| Ticker monitorado | `market_snapshots.ticker` e cadastro de ativo futuro | `upsert_market_snapshot` | `get_market_snapshot` | Fonte de mercado configurada para PETR4 | Unit MCP + contexto painel sem mock |
| Empresa/nome do ativo | Tabela futura `monitored_assets` ou campo equivalente | Tool futura `upsert_monitored_asset` | Tool futura `get_agent_profile` baseada em banco | Curadoria inicial do agente ou cadastro operacional guiado | Unit MCP + contexto painel |
| Último preço | `market_snapshots.price` | `upsert_market_snapshot` | `get_market_snapshot` | Fonte externa de mercado escolhida e documentada | Unit MCP + integração cache |
| Variação | `market_snapshots.variation` | `upsert_market_snapshot` | `get_market_snapshot` | Fonte externa de mercado escolhida e documentada | Unit MCP + integração cache |
| Volume | `market_snapshots.volume` | `upsert_market_snapshot` | `get_market_snapshot` | Fonte externa de mercado escolhida e documentada | Unit MCP |
| Fonte do snapshot | `market_snapshots.source` | `upsert_market_snapshot` | `get_market_snapshot` | Nome/URL da fonte usada pelo agente | Unit MCP |
| Horário do snapshot | `market_snapshots.snapshot_time` | `upsert_market_snapshot` | `get_market_snapshot` | Timestamp original da fonte | Unit MCP + contexto painel |
| Status do radar | Derivado de `agent_execution_logs.status` e/ou último dado persistido | Tool futura de log/status ou log existente | Tool futura `get_agent_status` | Execução do agente | Unit service + contexto painel |
| Resumo inteligente | `agent_reports.summary` | Tool futura `save_agent_report` ou `generate_informative_analysis` persistível | `get_latest_report` | Análise do agente sobre contexto salvo | Unit MCP + integração executor |
| Data do relatório | `agent_reports.created_at` | Tool futura `save_agent_report` | `get_latest_report` | Geração do agente | Unit MCP |
| Fonte/modelo do relatório | `agent_reports.model_used`, `source_count` | Tool futura `save_agent_report` | `get_latest_report` | Execução IA/fallback do agente | Unit MCP |
| Sentimento textual | `agent_reports.sentiment` | Tool futura `save_agent_report` ou `generate_informative_analysis` | `get_latest_report` | Análise do agente | Unit MCP + contexto painel |
| Escore de sentimento | Campo futuro em `agent_reports` ou tabela derivada | Tool futura `save_agent_report` | `get_latest_report` | Análise estruturada do agente | Migration + unit MCP |
| Confiabilidade/base do sentimento | Campos futuros em `agent_reports` ou tabela derivada | Tool futura `save_agent_report` | `get_latest_report` | Análise estruturada do agente | Migration + unit MCP |
| Eventos recentes | `market_events.*` | `register_market_event` | `list_market_events` | Fontes coletadas e analisadas pelo agente | Unit MCP + integração painel |
| Fonte do evento | `market_events.source_id -> sources.id` | `register_source` + `register_market_event` | `list_market_events` e `search_agent_memory` | URL/documento público coletado | Unit MCP |
| Relevância do evento | `market_events.relevance_score` | `register_market_event` | `list_market_events` | Classificação do agente | Unit MCP |
| Sinais monitorados | Derivado de `market_events`, `agent_reports` ou tabela futura de sinais | Tool futura `upsert_signal_status` ou derivação documentada | Tool futura `list_signal_statuses` | Análise do agente por categoria | Issue específica + testes |
| Pulso do painel | Derivado de `market_events.relevance_score` por período ou tabela futura | Tool futura ou derivação documentada | Tool futura `list_market_pulse` | Série gerada pelo agente a partir de eventos/snapshots | Issue específica + smoke visual |

## Dados que o agente consegue buscar sozinho

O agente só consegue buscar dados sozinho quando houver uma fonte/tool definida.
Para a Fase 11, cada origem externa precisa ser decidida antes da implementação:

| Dado | Autonomia esperada do agente | Decisão pendente |
| --- | --- | --- |
| Preço, variação e volume PETR4 | Não confirmado | Definir fonte gratuita/viável de dados de mercado ou curadoria guiada |
| Comunicados de RI/fatos relevantes | Parcial | Definir fonte pública inicial e formato de coleta |
| Notícias públicas | Parcial | Definir fonte pública inicial e política de relevância |
| Dividendos/proventos | Parcial | Definir fonte pública inicial |
| Sentimento/escala/confiança | Sim, a partir dos dados persistidos | Definir schema de sentimento estruturado |
| Relatórios do agente | Sim | Persistência via contrato MCP ainda pendente |

## Bloqueadores criados pela matriz

1. Remover mocks do painel antes de haver estados vazios explícitos (#98).
2. Criar tools MCP de escrita antes de definir payloads com origem rastreável
   (#95).
3. Exibir empresa/nome do ativo sem origem no banco (#105).
4. Exibir escore de sentimento sem campo persistido (#106).
5. Exibir pulso visual com array fixo (#107).
6. Tratar o agente como autônomo para dados externos sem fonte/tool definida
   (#104).

## Sequência recomendada após esta matriz

1. Definir fonte inicial para dados de mercado PETR4.
2. Modelar metadados do ativo e sentimento estruturado (#105 e #106).
3. Implementar tools MCP de escrita com origem rastreável (#95).
4. Remover mocks do painel e trocar por estados vazios (#98).
5. Migrar executor para fluxo MCP-first (#94, #96 e #97).
6. Validar que `agent -> MCP -> banco -> painel` funciona com testes (#99).
