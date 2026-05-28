import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { getCachedPetrobrasData } from "@/services/petrobras-cache";

vi.mock("@/services/petrobras-cache", () => ({
  getCachedPetrobrasData: vi.fn(async () => ({
    events: [],
    report: null,
    reports: [],
    snapshot: null,
    source: "fallback",
  })),
}));

import PetrobrasPage, { metadata } from "@/app/petrobras/page";

describe("PetrobrasPage", () => {
  beforeEach(() => {
    vi.mocked(getCachedPetrobrasData).mockResolvedValue({
      events: [],
      report: null,
      reports: [],
      snapshot: null,
      source: "fallback",
    });
  });

  it("apresenta estados vazios quando ainda nao ha dados do agente", async () => {
    render(await PetrobrasPage());

    expect(
      screen.getByRole("heading", { name: /painel petrobras petr4/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /voltar para home/i })).toHaveAttribute(
      "href",
      "/",
    );
    expect(screen.getByText(/radar petrobras/i)).toBeInTheDocument();
    expect(screen.getByText(/dados de mercado/i)).toBeInTheDocument();
    expect(screen.getAllByText(/aguardando coleta/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/resumo inteligente/i)).toBeInTheDocument();
    expect(screen.getByText(/aguardando a primeira análise/i)).toBeInTheDocument();
    expect(screen.getByText(/análises recentes/i)).toBeInTheDocument();
    expect(screen.getByText(/nenhuma análise salva ainda/i)).toBeInTheDocument();
    expect(screen.getByText(/indicador de sentimento/i)).toBeInTheDocument();
    expect(screen.getByRole("meter", { name: /sentimento sem dado/i })).toHaveAttribute(
      "aria-valuenow",
      "0",
    );
    expect(screen.getAllByText(/eventos/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/nenhum evento monitorado/i)).toBeInTheDocument();
    expect(screen.getByText(/aguardando eventos recentes/i)).toBeInTheDocument();
    expect(screen.getAllByText(/última atualização/i)).toHaveLength(1);
    expect(screen.queryByText(/horário de brasília/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/persistidos/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/banco de dados/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/mcp-first/i)).not.toBeInTheDocument();
  });

  it("apresenta dados do agente de snapshot, relatório e eventos", async () => {
    vi.mocked(getCachedPetrobrasData).mockResolvedValue({
      events: [
        {
          created_at: "2026-05-27T18:00:00.000Z",
          event_date: "2026-05-27T17:00:00.000Z",
          event_type: "Dividendos",
          relevance_score: 82,
          source_id: 7,
          summary: "Evento acompanhado pelo agente.",
          title: "Dividendo em monitoramento",
        },
      ],
      report: {
        created_at: "2026-05-27T19:00:00.000Z",
        model_used: "gemini",
        sentiment: "Neutro",
        sentiment_basis: "Base acompanhada pelo agente.",
        sentiment_confidence: "media",
        sentiment_score: 54,
        source_count: 2,
        summary: "Resumo salvo pelo agente.",
        title: "Radar PETR4",
      },
      reports: [],
      snapshot: {
        price: 42.82,
        snapshot_time: "2026-05-27T17:10:00-03:00",
        source: "Google Finance - https://www.google.com/finance/quote/PETR4:BVMF",
        ticker: "PETR4",
        variation: -1.43,
        volume: 287654321,
      },
      source: "supabase",
    });

    render(await PetrobrasPage());

    expect(screen.getByText("R$ 42,82")).toBeInTheDocument();
    expect(screen.getByText("-1,43%")).toBeInTheDocument();
    expect(screen.getByText("287.654.321")).toBeInTheDocument();
    expect(screen.getByText("Resumo salvo pelo agente.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /google finance/i })).toHaveAttribute(
      "href",
      "https://www.google.com/finance/quote/PETR4:BVMF",
    );
    expect(screen.getByText(/análises recentes/i)).toBeInTheDocument();
    expect(screen.getByText(/eventos monitorados/i)).toBeInTheDocument();
    expect(screen.getByRole("meter", { name: /sentimento neutro/i })).toHaveAttribute(
      "aria-valuenow",
      "54",
    );
    expect(screen.getByText(/dividendo em monitoramento/i)).toBeInTheDocument();
    expect(screen.queryByText(/evento acompanhado pelo agente/i)).not.toBeInTheDocument();
    expect(screen.getByLabelText("Pulso 1: 82")).toBeInTheDocument();
    expect(screen.queryByText(/gemini/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/banco de dados/i)).not.toBeInTheDocument();
  });

  it("declara metadados públicos da rota", () => {
    expect(metadata.title).toBe("Painel Petrobras | PetroAgent");
    expect(metadata.description).toMatch(/acompanhamento informativo/i);
  });
});
