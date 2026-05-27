import type { SupabaseClient } from "@supabase/supabase-js";

const PETROAGENT_SCHEMA = "petroagent";
const LOGS_TABLE = "agent_execution_logs";

export type AgentExecutionStatus = "started" | "saved" | "failed";

export type AgentExecutionLogInput = {
  origin: string;
  sourceCount?: number;
};

export type AgentExecutionLogUpdate = {
  engine?: string | null;
  errorMessage?: string | null;
  reportId?: number | null;
  sourceCount?: number;
  status: Exclude<AgentExecutionStatus, "started">;
};

export async function startAgentExecutionLog(
  client: SupabaseClient,
  input: AgentExecutionLogInput,
) {
  const { data, error } = await client
    .schema(PETROAGENT_SCHEMA)
    .from(LOGS_TABLE)
    .insert({
      origin: input.origin,
      source_count: input.sourceCount ?? 0,
      status: "started",
    })
    .select("id")
    .single();

  if (error) {
    throw error;
  }

  return { id: data.id as number };
}

export async function finishAgentExecutionLog(
  client: SupabaseClient,
  logId: number,
  update: AgentExecutionLogUpdate,
) {
  const { error } = await client
    .schema(PETROAGENT_SCHEMA)
    .from(LOGS_TABLE)
    .update({
      engine: update.engine ?? null,
      error_message: update.errorMessage ? update.errorMessage.slice(0, 500) : null,
      finished_at: new Date().toISOString(),
      report_id: update.reportId ?? null,
      source_count: update.sourceCount ?? 0,
      status: update.status,
    })
    .eq("id", logId);

  if (error) {
    throw error;
  }
}

export function serializeAgentError(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  if (error && typeof error === "object") {
    const record = error as Record<string, unknown>;
    const message = record.message;
    const code = record.code;

    return [code, message].filter(Boolean).join(": ") || "unknown_error";
  }

  return "unknown_error";
}
