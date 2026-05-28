import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import { normalizeTicker } from "../agents/registry.js";
import { createPetroAgentSupabaseClient } from "../db/supabase.js";

type UpsertMarketSnapshotParams = {
  price?: number | null;
  snapshot_time: string;
  source?: string | null;
  ticker?: string;
  variation?: number | null;
  volume?: number | null;
};

type UpsertMarketSnapshotResult = {
  id: number;
  source: "petroagent.market_snapshots";
  ticker: string;
};

const upsertMarketSnapshotInputSchema = {
  price: z.number().nullable().optional(),
  snapshot_time: z.string().datetime(),
  source: z.string().min(2).max(300).nullable().optional(),
  ticker: z.string().min(4).max(8).optional(),
  variation: z.number().nullable().optional(),
  volume: z.number().nonnegative().nullable().optional(),
};

export async function upsertMarketSnapshot(
  params: UpsertMarketSnapshotParams,
): Promise<UpsertMarketSnapshotResult> {
  const client = createPetroAgentSupabaseClient();
  const ticker = normalizeTicker(params.ticker);
  const row = {
    price: params.price ?? null,
    snapshot_time: params.snapshot_time,
    source: params.source ?? null,
    ticker,
    variation: params.variation ?? null,
    volume: params.volume ?? null,
  };
  const existing = await client
    .schema("petroagent")
    .from("market_snapshots")
    .select("id")
    .eq("ticker", ticker)
    .eq("snapshot_time", params.snapshot_time)
    .maybeSingle();

  if (existing.error) {
    throw existing.error;
  }

  const existingId = (existing.data as { id?: number } | null)?.id;
  const { data, error } = existingId
    ? await client
        .schema("petroagent")
        .from("market_snapshots")
        .update(row)
        .eq("id", existingId)
        .select("id")
        .single()
    : await client
        .schema("petroagent")
        .from("market_snapshots")
        .insert(row)
        .select("id")
        .single();

  if (error) {
    throw error;
  }

  return {
    id: (data as { id: number }).id,
    source: "petroagent.market_snapshots",
    ticker,
  };
}

export function registerUpsertMarketSnapshotTool(server: McpServer) {
  server.registerTool(
    "upsert_market_snapshot",
    {
      annotations: {
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
        readOnlyHint: false,
      },
      description:
        "Registra ou atualiza um snapshot de mercado em petroagent.market_snapshots.",
      inputSchema: upsertMarketSnapshotInputSchema,
      title: "Salvar snapshot de mercado",
    },
    async (args) => {
      const result = await upsertMarketSnapshot(args);

      return {
        content: [{ text: `Snapshot ${result.ticker} salvo em market_snapshots:${result.id}.`, type: "text" }],
        structuredContent: result,
      };
    },
  );
}
