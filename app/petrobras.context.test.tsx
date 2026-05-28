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

  it("apresenta estados vazios quando ainda nao ha dados persistidos", async () => {
    render(await PetrobrasPage());

    expect(
      screen.getByRole("heading", { name: /painel petrobras petr4/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /voltar para home/i })).toHaveAttribute(
      "href",
      "/",
    );
    expect(screen.getByText(/dados básicos petr4/i)).toBeInTheDocument();
    expect(screen.getAllByText(/aguardando coleta/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/resumo inteligente/i)).toBeInTheDocument();
    expect(screen.getAllByText(/aguardando relatório/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/relatórios recentes/i)).toBeInTheDocument();
    expect(screen.getByText(/nenhum relatório salvo ainda/i)).toBeInTheDocument();
    expect(screen.getByText(/indicador de sentimento/i)).toBeInTheDocument();
    expect(screen.getByRole("meter", { name: /sentimento sem dado/i })).toHaveAttribute(
      "aria-valuenow",
      "0",
    );
    expect(screen.getByText(/eventos recentes/i)).toBeInTheDocument();
    expect(screen.getByText(/nenhum evento recente/i)).toBeInTheDocument();
    expect(screen.getByText(/aguardando eventos persistidos/i)).toBeInTheDocument();
    expect(screen.getByText(/sem recomendação financeira/i)).toBeInTheDocument();
  });

  it("apresenta dados persistidos de snapshot, relatório e eventos", async () => {
    vi.mocked(getCachedPetrobrasData).mockResolvedValue({
      events: [
        {
          created_at: "2026-05-27T18:00:00.000Z",
          event_date: "2026-05-27T17:00:00.000Z",
          event_type: "Dividendos",
          relevance_score: 82,
          source_id: 7,
          summary: "Evento persistido pelo agente.",
          title: "Dividendo em monitoramento",
        },
      ],
      report: {
        created_at: "2026-05-27T19:00:00.000Z",
        model_used: "gemini",
        sentiment: "Neutro",
        sentiment_basis: "Base persistida pelo agente.",
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
        source: "Google Finance",
        ticker: "PETR4",
        variation: -1.43,
        volume: 287654321,
      },
      source: "supabase",
    });

    render(await PetrobrasPage());

    expect(screen.getByText("R$ 42,82")).toBeInTheDocument();
    expect(screen.getByText("-1,43%")).toBeInTheDocument();
    expect(screen.getByText("Resumo salvo pelo agente.")).toBeInTheDocument();
    expect(screen.getByRole("meter", { name: /sentimento neutro/i })).toHaveAttribute(
      "aria-valuenow",
      "54",
    );
    expect(screen.getByText(/dividendo em monitoramento/i)).toBeInTheDocument();
    expect(screen.getByLabelText("Pulso 1: 82")).toBeInTheDocument();
  });

  it("declara metadados públicos da rota", () => {
    expect(metadata.title).toBe("Painel Petrobras | PetroAgent");
    expect(metadata.description).toMatch(/acompanhamento informativo/i);
  });
});
