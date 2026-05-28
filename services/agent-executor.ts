import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import {
  finishAgentExecutionLog,
  serializeAgentError,
  startAgentExecutionLog,
} from "./agent-execution-logs";
import {
  createPetroAgentMcpAdapter,
  type AgentReportPayload,
  type PetroAgentMcpAdapter,
} from "./mcp/internal-adapter";
import { createLocalMcpToolClient } from "./mcp/local-tool-client";

export type AgentSourceContext = {
  created_at: string;
  id: number;
  published_at: string | null;
  raw_content: string;
  source_type: string;
  title: string | null;
  url: string | null;
};

export type AgentMarketEventContext = {
  created_at: string;
  event_date: string | null;
  event_type: string;
  id: number;
  relevance_score: number | null;
  summary: string | null;
  title: string;
};

export type AgentMarketSnapshotContext = {
  price: number | null;
  snapshot_time: string | null;
  source: string | null;
  ticker: string;
  variation: number | null;
  volume: number | null;
};

export type AgentPreviousReportContext = {
  created_at: string;
  sentiment: string | null;
  sentiment_score: number | null;
  summary: string;
  title: string;
};

export type ManualAgentContext = {
  events: AgentMarketEventContext[];
  previousReports: AgentPreviousReportContext[];
  snapshot: AgentMarketSnapshotContext | null;
  sources: AgentSourceContext[];
};

export type ManualAgentExecutionResult =
  | {
      engine: string;
      logId: number;
      reportId: number | null;
      sourceCount: number;
      status: "saved";
      summary: string;
    }
  | {
      reason: "missing_supabase_admin_config";
      status: "disabled";
    };

type GeneratedReportPayload = {
  highlights?: string[];
  key_facts?: unknown[];
  model_used?: string;
  next_steps?: string;
  sentiment?: string;
  sentiment_analysis?: {
    basis?: string;
    confidence?: string;
    label?: string;
    score?: number;
  };
  sentiment_basis?: string;
  sentiment_confidence?: string;
  sentiment_score?: number;
  source_count?: number;
  sources?: string[];
  summary?: string;
  title?: string;
};

type ManualAgentDependencies = {
  client?: SupabaseClient | null;
  logFinish?: typeof finishAgentExecutionLog;
  logStart?: typeof startAgentExecutionLog;
  mcpAdapter?: PetroAgentMcpAdapter;
  origin?: string;
};

function getSupabaseAdminClient() {
  const supabaseUrl =
    process.env.SUPABASE_URL?.trim() ?? process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!supabaseUrl || !serviceRoleKey) {
    return null;
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
    },
  });
}

export async function readManualAgentContext(
  mcpAdapter: PetroAgentMcpAdapter,
): Promise<ManualAgentContext> {
  const [memoryResult, eventsResult, snapshotResult, reportResult] = await Promise.all([
    mcpAdapter.searchAgentMemory({ limit: 8, query: "Petrobras PETR4" }),
    mcpAdapter.listMarketEvents({ limit: 8 }),
    mcpAdapter.getMarketSnapshot("PETR4"),
    mcpAdapter.getLatestReport(),
  ]);
  const memory = memoryResult.structuredContent;
  const events = eventsResult.structuredContent.events as AgentMarketEventContext[];
  const snapshot = snapshotResult.structuredContent.found
    ? (snapshotResult.structuredContent.snapshot as AgentMarketSnapshotContext)
    : null;
  const latestReport = reportResult.structuredContent.found
    ? (reportResult.structuredContent.report as AgentPreviousReportContext)
    : null;

  return {
    events,
    previousReports: latestReport ? [latestReport] : [],
    snapshot,
    sources: memory.items as AgentSourceContext[],
  };
}

export function buildManualAgentPrompt(context: ManualAgentContext) {
  const sections = [
    "PetroAgent manual run - Petrobras/PETR4.",
    "Gere uma análise informativa, clara e curta. Não recomende compra, venda ou manutenção de ativos. Não crie preço-alvo. Diferencie fatos observados de contexto.",
    formatSnapshot(context.snapshot),
    formatSources(context.sources),
    formatEvents(context.events),
    formatPreviousReports(context.previousReports),
  ];

  return sections.filter(Boolean).join("\n\n");
}

export function getManualAgentCitations(context: ManualAgentContext) {
  const sourceLinks = context.sources.map(
    (source) => source.url ?? `petroagent.sources:${source.id}`,
  );
  const eventLinks = context.events.map((event) => `petroagent.market_events:${event.id}`);

  return [...sourceLinks, ...eventLinks];
}

export async function executeManualPetroAgent(
  dependencies: ManualAgentDependencies = {},
): Promise<ManualAgentExecutionResult> {
  const client =
    dependencies.client === undefined ? getSupabaseAdminClient() : dependencies.client;

  if (!client) {
    return {
      reason: "missing_supabase_admin_config",
      status: "disabled",
    };
  }

  const logFinish = dependencies.logFinish ?? finishAgentExecutionLog;
  const logStart = dependencies.logStart ?? startAgentExecutionLog;
  const mcpAdapter =
    dependencies.mcpAdapter ?? createPetroAgentMcpAdapter(createLocalMcpToolClient(client));
  const origin = dependencies.origin ?? "manual-cli";
  const started = await logStart(client, { origin });

  try {
    const context = await readManualAgentContext(mcpAdapter);
    const prompt = buildManualAgentPrompt(context);
    const citations = getManualAgentCitations(context);
    const analysis = await mcpAdapter.generateInformativeAnalysis({
      context_limit: 8,
      query: "Petrobras PETR4",
      scope: prompt,
      ticker: "PETR4",
    });
    const payload = normalizeReportPayload(
      analysis.structuredContent.payload,
      citations.length > 0 ? citations : analysis.structuredContent.citations,
    );
    const saved = await mcpAdapter.saveAgentReport(payload);
    const reportId = saved.structuredContent.id;
    const engine = payload.model_used ?? "mcp";
    const sourceCount = payload.source_count ?? citations.length;

    await logFinish(client, started.id, {
      engine,
      reportId,
      sourceCount,
      status: "saved",
    });

    return {
      engine,
      logId: started.id,
      reportId,
      sourceCount,
      status: "saved",
      summary: payload.summary ?? "Relatório gerado sem resumo textual estruturado.",
    };
  } catch (error) {
    await logFinish(client, started.id, {
      errorMessage: serializeAgentError(error),
      status: "failed",
    });

    throw error;
  }
}

function normalizeReportPayload(
  payload: unknown,
  citations: string[],
): AgentReportPayload {
  const normalized =
    typeof payload === "object" && payload !== null
      ? ({ ...payload } as GeneratedReportPayload)
      : { summary: String(payload ?? "") };
  const sentimentAnalysis = normalized.sentiment_analysis ?? {};

  return {
    attention_points: normalized.highlights,
    model_used: normalized.model_used,
    sentiment: normalized.sentiment ?? sentimentAnalysis.label,
    sentiment_basis: normalized.sentiment_basis ?? sentimentAnalysis.basis,
    sentiment_confidence: normalizeReportConfidence(
      normalized.sentiment_confidence ?? sentimentAnalysis.confidence,
    ),
    sentiment_score: normalized.sentiment_score ?? sentimentAnalysis.score,
    source_count: Array.isArray(normalized.sources)
      ? normalized.sources.length
      : citations.length,
    summary: normalized.summary ?? "Relatório gerado sem resumo textual estruturado.",
    title: normalized.title ?? "Relatório PetroAgent",
  };
}

function normalizeReportConfidence(value: unknown) {
  if (typeof value !== "string") {
    return undefined;
  }

  const normalized = value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim()
    .toLowerCase();

  if (normalized === "baixa" || normalized === "media" || normalized === "alta") {
    return normalized;
  }

  return undefined;
}

function formatSnapshot(snapshot: AgentMarketSnapshotContext | null) {
  if (!snapshot) {
    return "Snapshot de mercado: nenhum snapshot persistido encontrado.";
  }

  return [
    "Snapshot de mercado:",
    `- Ticker: ${snapshot.ticker}`,
    `- Preço: ${snapshot.price ?? "indisponível"}`,
    `- Variação: ${snapshot.variation ?? "indisponível"}`,
    `- Volume: ${snapshot.volume ?? "indisponível"}`,
    `- Fonte: ${snapshot.source ?? "não informada"}`,
    `- Horário: ${snapshot.snapshot_time ?? "não informado"}`,
  ].join("\n");
}

function formatSources(sources: AgentSourceContext[]) {
  if (sources.length === 0) {
    return "Fontes recentes: nenhuma fonte persistida encontrada.";
  }

  return [
    "Fontes recentes:",
    ...sources.map((source) => {
      const title = source.title ?? source.url ?? `Fonte #${source.id}`;
      const text = source.raw_content.slice(0, 700);

      return `- [${source.source_type}] ${title}: ${text}`;
    }),
  ].join("\n");
}

function formatEvents(events: AgentMarketEventContext[]) {
  if (events.length === 0) {
    return "Eventos recentes: nenhum evento persistido encontrado.";
  }

  return [
    "Eventos recentes:",
    ...events.map((event) => {
      const date = event.event_date ?? event.created_at;
      const score =
        event.relevance_score === null ? "" : ` Relevância: ${event.relevance_score}.`;

      return `- [${event.event_type}] ${event.title} (${date}).${score} ${event.summary ?? ""}`;
    }),
  ].join("\n");
}

function formatPreviousReports(reports: AgentPreviousReportContext[]) {
  if (reports.length === 0) {
    return "Relatórios anteriores: nenhum relatório persistido encontrado.";
  }

  return [
    "Relatórios anteriores:",
    ...reports.map(
      (report) =>
        `- ${report.title} (${report.created_at}, sentimento ${
          report.sentiment ?? "não informado"
        }, escore ${
          typeof report.sentiment_score === "number"
            ? `${report.sentiment_score}/100`
            : "não informado"
        }): ${report.summary}`,
    ),
  ].join("\n");
}
