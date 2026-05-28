import type { ComponentType } from "react";
import {
  Activity,
  BadgeDollarSign,
  CalendarClock,
  FileText,
  Newspaper,
  TrendingUp,
} from "lucide-react";

import { getCachedPetrobrasData } from "@/services/petrobras-cache";

export type PetrobrasBasicData = {
  change: string;
  company: string;
  lastPrice: string;
  sourceName: string;
  sourceUrl: string | null;
  ticker: string;
  volume: string;
};

export type PetrobrasReport = {
  generatedAt: string;
  summary: string;
  sentimentBasis: string | null;
  sentimentConfidence: PetrobrasSentimentConfidence | null;
  sentimentLabel: PetrobrasSentimentLabel | null;
  sentimentScore: number | null;
  status: "Saved" | "Fallback";
  title: string;
};

export type PetrobrasRecentReport = {
  generatedAt: string;
  modelUsed: string;
  sentiment: string;
  sourceCount: string;
  summary: string;
  title: string;
};

export type PetrobrasPanelMetric = {
  label: string;
  value: string;
  detail: string;
  icon: ComponentType<{ className?: string }>;
};

export type PetrobrasSignal = {
  title: string;
  description: string;
  status: string;
  icon: ComponentType<{ className?: string }>;
};

export type PetrobrasTimelineEvent = {
  date: string;
  relevanceLabel: string;
  relevanceScore: number | null;
  summary: string | null;
  title: string;
  type: string;
  source: string;
};

export type PetrobrasSentiment = {
  label: PetrobrasSentimentLabel | "Sem dado";
  score: number;
  confidence: PetrobrasSentimentConfidence | "Sem dado";
  basis: string;
};

type PetrobrasSentimentLabel = "Neutro" | "Positivo" | "Negativo";
type PetrobrasSentimentConfidence = "Baixa" | "Média" | "Alta";

export type PetrobrasDashboardData = {
  basicData: PetrobrasBasicData;
  latestAgentUpdate: string;
  monitoredSignals: PetrobrasSignal[];
  panelMetrics: PetrobrasPanelMetric[];
  pulse: number[];
  report: PetrobrasReport | null;
  recentReports: PetrobrasRecentReport[];
  sentiment: PetrobrasSentiment;
  timelineEvents: PetrobrasTimelineEvent[];
};

const EMPTY_BASIC_DATA: PetrobrasBasicData = {
  change: "Aguardando coleta",
  company: "Petrobras PN",
  lastPrice: "Aguardando coleta",
  sourceName: "Aguardando coleta",
  sourceUrl: null,
  ticker: "PETR4",
  volume: "Aguardando coleta",
};

export function getPetrobrasBasicData(): PetrobrasBasicData {
  return EMPTY_BASIC_DATA;
}

export function getLatestPetrobrasReport(): PetrobrasReport | null {
  return null;
}

export function getPetrobrasPanelMetrics(
  basicData: PetrobrasBasicData,
  latestAgentUpdate: string,
): PetrobrasPanelMetric[] {
  return [
    {
      label: "Ativo monitorado",
      value: basicData.ticker,
      detail: basicData.company,
      icon: TrendingUp,
    },
    {
      label: "Última atualização",
      value: latestAgentUpdate,
      detail: "Horário de Brasília",
      icon: CalendarClock,
    },
  ];
}

export function getPetrobrasMonitoredSignals(
  events: PetrobrasTimelineEvent[],
  sentiment: PetrobrasSentiment,
): PetrobrasSignal[] {
  const hasDividend = events.some((event) => matchesAny(event, ["dividendo", "provento"]));
  const hasRelevantFact = events.some((event) =>
    matchesAny(event, ["fato", "relevante", "ri"]),
  );
  const hasNews = events.some((event) =>
    matchesAny(event, ["notícia", "noticia", "news"]),
  );

  return [
    {
      title: "Dividendos",
      description: "Agenda de proventos, comunicados e contexto histórico.",
      status: hasDividend ? "Acompanhado" : "Aguardando evento",
      icon: BadgeDollarSign,
    },
    {
      title: "Fatos relevantes",
      description: "Eventos corporativos publicados por canais oficiais.",
      status: hasRelevantFact ? "Acompanhado" : "Aguardando evento",
      icon: FileText,
    },
    {
      title: "Notícias públicas",
      description: "Leitura contextual de notícias setoriais e institucionais.",
      status: hasNews ? "Acompanhado" : "Aguardando evento",
      icon: Newspaper,
    },
    {
      title: "Sentimento",
      description: "Classificação textual cautelosa, sem recomendação.",
      status: sentiment.label === "Sem dado" ? "Aguardando análise" : sentiment.label,
      icon: Activity,
    },
  ];
}

export function getPetrobrasTimelineEvents(): PetrobrasTimelineEvent[] {
  return [];
}

export async function getPetrobrasDashboardData(): Promise<PetrobrasDashboardData> {
  const cachedData = await getCachedPetrobrasData();
  const basicData = cachedData.snapshot
    ? mapMarketSnapshotToBasicData(cachedData.snapshot)
    : getPetrobrasBasicData();
  const report = cachedData.report
    ? mapAgentReportToPetrobrasReport(cachedData.report)
    : getLatestPetrobrasReport();
  const recentReports = cachedData.reports.map(mapAgentReportToRecentReport);
  const sentiment = getPetrobrasSentiment(report);
  const latestAgentUpdate = getLatestAgentUpdate(cachedData);
  const timelineEvents =
    cachedData.events.length > 0
      ? sortPetrobrasTimelineEvents(
          cachedData.events.map((event) => ({
            date: formatDate(event.event_date ?? event.created_at),
            relevanceLabel: getRelevanceLabel(event.relevance_score),
            relevanceScore: event.relevance_score,
            source: event.source_id ? "Fonte vinculada" : "Fonte não informada",
            summary: event.summary,
            title: event.title,
            type: event.event_type,
          })),
        )
      : getPetrobrasTimelineEvents();

  return {
    basicData,
    latestAgentUpdate,
    monitoredSignals: getPetrobrasMonitoredSignals(timelineEvents, sentiment),
    panelMetrics: getPetrobrasPanelMetrics(basicData, latestAgentUpdate),
    pulse: getPetrobrasPulse(timelineEvents),
    report,
    recentReports,
    sentiment,
    timelineEvents,
  };
}

export function getPetrobrasSentiment(
  report: PetrobrasReport | null,
): PetrobrasSentiment {
  if (
    !report ||
    report.status !== "Saved" ||
    report.sentimentScore === null ||
    report.sentimentLabel === null
  ) {
    return {
      basis:
        "Aguardando análise estruturada do agente.",
      confidence: "Sem dado",
      label: "Sem dado",
      score: 0,
    };
  }

  return {
    basis:
      report.sentimentBasis ??
      "Análise estruturada salva pelo agente sem base textual detalhada.",
    confidence: report.sentimentConfidence ?? "Sem dado",
    label: report.sentimentLabel,
    score: report.sentimentScore,
  };
}

export function getPetrobrasPulse(events: PetrobrasTimelineEvent[]) {
  return events
    .filter((event) => typeof event.relevanceScore === "number")
    .slice(0, 10)
    .map((event) => Math.min(Math.max(event.relevanceScore ?? 0, 8), 100))
    .reverse();
}

function sortPetrobrasTimelineEvents(
  events: PetrobrasTimelineEvent[],
): PetrobrasTimelineEvent[] {
  return [...events].sort(
    (current, next) => parseBrazilianDate(next.date) - parseBrazilianDate(current.date),
  );
}

function parseBrazilianDate(date: string) {
  const [day, month, year] = date.split("/").map(Number);

  return new Date(year, month - 1, day).getTime();
}

function getRelevanceLabel(score: number | null) {
  if (typeof score !== "number") {
    return "Não classificada";
  }

  if (score >= 75) {
    return "Alta";
  }

  if (score >= 45) {
    return "Média";
  }

  return "Baixa";
}

function matchesAny(event: PetrobrasTimelineEvent, terms: string[]) {
  const searchable = `${event.type} ${event.title} ${event.summary ?? ""}`
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();

  return terms.some((term) =>
    searchable.includes(
      term
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .toLowerCase(),
    ),
  );
}

function mapAgentReportToPetrobrasReport(report: {
  created_at: string;
  model_used: string | null;
  sentiment: string | null;
  sentiment_basis: string | null;
  sentiment_confidence: string | null;
  sentiment_score: number | null;
  summary: string;
  title: string;
}): PetrobrasReport {
  return {
    generatedAt: formatDateTime(report.created_at),
    sentimentBasis: report.sentiment_basis,
    sentimentConfidence: normalizeSentimentConfidence(report.sentiment_confidence),
    sentimentLabel: normalizeSentimentLabel(report.sentiment),
    sentimentScore: normalizeSentimentScore(report.sentiment_score),
    status: "Saved",
    summary: report.summary,
    title: report.title,
  };
}

function normalizeSentimentLabel(value: string | null): PetrobrasSentimentLabel | null {
  if (!value) {
    return null;
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

  if (normalized === "neutro") {
    return "Neutro";
  }

  return null;
}

function normalizeSentimentConfidence(
  value: string | null,
): PetrobrasSentimentConfidence | null {
  if (!value) {
    return null;
  }

  const normalized = value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim()
    .toLowerCase();

  if (normalized === "baixa") {
    return "Baixa";
  }

  if (normalized === "media") {
    return "Média";
  }

  if (normalized === "alta") {
    return "Alta";
  }

  return null;
}

function normalizeSentimentScore(value: number | null) {
  if (typeof value !== "number" || value < 0 || value > 100) {
    return null;
  }

  return Math.round(value);
}

function mapAgentReportToRecentReport(report: {
  created_at: string;
  model_used: string | null;
  sentiment: string | null;
  source_count: number | null;
  summary: string;
  title: string;
}): PetrobrasRecentReport {
  return {
    generatedAt: formatDateTime(report.created_at),
    modelUsed: report.model_used ?? "Modelo não informado",
    sentiment: report.sentiment ?? "Sem sentimento",
    sourceCount:
      typeof report.source_count === "number"
        ? `${report.source_count} fonte${report.source_count === 1 ? "" : "s"}`
        : "Fontes não informadas",
    summary: report.summary,
    title: report.title,
  };
}

function mapMarketSnapshotToBasicData(snapshot: {
  price: number | null;
  snapshot_time: string | null;
  source: string | null;
  ticker: string;
  variation: number | null;
  volume: number | null;
}): PetrobrasBasicData {
  const variation = snapshot.variation ?? 0;
  const source = normalizeSource(snapshot.source);

  return {
    change: `${variation > 0 ? "+" : ""}${variation.toLocaleString("pt-BR")}%`,
    company: "Petrobras PN",
    lastPrice:
      typeof snapshot.price === "number"
        ? snapshot.price.toLocaleString("pt-BR", {
            currency: "BRL",
            style: "currency",
          })
        : "Preço indisponível",
    sourceName: source.name,
    sourceUrl: source.url,
    ticker: snapshot.ticker,
    volume:
      typeof snapshot.volume === "number"
        ? snapshot.volume.toLocaleString("pt-BR")
        : "Volume indisponível",
  };
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "America/Sao_Paulo",
    year: "numeric",
  }).format(new Date(value));
}

export function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "2-digit",
    timeZone: "America/Sao_Paulo",
    year: "numeric",
  }).format(new Date(value));
}

export function normalizeSource(value: string | null) {
  if (!value?.trim()) {
    return {
      name: "Fonte não informada",
      url: null,
    };
  }

  const trimmed = value.trim();
  const urlMatch = trimmed.match(/https?:\/\/\S+/);
  const url = urlMatch?.[0] ?? null;
  const name = (url ? trimmed.slice(0, urlMatch?.index).replace(/\s+-\s*$/, "") : trimmed)
    .replace(/^Banco de dados\s*·\s*/i, "")
    .replace(/^Fonte\s*:\s*/i, "")
    .trim();

  return {
    name: name || getHostLabel(url) || "Fonte externa",
    url,
  };
}

function getHostLabel(url: string | null) {
  if (!url) {
    return null;
  }

  try {
    const host = new URL(url).hostname.replace(/^www\./, "");

    if (host.includes("vertexaisearch.cloud.google.com")) {
      return "Fonte consultada pelo Gemini";
    }

    return host;
  } catch {
    return null;
  }
}

function getLatestAgentUpdate(data: {
  events: Array<{ created_at: string; event_date: string | null }>;
  report: { created_at: string } | null;
  snapshot: { snapshot_time: string | null } | null;
}) {
  const timestamps = [
    data.report?.created_at,
    data.snapshot?.snapshot_time,
    ...data.events.flatMap((event) => [event.event_date, event.created_at]),
  ]
    .filter((value): value is string => Boolean(value))
    .map((value) => new Date(value).getTime())
    .filter(Number.isFinite);

  if (timestamps.length === 0) {
    return "Aguardando coleta";
  }

  return formatDateTime(new Date(Math.max(...timestamps)).toISOString());
}
