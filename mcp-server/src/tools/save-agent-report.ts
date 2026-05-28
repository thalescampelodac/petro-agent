import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import { createPetroAgentSupabaseClient } from "../db/supabase.js";

type SaveAgentReportParams = {
  attention_points?: string[];
  model_used?: string | null;
  sentiment?: string | null;
  sentiment_basis?: string | null;
  sentiment_confidence?: "baixa" | "media" | "alta" | null;
  sentiment_score?: number | null;
  source_count?: number;
  summary: string;
  title?: string;
};

type SaveAgentReportResult = {
  id: number;
  source: "petroagent.agent_reports";
};

const saveAgentReportInputSchema = {
  attention_points: z.array(z.string().min(1).max(500)).optional(),
  model_used: z.string().min(1).max(120).nullable().optional(),
  sentiment: z.string().min(1).max(40).nullable().optional(),
  sentiment_basis: z.string().min(1).max(1000).nullable().optional(),
  sentiment_confidence: z.enum(["baixa", "media", "alta"]).nullable().optional(),
  sentiment_score: z.number().int().min(0).max(100).nullable().optional(),
  source_count: z.number().int().min(0).optional(),
  summary: z.string().min(1).max(5000),
  title: z.string().min(2).max(200).optional(),
};

export async function saveAgentReport(
  params: SaveAgentReportParams,
): Promise<SaveAgentReportResult> {
  const client = createPetroAgentSupabaseClient();

  const { data, error } = await client
    .schema("petroagent")
    .from("agent_reports")
    .insert({
      attention_points: params.attention_points ?? [],
      model_used: params.model_used ?? null,
      sentiment: params.sentiment ?? null,
      sentiment_basis: params.sentiment_basis ?? null,
      sentiment_confidence: params.sentiment_confidence ?? null,
      sentiment_score: params.sentiment_score ?? null,
      source_count: params.source_count ?? 0,
      summary: params.summary,
      title: params.title ?? "Relatório PetroAgent",
    })
    .select("id")
    .single();

  if (error) {
    throw error;
  }

  return {
    id: (data as { id: number }).id,
    source: "petroagent.agent_reports",
  };
}

export function registerSaveAgentReportTool(server: McpServer) {
  server.registerTool(
    "save_agent_report",
    {
      annotations: {
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: false,
        readOnlyHint: false,
      },
      description:
        "Salva um relatório estruturado do agente em petroagent.agent_reports.",
      inputSchema: saveAgentReportInputSchema,
      title: "Salvar relatório do agente",
    },
    async (args) => {
      const result = await saveAgentReport(args);

      return {
        content: [{ text: `Relatório salvo em petroagent.agent_reports:${result.id}.`, type: "text" }],
        structuredContent: result,
      };
    },
  );
}
