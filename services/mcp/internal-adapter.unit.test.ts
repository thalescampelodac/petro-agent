import { describe, expect, it, vi } from "vitest";

import {
  createPetroAgentMcpAdapter,
  getMcpText,
  PETROAGENT_MCP_TOOLS,
  PetroAgentMcpToolError,
  type McpToolClient,
} from "./internal-adapter";

function createClient(result = { ok: true }) {
  const callTool = vi.fn(async (name, args) => ({
    content: [{ text: `${name} ok`, type: "text" as const }],
    structuredContent: { args, ...result },
  }));

  return {
    adapter: createPetroAgentMcpAdapter({ callTool } as McpToolClient),
    callTool,
  };
}

describe("PetroAgent MCP internal adapter", () => {
  it("chama tools MCP pelo nome oficial do contrato", async () => {
    const { adapter, callTool } = createClient();

    await adapter.getAgentProfile();
    await adapter.getLatestReport();
    await adapter.getMarketSnapshot("PETR4");
    await adapter.listMarketEvents({ event_type: "RI", limit: 5 });
    await adapter.registerSource({
      raw_content: "Fonte",
      source_type: "ri",
      url: "https://example.com",
    });
    await adapter.registerMarketEvent({
      event_type: "RI",
      title: "Evento",
    });
    await adapter.upsertMarketSnapshot({
      snapshot_time: "2026-05-27T19:10:00-03:00",
      ticker: "PETR4",
    });
    await adapter.searchAgentMemory({ query: "dividendos" });
    await adapter.compareReports({ limit: 3 });
    await adapter.summarizeContext({ query: "Petrobras" });
    await adapter.generateInformativeAnalysis({ ticker: "PETR4" });
    await adapter.saveAgentReport({ summary: "Resumo" });

    expect(callTool.mock.calls.map(([name]) => name)).toEqual([
      PETROAGENT_MCP_TOOLS.getAgentProfile,
      PETROAGENT_MCP_TOOLS.getLatestReport,
      PETROAGENT_MCP_TOOLS.getMarketSnapshot,
      PETROAGENT_MCP_TOOLS.listMarketEvents,
      PETROAGENT_MCP_TOOLS.registerSource,
      PETROAGENT_MCP_TOOLS.registerMarketEvent,
      PETROAGENT_MCP_TOOLS.upsertMarketSnapshot,
      PETROAGENT_MCP_TOOLS.searchAgentMemory,
      PETROAGENT_MCP_TOOLS.compareReports,
      PETROAGENT_MCP_TOOLS.summarizeContext,
      PETROAGENT_MCP_TOOLS.generateInformativeAnalysis,
      PETROAGENT_MCP_TOOLS.saveAgentReport,
    ]);
    expect(callTool).toHaveBeenCalledWith(PETROAGENT_MCP_TOOLS.getMarketSnapshot, {
      ticker: "PETR4",
    });
    expect(callTool).toHaveBeenCalledWith(PETROAGENT_MCP_TOOLS.listMarketEvents, {
      event_type: "RI",
      limit: 5,
    });
  });

  it("usa PETR4 como ticker padrao para snapshot", async () => {
    const { adapter, callTool } = createClient();

    await adapter.getMarketSnapshot();

    expect(callTool).toHaveBeenCalledWith(PETROAGENT_MCP_TOOLS.getMarketSnapshot, {
      ticker: "PETR4",
    });
  });

  it("preserva texto retornado pela tool", async () => {
    const result = {
      content: [
        { text: "Linha 1", type: "text" as const },
        { text: "Linha 2", type: "text" as const },
      ],
      structuredContent: { ok: true },
    };

    expect(getMcpText(result)).toBe("Linha 1\nLinha 2");
  });

  it("envelopa falhas com o nome da tool", async () => {
    const cause = new Error("mcp_down");
    const callTool = vi.fn(async () => {
      throw cause;
    });
    const adapter = createPetroAgentMcpAdapter({ callTool } as McpToolClient);

    await expect(adapter.getLatestReport()).rejects.toMatchObject({
      cause,
      name: "PetroAgentMcpToolError",
      toolName: PETROAGENT_MCP_TOOLS.getLatestReport,
    } satisfies Partial<PetroAgentMcpToolError>);
  });
});
