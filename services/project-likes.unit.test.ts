import { afterEach, describe, expect, it, vi } from "vitest";

const originalEnv = process.env;

describe("project likes service", () => {
  afterEach(() => {
    process.env = originalEnv;
    vi.resetModules();
    vi.restoreAllMocks();
  });

  it("usa fallback local quando Supabase nao esta configurado", async () => {
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "",
      NEXT_PUBLIC_SUPABASE_URL: "",
    };

    const { getProjectLikesCount, registerProjectLike } = await import(
      "@/services/project-likes"
    );

    await expect(getProjectLikesCount()).resolves.toEqual({
      count: null,
      reason: "missing_supabase_config",
      source: "local-fallback",
    });
    await expect(registerProjectLike()).resolves.toEqual({
      count: null,
      reason: "missing_supabase_config",
      source: "local-fallback",
    });
  });

  it("consulta e grava curtidas no schema petroagent", async () => {
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: " publishable-key\n",
      NEXT_PUBLIC_SUPABASE_URL: " https://example.supabase.co\n",
    };
    const select = vi.fn().mockResolvedValue({ count: 7, error: null });
    const insert = vi.fn().mockResolvedValue({ error: null });
    const from = vi.fn(() => ({ insert, select }));
    const schema = vi.fn(() => ({ from }));
    const createClient = vi.fn(() => ({ schema }));

    vi.doMock("@supabase/supabase-js", () => ({
      createClient,
    }));

    const { getProjectLikesCount, registerProjectLike } = await import(
      "@/services/project-likes"
    );

    await expect(getProjectLikesCount()).resolves.toEqual({
      count: 7,
      source: "supabase",
    });
    await expect(registerProjectLike()).resolves.toEqual({
      count: 7,
      source: "supabase",
    });

    expect(schema).toHaveBeenCalledWith("petroagent");
    expect(from).toHaveBeenCalledWith("project_likes");
    expect(createClient).toHaveBeenCalledWith(
      "https://example.supabase.co",
      "publishable-key",
      expect.any(Object),
    );
    expect(insert).toHaveBeenCalledWith({ source: "web" });
    expect(select).toHaveBeenCalledWith("id", { count: "exact", head: true });
  });
});
