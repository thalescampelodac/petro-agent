import { describe, expect, it } from "vitest";

import {
  getPetrobrasBasicData,
  getPetrobrasPulse,
  getPetrobrasSentiment,
  type PetrobrasReport,
} from "./petrobras";

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

  it("usa estado vazio para dados básicos sem snapshot persistido", () => {
    expect(getPetrobrasBasicData()).toMatchObject({
      change: "Aguardando coleta",
      lastPrice: "Aguardando coleta",
      origin: "Sem snapshot persistido",
      source: "Aguardando coleta",
    });
  });

  it("deriva pulso a partir da relevância dos eventos persistidos", () => {
    expect(
      getPetrobrasPulse([
        {
          date: "27/05/2026",
          relevanceLabel: "Alta",
          relevanceScore: 82,
          source: "Banco de dados",
          summary: "Evento",
          title: "Evento A",
          type: "RI",
        },
        {
          date: "26/05/2026",
          relevanceLabel: "Baixa",
          relevanceScore: 20,
          source: "Banco de dados",
          summary: "Evento",
          title: "Evento B",
          type: "Notícia",
        },
      ]),
    ).toEqual([20, 82]);
  });
});
