import { describe, expect, it } from "vitest";

import { createSupabaseFixtureClient } from "@/test/fixtures/supabase";

import { PETROAGENT_MCP_TOOLS } from "./internal-adapter";
import { createLocalMcpToolClient } from "./local-tool-client";

describe("local MCP tool client", () => {
  it("registra fonte pelo contrato MCP local", async () => {
    const { calls, client } = createSupabaseFixtureClient({
      sources: [
        { data: null, error: null },
        { data: { id: 10 }, error: null },
      ],
    });
    const toolClient = createLocalMcpToolClient(client as never);

    await expect(
      toolClient.callTool(PETROAGENT_MCP_TOOLS.registerSource, {
        raw_content: "Conteúdo público de teste operacional.",
        source_type: "operational_test",
        title: "Fonte de teste operacional",
        url: "https://example.com/petroagent-operational-test",
      }),
    ).resolves.toMatchObject({
      structuredContent: {
        id: 10,
        source: "petroagent.sources",
      },
    });
    expect(calls).toContainEqual({
      args: [expect.any(Object)],
      method: "insert",
      table: "sources",
    });
  });

  it("registra evento pelo contrato MCP local", async () => {
    const { calls, client } = createSupabaseFixtureClient({
      market_events: { data: { id: 20 }, error: null },
    });
    const toolClient = createLocalMcpToolClient(client as never);

    await expect(
      toolClient.callTool(PETROAGENT_MCP_TOOLS.registerMarketEvent, {
        event_date: "2026-05-28T12:00:00.000Z",
        event_type: "Teste operacional",
        relevance_score: 72,
        source_id: 10,
        summary: "Evento salvo pelo contrato MCP local.",
        title: "Evento de teste operacional",
      }),
    ).resolves.toMatchObject({
      structuredContent: {
        id: 20,
        source: "petroagent.market_events",
      },
    });
    expect(calls).toContainEqual({
      args: [expect.any(Object), { onConflict: "event_type,title,event_date" }],
      method: "upsert",
      table: "market_events",
    });
  });

  it("salva snapshot pelo contrato MCP local", async () => {
    const { calls, client } = createSupabaseFixtureClient({
      market_snapshots: [
        { data: null, error: null },
        { data: { id: 30 }, error: null },
      ],
    });
    const toolClient = createLocalMcpToolClient(client as never);

    await expect(
      toolClient.callTool(PETROAGENT_MCP_TOOLS.upsertMarketSnapshot, {
        price: 42.82,
        snapshot_time: "2026-05-28T18:00:00.000Z",
        source: "Teste operacional",
        ticker: "petr4",
        variation: -1.43,
        volume: 287654321,
      }),
    ).resolves.toMatchObject({
      structuredContent: {
        id: 30,
        source: "petroagent.market_snapshots",
        ticker: "PETR4",
      },
    });
    expect(calls).toContainEqual({
      args: [expect.any(Object)],
      method: "insert",
      table: "market_snapshots",
    });
  });
});
