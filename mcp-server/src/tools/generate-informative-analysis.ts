import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import { summarizeContext } from "./summarize-context.js";

type GenerateInformativeAnalysisParams = {
  context_limit?: number;
  query?: string;
  scope?: string;
  ticker?: string;
};

type InformativeAnalysisPayload = {
  attention_points: string[];
  model_used: string;
  sentiment: "Neutro" | "Positivo" | "Negativo";
  sentiment_basis: string;
  sentiment_confidence: "baixa" | "media" | "alta";
  sentiment_score: number;
  source_count: number;
  summary: string;
  title: string;
};

type GenerateInformativeAnalysisResult = {
  citations: string[];
  payload: InformativeAnalysisPayload;
};

const generateInformativeAnalysisInputSchema = {
  context_limit: z.number().int().min(1).max(10).optional(),
  query: z.string().min(2).max(120).optional(),
  scope: z.string().min(2).max(160).optional(),
  ticker: z.string().min(4).max(8).optional(),
};

function removeMarkdownFence(content: string) {
  return content
    .trim()
    .replace(/^```(?:json)?[\s\n]*/i, "")
    .replace(/[\s\n]*```$/i, "")
    .trim();
}

function normalizeSentiment(value: unknown): InformativeAnalysisPayload["sentiment"] {
  if (typeof value !== "string") {
    return "Neutro";
  }

  const normalized = value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim()
    .toLowerCase();

  if (normalized === "positivo") {
    return "Positivo";
  }

  if (normalized === "negativo") {
    return "Negativo";
  }

  return "Neutro";
}

function normalizeConfidence(
  value: unknown,
): InformativeAnalysisPayload["sentiment_confidence"] {
  if (typeof value !== "string") {
    return "baixa";
  }

  const normalized = value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim()
    .toLowerCase();

  if (normalized === "alta" || normalized === "media") {
    return normalized;
  }

  return "baixa";
}

function normalizeScore(value: unknown) {
  const numberValue = typeof value === "number" ? value : Number(value);

  if (!Number.isFinite(numberValue)) {
    return 50;
  }

  return Math.min(Math.max(Math.round(numberValue), 0), 100);
}

function createFallbackPayload(
  ticker: string,
  contextSummary: string,
  sourceCount: number,
): InformativeAnalysisPayload {
  return {
    attention_points: [
      "Análise informativa baseada apenas no contexto persistido.",
      "Não representa recomendação de compra, venda ou manutenção.",
    ],
    model_used: "fallback",
    sentiment: "Neutro",
    sentiment_basis:
      "Contexto persistido insuficiente para indicar pressão informativa clara.",
    sentiment_confidence: "baixa",
    sentiment_score: 50,
    source_count: sourceCount,
    summary: `${ticker}: ${contextSummary}`,
    title: `Radar informativo ${ticker}`,
  };
}

function normalizePayload(
  value: unknown,
  fallback: InformativeAnalysisPayload,
): InformativeAnalysisPayload {
  const record =
    typeof value === "object" && value !== null ? (value as Record<string, unknown>) : {};

  return {
    attention_points: Array.isArray(record.attention_points)
      ? record.attention_points.filter((item): item is string => typeof item === "string")
      : fallback.attention_points,
    model_used: fallback.model_used,
    sentiment: normalizeSentiment(record.sentiment),
    sentiment_basis:
      typeof record.sentiment_basis === "string"
        ? record.sentiment_basis
        : fallback.sentiment_basis,
    sentiment_confidence: normalizeConfidence(record.sentiment_confidence),
    sentiment_score: normalizeScore(record.sentiment_score),
    source_count: fallback.source_count,
    summary: typeof record.summary === "string" ? record.summary : fallback.summary,
    title: typeof record.title === "string" ? record.title : fallback.title,
  };
}

async function callGemini(prompt: string) {
  const apiKey = process.env.GEMINI_API_KEY?.trim();

  if (!apiKey) {
    return null;
  }

  const apiVersion = process.env.GEMINI_API_VERSION?.trim() || "v1beta";
  const model = process.env.GEMINI_MODEL?.trim() || "gemini-2.5-flash";
  const response = await fetch(
    `https://generativelanguage.googleapis.com/${apiVersion}/models/${model}:generateContent`,
    {
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.2 },
      }),
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      method: "POST",
    },
  );

  if (!response.ok) {
    throw new Error(`Gemini call failed: ${response.status}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts
    ?.map((part: { text?: string }) => part.text)
    .filter(Boolean)
    .join("\n");

  if (!text) {
    throw new Error("Gemini returned no content");
  }

  return JSON.parse(removeMarkdownFence(text));
}

export async function generateInformativeAnalysis({
  context_limit = 5,
  query,
  scope,
  ticker = "PETR4",
}: GenerateInformativeAnalysisParams): Promise<GenerateInformativeAnalysisResult> {
  const context = await summarizeContext({ limit: context_limit, query });
  const fallback = createFallbackPayload(ticker, context.summary, context.citations.length);
  const prompt = [
    `Você é o PetroAgent, agente informativo sobre ${ticker}.`,
    "Gere uma análise clara, curta e sem recomendação financeira.",
    "Retorne apenas JSON válido com title, summary, sentiment, sentiment_score, sentiment_confidence, sentiment_basis e attention_points.",
    "sentiment deve ser Neutro, Positivo ou Negativo.",
    "sentiment_score deve ficar entre 0 e 100.",
    "sentiment_confidence deve ser baixa, media ou alta.",
    scope ? `Escopo: ${scope}.` : "",
    `Contexto persistido: ${context.summary}`,
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const aiPayload = await callGemini(prompt);

    if (!aiPayload) {
      return {
        citations: context.citations,
        payload: fallback,
      };
    }

    return {
      citations: context.citations,
      payload: normalizePayload(aiPayload, { ...fallback, model_used: "gemini" }),
    };
  } catch {
    return {
      citations: context.citations,
      payload: fallback,
    };
  }
}

export function registerGenerateInformativeAnalysisTool(server: McpServer) {
  server.registerTool(
    "generate_informative_analysis",
    {
      annotations: {
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true,
        readOnlyHint: false,
      },
      description:
        "Gera uma análise informativa curta a partir do contexto persistido e retorna payload compatível com agent_reports.",
      inputSchema: generateInformativeAnalysisInputSchema,
      title: "Gerar análise informativa",
    },
    async (args) => {
      const result = await generateInformativeAnalysis(args);

      return {
        content: [{ text: result.payload.summary, type: "text" }],
        structuredContent: result,
      };
    },
  );
}
