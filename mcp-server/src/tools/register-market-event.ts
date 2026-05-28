import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import { createPetroAgentSupabaseClient } from "../db/supabase.js";

type RegisterMarketEventParams = {
  event_date?: string | null;
  event_type: string;
  relevance_score?: number | null;
  source_id?: number | null;
  summary?: string | null;
  title: string;
};

type RegisterMarketEventResult = {
  id: number;
  source: "petroagent.market_events";
};

const registerMarketEventInputSchema = {
  event_date: z.string().datetime().nullable().optional(),
  event_type: z.string().min(2).max(80),
  relevance_score: z.number().int().min(0).max(100).nullable().optional(),
  source_id: z.number().int().positive().nullable().optional(),
  summary: z.string().max(2000).nullable().optional(),
  title: z.string().min(2).max(300),
};

export async function registerMarketEvent(
  params: RegisterMarketEventParams,
): Promise<RegisterMarketEventResult> {
  const client = createPetroAgentSupabaseClient();
  const row = {
    event_date: params.event_date ?? null,
    event_type: params.event_type,
    relevance_score: params.relevance_score ?? null,
    source_id: params.source_id ?? null,
    summary: params.summary ?? null,
    title: params.title,
  };

  const { data, error } = await client
    .schema("petroagent")
    .from("market_events")
    .upsert(row, { onConflict: "event_type,title,event_date" })
    .select("id")
    .single();

  if (error) {
    throw error;
  }

  return {
    id: (data as { id: number }).id,
    source: "petroagent.market_events",
  };
}

export function registerRegisterMarketEventTool(server: McpServer) {
  server.registerTool(
    "register_market_event",
    {
      annotations: {
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
        readOnlyHint: false,
      },
      description:
        "Registra ou atualiza um evento de mercado em petroagent.market_events.",
      inputSchema: registerMarketEventInputSchema,
      title: "Registrar evento de mercado",
    },
    async (args) => {
      const result = await registerMarketEvent(args);

      return {
        content: [{ text: `Evento registrado em petroagent.market_events:${result.id}.`, type: "text" }],
        structuredContent: result,
      };
    },
  );
}
