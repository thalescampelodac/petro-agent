import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const PETROAGENT_SCHEMA = 'petroagent';
const REPORTS_TABLE = 'reports';

type ReportRow = {
  id: number;
  engine: string;
  payload: Record<string, unknown>;
  source_url?: string | null;
  created_at: string;
};

let supabase: SupabaseClient | null = null;

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const supabaseKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '').trim();

  if (!supabaseUrl || !supabaseKey) return null;

  if (!supabase) {
    supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false },
    });
  }

  return supabase;
}

export async function saveReport(engine: string, payload: Record<string, unknown>, source_url?: string | null) {
  const client = getSupabaseClient();
  if (!client) return { id: null, reason: 'missing_supabase_config' };

  const { data, error } = await client
    .schema(PETROAGENT_SCHEMA)
    .from(REPORTS_TABLE)
    .insert({ engine, payload, source_url })
    .select('*')
    .single();

  if (error) throw error;

  return { id: (data as ReportRow).id };
}

export async function listReports(limit = 20, offset = 0) {
  const client = getSupabaseClient();
  if (!client) return { reports: [], reason: 'missing_supabase_config' };

  const { data, error } = await client
    .schema(PETROAGENT_SCHEMA)
    .from(REPORTS_TABLE)
    .select('*')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;

  return { reports: (data as ReportRow[]) };
}

export default { saveReport, listReports };
