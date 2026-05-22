import { beforeEach, describe, expect, it, vi } from "vitest";

import { POST } from "@/app/api/sources/route";
import { registerManualSource } from "@/services/petroagent-sources";

vi.mock("@/services/petroagent-sources", () => ({
  registerManualSource: vi.fn(),
}));

describe("/api/sources", () => {
  beforeEach(() => {
    vi.mocked(registerManualSource).mockReset();
    process.env.PETROAGENT_COLLECTOR_TOKEN = "secret-token";
  });

  it("registra fonte manual quando o token é válido", async () => {
    vi.mocked(registerManualSource).mockResolvedValue({
      id: 10,
      source: "supabase",
    });

    const response = await POST(
      new Request("http://localhost/api/sources", {
        body: JSON.stringify({
          rawContent: "Conteúdo público da fonte.",
          sourceType: "ri",
          title: "Comunicado",
          url: "https://example.com/comunicado",
        }),
        headers: {
          authorization: "Bearer secret-token",
        },
        method: "POST",
      }),
    );

    await expect(response.json()).resolves.toEqual({
      id: 10,
      source: "supabase",
    });
    expect(response.status).toBe(201);
    expect(registerManualSource).toHaveBeenCalledWith({
      rawContent: "Conteúdo público da fonte.",
      sourceType: "ri",
      title: "Comunicado",
      url: "https://example.com/comunicado",
    });
  });

  it("bloqueia chamadas sem token válido", async () => {
    const response = await POST(
      new Request("http://localhost/api/sources", {
        body: JSON.stringify({
          rawContent: "Conteúdo público da fonte.",
          sourceType: "ri",
        }),
        method: "POST",
      }),
    );

    await expect(response.json()).resolves.toEqual({
      reason: "unauthorized",
      source: "manual-collector",
    });
    expect(response.status).toBe(401);
    expect(registerManualSource).not.toHaveBeenCalled();
  });

  it("valida campos obrigatórios", async () => {
    const response = await POST(
      new Request("http://localhost/api/sources", {
        body: JSON.stringify({
          sourceType: "ri",
        }),
        headers: {
          "x-petroagent-collector-token": "secret-token",
        },
        method: "POST",
      }),
    );

    await expect(response.json()).resolves.toEqual({
      detail: "sourceType_and_rawContent_are_required",
      reason: "invalid_manual_source",
      source: "manual-collector",
    });
    expect(response.status).toBe(400);
  });
});
