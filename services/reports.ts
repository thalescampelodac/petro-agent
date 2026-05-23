import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const PETROAGENT_SCHEMA = 'petroagent';
const REPORTS_TABLE = 'agent_reports';

export type ReportRow = {
  id: number;
  created_at: string;
  title: string;
  summary: string;
  sentiment: string | null;
  attention_points: string[] | null;
  source_count: number;
  model_used: string | null;
};

type ReportPayload = {
  summary?: unknown;
  highlights?: unknown;
  key_facts?: unknown;
  sources?: unknown;
  sentiment?: unknown;
};

let supabaseAdmin: SupabaseClient | null = null;
let supabasePublic: SupabaseClient | null = null;

function getSupabaseAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!supabaseUrl || !supabaseKey) {
    return null;
  }

  if (!supabaseAdmin) {
    supabaseAdmin = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false },
    });
  }

  return supabaseAdmin;
}

function getSupabasePublicClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();

  if (!supabaseUrl || !supabaseKey) {
    return null;
  }

  if (!supabasePublic) {
    supabasePublic = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false },
    });
  }

  return supabasePublic;
}

function getStringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : [];
}

function getSourceCount(value: unknown) {
  return Array.isArray(value) ? value.length : 0;
}

function mapPayloadToAgentReport(engine: string, payload: ReportPayload) {
  const summary =
    typeof payload.summary === 'string'
      ? payload.summary
      : 'Relatório gerado sem resumo textual estruturado.';
  const highlights = getStringArray(payload.highlights);
  const keyFacts = Array.isArray(payload.key_facts)
    ? payload.key_facts.map((fact) => JSON.stringify(fact))
    : [];

  return {
    attention_points: [...highlights, ...keyFacts],
    model_used: engine,
    sentiment: typeof payload.sentiment === 'string' ? payload.sentiment : null,
    source_count: getSourceCount(payload.sources),
    summary,
    title: 'Relatório PetroAgent',
  };
}

export async function saveReport(
  engine: string,
  payload: Record<string, unknown>,
) {
  const client = getSupabaseAdminClient();

  if (!client) return { id: null, reason: 'missing_supabase_config' };

  const { data, error } = await client
    .schema(PETROAGENT_SCHEMA)
    .from(REPORTS_TABLE)
    .insert(mapPayloadToAgentReport(engine, payload))
    .select('id')
    .single();

  if (error) throw error;

  return { id: (data as ReportRow).id };
}

export async function listReports(limit = 20, offset = 0) {
  const client = getSupabasePublicClient();

  if (!client) return { reports: [], reason: 'missing_supabase_config' };

  const safeLimit = Math.min(Math.max(limit, 1), 100);
  const safeOffset = Math.max(offset, 0);

  const { data, error } = await client
    .schema(PETROAGENT_SCHEMA)
    .from(REPORTS_TABLE)
    .select('*')
    .order('created_at', { ascending: false })
    .range(safeOffset, safeOffset + safeLimit - 1);

  if (error) throw error;

  return { reports: (data as ReportRow[]) };
}

const reportsService = { listReports, saveReport };

export default reportsService;
