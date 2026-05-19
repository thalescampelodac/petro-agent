import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Home from "@/app/page";

describe("Home", () => {
  it("apresenta o contexto do produto sem vender recomendacao financeira", () => {
    render(<Home />);

    expect(
      screen.getByRole("heading", {
        name: /um agente inteligente acompanhando petrobras para voce/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText(/petroagent transforma sinais publicos/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /o que o agente monitora/i })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /resumo inteligente do agente/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /como funciona/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /gostou do petroagent/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /um projeto aberto/i })).toBeInTheDocument();
    expect(screen.getAllByText(/nao constitui recomendacao/i).length).toBeGreaterThan(0);
  });
});
