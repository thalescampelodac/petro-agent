import { describe, expect, it, vi } from "vitest";

import { createSupabaseFixtureClient } from "../../../test/fixtures/supabase.js";
import { getAgentProfile } from "./get-agent-profile.js";
import { getMarketSnapshot } from "./get-market-snapshot.js";
import { searchAgentMemory } from "./search-agent-memory.js";
import { compareReports } from "./compare-reports.js";
import { summarizeContext } from "./summarize-context.js";
import { registerTools } from "./index.js";

let supabaseClient: unknown;

vi.mock("../db/supabase.js", () => ({
  createPetroAgentSupabaseClient: () => supabaseClient,
}));

describe("MCP tools", () => {
  it("retorna o perfil padrao Petrobras/PETR4", () => {
    const profile = getAgentProfile();

    expect(profile.active_profile.asset.defaultTicker).toBe("PETR4");
    expect(profile.active_profile.name).toContain("Petrobras");
    expect(profile.available_profiles).toHaveLength(1);
  });

  it("retorna o ultimo snapshot de mercado encontrado", async () => {
    const { calls, client } = createSupabaseFixtureClient({
      market_snapshots: {
        data: {
          created_at: "2026-05-25T10:00:00.000Z",
          id: 1,
          price: 30.25,
          snapshot_time: "2026-05-25T09:55:00.000Z",
          source: "fixture",
          ticker: "PETR4",
          variation: 1.2,
          volume: 1000,
        },
        error: null,
      },
    });
    supabaseClient = client;

    await expect(getMarketSnapshot(" petr4 ")).resolves.toMatchObject({
      found: true,
      snapshot: { ticker: "PETR4" },
      ticker: "PETR4",
    });
    expect(calls).toContainEqual({
      args: ["ticker", "PETR4"],
      method: "eq",
      table: "market_snapshots",
    });
  });

  it("retorna vazio quando nao existe snapshot salvo", async () => {
    const { client } = createSupabaseFixtureClient({
      market_snapshots: { data: null, error: null },
    });
    supabaseClient = client;

    await expect(getMarketSnapshot()).resolves.toEqual({
      found: false,
      reason: "not_found",
      snapshot: null,
      ticker: "PETR4",
    });
  });

  it("busca memoria em fontes, eventos e relatorios", async () => {
    const { client } = createSupabaseFixtureClient({
      agent_reports: {
        data: [
          {
            created_at: "2026-05-25T12:00:00.000Z",
            id: 3,
            sentiment: "Neutro",
            summary: "Relatorio sobre dividendos",
            title: "Radar diario",
          },
        ],
        error: null,
      },
      market_events: {
        data: [
          {
            created_at: "2026-05-25T11:00:00.000Z",
            event_type: "Dividendos",
            id: 2,
            source_id: 1,
            summary: "Evento de proventos",
            title: "Proventos em pauta",
          },
        ],
        error: null,
      },
      sources: {
        data: [
          {
            created_at: "2026-05-25T10:00:00.000Z",
            id: 1,
            raw_content: "Comunicado sobre dividendos",
            source_type: "ri",
            title: "Comunicado RI",
            url: "https://example.com/ri",
          },
        ],
        error: null,
      },
    });
    supabaseClient = client;

    const result = await searchAgentMemory({ limit: 10, query: "dividendos" });

    expect(result).toMatchObject({ count: 3, query: "dividendos" });
    expect(result.items.map((item) => item.item_type)).toEqual([
      "agent_report",
      "market_event",
      "source",
    ]);
  });

  it("compara dois relatorios e calcula mudancas basicas", async () => {
    const { client } = createSupabaseFixtureClient({
      agent_reports: {
        data: [
          {
            created_at: "2026-05-25T12:00:00.000Z",
            id: 2,
            model_used: "fallback",
            sentiment: "Positivo",
            source_count: 5,
            summary: "Atual",
            title: "Atual",
          },
          {
            created_at: "2026-05-24T12:00:00.000Z",
            id: 1,
            model_used: "fallback",
            sentiment: "Neutro",
            source_count: 3,
            summary: "Anterior",
            title: "Anterior",
          },
        ],
        error: null,
      },
    });
    supabaseClient = client;

    await expect(compareReports({ limit: 5 })).resolves.toMatchObject({
      changes: {
        sentiment_changed: true,
        sentiment_from: "Neutro",
        sentiment_to: "Positivo",
        source_count_delta: 2,
      },
      count: 2,
    });
  });

  it("explica quando a comparacao nao possui relatorios suficientes", async () => {
    const { client } = createSupabaseFixtureClient({
      agent_reports: { data: [], error: null },
    });
    supabaseClient = client;

    await expect(compareReports({ limit: 5 })).resolves.toMatchObject({
      changes: null,
      count: 0,
      summary: expect.stringContaining("pelo menos dois relatórios"),
    });
  });

  it("sumariza fontes e eventos persistidos", async () => {
    const { client } = createSupabaseFixtureClient({
      market_events: {
        data: [
          {
            created_at: "2026-05-25T11:00:00.000Z",
            event_type: "RI",
            id: 2,
            relevance_score: 80,
            summary: "Evento relevante",
            title: "Fato relevante",
          },
        ],
        error: null,
      },
      sources: {
        data: [
          {
            created_at: "2026-05-25T10:00:00.000Z",
            id: 1,
            source_type: "ri",
            title: "Fonte RI",
            url: "https://example.com/fonte",
          },
        ],
        error: null,
      },
    });
    supabaseClient = client;

    await expect(summarizeContext({ query: "Petrobras" })).resolves.toMatchObject({
      citations: ["https://example.com/fonte", "petroagent.market_events:2"],
      summary: expect.stringContaining("Foram consideradas 1 fontes"),
    });
  });

  it("sumariza contexto vazio com fallback deterministico", async () => {
    const { client } = createSupabaseFixtureClient({
      market_events: { data: [], error: null },
      sources: { data: [], error: null },
    });
    supabaseClient = client;

    await expect(summarizeContext({})).resolves.toMatchObject({
      citations: [],
      events: [],
      sources: [],
      summary: expect.stringContaining("Nenhuma fonte persistida"),
    });
  });
});

describe("MCP tools registry", () => {
  it("registra todas as tools publicas esperadas", () => {
    const server = {
      registerTool: vi.fn(),
    };

    registerTools(server as never);

    expect(server.registerTool).toHaveBeenCalledTimes(7);
    expect(server.registerTool.mock.calls.map(([name]) => name).sort()).toEqual([
      "compare_reports",
      "get_agent_profile",
      "get_latest_report",
      "get_market_snapshot",
      "list_market_events",
      "search_agent_memory",
      "summarize_context",
    ]);
  });
});
