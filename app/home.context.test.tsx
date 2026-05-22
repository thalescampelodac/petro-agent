import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Home from "@/app/page";

describe("Home", () => {
  it("apresenta o contexto do produto sem vender recomendação financeira", () => {
    render(<Home />);

    expect(
      screen.getByRole("heading", {
        name: /um agente inteligente acompanhando petrobras para você/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText(/petroagent transforma sinais públicos/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /o que o agente monitora/i })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /resumo inteligente do agente/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /como funciona/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /roadmap do projeto/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /um projeto aberto/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /gostei do projeto/i }),
    ).toHaveTextContent("Gostei do projeto");
    expect(screen.getByText("Mostre que você está acompanhando")).toBeInTheDocument();
    expect(screen.getAllByText(/não constitui recomendação/i).length).toBeGreaterThan(0);
  });
});
