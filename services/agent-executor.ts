import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import generateReport from "../lib/report";
import {
  finishAgentExecutionLog,
  serializeAgentError,
  startAgentExecutionLog,
} from "./agent-execution-logs";
import { saveReport } from "./reports";

const PETROAGENT_SCHEMA = "petroagent";

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

type AgentReportPayload = {
  highlights?: string[];
  key_facts?: unknown[];
  next_steps?: string;
  sentiment?: string;
  sources?: string[];
  summary?: string;
};

type ManualAgentDependencies = {
  client?: SupabaseClient | null;
  generate?: typeof generateReport;
  logFinish?: typeof finishAgentExecutionLog;
  logStart?: typeof startAgentExecutionLog;
  origin?: string;
  persist?: typeof saveReport;
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
  client: SupabaseClient,
): Promise<ManualAgentContext> {
  const [sourcesResult, eventsResult, snapshotResult, reportsResult] =
    await Promise.all([
      client
        .schema(PETROAGENT_SCHEMA)
        .from("sources")
        .select("id, created_at, published_at, source_type, title, url, raw_content")
        .order("published_at", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false })
        .limit(8),
      client
        .schema(PETROAGENT_SCHEMA)
        .from("market_events")
        .select(
          "id, created_at, event_date, event_type, title, summary, relevance_score",
        )
        .order("event_date", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false })
        .limit(8),
      client
        .schema(PETROAGENT_SCHEMA)
        .from("market_snapshots")
        .select("ticker, price, variation, volume, source, snapshot_time")
        .eq("ticker", "PETR4")
        .order("snapshot_time", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      client
        .schema(PETROAGENT_SCHEMA)
        .from("agent_reports")
        .select("created_at, title, summary, sentiment")
        .order("created_at", { ascending: false })
        .limit(3),
    ]);

  const error =
    sourcesResult.error ??
    eventsResult.error ??
    snapshotResult.error ??
    reportsResult.error;

  if (error) {
    throw error;
  }

  return {
    events: (eventsResult.data ?? []) as AgentMarketEventContext[],
    previousReports: (reportsResult.data ?? []) as AgentPreviousReportContext[],
    snapshot: (snapshotResult.data ?? null) as AgentMarketSnapshotContext | null,
    sources: (sourcesResult.data ?? []) as AgentSourceContext[],
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

  const generate = dependencies.generate ?? generateReport;
  const logFinish = dependencies.logFinish ?? finishAgentExecutionLog;
  const logStart = dependencies.logStart ?? startAgentExecutionLog;
  const origin = dependencies.origin ?? "manual-cli";
  const persist = dependencies.persist ?? saveReport;
  const started = await logStart(client, { origin });

  try {
    const context = await readManualAgentContext(client);
    const prompt = buildManualAgentPrompt(context);
    const citations = getManualAgentCitations(context);
    const output = await generate({ text: prompt });
    const payload = normalizeReportPayload(output.result, citations);
    const saved = await persist(output.engine, payload);

    await logFinish(client, started.id, {
      engine: output.engine,
      reportId: saved.id,
      sourceCount: citations.length,
      status: "saved",
    });

    return {
      engine: output.engine,
      logId: started.id,
      reportId: saved.id,
      sourceCount: citations.length,
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
      ? ({ ...payload } as AgentReportPayload)
      : { summary: String(payload ?? "") };

  return {
    ...normalized,
    sources:
      Array.isArray(normalized.sources) && normalized.sources.length > 0
        ? normalized.sources
        : citations,
  };
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
        }): ${report.summary}`,
    ),
  ].join("\n");
}
