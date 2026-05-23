import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import { createPetroAgentSupabaseClient } from "../db/supabase.js";

type MarketEventRow = {
  id: number;
  created_at: string;
  event_date: string | null;
  event_type: string;
  title: string;
  summary: string | null;
  source_id: number | null;
  relevance_score: number | null;
};

type ListMarketEventsParams = {
  date_from?: string;
  date_to?: string;
  event_type?: string;
  limit?: number;
};

type ListMarketEventsResult = {
  count: number;
  events: MarketEventRow[];
  filters: {
    date_from: string | null;
    date_to: string | null;
    event_type: string | null;
    limit: number;
  };
};

const listMarketEventsInputSchema = {
  date_from: z
    .string()
    .datetime()
    .optional()
    .describe("Data inicial em ISO 8601 para filtrar event_date."),
  date_to: z
    .string()
    .datetime()
    .optional()
    .describe("Data final em ISO 8601 para filtrar event_date."),
  event_type: z
    .string()
    .min(1)
    .max(80)
    .optional()
    .describe("Tipo do evento em petroagent.market_events.event_type."),
  limit: z
    .number()
    .int()
    .min(1)
    .max(50)
    .optional()
    .describe("Quantidade máxima de eventos. Padrão: 10; máximo: 50."),
};

async function listMarketEvents({
  date_from,
  date_to,
  event_type,
  limit = 10,
}: ListMarketEventsParams): Promise<ListMarketEventsResult> {
  const client = createPetroAgentSupabaseClient();
  const safeLimit = Math.min(Math.max(limit, 1), 50);

  let query = client
    .schema("petroagent")
    .from("market_events")
    .select(
      "id, created_at, event_date, event_type, title, summary, source_id, relevance_score",
    )
    .order("event_date", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(safeLimit);

  if (event_type) {
    query = query.eq("event_type", event_type);
  }

  if (date_from) {
    query = query.gte("event_date", date_from);
  }

  if (date_to) {
    query = query.lte("event_date", date_to);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  const events = (data ?? []) as MarketEventRow[];

  return {
    count: events.length,
    events,
    filters: {
      date_from: date_from ?? null,
      date_to: date_to ?? null,
      event_type: event_type ?? null,
      limit: safeLimit,
    },
  };
}

function describeResult(result: ListMarketEventsResult) {
  if (result.events.length === 0) {
    return "Nenhum evento de mercado foi encontrado em market_events para os filtros informados.";
  }

  const lines = result.events.map((event) => {
    const date = event.event_date ?? event.created_at;
    const relevance =
      event.relevance_score === null ? "" : ` Relevância: ${event.relevance_score}.`;

    return `- ${event.title} (${event.event_type}, ${date}).${relevance}`;
  });

  return [`Eventos encontrados: ${result.count}.`, ...lines].join("\n");
}

export function registerListMarketEventsTool(server: McpServer) {
  server.registerTool(
    "list_market_events",
    {
      annotations: {
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
        readOnlyHint: true,
      },
      description:
        "Lista eventos recentes salvos em petroagent.market_events com filtros simples.",
      inputSchema: listMarketEventsInputSchema,
      title: "Listar eventos de mercado",
    },
    async (args) => {
      const result = await listMarketEvents(args);

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
