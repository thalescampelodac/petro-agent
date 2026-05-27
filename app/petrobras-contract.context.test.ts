import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

describe("contrato painel-banco-MCP", () => {
  it("documenta a matriz obrigatória do painel Petrobras", () => {
    const matrix = readFileSync(
      join(process.cwd(), "database/panel-bank-mcp-matrix.md"),
      "utf8",
    );

    expect(matrix).toContain("Agente PetroAgent -> contrato MCP -> banco petroagent");
    expect(matrix).toContain("Campo do painel");
    expect(matrix).toContain("Tool MCP que grava/atualiza");
    expect(matrix).toContain("Bloqueado por mock");
    expect(matrix).toContain("upsert_market_snapshot");
    expect(matrix).toContain("prompts/market-snapshot-petr4.md");
    expect(matrix).toContain("register_market_event");
    expect(matrix).toContain("save_agent_report");
  });

  it("mantém AGENTES.md alinhado à regra sem mock realista", () => {
    const agentes = readFileSync(join(process.cwd(), "AGENTES.md"), "utf8");

    expect(agentes).toContain("Todo dado exibido no painel `/petrobras`");
    expect(agentes).toContain("Nenhum dado do painel pode ser mockado");
    expect(agentes).toContain("matriz obrigatória painel-banco-MCP");
  });
});
