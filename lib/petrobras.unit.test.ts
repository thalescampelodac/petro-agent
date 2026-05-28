import { describe, expect, it } from "vitest";

import {
  formatDateTime,
  getPetrobrasBasicData,
  getPetrobrasPulse,
  getPetrobrasSentiment,
  normalizeSource,
  type PetrobrasReport,
} from "./petrobras";

describe("Petrobras dashboard sentiment", () => {
  it("usa sentimento estruturado salvo no relatório do agente", () => {
    const report: PetrobrasReport = {
      generatedAt: "27/05/2026 19:30",
      sentimentBasis: "Eventos sem pressão direcional relevante.",
      sentimentConfidence: "Média",
      sentimentLabel: "Neutro",
      sentimentScore: 54,
      status: "Saved",
      summary: "Resumo informativo.",
      title: "Radar PETR4",
    };

    expect(getPetrobrasSentiment(report)).toEqual({
      basis: "Eventos sem pressão direcional relevante.",
      confidence: "Média",
      label: "Neutro",
      score: 54,
    });
  });

  it("usa estado vazio quando não há análise estruturada", () => {
    expect(getPetrobrasSentiment(null)).toEqual({
      basis: "Aguardando análise estruturada do agente.",
      confidence: "Sem dado",
      label: "Sem dado",
      score: 0,
    });
  });

  it("usa estado vazio para dados básicos sem snapshot", () => {
    expect(getPetrobrasBasicData()).toMatchObject({
      change: "Aguardando coleta",
      lastPrice: "Aguardando coleta",
      sourceName: "Aguardando coleta",
      volume: "Aguardando coleta",
    });
  });

  it("deriva pulso a partir da relevância dos eventos", () => {
    expect(
      getPetrobrasPulse([
        {
          date: "27/05/2026",
          relevanceLabel: "Alta",
          relevanceScore: 82,
          source: "Fonte vinculada",
          summary: "Evento",
          title: "Evento A",
          type: "RI",
        },
        {
          date: "26/05/2026",
          relevanceLabel: "Baixa",
          relevanceScore: 20,
          source: "Fonte vinculada",
          summary: "Evento",
          title: "Evento B",
          type: "Notícia",
        },
      ]),
    ).toEqual([20, 82]);
  });

  it("formata data e hora no horário de Brasília", () => {
    expect(formatDateTime("2026-05-27T20:10:00.000Z")).toBe("27/05/2026, 17:10");
  });

  it("normaliza fonte longa para nome curto e link", () => {
    expect(
      normalizeSource(
        "Petrobras RI - https://vertexaisearch.cloud.google.com/grounding-api-redirect/token-longo",
      ),
    ).toEqual({
      name: "Petrobras RI",
      url: "https://vertexaisearch.cloud.google.com/grounding-api-redirect/token-longo",
    });
  });
});
