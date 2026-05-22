import { createClient } from "@supabase/supabase-js";

const PETROAGENT_SCHEMA = "petroagent";
const CACHE_TTL_MS = 60_000;

export type CachedPetrobrasReport = {
  created_at: string;
  model_used: string | null;
  sentiment: string | null;
  source_count: number | null;
  summary: string;
  title: string;
};

export type CachedPetrobrasEvent = {
  created_at: string;
  event_date: string | null;
  event_type: string;
  source_id: number | null;
  summary: string | null;
  title: string;
};

export type CachedMarketSnapshot = {
  price: number | null;
  snapshot_time: string | null;
  source: string | null;
  ticker: string;
  variation: number | null;
  volume: number | null;
};

export type CachedPetrobrasData = {
  events: CachedPetrobrasEvent[];
  report: CachedPetrobrasReport | null;
  snapshot: CachedMarketSnapshot | null;
  source: "supabase" | "fallback";
};

let cache:
  | {
      expiresAt: number;
      value: CachedPetrobrasData;
    }
  | null = null;

function getSupabasePublicClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();

  if (!supabaseUrl || !supabaseKey) {
    return null;
  }

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
    },
  });
}

export async function getCachedPetrobrasData(): Promise<CachedPetrobrasData> {
  const now = Date.now();

  if (cache && cache.expiresAt > now) {
    return cache.value;
  }

  const client = getSupabasePublicClient();

  if (!client) {
    return {
      events: [],
      report: null,
      snapshot: null,
      source: "fallback",
    };
  }

  const [reportResult, eventsResult, snapshotResult] = await Promise.all([
    client
      .schema(PETROAGENT_SCHEMA)
      .from("agent_reports")
      .select("created_at, model_used, sentiment, source_count, summary, title")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    client
      .schema(PETROAGENT_SCHEMA)
      .from("market_events")
      .select("created_at, event_date, event_type, source_id, summary, title")
      .order("event_date", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false })
      .limit(5),
    client
      .schema(PETROAGENT_SCHEMA)
      .from("market_snapshots")
      .select("price, snapshot_time, source, ticker, variation, volume")
      .eq("ticker", "PETR4")
      .order("snapshot_time", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  if (reportResult.error || eventsResult.error || snapshotResult.error) {
    return {
      events: [],
      report: null,
      snapshot: null,
      source: "fallback",
    };
  }

  const value: CachedPetrobrasData = {
    events: (eventsResult.data ?? []) as CachedPetrobrasEvent[],
    report: (reportResult.data ?? null) as CachedPetrobrasReport | null,
    snapshot: (snapshotResult.data ?? null) as CachedMarketSnapshot | null,
    source: "supabase",
  };

  cache = {
    expiresAt: now + CACHE_TTL_MS,
    value,
  };

  return value;
}
