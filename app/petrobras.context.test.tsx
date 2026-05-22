import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import PetrobrasPage, { metadata } from "@/app/petrobras/page";

describe("PetrobrasPage", () => {
  it("apresenta o painel Petrobras com dados demonstrativos e aviso informativo", () => {
    render(<PetrobrasPage />);

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
    expect(screen.getByText(/linha do tempo/i)).toBeInTheDocument();
    expect(screen.getByText(/aviso informativo/i)).toBeInTheDocument();
  });

  it("declara metadados públicos da rota", () => {
    expect(metadata.title).toBe("Painel Petrobras | PetroAgent");
    expect(metadata.description).toMatch(/acompanhamento informativo/i);
  });
});
