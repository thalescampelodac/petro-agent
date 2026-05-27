import { beforeEach, describe, expect, it, vi } from "vitest";

import { GET, POST } from "@/app/api/agent/run/route";
import { executeManualPetroAgent } from "@/services/agent-executor";

vi.mock("@/services/agent-executor", () => ({
  executeManualPetroAgent: vi.fn(),
}));

describe("/api/agent/run", () => {
  beforeEach(() => {
    vi.mocked(executeManualPetroAgent).mockReset();
    process.env.PETROAGENT_AGENT_RUN_TOKEN = "agent-secret";
    process.env.CRON_SECRET = "cron-secret";
  });

  it("executa agente via POST com token manual", async () => {
    vi.mocked(executeManualPetroAgent).mockResolvedValue({
      engine: "fallback",
      logId: 10,
      reportId: 20,
      sourceCount: 2,
      status: "saved",
      summary: "Resumo.",
    });

    const response = await POST(
      new Request("http://localhost/api/agent/run", {
        headers: {
          authorization: "Bearer agent-secret",
        },
        method: "POST",
      }),
    );

    await expect(response.json()).resolves.toEqual({
      engine: "fallback",
      logId: 10,
      reportId: 20,
      sourceCount: 2,
      status: "saved",
      summary: "Resumo.",
    });
    expect(response.status).toBe(200);
    expect(executeManualPetroAgent).toHaveBeenCalledWith({ origin: "manual-api" });
  });

  it("bloqueia POST sem token valido", async () => {
    const response = await POST(
      new Request("http://localhost/api/agent/run", {
        method: "POST",
      }),
    );

    await expect(response.json()).resolves.toEqual({
      reason: "unauthorized",
      source: "petroagent-agent-runner",
    });
    expect(response.status).toBe(401);
    expect(executeManualPetroAgent).not.toHaveBeenCalled();
  });

  it("executa GET para cron futuro usando CRON_SECRET", async () => {
    vi.mocked(executeManualPetroAgent).mockResolvedValue({
      engine: "fallback",
      logId: 11,
      reportId: 21,
      sourceCount: 1,
      status: "saved",
      summary: "Resumo cron.",
    });

    const response = await GET(
      new Request("http://localhost/api/agent/run", {
        headers: {
          authorization: "Bearer cron-secret",
        },
        method: "GET",
      }),
    );

    await expect(response.json()).resolves.toMatchObject({
      logId: 11,
      status: "saved",
    });
    expect(response.status).toBe(200);
    expect(executeManualPetroAgent).toHaveBeenCalledWith({
      origin: "vercel-cron",
    });
  });

  it("retorna falha segura quando executor quebra", async () => {
    vi.mocked(executeManualPetroAgent).mockRejectedValue(new Error("boom"));

    const response = await POST(
      new Request("http://localhost/api/agent/run", {
        headers: {
          "x-petroagent-agent-token": "agent-secret",
        },
        method: "POST",
      }),
    );

    await expect(response.json()).resolves.toEqual({
      detail: "boom",
      reason: "agent_execution_failed",
      source: "petroagent-agent-runner",
    });
    expect(response.status).toBe(500);
  });
});
