drop policy if exists "Anyone can read public sources"
  on petroagent.sources;

revoke select on table petroagent.sources
from anon, authenticated;

-- `sources` stores raw collected content. Keep it backend-only until a future
-- sanitized view/API is created for public source references.
