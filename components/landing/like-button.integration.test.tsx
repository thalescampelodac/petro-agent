import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { LikeButton } from "@/components/landing/like-button";

describe("LikeButton", () => {
  beforeEach(() => {
    const store = new Map<string, string>();

    vi.stubGlobal("localStorage", {
      clear: vi.fn(() => store.clear()),
      getItem: vi.fn((key: string) => store.get(key) ?? null),
      removeItem: vi.fn((key: string) => store.delete(key)),
      setItem: vi.fn((key: string, value: string) => {
        store.set(key, value);
      }),
    });
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => Response.json({ count: null, source: "local-fallback" })),
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("incrementa o contador visual e persiste o apoio localmente", async () => {
    const user = userEvent.setup();

    render(<LikeButton />);

    const button = screen.getByRole("button", { name: /gostei do projeto/i });
    expect(screen.getByText("128")).toBeInTheDocument();

    await user.click(button);

    expect(screen.getByText("129")).toBeInTheDocument();
    expect(window.localStorage.getItem("petroagent-like-count")).toBe("129");
    expect(window.localStorage.getItem("petroagent-like-activity")).toBeTruthy();
    expect(screen.getByText(/valeu|curioso|radar|obrigado/i)).toBeInTheDocument();
  });

  it("exibe contador global quando a API de likes está disponível", async () => {
    const user = userEvent.setup();
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(Response.json({ count: 144, source: "supabase" }))
      .mockResolvedValueOnce(Response.json({ count: 145, source: "supabase" }));
    vi.stubGlobal("fetch", fetchMock);

    render(<LikeButton />);

    expect(await screen.findByText("144")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /gostei do projeto/i }));

    expect(await screen.findByText("145")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/project-likes",
      expect.objectContaining({ cache: "no-store" }),
    );
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/project-likes",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("limita excesso de apoios em uma janela curta sem coletar dados pessoais", async () => {
    const user = userEvent.setup();
    vi.spyOn(Date, "now").mockReturnValue(1_000);

    render(<LikeButton />);

    const button = screen.getByRole("button", { name: /gostei do projeto/i });

    for (let i = 0; i < 6; i += 1) {
      await user.click(button);
    }

    expect(screen.getByText("133")).toBeInTheDocument();
    expect(window.localStorage.getItem("petroagent-like-count")).toBe("133");
    expect(screen.getByText(/pausa rapidinha/i)).toBeInTheDocument();
    expect(Object.keys(window.localStorage)).not.toContain("email");
    expect(Object.keys(window.localStorage)).not.toContain("user");
  });
});
