alter table petroagent.agent_reports
  add column if not exists sentiment_score integer,
  add column if not exists sentiment_confidence text,
  add column if not exists sentiment_basis text;

alter table petroagent.agent_reports
  add constraint agent_reports_sentiment_score_check
  check (
    sentiment_score is null
    or (sentiment_score >= 0 and sentiment_score <= 100)
  );

alter table petroagent.agent_reports
  add constraint agent_reports_sentiment_confidence_check
  check (
    sentiment_confidence is null
    or sentiment_confidence in ('baixa', 'media', 'alta')
  );

comment on column petroagent.agent_reports.sentiment_score is
  'Escore estruturado do sentimento gerado pelo agente, entre 0 e 100.';

comment on column petroagent.agent_reports.sentiment_confidence is
  'Confiabilidade estruturada do sentimento: baixa, media ou alta.';

comment on column petroagent.agent_reports.sentiment_basis is
  'Base textual curta usada pelo agente para justificar o sentimento informativo.';
