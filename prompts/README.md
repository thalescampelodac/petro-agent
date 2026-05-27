# Prompts

Diretorio para prompts versionados do PetroAgent.

Prompts devem diferenciar fato, interpretacao e hipotese, citar fontes quando
possivel e nunca transformar o produto em recomendacao financeira.

## Prompts operacionais

- `prompt-base.md`: prompt base para análises informativas do PetroAgent.
- `market-snapshot-petr4.md`: prompt guiado para coleta de snapshot PETR4 após
  o fechamento do pregão, usado como entrada para `upsert_market_snapshot`.
