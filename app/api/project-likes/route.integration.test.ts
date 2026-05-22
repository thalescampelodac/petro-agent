import { beforeEach, describe, expect, it, vi } from "vitest";

import { GET, POST } from "@/app/api/project-likes/route";
import {
  getProjectLikesCount,
  registerProjectLike,
} from "@/services/project-likes";

vi.mock("@/services/project-likes", () => ({
  getProjectLikesCount: vi.fn(),
  registerProjectLike: vi.fn(),
}));

describe("/api/project-likes", () => {
  beforeEach(() => {
    vi.mocked(getProjectLikesCount).mockReset();
    vi.mocked(registerProjectLike).mockReset();
  });

  it("retorna o contador global", async () => {
    vi.mocked(getProjectLikesCount).mockResolvedValue({
      count: 42,
      source: "supabase",
    });

    const response = await GET();

    await expect(response.json()).resolves.toEqual({
      count: 42,
      source: "supabase",
    });
    expect(response.status).toBe(200);
  });

  it("registra curtida e retorna total atualizado", async () => {
    vi.mocked(registerProjectLike).mockResolvedValue({
      count: 43,
      source: "supabase",
    });

    const response = await POST();

    await expect(response.json()).resolves.toEqual({
      count: 43,
      source: "supabase",
    });
    expect(response.status).toBe(200);
  });

  it("usa fallback quando Supabase esta indisponivel", async () => {
    vi.mocked(getProjectLikesCount).mockRejectedValue(new Error("unavailable"));

    const response = await GET();

    await expect(response.json()).resolves.toEqual({
      count: null,
      detail: "unavailable",
      reason: "supabase_unavailable",
      source: "local-fallback",
    });
    expect(response.status).toBe(503);
  });

  it("serializa erro seguro retornado pelo Supabase", async () => {
    vi.mocked(registerProjectLike).mockRejectedValue({
      code: "PGRST106",
      message: "The schema must be one of the following: public",
      status: 406,
    });

    const response = await POST();

    await expect(response.json()).resolves.toEqual({
      count: null,
      detail: {
        code: "PGRST106",
        message: "The schema must be one of the following: public",
        status: "406",
      },
      reason: "supabase_unavailable",
      source: "local-fallback",
    });
    expect(response.status).toBe(503);
  });
});
