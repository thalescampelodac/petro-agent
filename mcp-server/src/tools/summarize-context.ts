import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import { createPetroAgentSupabaseClient } from "../db/supabase.js";

type ContextSource = {
  created_at: string;
  id: number;
  source_type: string;
  title: string | null;
  url: string | null;
};

type ContextEvent = {
  created_at: string;
  event_type: string;
  id: number;
  relevance_score: number | null;
  summary: string | null;
  title: string;
};

type SummarizeContextResult = {
  citations: string[];
  events: ContextEvent[];
  query: string | null;
  sources: ContextSource[];
  summary: string;
};

const summarizeContextInputSchema = {
  limit: z
    .number()
    .int()
    .min(1)
    .max(10)
    .optional()
    .describe("Quantidade máxima de fontes/eventos usados. Padrão: 5."),
  query: z
    .string()
    .min(2)
    .max(120)
    .optional()
    .describe("Termo opcional para restringir o contexto textual."),
};

function createPattern(query?: string) {
  const normalized = query?.trim().replaceAll("%", "").replaceAll("_", "");

  return normalized ? `%${normalized}%` : null;
}

async function summarizeContext({
  limit = 5,
  query,
}: {
  limit?: number;
  query?: string;
}): Promise<SummarizeContextResult> {
  const client = createPetroAgentSupabaseClient();
  const safeLimit = Math.min(Math.max(limit, 1), 10);
  const pattern = createPattern(query);

  let sourcesQuery = client
    .schema("petroagent")
    .from("sources")
    .select("id, created_at, source_type, title, url")
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(safeLimit);

  let eventsQuery = client
    .schema("petroagent")
    .from("market_events")
    .select("id, created_at, event_type, title, summary, relevance_score")
    .order("event_date", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(safeLimit);

  if (pattern) {
    sourcesQuery = sourcesQuery.or(`title.ilike.${pattern},url.ilike.${pattern}`);
    eventsQuery = eventsQuery.or(`title.ilike.${pattern},summary.ilike.${pattern}`);
  }

  const [sourcesResult, eventsResult] = await Promise.all([sourcesQuery, eventsQuery]);
  const error = sourcesResult.error ?? eventsResult.error;

  if (error) {
    throw error;
  }

  const sources = (sourcesResult.data ?? []) as ContextSource[];
  const events = (eventsResult.data ?? []) as ContextEvent[];
  const citations = [
    ...sources.map((source) => source.url ?? `petroagent.sources:${source.id}`),
    ...events.map((event) => `petroagent.market_events:${event.id}`),
  ];

  const eventSummary =
    events.length > 0
      ? events
          .slice(0, 3)
          .map((event) => `${event.title}: ${event.summary ?? "sem resumo"}`)
          .join(" ")
      : "Nenhum evento persistido foi encontrado para o contexto solicitado.";

  const sourceSummary =
    sources.length > 0
      ? `Foram consideradas ${sources.length} fontes persistidas.`
      : "Nenhuma fonte persistida foi encontrada para o contexto solicitado.";

  return {
    citations,
    events,
    query: query?.trim() || null,
    sources,
    summary: `${sourceSummary} ${eventSummary}`,
  };
}

export function registerSummarizeContextTool(server: McpServer) {
  server.registerTool(
    "summarize_context",
    {
      annotations: {
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
        readOnlyHint: true,
      },
      description:
        "Gera uma sumarização contextual simples usando apenas fontes e eventos persistidos.",
      inputSchema: summarizeContextInputSchema,
      title: "Sumarizar contexto persistido",
    },
    async (args) => {
      const result = await summarizeContext(args);

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
