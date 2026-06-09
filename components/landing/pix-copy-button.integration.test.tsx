import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { PixCopyButton } from "@/components/landing/pix-copy-button";

describe("PixCopyButton", () => {
  let writeText: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    writeText = vi.fn(async () => undefined);

    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText,
      },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("copia a chave Pix e exibe feedback acessível", async () => {
    const pixKey = "2d8597cb-c2ba-41e5-9eb4-7221e7e1c4e8";

    render(<PixCopyButton pixKey={pixKey} />);

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /copiar chave pix/i }));
    });

    await vi.waitFor(() => expect(writeText).toHaveBeenCalledWith(pixKey));
    expect(
      screen.getByRole("button", { name: /chave pix copiada/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/chave disponível na área de transferência/i),
    ).toBeInTheDocument();
  });
});
