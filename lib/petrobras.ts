import type { ComponentType } from "react";
import {
  Activity,
  BadgeDollarSign,
  CalendarClock,
  DatabaseZap,
  FileText,
  Newspaper,
  Radar,
  TrendingUp,
} from "lucide-react";

import { getCachedPetrobrasData } from "@/services/petrobras-cache";

export type PetrobrasBasicData = {
  ticker: string;
  company: string;
  lastPrice: string;
  change: string;
  updatedAt: string;
  source: "Banco" | "Aguardando coleta";
  origin: string;
  note: string;
};

export type PetrobrasReport = {
  summary: string;
  generatedAt: string;
  sentimentBasis: string | null;
  sentimentConfidence: PetrobrasSentimentConfidence | null;
  sentimentLabel: PetrobrasSentimentLabel | null;
  sentimentScore: number | null;
  source: string;
  status: "Saved" | "Fallback";
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
  source: string;
};

type PetrobrasSentimentLabel = "Neutro" | "Positivo" | "Negativo";
type PetrobrasSentimentConfidence = "Baixa" | "Média" | "Alta";

export type PetrobrasDashboardData = {
  basicData: PetrobrasBasicData;
  monitoredSignals: PetrobrasSignal[];
  panelMetrics: PetrobrasPanelMetric[];
  pulse: number[];
  report: PetrobrasReport | null;
  recentReports: PetrobrasRecentReport[];
  sentiment: PetrobrasSentiment;
  timelineEvents: PetrobrasTimelineEvent[];
};

const EMPTY_BASIC_DATA: PetrobrasBasicData = {
  ticker: "PETR4",
  company: "Petrobras PN",
  lastPrice: "Aguardando coleta",
  change: "Aguardando coleta",
  updatedAt: "Aguardando coleta",
  source: "Aguardando coleta",
  origin: "Sem snapshot persistido",
  note: "Execute o agente para salvar um snapshot de mercado no banco",
};

export function getPetrobrasBasicData(): PetrobrasBasicData {
  return EMPTY_BASIC_DATA;
}

export function getLatestPetrobrasReport(): PetrobrasReport | null {
  return null;
}

export function getPetrobrasPanelMetrics(
  basicData: PetrobrasBasicData,
): PetrobrasPanelMetric[] {
  return [
    {
      label: "Ativo monitorado",
      value: basicData.ticker,
      detail: basicData.company,
      icon: TrendingUp,
    },
    {
      label: "Origem dos dados",
      value: basicData.source,
      detail: basicData.origin,
      icon: DatabaseZap,
    },
    {
      label: "Status do radar",
      value: basicData.source === "Banco" ? "Com dados" : "Aguardando coleta",
      detail:
        basicData.source === "Banco"
          ? "Último snapshot persistido localizado"
          : "Sem snapshot persistido no banco",
      icon: Radar,
    },
    {
      label: "Última atualização",
      value: basicData.updatedAt,
      detail: basicData.note,
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
      status: hasDividend ? "Registro persistido" : "Aguardando evento",
      icon: BadgeDollarSign,
    },
    {
      title: "Fatos relevantes",
      description: "Eventos corporativos publicados por canais oficiais.",
      status: hasRelevantFact ? "Registro persistido" : "Aguardando evento",
      icon: FileText,
    },
    {
      title: "Notícias públicas",
      description: "Leitura contextual de notícias setoriais e institucionais.",
      status: hasNews ? "Registro persistido" : "Aguardando evento",
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
  const timelineEvents =
    cachedData.events.length > 0
      ? sortPetrobrasTimelineEvents(
          cachedData.events.map((event) => ({
            date: formatDate(event.event_date ?? event.created_at),
            relevanceLabel: getRelevanceLabel(event.relevance_score),
            relevanceScore: event.relevance_score,
            source: event.source_id ? `Fonte #${event.source_id}` : "Banco de dados",
            summary: event.summary,
            title: event.title,
            type: event.event_type,
          })),
        )
      : getPetrobrasTimelineEvents();

  return {
    basicData,
    monitoredSignals: getPetrobrasMonitoredSignals(timelineEvents, sentiment),
    panelMetrics: getPetrobrasPanelMetrics(basicData),
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
        "Aguardando análise estruturada do agente salva no banco de dados.",
      confidence: "Sem dado",
      label: "Sem dado",
      score: 0,
      source: "Banco de dados",
    };
  }

  return {
    basis:
      report.sentimentBasis ??
      "Análise estruturada salva pelo agente sem base textual detalhada.",
    confidence: report.sentimentConfidence ?? "Sem dado",
    label: report.sentimentLabel,
    score: report.sentimentScore,
    source: report.source,
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
    source: report.model_used ? `Banco de dados · ${report.model_used}` : "Banco de dados",
    status: "Saved",
    summary: report.summary,
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
    note: "Dado persistido em cache no banco",
    origin: snapshot.source ?? "Banco de dados",
    source: "Banco",
    ticker: snapshot.ticker,
    updatedAt: snapshot.snapshot_time
      ? formatDateTime(snapshot.snapshot_time)
      : "Horário indisponível",
  };
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}
