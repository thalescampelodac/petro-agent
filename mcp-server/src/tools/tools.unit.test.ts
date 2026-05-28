import { describe, expect, it, vi } from "vitest";

import { createSupabaseFixtureClient } from "../../../test/fixtures/supabase.js";
import { getAgentProfile } from "./get-agent-profile.js";
import { getLatestReport } from "./get-latest-report.js";
import { getMarketSnapshot } from "./get-market-snapshot.js";
import { searchAgentMemory } from "./search-agent-memory.js";
import { compareReports } from "./compare-reports.js";
import { generateInformativeAnalysis } from "./generate-informative-analysis.js";
import { registerMarketEvent } from "./register-market-event.js";
import { registerSource } from "./register-source.js";
import { saveAgentReport } from "./save-agent-report.js";
import { summarizeContext } from "./summarize-context.js";
import { upsertMarketSnapshot } from "./upsert-market-snapshot.js";
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

  it("retorna sentimento estruturado do ultimo relatorio", async () => {
    const { client } = createSupabaseFixtureClient({
      agent_reports: {
        data: {
          attention_points: ["Sem recomendação financeira"],
          created_at: "2026-05-25T12:00:00.000Z",
          id: 3,
          model_used: "gemini",
          sentiment: "Neutro",
          sentiment_basis: "Dados persistidos sem pressão direcional relevante.",
          sentiment_confidence: "media",
          sentiment_score: 54,
          source_count: 2,
          summary: "Resumo estruturado.",
          title: "Radar diário",
        },
        error: null,
      },
    });
    supabaseClient = client;

    await expect(getLatestReport()).resolves.toMatchObject({
      found: true,
      report: {
        sentiment_basis: "Dados persistidos sem pressão direcional relevante.",
        sentiment_confidence: "media",
        sentiment_score: 54,
      },
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
            sentiment_basis: "Base estruturada",
            sentiment_confidence: "media",
            sentiment_score: 52,
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

  it("registra fonte com chave natural por URL", async () => {
    const { calls, client } = createSupabaseFixtureClient({
      sources: [
        { data: null, error: null },
        { data: { id: 10 }, error: null },
      ],
    });
    supabaseClient = client;

    await expect(
      registerSource({
        raw_content: "Conteúdo público",
        source_type: "ri",
        title: "Fonte RI",
        url: "https://example.com/ri",
      }),
    ).resolves.toEqual({ id: 10, source: "petroagent.sources" });
    expect(calls).toContainEqual({
      args: [expect.any(Object)],
      method: "insert",
      table: "sources",
    });
  });

  it("registra evento de mercado de forma idempotente", async () => {
    const { calls, client } = createSupabaseFixtureClient({
      market_events: { data: { id: 20 }, error: null },
    });
    supabaseClient = client;

    await expect(
      registerMarketEvent({
        event_date: "2026-05-27T12:00:00.000Z",
        event_type: "RI",
        relevance_score: 80,
        summary: "Evento acompanhado.",
        title: "Fato relevante",
      }),
    ).resolves.toEqual({ id: 20, source: "petroagent.market_events" });
    expect(calls).toContainEqual({
      args: [expect.any(Object), { onConflict: "event_type,title,event_date" }],
      method: "upsert",
      table: "market_events",
    });
  });

  it("salva snapshot de mercado por ticker e horario", async () => {
    const { calls, client } = createSupabaseFixtureClient({
      market_snapshots: [
        { data: null, error: null },
        { data: { id: 30 }, error: null },
      ],
    });
    supabaseClient = client;

    await expect(
      upsertMarketSnapshot({
        price: 42.82,
        snapshot_time: "2026-05-27T17:10:00-03:00",
        source: "Google Finance",
        ticker: "petr4",
        variation: -1.43,
        volume: 287654321,
      }),
    ).resolves.toEqual({
      id: 30,
      source: "petroagent.market_snapshots",
      ticker: "PETR4",
    });
    expect(calls).toContainEqual({
      args: [expect.any(Object)],
      method: "insert",
      table: "market_snapshots",
    });
  });

  it("salva relatorio estruturado do agente", async () => {
    const { calls, client } = createSupabaseFixtureClient({
      agent_reports: { data: { id: 40 }, error: null },
    });
    supabaseClient = client;

    await expect(
      saveAgentReport({
        sentiment: "Neutro",
        sentiment_basis: "Sem pressão direcional relevante.",
        sentiment_confidence: "baixa",
        sentiment_score: 50,
        summary: "Resumo informativo.",
      }),
    ).resolves.toEqual({ id: 40, source: "petroagent.agent_reports" });
    expect(calls).toContainEqual({
      args: [expect.objectContaining({ sentiment_score: 50 })],
      method: "insert",
      table: "agent_reports",
    });
  });

  it("gera analise informativa com fallback persistivel", async () => {
    const originalGeminiKey = process.env.GEMINI_API_KEY;
    process.env.GEMINI_API_KEY = "";
    const { client } = createSupabaseFixtureClient({
      market_events: { data: [], error: null },
      sources: { data: [], error: null },
    });
    supabaseClient = client;

    try {
      await expect(
        generateInformativeAnalysis({ ticker: "PETR4" }),
      ).resolves.toMatchObject({
        payload: {
          model_used: "fallback",
          sentiment: "Neutro",
          sentiment_score: 50,
        },
      });
    } finally {
      process.env.GEMINI_API_KEY = originalGeminiKey;
    }
  });

  it("gera analise informativa com Gemini quando configurado", async () => {
    const originalGeminiKey = process.env.GEMINI_API_KEY;
    process.env.GEMINI_API_KEY = "test-key";
    const fetchMock = vi.fn(async () => ({
      json: async () => ({
        candidates: [
          {
            content: {
              parts: [
                {
                  text: JSON.stringify({
                    attention_points: ["Contexto persistido considerado."],
                    sentiment: "Positivo",
                    sentiment_basis: "Eventos recentes indicam leitura informativa construtiva.",
                    sentiment_confidence: "media",
                    sentiment_score: 61,
                    summary: "Análise curta baseada no contexto salvo.",
                    title: "Radar PETR4",
                  }),
                },
              ],
            },
          },
        ],
      }),
      ok: true,
    }));
    const originalFetch = globalThis.fetch;
    vi.stubGlobal("fetch", fetchMock);
    const { client } = createSupabaseFixtureClient({
      market_events: { data: [], error: null },
      sources: { data: [], error: null },
    });
    supabaseClient = client;

    try {
      await expect(
        generateInformativeAnalysis({ ticker: "PETR4" }),
      ).resolves.toMatchObject({
        payload: {
          model_used: "gemini",
          sentiment: "Positivo",
          sentiment_confidence: "media",
          sentiment_score: 61,
        },
      });
      expect(fetchMock).toHaveBeenCalled();
    } finally {
      process.env.GEMINI_API_KEY = originalGeminiKey;
      vi.stubGlobal("fetch", originalFetch);
    }
  });
});

describe("MCP tools registry", () => {
  it("registra todas as tools publicas esperadas", () => {
    const server = {
      registerTool: vi.fn(),
    };

    registerTools(server as never);

    expect(server.registerTool).toHaveBeenCalledTimes(12);
    expect(server.registerTool.mock.calls.map(([name]) => name).sort()).toEqual([
      "compare_reports",
      "generate_informative_analysis",
      "get_agent_profile",
      "get_latest_report",
      "get_market_snapshot",
      "list_market_events",
      "register_market_event",
      "register_source",
      "save_agent_report",
      "search_agent_memory",
      "summarize_context",
      "upsert_market_snapshot",
    ]);
  });
});
