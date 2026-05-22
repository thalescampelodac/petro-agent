import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const PETROAGENT_SCHEMA = "petroagent";
const PROJECT_LIKES_TABLE = "project_likes";

type ProjectLikesResponse =
  | {
      count: number;
      source: "supabase";
    }
  | {
      count: null;
      reason: "missing_supabase_config";
      source: "local-fallback";
    };

let supabase: SupabaseClient | null = null;

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();

  if (!supabaseUrl || !supabaseKey) {
    return null;
  }

  if (!supabase) {
    supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
      },
    });
  }

  return supabase;
}

export async function getProjectLikesCount(): Promise<ProjectLikesResponse> {
  const client = getSupabaseClient();

  if (!client) {
    return {
      count: null,
      reason: "missing_supabase_config",
      source: "local-fallback",
    };
  }

  const { count, error } = await client
    .schema(PETROAGENT_SCHEMA)
    .from(PROJECT_LIKES_TABLE)
    .select("id", { count: "exact", head: true });

  if (error) {
    throw error;
  }

  return {
    count: count ?? 0,
    source: "supabase",
  };
}

export async function registerProjectLike(): Promise<ProjectLikesResponse> {
  const client = getSupabaseClient();

  if (!client) {
    return {
      count: null,
      reason: "missing_supabase_config",
      source: "local-fallback",
    };
  }

  const { error } = await client
    .schema(PETROAGENT_SCHEMA)
    .from(PROJECT_LIKES_TABLE)
    .insert({ source: "web" });

  if (error) {
    throw error;
  }

  return getProjectLikesCount();
}
