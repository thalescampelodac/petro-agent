create unique index if not exists sources_url_unique_idx
  on petroagent.sources (url)
  where url is not null;

create unique index if not exists market_events_natural_key_idx
  on petroagent.market_events (event_type, title, event_date);

create unique index if not exists market_snapshots_ticker_snapshot_time_unique_idx
  on petroagent.market_snapshots (ticker, snapshot_time)
  where snapshot_time is not null;
