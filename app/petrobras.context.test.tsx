import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/services/petrobras-cache", () => ({
  getCachedPetrobrasData: vi.fn(async () => ({
    events: [],
    report: null,
    snapshot: null,
    source: "fallback",
  })),
}));

import PetrobrasPage, { metadata } from "@/app/petrobras/page";

describe("PetrobrasPage", () => {
  it("apresenta o painel Petrobras com dados demonstrativos e aviso informativo", async () => {
    render(await PetrobrasPage());

    expect(
      screen.getByRole("heading", { name: /painel petrobras petr4/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /voltar para home/i })).toHaveAttribute(
      "href",
      "/",
    );
    expect(screen.getByText(/dados básicos petr4/i)).toBeInTheDocument();
    expect(screen.getByText(/resumo inteligente/i)).toBeInTheDocument();
    expect(screen.getByText(/fallback mockado/i)).toBeInTheDocument();
    expect(screen.getByText(/indicador de sentimento/i)).toBeInTheDocument();
    expect(screen.getByRole("meter", { name: /sentimento neutro/i })).toHaveAttribute(
      "aria-valuenow",
      "52",
    );
    expect(screen.getByText(/linha do tempo/i)).toBeInTheDocument();
    expect(screen.getByText(/fonte: fallback/i)).toBeInTheDocument();
    expect(screen.getByText(/sem recomendação financeira/i)).toBeInTheDocument();
  });

  it("declara metadados públicos da rota", () => {
    expect(metadata.title).toBe("Painel Petrobras | PetroAgent");
    expect(metadata.description).toMatch(/acompanhamento informativo/i);
  });
});
