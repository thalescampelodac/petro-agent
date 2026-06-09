# Matriz painel-banco-MCP

Esta matriz pertence à Fase 11 do MVP 2 e é bloqueadora para qualquer entrega que
remova mocks, altere o painel Petrobras ou implemente execução MCP-first.

Regra central:

```text
Agente PetroAgent -> contrato MCP -> banco petroagent -> painel /petrobras
```

O painel pode exibir textos estruturais da interface, como títulos, labels,
avisos legais e metadados estáticos do ativo monitorado diretamente no código.
Dados operacionais sobre Petrobras/PETR4 devem vir do banco ou de um estado
vazio explícito.

Metadados estáticos e canônicos, como `PETR4`, nome da empresa e nome de
exibição institucional, são configuração estrutural do produto. Eles não exigem
tabela própria, tool MCP de escrita ou execução do agente, desde que não sejam
usados para substituir dados operacionais ausentes.

## Estado atual

| Área do painel | Campo exibido | Origem atual | Status Fase 11 |
| --- | --- | --- | --- |
| Hero status | Dados | `market_snapshots` quando existe; estado vazio quando ausente | Alinhado ao banco |
| Hero status | Atualização | `market_snapshots.snapshot_time` quando existe; estado vazio quando ausente | Alinhado ao banco |
| Métricas | Ativo monitorado, empresa | Configuração estática do produto; snapshot define estado operacional | Alinhado como metadado estático |
| Métricas | Origem dos dados | `market_snapshots.source` quando existe; estado vazio quando ausente | Alinhado ao banco |
| Métricas | Status do radar | Derivado da presença de `market_snapshots` | Alinhado ao banco |
| Métricas | Última atualização | `market_snapshots.snapshot_time` quando existe; estado vazio quando ausente | Alinhado ao banco |
| Dados básicos | Ticker | Configuração estática `PETR4`; snapshot define estado operacional | Alinhado como metadado estático |
| Dados básicos | Empresa | Configuração estática do produto | Alinhado como metadado estático |
| Dados básicos | Último preço | `market_snapshots.price` quando existe; estado vazio quando ausente | Alinhado ao banco |
| Dados básicos | Variação | `market_snapshots.variation` quando existe; estado vazio quando ausente | Alinhado ao banco |
| Dados básicos | Fonte | `market_snapshots.source` quando existe; estado vazio quando ausente | Alinhado ao banco |
| Resumo inteligente | Resumo, geração, fonte | `agent_reports` quando existe; estado vazio quando ausente | Alinhado ao banco |
| Relatórios recentes | Título, resumo, sentimento, modelo, fontes | `agent_reports` | Alinhado ao banco |
| Sentimento | Label | `agent_reports.sentiment` quando existe; estado vazio quando ausente | Alinhado ao banco |
| Sentimento | Escore | `agent_reports.sentiment_score` quando existe; estado vazio quando ausente | Alinhado ao banco |
| Sentimento | Confiabilidade, base, fonte | `agent_reports.sentiment_confidence`, `agent_reports.sentiment_basis` e `agent_reports.model_used` | Alinhado ao banco |
| Sinais monitorados | Dividendos, fatos relevantes, notícias, sentimento | Derivado de `market_events` e `agent_reports`; estado vazio quando ausente | Alinhado ao banco |
| Pulso do mercado | Barras do gráfico | Derivado de `market_events.relevance_score`; estado vazio quando ausente | Alinhado ao banco |
| Eventos recentes | Eventos, datas, tipo, resumo, relevância | `market_events` quando existe; estado vazio quando ausente | Alinhado ao banco |
| Cenários probabilísticos | Curto, médio e longo prazo; tendência; probabilidade; confiança; riscos; pontos de atenção | A definir na Fase 12; estado vazio obrigatório até existir persistência | Bloqueado por #128 e #129 |

## Matriz alvo

| Campo do painel | Tabela/coluna no `petroagent` | Tool MCP que grava/atualiza | Tool MCP que consulta | Origem esperada | Teste necessário |
| --- | --- | --- | --- | --- | --- |
| Ticker monitorado | Configuração estática do produto; `market_snapshots.ticker` valida snapshot operacional | `upsert_market_snapshot` para snapshots | `get_market_snapshot` | Prompt guiado `prompts/market-snapshot-petr4.md` após fechamento do pregão | Unit MCP + contexto painel sem mock |
| Empresa/nome do ativo | Configuração estática do produto | Não se aplica | Não se aplica | Curadoria estrutural do produto | Contexto painel |
| Último preço | `market_snapshots.price` | `upsert_market_snapshot` | `get_market_snapshot` | Prompt guiado priorizando B3, Google Finance, Yahoo Finance, Investing ou InfoMoney | Unit MCP + integração cache |
| Variação | `market_snapshots.variation` | `upsert_market_snapshot` | `get_market_snapshot` | Prompt guiado priorizando B3, Google Finance, Yahoo Finance, Investing ou InfoMoney | Unit MCP + integração cache |
| Volume | `market_snapshots.volume` | `upsert_market_snapshot` | `get_market_snapshot` | Prompt guiado; volume deve ser quantidade negociada, não volume financeiro | Unit MCP |
| Fonte do snapshot | `market_snapshots.source` | `upsert_market_snapshot` | `get_market_snapshot` | Nome e URL exata da fonte consultada pelo agente | Unit MCP |
| Horário do snapshot | `market_snapshots.snapshot_time` | `upsert_market_snapshot` | `get_market_snapshot` | Timestamp informado pela fonte; se ausente, `null` | Unit MCP + contexto painel |
| Status do radar | Derivado de `agent_execution_logs.status` e/ou último dado persistido | Tool futura de log/status ou log existente | Tool futura `get_agent_status` | Execução do agente | Unit service + contexto painel |
| Resumo inteligente | `agent_reports.summary` | `generate_informative_analysis` + `save_agent_report` | `get_latest_report` | Análise do agente sobre contexto salvo | Unit MCP + integração executor |
| Data do relatório | `agent_reports.created_at` | `save_agent_report` | `get_latest_report` | Geração do agente | Unit MCP |
| Fonte/modelo do relatório | `agent_reports.model_used`, `source_count` | `save_agent_report` | `get_latest_report` | Execução IA/fallback do agente | Unit MCP |
| Sentimento textual | `agent_reports.sentiment` | `generate_informative_analysis` + `save_agent_report` | `get_latest_report` | Análise do agente | Unit MCP + contexto painel |
| Escore de sentimento | `agent_reports.sentiment_score` | `save_agent_report` | `get_latest_report` | Análise estruturada do agente | Migration + unit MCP |
| Confiabilidade/base do sentimento | `agent_reports.sentiment_confidence`, `agent_reports.sentiment_basis` | `save_agent_report` | `get_latest_report` | Análise estruturada do agente | Migration + unit MCP |
| Eventos recentes | `market_events.*` | `register_market_event` | `list_market_events` | Fontes coletadas e analisadas pelo agente | Unit MCP + integração painel |
| Fonte do evento | `market_events.source_id -> sources.id` | `register_source` + `register_market_event` | `list_market_events` e `search_agent_memory` | URL/documento público coletado | Unit MCP |
| Relevância do evento | `market_events.relevance_score` | `register_market_event` | `list_market_events` | Classificação do agente | Unit MCP |
| Sinais monitorados | Derivado de `market_events` e `agent_reports` | `register_market_event` e `save_agent_report` | `list_market_events` e `get_latest_report` | Análise do agente por categoria | Contexto painel |
| Pulso do painel | Derivado de `market_events.relevance_score` | `register_market_event` | `list_market_events` | Série gerada pelo agente a partir de eventos | Unit + smoke visual |
| Cenários de curto prazo | Nova tabela planejada `scenario_analyses.short_term` ou estrutura equivalente | `generate_probability_scenarios` + `save_scenario_analysis` | `get_latest_scenario_analysis` | Snapshot, eventos, relatórios, memória e contexto externo aprovado | Unit MCP + contexto painel |
| Cenários de médio prazo | Nova tabela planejada `scenario_analyses.medium_term` ou estrutura equivalente | `generate_probability_scenarios` + `save_scenario_analysis` | `get_latest_scenario_analysis` | Snapshot, eventos, relatórios, memória e contexto externo aprovado | Unit MCP + contexto painel |
| Cenários de longo prazo | Nova tabela planejada `scenario_analyses.long_term` ou estrutura equivalente | `generate_probability_scenarios` + `save_scenario_analysis` | `get_latest_scenario_analysis` | Snapshot, eventos, relatórios, memória e contexto externo aprovado | Unit MCP + contexto painel |
| Tendência qualitativa | Nova tabela planejada `scenario_analyses.trend` ou estrutura equivalente | `save_scenario_analysis` | `get_latest_scenario_analysis` | Análise do agente; valores controlados como negativa, neutra ou positiva | Unit schema + contexto painel |
| Probabilidade qualitativa | Nova tabela planejada `scenario_analyses.qualitative_probability` ou estrutura equivalente | `save_scenario_analysis` | `get_latest_scenario_analysis` | Análise do agente; valores baixa, média ou alta | Unit schema + contexto painel |
| Confiança do cenário | Nova tabela planejada `scenario_analyses.confidence` ou estrutura equivalente | `save_scenario_analysis` | `get_latest_scenario_analysis` | Análise do agente; valores baixa, média ou alta | Unit schema + contexto painel |
| Riscos e pontos de atenção | Nova tabela planejada `scenario_analyses.risks`, `attention_points` ou estrutura equivalente | `save_scenario_analysis` | `get_latest_scenario_analysis` | Análise do agente baseada em fontes/eventos persistidos | Unit MCP + contexto painel |
| Fatores considerados | Nova tabela planejada `scenario_analyses.considered_factors` ou estrutura equivalente | `save_scenario_analysis` | `get_latest_scenario_analysis` | Preço, volume, volatilidade, notícias, dividendos, petróleo, câmbio e política quando disponíveis | Unit MCP + contexto painel |

## Dados que o agente consegue buscar sozinho

O agente só consegue buscar dados sozinho quando houver fonte, prompt, payload e
tool MCP definidos. Para a Fase 11, a regra é não inventar dado ausente: quando
a coleta ainda não existe, o painel mostra estado vazio explícito.

| Dado | Autonomia esperada do agente | Decisão pendente |
| --- | --- | --- |
| Preço, variação e volume PETR4 | Guiada por prompt | Usar `prompts/market-snapshot-petr4.md` em cron fora do pregão; validar JSON antes de gravar |
| Comunicados de RI/fatos relevantes | Parcial | Definir fonte pública inicial e formato de coleta |
| Notícias públicas | Parcial | Definir fonte pública inicial e política de relevância |
| Dividendos/proventos | Parcial | Definir fonte pública inicial |
| Sentimento/escala/confiança | Sim, a partir dos dados persistidos | Persistido em `agent_reports` via MCP |
| Relatórios do agente | Sim | Persistência via `generate_informative_analysis` e `save_agent_report` |
| Cenários probabilísticos | Sim, quando houver contexto mínimo persistido | Fase 12 deve definir prompt, tabela, tools MCP, guardrails e testes antes da UI |

## Bloqueadores criados pela matriz

1. Tratar o agente como autônomo para dados externos sem validação do JSON
   retornado pelo prompt (#104).
2. Exibir cenários probabilísticos no painel antes de existir contrato MCP,
   persistência e teste de ausência/presença (#128, #129, #131, #133).
3. Usar linguagem determinística de previsão ou recomendação financeira nos
   cenários (#130, #135).

## Sequência recomendada após esta matriz

1. Validar o pacote final da Fase 11 em preview: painel sem mocks enganosos,
   executor MCP-first, relatório persistido e estados vazios explícitos.
2. Só ativar cron após validação manual de execução, logs, relatório e painel em
   produção.
3. Para novas coletas externas, abrir issue específica com fonte, prompt,
   payload, validação, tool MCP de escrita e teste de regressão.
4. Para Fase 12, seguir a ordem #128 -> #129/#130 -> #131 -> #132 -> #133/#134,
   mantendo #135 como guarda-chuva de testes.
