import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import PetrobrasPage, { metadata } from "@/app/petrobras/page";

describe("PetrobrasPage", () => {
  it("apresenta o painel Petrobras com dados demonstrativos e aviso informativo", () => {
    render(<PetrobrasPage />);

    expect(
      screen.getByRole("heading", { name: /painel petrobras petr4/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/radar petrobras\/petr4/i)).toBeInTheDocument();
    expect(screen.getByText(/mvp 1/i)).toBeInTheDocument();
    expect(screen.getByText(/fallback mockado/i)).toBeInTheDocument();
    expect(screen.getAllByText(/conteúdo simulado/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/estrutura visual preparada/i)).toBeInTheDocument();
    expect(screen.getByText("Linha do tempo")).toBeInTheDocument();
    expect(screen.getAllByText(/não constitui recomendação/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/mock/i).length).toBeGreaterThan(0);
  });

  it("declara metadados públicos da rota", () => {
    expect(metadata.title).toBe("Painel Petrobras | PetroAgent");
    expect(metadata.description).toMatch(/acompanhamento informativo/i);
  });
});
