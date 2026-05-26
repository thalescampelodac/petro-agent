import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import { createPetroAgentSupabaseClient } from "../db/supabase.js";

type ComparableReportRow = {
  created_at: string;
  id: number;
  model_used: string | null;
  sentiment: string | null;
  source_count: number;
  summary: string;
  title: string;
};

type CompareReportsResult = {
  changes: {
    source_count_delta: number;
    sentiment_changed: boolean;
    sentiment_from: string | null;
    sentiment_to: string | null;
  } | null;
  count: number;
  date_from: string | null;
  date_to: string | null;
  reports: ComparableReportRow[];
  summary: string;
};

const compareReportsInputSchema = {
  date_from: z
    .string()
    .datetime()
    .optional()
    .describe("Data inicial em ISO 8601 para filtrar created_at."),
  date_to: z
    .string()
    .datetime()
    .optional()
    .describe("Data final em ISO 8601 para filtrar created_at."),
  limit: z
    .number()
    .int()
    .min(2)
    .max(10)
    .optional()
    .describe("Quantidade máxima de relatórios para comparar. Padrão: 5."),
};

async function compareReports({
  date_from,
  date_to,
  limit = 5,
}: {
  date_from?: string;
  date_to?: string;
  limit?: number;
}): Promise<CompareReportsResult> {
  const client = createPetroAgentSupabaseClient();
  const safeLimit = Math.min(Math.max(limit, 2), 10);

  let query = client
    .schema("petroagent")
    .from("agent_reports")
    .select("id, created_at, title, summary, sentiment, source_count, model_used")
    .order("created_at", { ascending: false })
    .limit(safeLimit);

  if (date_from) {
    query = query.gte("created_at", date_from);
  }

  if (date_to) {
    query = query.lte("created_at", date_to);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  const reports = (data ?? []) as ComparableReportRow[];
  const current = reports[0];
  const previous = reports[1];

  if (!current || !previous) {
    return {
      changes: null,
      count: reports.length,
      date_from: date_from ?? null,
      date_to: date_to ?? null,
      reports,
      summary:
        "Comparação temporal indisponível: são necessários pelo menos dois relatórios salvos.",
    };
  }

  const changes = {
    source_count_delta: current.source_count - previous.source_count,
    sentiment_changed: current.sentiment !== previous.sentiment,
    sentiment_from: previous.sentiment,
    sentiment_to: current.sentiment,
  };

  const summary = [
    `Relatório atual: ${current.title} (${current.created_at}).`,
    `Relatório anterior: ${previous.title} (${previous.created_at}).`,
    changes.sentiment_changed
      ? `Sentimento mudou de ${previous.sentiment ?? "não informado"} para ${
          current.sentiment ?? "não informado"
        }.`
      : `Sentimento permaneceu ${current.sentiment ?? "não informado"}.`,
    `Variação na quantidade de fontes: ${changes.source_count_delta}.`,
  ].join(" ");

  return {
    changes,
    count: reports.length,
    date_from: date_from ?? null,
    date_to: date_to ?? null,
    reports,
    summary,
  };
}

export function registerCompareReportsTool(server: McpServer) {
  server.registerTool(
    "compare_reports",
    {
      annotations: {
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
        readOnlyHint: true,
      },
      description:
        "Compara relatórios salvos em petroagent.agent_reports por período e aponta mudanças básicas.",
      inputSchema: compareReportsInputSchema,
      title: "Comparar relatórios do agente",
    },
    async (args) => {
      const result = await compareReports(args);

      return {
        content: [
          {
            text: result.summary,
            type: "text",
          },
        ],
        structuredContent: result,
      };
    },
  );
}
