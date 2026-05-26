import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import { createPetroAgentSupabaseClient } from "../db/supabase.js";

type MemoryItemType = "agent_report" | "market_event" | "source";

type MemorySearchItem = {
  created_at: string;
  id: number;
  item_type: MemoryItemType;
  link: string | null;
  matched_text: string | null;
  source: string | null;
  title: string;
};

type MemorySearchResult = {
  count: number;
  items: MemorySearchItem[];
  query: string;
};

const searchAgentMemoryInputSchema = {
  limit: z
    .number()
    .int()
    .min(1)
    .max(30)
    .optional()
    .describe("Quantidade máxima de itens por busca. Padrão: 10; máximo: 30."),
  query: z
    .string()
    .min(2)
    .max(120)
    .describe("Termo textual para buscar em fontes, eventos e relatórios salvos."),
};

function toSearchPattern(query: string) {
  return `%${query.trim().replaceAll("%", "").replaceAll("_", "")}%`;
}

async function searchAgentMemory({
  limit = 10,
  query,
}: {
  limit?: number;
  query: string;
}): Promise<MemorySearchResult> {
  const client = createPetroAgentSupabaseClient();
  const safeLimit = Math.min(Math.max(limit, 1), 30);
  const pattern = toSearchPattern(query);

  const [sourcesResult, eventsResult, reportsResult] = await Promise.all([
    client
      .schema("petroagent")
      .from("sources")
      .select("id, created_at, source_type, title, url, raw_content")
      .or(`title.ilike.${pattern},raw_content.ilike.${pattern},url.ilike.${pattern}`)
      .order("created_at", { ascending: false })
      .limit(safeLimit),
    client
      .schema("petroagent")
      .from("market_events")
      .select("id, created_at, event_type, title, summary, source_id")
      .or(`title.ilike.${pattern},summary.ilike.${pattern},event_type.ilike.${pattern}`)
      .order("created_at", { ascending: false })
      .limit(safeLimit),
    client
      .schema("petroagent")
      .from("agent_reports")
      .select("id, created_at, title, summary, sentiment")
      .or(`title.ilike.${pattern},summary.ilike.${pattern},sentiment.ilike.${pattern}`)
      .order("created_at", { ascending: false })
      .limit(safeLimit),
  ]);

  const error = sourcesResult.error ?? eventsResult.error ?? reportsResult.error;

  if (error) {
    throw error;
  }

  const sourceItems: MemorySearchItem[] = (sourcesResult.data ?? []).map((source) => ({
    created_at: source.created_at,
    id: source.id,
    item_type: "source",
    link: source.url,
    matched_text: source.raw_content,
    source: source.source_type,
    title: source.title ?? source.url ?? `Fonte #${source.id}`,
  }));

  const eventItems: MemorySearchItem[] = (eventsResult.data ?? []).map((event) => ({
    created_at: event.created_at,
    id: event.id,
    item_type: "market_event",
    link: event.source_id ? `petroagent.sources:${event.source_id}` : null,
    matched_text: event.summary,
    source: event.event_type,
    title: event.title,
  }));

  const reportItems: MemorySearchItem[] = (reportsResult.data ?? []).map((report) => ({
    created_at: report.created_at,
    id: report.id,
    item_type: "agent_report",
    link: `petroagent.agent_reports:${report.id}`,
    matched_text: report.summary,
    source: report.sentiment,
    title: report.title,
  }));

  const items = [...sourceItems, ...eventItems, ...reportItems]
    .sort(
      (current, next) =>
        new Date(next.created_at).getTime() - new Date(current.created_at).getTime(),
    )
    .slice(0, safeLimit);

  return {
    count: items.length,
    items,
    query: query.trim(),
  };
}

function describeResult(result: MemorySearchResult) {
  if (result.items.length === 0) {
    return `Nenhum item foi encontrado na memória textual para "${result.query}".`;
  }

  const lines = result.items.map((item) => {
    const link = item.link ? ` Fonte/link: ${item.link}.` : "";

    return `- [${item.item_type}] ${item.title}.${link}`;
  });

  return [`Itens encontrados para "${result.query}": ${result.count}.`, ...lines].join("\n");
}

export function registerSearchAgentMemoryTool(server: McpServer) {
  server.registerTool(
    "search_agent_memory",
    {
      annotations: {
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
        readOnlyHint: true,
      },
      description:
        "Busca texto em fontes, eventos e relatórios persistidos no schema petroagent.",
      inputSchema: searchAgentMemoryInputSchema,
      title: "Buscar memória textual do agente",
    },
    async (args) => {
      const result = await searchAgentMemory(args);

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
