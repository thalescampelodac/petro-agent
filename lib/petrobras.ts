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
  source: "Mock" | "Cache" | "Real";
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
  report: PetrobrasReport | null;
  recentReports: PetrobrasRecentReport[];
  sentiment: PetrobrasSentiment;
  timelineEvents: PetrobrasTimelineEvent[];
};

const BASIC_DATA: PetrobrasBasicData = {
  ticker: "PETR4",
  company: "Petrobras PN",
  lastPrice: "R$ 28,45",
  change: "+1,2%",
  updatedAt: "19/05/2026 14:30",
  source: "Mock",
  origin: "Mock interno",
  note: "Dados demonstrativos para validação do painel",
};

const LATEST_REPORT: PetrobrasReport = {
  summary:
    "O PetroAgent continua monitorando PETR4 com foco em dividendos, fatos relevantes e sentimento setorial. O painel atual exibe o último contexto disponível em modo demonstrativo, sem indicação de operação.",
  generatedAt: "19/05/2026 14:35",
  sentimentBasis: null,
  sentimentConfidence: null,
  sentimentLabel: null,
  sentimentScore: null,
  source: "Fallback demonstrativo",
  status: "Fallback",
};

export function getPetrobrasBasicData(): PetrobrasBasicData {
  return BASIC_DATA;
}

export function getLatestPetrobrasReport(): PetrobrasReport | null {
  return LATEST_REPORT;
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
      value: "Preparado",
      detail: "Aguardando dados reais",
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

export function getPetrobrasMonitoredSignals(): PetrobrasSignal[] {
  return [
    {
      title: "Dividendos",
      description: "Agenda de proventos, comunicados e contexto histórico.",
      status: "Em observação",
      icon: BadgeDollarSign,
    },
    {
      title: "Fatos relevantes",
      description: "Eventos corporativos publicados por canais oficiais.",
      status: "Sem alerta crítico",
      icon: FileText,
    },
    {
      title: "Notícias públicas",
      description: "Leitura contextual de notícias setoriais e institucionais.",
      status: "Aguardando fonte",
      icon: Newspaper,
    },
    {
      title: "Sentimento",
      description: "Classificação textual cautelosa, sem recomendação.",
      status: "Neutro",
      icon: Activity,
    },
  ];
}

export function getPetrobrasTimelineEvents(): PetrobrasTimelineEvent[] {
  return sortPetrobrasTimelineEvents([
    {
      date: "19/05/2026",
      relevanceLabel: "Demonstração",
      relevanceScore: null,
      summary:
        "Estrutura inicial do radar preparada para receber eventos persistidos sobre Petrobras/PETR4.",
      title: "Radar inicial preparado",
      type: "Sistema",
      source: "Mock interno",
    },
    {
      date: "18/05/2026",
      relevanceLabel: "Média",
      relevanceScore: 62,
      summary:
        "Acompanhamento demonstrativo de proventos e comunicados relacionados ao ativo.",
      title: "Monitoramento de dividendos em destaque",
      type: "Dividendos",
      source: "Fallback",
    },
    {
      date: "17/05/2026",
      relevanceLabel: "Baixa",
      relevanceScore: 28,
      summary:
        "Estado de exemplo para sinalizar ausência de alerta crítico no painel público.",
      title: "Sem fato relevante crítico no painel demonstrativo",
      type: "RI",
      source: "Mock interno",
    },
  ]);
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
    monitoredSignals: getPetrobrasMonitoredSignals(),
    panelMetrics: getPetrobrasPanelMetrics(basicData),
    report,
    recentReports,
    sentiment: getPetrobrasSentiment(report),
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
    source: "Cache",
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
