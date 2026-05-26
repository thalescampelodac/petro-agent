import { afterEach, describe, expect, it, vi } from "vitest";

import { createSupabaseFixtureClient } from "@/test/fixtures/supabase";

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
    const { calls, client, from, schema } = createSupabaseFixtureClient({
      project_likes: [
        { count: 7, data: null, error: null },
        { data: null, error: null },
        { count: 7, data: null, error: null },
      ],
    });
    const createClient = vi.fn(() => client);

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
    expect(calls).toContainEqual({
      args: [{ source: "web" }],
      method: "insert",
      table: "project_likes",
    });
    expect(calls).toContainEqual({
      args: ["id", { count: "exact", head: true }],
      method: "select",
      table: "project_likes",
    });
  });
});
