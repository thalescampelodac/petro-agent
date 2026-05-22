import { createClient } from "@supabase/supabase-js";

const PETROAGENT_SCHEMA = "petroagent";
const SOURCES_TABLE = "sources";

export type ManualSourceInput = {
  sourceType: string;
  title?: string;
  url?: string;
  publishedAt?: string;
  rawContent: string;
};

export type ManualSourceResult =
  | {
      id: number;
      source: "supabase";
    }
  | {
      reason: "missing_supabase_admin_config";
      source: "disabled";
    };

function getSupabaseAdminClient() {
  const supabaseUrl =
    process.env.SUPABASE_URL?.trim() ?? process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!supabaseUrl || !serviceRoleKey) {
    return null;
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
    },
  });
}

export async function registerManualSource(
  input: ManualSourceInput,
): Promise<ManualSourceResult> {
  const client = getSupabaseAdminClient();

  if (!client) {
    return {
      reason: "missing_supabase_admin_config",
      source: "disabled",
    };
  }

  const { data, error } = await client
    .schema(PETROAGENT_SCHEMA)
    .from(SOURCES_TABLE)
    .insert({
      processed: false,
      published_at: input.publishedAt || null,
      raw_content: input.rawContent,
      source_type: input.sourceType,
      title: input.title || null,
      url: input.url || null,
    })
    .select("id")
    .single();

  if (error) {
    throw error;
  }

  return {
    id: data.id as number,
    source: "supabase",
  };
}
