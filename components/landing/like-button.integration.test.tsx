import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

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
  });

  it("incrementa o contador visual e persiste o apoio localmente", async () => {
    const user = userEvent.setup();

    render(<LikeButton />);

    const button = screen.getByRole("button", { name: /gostei do projeto/i });
    expect(screen.getByText("128")).toBeInTheDocument();

    await user.click(button);

    expect(screen.getByText("129")).toBeInTheDocument();
    expect(window.localStorage.getItem("petroagent-like-count")).toBe("129");
    expect(screen.getByText(/valeu|curioso|radar|obrigado/i)).toBeInTheDocument();
  });
});
