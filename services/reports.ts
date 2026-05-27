import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const PETROAGENT_SCHEMA = 'petroagent';
const REPORTS_TABLE = 'agent_reports';

export type ReportRow = {
  id: number;
  created_at: string;
  title: string;
  summary: string;
  sentiment: string | null;
  sentiment_basis: string | null;
  sentiment_confidence: string | null;
  sentiment_score: number | null;
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
  sentiment_analysis?: unknown;
  sentiment_basis?: unknown;
  sentiment_confidence?: unknown;
  sentiment_score?: unknown;
  structured_sentiment?: unknown;
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

function getRecord(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null
    ? (value as Record<string, unknown>)
    : {};
}

function getNumberInRange(value: unknown, min: number, max: number) {
  const numberValue =
    typeof value === 'number'
      ? value
      : typeof value === 'string'
        ? Number(value.replace(',', '.'))
        : Number.NaN;

  if (!Number.isFinite(numberValue) || numberValue < min || numberValue > max) {
    return null;
  }

  return Math.round(numberValue);
}

function normalizeConfidence(value: unknown) {
  if (typeof value !== 'string') {
    return null;
  }

  const normalized = value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .trim()
    .toLowerCase();

  if (['baixa', 'media', 'alta'].includes(normalized)) {
    return normalized;
  }

  return null;
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
  const structuredSentiment = getRecord(
    payload.structured_sentiment ?? payload.sentiment_analysis,
  );
  const sentiment =
    typeof payload.sentiment === 'string'
      ? payload.sentiment
      : typeof structuredSentiment.label === 'string'
        ? structuredSentiment.label
        : null;

  return {
    attention_points: [...highlights, ...keyFacts],
    model_used: engine,
    sentiment,
    sentiment_basis:
      typeof payload.sentiment_basis === 'string'
        ? payload.sentiment_basis
        : typeof structuredSentiment.basis === 'string'
          ? structuredSentiment.basis
          : null,
    sentiment_confidence: normalizeConfidence(
      payload.sentiment_confidence ?? structuredSentiment.confidence,
    ),
    sentiment_score: getNumberInRange(
      payload.sentiment_score ?? structuredSentiment.score,
      0,
      100,
    ),
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
