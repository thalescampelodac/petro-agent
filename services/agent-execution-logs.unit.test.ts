import { describe, expect, it } from "vitest";

import {
  finishAgentExecutionLog,
  serializeAgentError,
  startAgentExecutionLog,
} from "./agent-execution-logs";
import { createSupabaseFixtureClient } from "@/test/fixtures/supabase";

describe("agent execution logs service", () => {
  it("registra inicio e fim de execucao", async () => {
    const { calls, client } = createSupabaseFixtureClient({
      agent_execution_logs: [
        { data: { id: 7 }, error: null },
        { data: null, error: null },
      ],
    });

    await expect(
      startAgentExecutionLog(client as never, { origin: "manual-api" }),
    ).resolves.toEqual({ id: 7 });
    await expect(
      finishAgentExecutionLog(client as never, 7, {
        engine: "fallback",
        reportId: 123,
        sourceCount: 2,
        status: "saved",
      }),
    ).resolves.toBeUndefined();

    expect(calls).toContainEqual({
      args: [
        {
          origin: "manual-api",
          source_count: 0,
          status: "started",
        },
      ],
      method: "insert",
      table: "agent_execution_logs",
    });
    expect(calls).toContainEqual({
      args: ["id", 7],
      method: "eq",
      table: "agent_execution_logs",
    });
  });

  it("serializa erro sem expor objeto bruto", () => {
    expect(serializeAgentError(new Error("falha"))).toBe("falha");
    expect(serializeAgentError({ code: "PGRST", message: "erro" })).toBe(
      "PGRST: erro",
    );
    expect(serializeAgentError({ foo: "bar" })).toBe("unknown_error");
  });
});
