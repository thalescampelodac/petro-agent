import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import { normalizeTicker } from "../agents/registry.js";
import { createPetroAgentSupabaseClient } from "../db/supabase.js";

type MarketSnapshotRow = {
  id: number;
  created_at: string;
  price: number | null;
  snapshot_time: string | null;
  source: string | null;
  ticker: string;
  variation: number | null;
  volume: number | null;
};

type MarketSnapshotResult =
  | {
      found: true;
      snapshot: MarketSnapshotRow;
      ticker: string;
    }
  | {
      found: false;
      reason: "not_found";
      snapshot: null;
      ticker: string;
    };

const getMarketSnapshotInputSchema = {
  ticker: z
    .string()
    .min(4)
    .max(8)
    .optional()
    .describe("Ticker monitorado. Padrão: PETR4."),
};

async function getMarketSnapshot(ticker?: string): Promise<MarketSnapshotResult> {
  const client = createPetroAgentSupabaseClient();
  const normalizedTicker = normalizeTicker(ticker);

  const { data, error } = await client
    .schema("petroagent")
    .from("market_snapshots")
    .select("id, created_at, ticker, price, variation, volume, source, snapshot_time")
    .eq("ticker", normalizedTicker)
    .order("snapshot_time", { ascending: false, nullsFirst: false })
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
      snapshot: null,
      ticker: normalizedTicker,
    };
  }

  return {
    found: true,
    snapshot: data as MarketSnapshotRow,
    ticker: normalizedTicker,
  };
}

function describeResult(result: MarketSnapshotResult) {
  if (!result.found) {
    return `Nenhum snapshot de mercado foi encontrado para ${result.ticker}.`;
  }

  const { snapshot } = result;
  const price = snapshot.price === null ? "preço indisponível" : `preço ${snapshot.price}`;
  const variation =
    snapshot.variation === null ? "" : ` Variação: ${snapshot.variation}.`;
  const source = snapshot.source ? ` Fonte: ${snapshot.source}.` : "";

  return `Último snapshot de ${snapshot.ticker}: ${price}.${variation}${source}`;
}

export function registerGetMarketSnapshotTool(server: McpServer) {
  server.registerTool(
    "get_market_snapshot",
    {
      annotations: {
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
        readOnlyHint: true,
      },
      description:
        "Recupera o último snapshot de mercado salvo em petroagent.market_snapshots por ticker.",
      inputSchema: getMarketSnapshotInputSchema,
      title: "Último snapshot de mercado",
    },
    async (args) => {
      const result = await getMarketSnapshot(args.ticker);

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
