import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

describe("prompt de snapshot PETR4", () => {
  it("define contrato JSON e validação antes da escrita MCP", () => {
    const prompt = readFileSync(
      join(process.cwd(), "prompts/market-snapshot-petr4.md"),
      "utf8",
    );

    expect(prompt).toContain("PETR4 negociada na B3");
    expect(prompt).toContain("Retorne apenas JSON válido");
    expect(prompt).toContain("upsert_market_snapshot");
    expect(prompt).toContain("snapshot_time");
    expect(prompt).toContain("America/Sao_Paulo");
    expect(prompt).toContain("Resposta inválida não deve ser persistida");
  });
});
