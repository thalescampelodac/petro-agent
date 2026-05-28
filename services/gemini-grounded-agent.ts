import type {
  AgentReportPayload,
  PetroAgentMcpAdapter,
} from "./mcp/internal-adapter";
import type { ManualAgentContext } from "./agent-executor";

const DEFAULT_GEMINI_API_VERSION = "v1beta";
const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash";

type GeminiGenerateContentResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
  error?: {
    message?: string;
  };
};

type GroundedSource = {
  name: string | null;
  url: string | null;
};

type GroundedSnapshot = {
  price: number | null;
  snapshot_time: string | null;
  source: GroundedSource;
  ticker: "PETR4";
  variation: number | null;
  volume: number | null;
};

type GroundedEvent = {
  event_date: string | null;
  event_type: string;
  relevance_score: number | null;
  source: GroundedSource;
  summary: string;
  title: string;
};

type GroundedReport = {
  attention_points: string[];
  sentiment: string | null;
  sentiment_basis: string | null;
  sentiment_confidence: "baixa" | "media" | "alta" | null;
  sentiment_score: number | null;
  summary: string;
  title: string;
};

type GroundedAgentPackage = {
  event: GroundedEvent;
  report: GroundedReport;
  snapshot: GroundedSnapshot;
};

export type GeminiGroundedExecutionResult = {
  engine: "gemini-grounded-search";
  eventId: number;
  reportId: number;
  snapshotId: number;
  sourceCount: number;
  sourceId: number;
  summary: string;
};

function getGeminiConfig() {
  const apiKey = process.env.GEMINI_API_KEY?.trim();

  if (!apiKey) {
    return null;
  }

  return {
    apiKey,
    apiVersion: process.env.GEMINI_API_VERSION?.trim() || DEFAULT_GEMINI_API_VERSION,
    model: process.env.GEMINI_MODEL?.trim() || DEFAULT_GEMINI_MODEL,
  };
}

export function hasGeminiGroundedConfig() {
  return Boolean(getGeminiConfig());
}

export async function runGeminiGroundedPetroAgent(
  mcpAdapter: PetroAgentMcpAdapter,
  context: ManualAgentContext,
): Promise<GeminiGroundedExecutionResult> {
  const parsed = await callGeminiGroundedSearch(buildGroundedAgentPrompt(context));
  const source = chooseSource(parsed);

  if (!source.url) {
    throw new Error("gemini_source_url_missing");
  }

  const publishedAt =
    parsed.event.event_date ?? parsed.snapshot.snapshot_time ?? new Date().toISOString();
  const registeredSource = await mcpAdapter.registerSource({
    processed: true,
    published_at: publishedAt,
    raw_content: buildRawSourceContent(parsed),
    source_type: "gemini_grounded_search",
    title: source.name,
    url: source.url,
  });
  const sourceId = registeredSource.structuredContent.id;
  const snapshot = await mcpAdapter.upsertMarketSnapshot({
    price: parsed.snapshot.price,
    snapshot_time: requireIsoDate(parsed.snapshot.snapshot_time, "snapshot_time"),
    source: formatSourceLabel(source),
    ticker: "PETR4",
    variation: parsed.snapshot.variation,
    volume: parsed.snapshot.volume,
  });
  const event = await mcpAdapter.registerMarketEvent({
    event_date: requireIsoDate(parsed.event.event_date ?? publishedAt, "event_date"),
    event_type: parsed.event.event_type,
    relevance_score: parsed.event.relevance_score,
    source_id: sourceId,
    summary: parsed.event.summary,
    title: parsed.event.title,
  });
  const reportPayload: AgentReportPayload = {
    attention_points: parsed.report.attention_points,
    model_used: "gemini-grounded-search",
    sentiment: parsed.report.sentiment,
    sentiment_basis: parsed.report.sentiment_basis,
    sentiment_confidence: parsed.report.sentiment_confidence,
    sentiment_score: parsed.report.sentiment_score,
    source_count: 1,
    summary: parsed.report.summary,
    title: parsed.report.title,
  };
  const report = await mcpAdapter.saveAgentReport(reportPayload);

  return {
    engine: "gemini-grounded-search",
    eventId: event.structuredContent.id,
    reportId: report.structuredContent.id,
    snapshotId: snapshot.structuredContent.id,
    sourceCount: 1,
    sourceId,
    summary: reportPayload.summary,
  };
}

function buildGroundedAgentPrompt(context: ManualAgentContext) {
  return [
    "Você é o PetroAgent, um agente informativo especializado em Petrobras/PETR4.",
    "Pesquise na web dados recentes após o fechamento do pregão brasileiro e gere um pacote operacional para alimentar o painel.",
    "Use busca externa. Não simule dados. Não recomende compra, venda ou manutenção. Não crie preço-alvo.",
    "Priorize fontes confiáveis como Google Finance, Investing, Yahoo Finance, B3, InfoMoney, Petrobras RI e veículos financeiros reconhecidos.",
    "Retorne apenas um JSON válido, sem markdown e sem explicações fora do JSON.",
    "Use números em formato decimal. Datas devem estar em ISO 8601. Use null quando não encontrar um campo.",
    "Formato obrigatório:",
    JSON.stringify(
      {
        event: {
          event_date: "2026-05-27T17:00:00-03:00",
          event_type: "Notícia",
          relevance_score: 80,
          source: {
            name: "Nome da fonte",
            url: "https://fonte.example/noticia",
          },
          summary: "Resumo curto do evento em português.",
          title: "Título curto do evento",
        },
        report: {
          attention_points: ["Ponto curto"],
          sentiment: "Neutro",
          sentiment_basis: "Justificativa curta.",
          sentiment_confidence: "media",
          sentiment_score: 50,
          summary: "Análise informativa curta em português.",
          title: "Título curto da análise",
        },
        snapshot: {
          price: 42.82,
          snapshot_time: "2026-05-27T17:10:00-03:00",
          source: {
            name: "Google Finance",
            url: "https://www.google.com/finance/quote/PETR4:BVMF",
          },
          ticker: "PETR4",
          variation: -1.43,
          volume: 287654321,
        },
      },
      null,
      2,
    ),
    "Contexto persistido atual, apenas para continuidade e evitar repetição desnecessária:",
    JSON.stringify(
      {
        events: context.events.slice(0, 5),
        previousReports: context.previousReports.slice(0, 2),
        snapshot: context.snapshot,
        sources: context.sources.slice(0, 5).map((source) => ({
          published_at: source.published_at,
          source_type: source.source_type,
          title: source.title,
          url: source.url,
        })),
      },
      null,
      2,
    ),
  ].join("\n\n");
}

async function callGeminiGroundedSearch(prompt: string) {
  const config = getGeminiConfig();

  if (!config) {
    throw new Error("missing_gemini_config");
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/${config.apiVersion}/models/${config.model}:generateContent`,
    {
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.1,
        },
        tools: [{ googleSearch: {} }],
      }),
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": config.apiKey,
      },
      method: "POST",
    },
  );
  const body = (await response.json()) as GeminiGenerateContentResponse;

  if (!response.ok) {
    throw new Error(body.error?.message ?? `gemini_http_${response.status}`);
  }

  const text = body.candidates?.[0]?.content?.parts
    ?.map((part) => part.text ?? "")
    .join("")
    .trim();

  if (!text) {
    throw new Error("gemini_empty_response");
  }

  return normalizeGroundedPackage(parseJsonResponse(text));
}

function parseJsonResponse(text: string) {
  const trimmed = text
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  try {
    return JSON.parse(trimmed) as unknown;
  } catch {
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");

    if (start === -1 || end === -1 || end <= start) {
      throw new Error("gemini_invalid_json");
    }

    return JSON.parse(trimmed.slice(start, end + 1)) as unknown;
  }
}

function normalizeGroundedPackage(payload: unknown): GroundedAgentPackage {
  const record = asRecord(payload);
  const snapshot = asRecord(record.snapshot);
  const event = asRecord(record.event);
  const report = asRecord(record.report);

  return {
    event: {
      event_date: nullableString(event.event_date),
      event_type: asNonEmptyString(event.event_type, "Evento"),
      relevance_score: clampNumber(nullableNumber(event.relevance_score), 0, 100),
      source: normalizeSource(event.source),
      summary: asNonEmptyString(event.summary, "Evento relevante sobre Petrobras/PETR4."),
      title: asNonEmptyString(event.title, "Evento Petrobras/PETR4"),
    },
    report: {
      attention_points: normalizeAttentionPoints(report.attention_points),
      sentiment: nullableString(report.sentiment),
      sentiment_basis: nullableString(report.sentiment_basis),
      sentiment_confidence: normalizeConfidence(report.sentiment_confidence),
      sentiment_score: clampNumber(nullableNumber(report.sentiment_score), 0, 100),
      summary: asNonEmptyString(
        report.summary,
        "Análise informativa gerada pelo PetroAgent.",
      ),
      title: asNonEmptyString(report.title, "Radar informativo PETR4"),
    },
    snapshot: {
      price: nullableNumber(snapshot.price),
      snapshot_time: nullableString(snapshot.snapshot_time),
      source: normalizeSource(snapshot.source),
      ticker: "PETR4",
      variation: nullableNumber(snapshot.variation),
      volume: nullableNumber(snapshot.volume),
    },
  };
}

function chooseSource(payload: GroundedAgentPackage) {
  if (payload.event.source.url) {
    return payload.event.source;
  }

  return payload.snapshot.source;
}

function normalizeSource(value: unknown): GroundedSource {
  const source = asRecord(value);

  return {
    name: nullableString(source.name),
    url: nullableString(source.url),
  };
}

function buildRawSourceContent(payload: GroundedAgentPackage) {
  return [
    payload.event.title,
    payload.event.summary,
    payload.report.summary,
    payload.report.sentiment_basis,
  ]
    .filter(Boolean)
    .join("\n\n");
}

function formatSourceLabel(source: GroundedSource) {
  if (source.name && source.url) {
    return `${source.name} - ${source.url}`;
  }

  return source.name ?? source.url ?? "Gemini grounded search";
}

function requireIsoDate(value: string | null, field: string) {
  if (!value || Number.isNaN(Date.parse(value))) {
    throw new Error(`gemini_invalid_${field}`);
  }

  return value;
}

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null ? value as Record<string, unknown> : {};
}

function asNonEmptyString(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function nullableString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function nullableNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value.replace(",", "."));

    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function clampNumber(value: number | null, min: number, max: number) {
  if (value === null) {
    return null;
  }

  return Math.min(Math.max(value, min), max);
}

function normalizeConfidence(value: unknown) {
  const normalized =
    typeof value === "string"
      ? value
          .normalize("NFD")
          .replace(/\p{Diacritic}/gu, "")
          .trim()
          .toLowerCase()
      : "";

  if (normalized === "baixa" || normalized === "media" || normalized === "alta") {
    return normalized;
  }

  return null;
}

function normalizeAttentionPoints(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item): item is string => typeof item === "string" && Boolean(item.trim()))
    .map((item) => item.trim())
    .slice(0, 5);
}
