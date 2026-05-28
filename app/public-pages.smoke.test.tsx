import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import Home from "@/app/page";
import PetrobrasPage from "@/app/petrobras/page";

vi.mock("@/services/petrobras-cache", () => ({
  getCachedPetrobrasData: vi.fn(async () => ({
    events: [],
    report: null,
    reports: [],
    snapshot: null,
    source: "fallback",
  })),
}));

function setViewport(width: number) {
  Object.defineProperty(window, "innerWidth", {
    configurable: true,
    value: width,
  });
  window.dispatchEvent(new Event("resize"));
}

describe("public pages smoke", () => {
  beforeEach(() => {
    const localStorage = {
      getItem: vi.fn(() => null),
      removeItem: vi.fn(),
      setItem: vi.fn(),
    };

    Object.defineProperty(window, "localStorage", {
      configurable: true,
      value: localStorage,
    });
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        json: async () => ({ count: 128, source: "fixture" }),
        ok: true,
      })),
    );
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it.each([
    ["desktop", 1280],
    ["mobile", 390],
  ])("renderiza a home em %s sem erro visual evidente", (_name, width) => {
    setViewport(width);

    render(<Home />);

    expect(
      screen.getByRole("heading", {
        name: /um agente inteligente acompanhando petrobras para você/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /ver painel petrobras/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /gostei do projeto/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/roadmap do projeto/i)).toBeInTheDocument();
    expect(console.error).not.toHaveBeenCalled();
  });

  it.each([
    ["desktop", 1280],
    ["mobile", 390],
  ])("renderiza o painel Petrobras em %s sem erro visual evidente", async (_name, width) => {
    setViewport(width);

    render(await PetrobrasPage());

    expect(
      screen.getByRole("heading", { name: /painel petrobras petr4/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/dados de mercado/i)).toBeInTheDocument();
    expect(screen.getByText(/resumo inteligente/i)).toBeInTheDocument();
    expect(screen.getByText(/análises recentes/i)).toBeInTheDocument();
    expect(screen.getByText(/sinais monitorados/i)).toBeInTheDocument();
    expect(screen.getByText(/pulso do mercado/i)).toBeInTheDocument();
    expect(screen.getByText(/eventos monitorados/i)).toBeInTheDocument();
    expect(console.error).not.toHaveBeenCalled();
  });
});
