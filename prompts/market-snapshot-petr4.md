# Prompt — Snapshot de mercado PETR4

Objetivo: orientar o agente PetroAgent a coletar um snapshot pontual de mercado
para PETR4 após o fechamento do pregão brasileiro.

Este prompt deve ser executado por rotina operacional/cron fora do horário de
pregão, com margem após o fechamento e eventual after-market. O resultado deve
ser validado por schema antes de qualquer escrita em `petroagent.market_snapshots`
via contrato MCP.

```txt
Pesquise na web a cotação mais recente da ação PETR4 negociada na B3 após o fechamento do pregão brasileiro.

Colete exatamente os seguintes dados:

- ticker: sempre "PETR4"
- price: último preço ou último fechamento disponível
- variation: variação percentual do dia
- volume: quantidade de ações negociadas no dia, não volume financeiro
- source: nome e URL exata da fonte consultada
- snapshot_time: data e horário da cotação conforme informado pela fonte

Regras:
- Priorize fontes confiáveis como B3, Google Finance, Yahoo Finance, Investing ou InfoMoney.
- Use apenas dados encontrados explicitamente na fonte consultada.
- Não estime, não calcule e não invente valores ausentes.
- Se algum dado não for encontrado, retorne null.
- Retorne apenas JSON válido.
- Não adicione comentários, markdown ou explicações fora do JSON.
- Use ponto como separador decimal.
- snapshot_time deve estar em ISO 8601.
- Não inclua recomendação financeira.

Formato esperado:

{
  "ticker": "PETR4",
  "price": 42.82,
  "variation": -1.43,
  "volume": 287654321,
  "source": {
    "name": "Google Finance",
    "url": "https://www.google.com/finance/quote/PETR4:BVMF"
  },
  "snapshot_time": "2026-05-27T17:10:00-03:00"
}
```

## Contrato de saída

O JSON retornado pelo agente deve ser transformado no payload da tool MCP
`upsert_market_snapshot`:

```json
{
  "ticker": "PETR4",
  "price": 42.82,
  "variation": -1.43,
  "volume": 287654321,
  "source": "Google Finance - https://www.google.com/finance/quote/PETR4:BVMF",
  "snapshot_time": "2026-05-27T17:10:00-03:00"
}
```

## Validação antes de gravar

- `ticker` deve ser exatamente `PETR4`.
- `price`, `variation` e `volume` devem ser números ou `null`.
- `source.name` e `source.url` devem existir quando algum valor de mercado for
  encontrado.
- `snapshot_time` deve ser ISO 8601 ou `null`.
- Resposta inválida não deve ser persistida.
- A execução deve registrar log operacional quando integrada ao executor.

## Cron

O cron deve ser configurado para rodar fora do pregão brasileiro e com margem
após fechamento/after-market. A janela sugerida para a primeira versão é após
`19:10` no fuso `America/Sao_Paulo`, sujeita a ajuste após validação operacional
e confirmação periódica dos horários oficiais da B3.
