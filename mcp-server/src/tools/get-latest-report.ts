import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import { createPetroAgentSupabaseClient } from "../db/supabase.js";

type AgentReportRow = {
  id: number;
  created_at: string;
  title: string;
  summary: string;
  sentiment: string | null;
  attention_points: string[] | null;
  source_count: number;
  model_used: string | null;
};

type LatestReportResult =
  | {
      found: true;
      report: AgentReportRow;
    }
  | {
      found: false;
      report: null;
      reason: "not_found";
    };

export async function getLatestReport(): Promise<LatestReportResult> {
  const client = createPetroAgentSupabaseClient();

  const { data, error } = await client
    .schema("petroagent")
    .from("agent_reports")
    .select(
      "id, created_at, title, summary, sentiment, attention_points, source_count, model_used",
    )
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return {
      found: false,
      reason: "not_found",
      report: null,
    };
  }

  return {
    found: true,
    report: data as AgentReportRow,
  };
}

function describeResult(result: LatestReportResult) {
  if (!result.found) {
    return "Nenhum relatório do PetroAgent foi encontrado em agent_reports.";
  }

  const { report } = result;
  const sentiment = report.sentiment ? ` Sentimento: ${report.sentiment}.` : "";

  return `${report.title}: ${report.summary}${sentiment}`;
}

export function registerGetLatestReportTool(server: McpServer) {
  server.registerTool(
    "get_latest_report",
    {
      annotations: {
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
        readOnlyHint: true,
      },
      description:
        "Recupera o relatório mais recente salvo em petroagent.agent_reports.",
      title: "Último relatório PetroAgent",
    },
    async () => {
      const result = await getLatestReport();

      return {
        content: [
          {
            text: describeResult(result),
            type: "text",
          },
        ],
        structuredContent: result,
      };
    },
  );
}
