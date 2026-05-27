import { describe, expect, it, vi } from "vitest";

import {
  buildManualAgentPrompt,
  executeManualPetroAgent,
  getManualAgentCitations,
  readManualAgentContext,
  type ManualAgentContext,
} from "./agent-executor";
import { createSupabaseFixtureClient } from "@/test/fixtures/supabase";

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

  it("le contexto do Supabase sem banco real", async () => {
    const { calls, client, schema } = createSupabaseFixtureClient({
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

    await expect(readManualAgentContext(client as never)).resolves.toEqual(context);
    expect(schema).toHaveBeenCalledWith("petroagent");
    expect(calls).toContainEqual({
      args: ["ticker", "PETR4"],
      method: "eq",
      table: "market_snapshots",
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
    const generate = vi.fn(async () => ({
      engine: "fallback",
      result: {
        highlights: ["Fato relevante publicado"],
        summary: "Resumo manual do agente.",
      },
    }));
    const persist = vi.fn(async () => ({ id: 123 }));
    const logStart = vi.fn(async () => ({ id: 99 }));
    const logFinish = vi.fn(async () => undefined);

    await expect(
      executeManualPetroAgent({
        client: client as never,
        generate,
        logFinish,
        logStart,
        origin: "unit-test",
        persist,
      }),
    ).resolves.toEqual({
      engine: "fallback",
      logId: 99,
      reportId: 123,
      sourceCount: 2,
      status: "saved",
      summary: "Resumo manual do agente.",
    });
    expect(generate).toHaveBeenCalledWith({
      text: expect.stringContaining("PetroAgent manual run"),
    });
    expect(persist).toHaveBeenCalledWith(
      "fallback",
      expect.objectContaining({
        sources: ["https://example.com/ri", "petroagent.market_events:20"],
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
    const generate = vi.fn(async () => {
      throw new Error("ai_failed");
    });
    const logStart = vi.fn(async () => ({ id: 101 }));
    const logFinish = vi.fn(async () => undefined);

    await expect(
      executeManualPetroAgent({
        client: client as never,
        generate,
        logFinish,
        logStart,
      }),
    ).rejects.toThrow("ai_failed");
    expect(logFinish).toHaveBeenCalledWith(client, 101, {
      errorMessage: "ai_failed",
      status: "failed",
    });
  });
});
