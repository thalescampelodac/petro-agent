import { describe, expect, it, vi } from "vitest";

import {
  buildManualAgentPrompt,
  executeManualPetroAgent,
  getManualAgentCitations,
  readManualAgentContext,
  type ManualAgentContext,
} from "./agent-executor";
import { createSupabaseFixtureClient } from "@/test/fixtures/supabase";
import type { PetroAgentMcpAdapter } from "./mcp/internal-adapter";

const context: ManualAgentContext = {
  events: [
    {
      created_at: "2026-05-25T11:00:00.000Z",
      event_date: "2026-05-25T00:00:00.000Z",
      event_type: "RI",
      id: 20,
      relevance_score: 80,
      summary: "Comunicado relevante acompanhado pelo radar.",
      title: "Fato relevante publicado",
    },
  ],
  previousReports: [
    {
      created_at: "2026-05-24T12:00:00.000Z",
      sentiment: "Neutro",
      sentiment_score: 50,
      summary: "Resumo anterior sem recomendação.",
      title: "Relatório anterior",
    },
  ],
  snapshot: {
    price: 31.4,
    snapshot_time: "2026-05-25T10:30:00.000Z",
    source: "manual",
    ticker: "PETR4",
    variation: 1.2,
    volume: 1000,
  },
  sources: [
    {
      created_at: "2026-05-25T10:00:00.000Z",
      id: 10,
      published_at: "2026-05-25T09:00:00.000Z",
      raw_content: "Petrobras publicou atualização operacional sem recomendação.",
      source_type: "ri",
      title: "Atualização operacional",
      url: "https://example.com/ri",
    },
  ],
};

function toolResult<T>(structuredContent: T) {
  return {
    content: [{ text: "ok", type: "text" as const }],
    structuredContent,
  };
}

function createMcpAdapter(overrides: Partial<PetroAgentMcpAdapter> = {}) {
  return {
    compareReports: vi.fn(),
    generateInformativeAnalysis: vi.fn(async () =>
      toolResult({
        citations: ["https://example.com/ri", "petroagent.market_events:20"],
        payload: {
          attention_points: ["Fato relevante publicado"],
          model_used: "fallback",
          sentiment: "Neutro",
          sentiment_basis: "Contexto persistido sem pressão direcional relevante.",
    sentiment_confidence: "baixa" as const,
          sentiment_score: 50,
          source_count: 2,
          summary: "Resumo manual do agente.",
          title: "Radar informativo PETR4",
        },
      }),
    ),
    getAgentProfile: vi.fn(),
    getLatestReport: vi.fn(async () =>
      toolResult({
        found: true as const,
        report: context.previousReports[0],
      }),
    ),
    getMarketSnapshot: vi.fn(async () =>
      toolResult({
        found: true as const,
        snapshot: context.snapshot,
        ticker: "PETR4",
      }),
    ),
    listMarketEvents: vi.fn(async () =>
      toolResult({
        count: context.events.length,
        events: context.events,
        filters: {
          date_from: null,
          date_to: null,
          event_type: null,
          limit: 8,
        },
      }),
    ),
    registerMarketEvent: vi.fn(),
    registerSource: vi.fn(),
    saveAgentReport: vi.fn(async () =>
      toolResult({
        id: 123,
        source: "petroagent.agent_reports",
      }),
    ),
    searchAgentMemory: vi.fn(async () =>
      toolResult({
        count: context.sources.length,
        items: context.sources,
        query: "Petrobras PETR4",
      }),
    ),
    summarizeContext: vi.fn(),
    upsertMarketSnapshot: vi.fn(),
    ...overrides,
  } as unknown as PetroAgentMcpAdapter;
}

describe("manual PetroAgent executor", () => {
  it("monta contexto textual com guardrails de produto", () => {
    const prompt = buildManualAgentPrompt(context);

    expect(prompt).toContain("PetroAgent manual run");
    expect(prompt).toContain("Não recomende compra, venda ou manutenção");
    expect(prompt).toContain("Snapshot de mercado");
    expect(prompt).toContain("Fontes recentes");
    expect(prompt).toContain("Eventos recentes");
    expect(prompt).toContain("Relatórios anteriores");
    expect(prompt).toContain("escore 50/100");
  });

  it("extrai citacoes de fontes e eventos persistidos", () => {
    expect(getManualAgentCitations(context)).toEqual([
      "https://example.com/ri",
      "petroagent.market_events:20",
    ]);
  });

  it("le contexto usando o adapter MCP", async () => {
    const mcpAdapter = createMcpAdapter();

    await expect(readManualAgentContext(mcpAdapter)).resolves.toEqual(context);
    expect(mcpAdapter.getMarketSnapshot).toHaveBeenCalledWith("PETR4");
    expect(mcpAdapter.listMarketEvents).toHaveBeenCalledWith({ limit: 8 });
    expect(mcpAdapter.searchAgentMemory).toHaveBeenCalledWith({
      limit: 8,
      query: "Petrobras PETR4",
    });
  });

  it("executa agente, gera relatório e persiste em agent_reports", async () => {
    const { client } = createSupabaseFixtureClient({
      agent_reports: {
        data: context.previousReports,
        error: null,
      },
      market_events: {
        data: context.events,
        error: null,
      },
      market_snapshots: {
        data: context.snapshot,
        error: null,
      },
      sources: {
        data: context.sources,
        error: null,
      },
    });
    const mcpAdapter = createMcpAdapter();
    const logStart = vi.fn(async () => ({ id: 99 }));
    const logFinish = vi.fn(async () => undefined);

    await expect(
      executeManualPetroAgent({
        client: client as never,
        logFinish,
        logStart,
        mcpAdapter,
        origin: "unit-test",
      }),
    ).resolves.toEqual({
      engine: "fallback",
      logId: 99,
      reportId: 123,
      sourceCount: 2,
      status: "saved",
      summary: "Resumo manual do agente.",
    });
    expect(mcpAdapter.generateInformativeAnalysis).toHaveBeenCalledWith(
      expect.objectContaining({
        scope: expect.stringContaining("PetroAgent manual run"),
        ticker: "PETR4",
      }),
    );
    expect(mcpAdapter.saveAgentReport).toHaveBeenCalledWith(
      expect.objectContaining({
        source_count: 2,
        summary: "Resumo manual do agente.",
      }),
    );
    expect(logStart).toHaveBeenCalledWith(client, { origin: "unit-test" });
    expect(logFinish).toHaveBeenCalledWith(client, 99, {
      engine: "fallback",
      reportId: 123,
      sourceCount: 2,
      status: "saved",
    });
  });

  it("não executa sem configuração server-side do Supabase", async () => {
    await expect(executeManualPetroAgent({ client: null })).resolves.toEqual({
      reason: "missing_supabase_admin_config",
      status: "disabled",
    });
  });

  it("registra falha quando a geração do relatório quebra", async () => {
    const { client } = createSupabaseFixtureClient({
      agent_reports: {
        data: context.previousReports,
        error: null,
      },
      market_events: {
        data: context.events,
        error: null,
      },
      market_snapshots: {
        data: context.snapshot,
        error: null,
      },
      sources: {
        data: context.sources,
        error: null,
      },
    });
    const mcpAdapter = createMcpAdapter({
      generateInformativeAnalysis: vi.fn(async () => {
        throw new Error("ai_failed");
      }),
    });
    const logStart = vi.fn(async () => ({ id: 101 }));
    const logFinish = vi.fn(async () => undefined);

    await expect(
      executeManualPetroAgent({
        client: client as never,
        logFinish,
        logStart,
        mcpAdapter,
      }),
    ).rejects.toThrow("ai_failed");
    expect(logFinish).toHaveBeenCalledWith(client, 101, {
      errorMessage: "ai_failed",
      status: "failed",
    });
  });
});
