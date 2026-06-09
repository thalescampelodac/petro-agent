import { render, screen } from "@testing-library/react";
import { vi, describe, expect, it } from "vitest";

import Home from "@/app/page";

vi.mock("@/services/petrobras-cache", () => ({
  getCachedPetrobrasData: vi.fn(async () => ({
    events: [],
    report: null,
    reports: [],
    snapshot: null,
    source: "fallback",
  })),
}));

describe("Home", () => {
  it("apresenta o contexto do produto sem vender recomendação financeira", async () => {
    render(await Home());

    expect(
      screen.getByRole("heading", {
        name: /um agente inteligente acompanhando a petrobrás para você/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getAllByText("PetroAgent").length).toBeGreaterThan(0);
    expect(screen.getByText(/petroagent transforma sinais públicos/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /o que o agente monitora/i })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /resumo inteligente do agente/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /como funciona/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /roadmap do projeto/i })).toBeInTheDocument();
    expect(screen.getByText("Concluído")).toBeInTheDocument();
    expect(screen.getByText("Em execução")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /um projeto aberto/i })).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /ver painel petrobras/i }),
    ).toHaveAttribute("href", "/petrobras");
    expect(
      screen.getByRole("button", { name: /gostei do projeto/i }),
    ).toHaveTextContent("Gostei do projeto");
    expect(screen.getByText("Mostre que você está acompanhando")).toBeInTheDocument();
    expect(screen.getByText("Apoie o PetroAgent")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /copiar chave pix/i })).toBeInTheDocument();
    expect(screen.getByText(/projeto independente, gratuito e experimental/i)).toBeInTheDocument();
    expect(screen.queryByText(/preview visual/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/mock/i)).not.toBeInTheDocument();
    expect(screen.getAllByText(/não constitui recomendação/i).length).toBeGreaterThan(0);
  });
});
