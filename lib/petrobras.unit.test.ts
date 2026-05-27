import { describe, expect, it } from "vitest";

import { getPetrobrasSentiment, type PetrobrasReport } from "./petrobras";

describe("Petrobras dashboard sentiment", () => {
  it("usa sentimento estruturado salvo no relatório do agente", () => {
    const report: PetrobrasReport = {
      generatedAt: "27/05/2026 19:30",
      sentimentBasis: "Eventos persistidos sem pressão direcional relevante.",
      sentimentConfidence: "Média",
      sentimentLabel: "Neutro",
      sentimentScore: 54,
      source: "Banco de dados · gemini",
      status: "Saved",
      summary: "Resumo informativo.",
    };

    expect(getPetrobrasSentiment(report)).toEqual({
      basis: "Eventos persistidos sem pressão direcional relevante.",
      confidence: "Média",
      label: "Neutro",
      score: 54,
      source: "Banco de dados · gemini",
    });
  });

  it("usa estado vazio quando não há análise estruturada", () => {
    expect(getPetrobrasSentiment(null)).toEqual({
      basis: "Aguardando análise estruturada do agente salva no banco de dados.",
      confidence: "Sem dado",
      label: "Sem dado",
      score: 0,
      source: "Banco de dados",
    });
  });
});
