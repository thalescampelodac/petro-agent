# Database

Diretório para migrations, SQL documentado e notas de modelagem Supabase.

As tabelas do PetroAgent ficam no schema `petroagent`, dentro do projeto
Supabase existente usado pelo Comprovou. Elas não devem ser criadas no schema
`public`.

## Tabelas

### `petroagent.project_likes`

Contador público de apoio ao projeto.

- `id`: identificador sequencial.
- `created_at`: data de criação.
- `source`: origem da curtida pública.

Permissões: `anon` e `authenticated` podem inserir curtidas com `source = 'web'`
e consultar a contagem.

### `petroagent.sources`

Memória bruta de fontes públicas coletadas ou registradas para processamento
futuro.

- `id`: identificador sequencial.
- `created_at`: data de entrada no banco.
- `source_type`: tipo da fonte, como notícia, RI, comunicado ou outro canal.
- `title`: título opcional.
- `url`: endereço público opcional.
- `published_at`: data de publicação da fonte.
- `raw_content`: conteúdo bruto capturado.
- `processed`: indica se a fonte já foi processada pelo agente.

Permissões: leitura e escrita reservadas ao backend com `service_role`, porque a
tabela pode conter conteúdo bruto. Referências públicas devem usar tabelas
derivadas ou uma view sanitizada futura.

### `petroagent.market_events`

Eventos de mercado extraídos ou registrados a partir das fontes.

- `id`: identificador sequencial.
- `created_at`: data de entrada no banco.
- `event_date`: data do evento.
- `event_type`: tipo do evento.
- `title`: título do evento.
- `summary`: resumo informativo.
- `source_id`: referência opcional para `petroagent.sources`.
- `relevance_score`: pontuação de relevância de 0 a 100.

### `petroagent.agent_reports`

Relatórios gerados pelo agente a partir de fontes e eventos.

- `id`: identificador sequencial.
- `created_at`: data de geração.
- `title`: título do relatório.
- `summary`: resumo consolidado.
- `sentiment`: sentimento textual informativo.
- `attention_points`: pontos de atenção em texto.
- `source_count`: quantidade de fontes usadas.
- `model_used`: modelo usado quando houver geração por IA.

### `petroagent.market_snapshots`

Fotografias pontuais de dados de mercado, sem promessa de tempo real.

- `id`: identificador sequencial.
- `created_at`: data de entrada no banco.
- `ticker`: ativo monitorado, como `PETR4`.
- `price`: preço capturado.
- `variation`: variação capturada.
- `volume`: volume capturado.
- `source`: fonte do dado.
- `snapshot_time`: horário original da fotografia.

## Segurança

Todas as tabelas em schema exposto devem ter Row Level Security habilitada.

Para `market_events`, `agent_reports` e `market_snapshots`, `anon` e
`authenticated` recebem apenas `select`, pois esses dados alimentam o painel
público. A tabela `sources` fica restrita ao backend. Escritas ficam reservadas
ao backend futuro com `service_role`, usado pelas fases de coleta e geração de
relatórios.

## Coletor manual

O endpoint `POST /api/sources` permite registrar fontes públicas manualmente sem
criar um painel administrativo completo.

Campos aceitos:

- `sourceType`: tipo da fonte.
- `title`: título opcional.
- `url`: URL opcional.
- `publishedAt`: data de publicação opcional.
- `rawContent`: conteúdo bruto obrigatório.

Autenticação:

- `Authorization: Bearer <PETROAGENT_COLLECTOR_TOKEN>`
- ou `x-petroagent-collector-token: <PETROAGENT_COLLECTOR_TOKEN>`

O endpoint usa `SUPABASE_SERVICE_ROLE_KEY` somente no servidor para inserir na
tabela `petroagent.sources`.

## Contrato do painel Petrobras

A partir da Fase 11, todo dado operacional exibido em `/petrobras` deve vir do
schema `petroagent` ou de um estado vazio explícito. Mocks que pareçam dados
reais são bloqueadores de entrega.

A matriz oficial de rastreabilidade fica em
[`panel-bank-mcp-matrix.md`](./panel-bank-mcp-matrix.md).

## Cache do painel

O painel Petrobras consulta primeiro dados persistidos nas tabelas:

- `petroagent.agent_reports`
- `petroagent.market_events`
- `petroagent.market_snapshots`

As consultas possuem cache simples em memória por 60 segundos. Se não houver
dados ou se o Supabase estiver indisponível, o painel deve exibir estados vazios
claros, sem substituir ausência de dados por valores mockados.
