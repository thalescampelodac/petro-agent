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
  source: string;
  status: "Saved" | "Fallback";
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
  title: string;
  type: string;
  source: string;
};

export type PetrobrasSentiment = {
  label: "Neutro" | "Positivo" | "Negativo";
  score: number;
  confidence: "Fallback" | "Baixa" | "Media" | "Alta";
  basis: string;
  source: string;
};

export type PetrobrasDashboardData = {
  basicData: PetrobrasBasicData;
  monitoredSignals: PetrobrasSignal[];
  panelMetrics: PetrobrasPanelMetric[];
  report: PetrobrasReport | null;
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
      title: "Radar inicial preparado",
      type: "Sistema",
      source: "Mock interno",
    },
    {
      date: "18/05/2026",
      title: "Monitoramento de dividendos em destaque",
      type: "Dividendos",
      source: "Fallback",
    },
    {
      date: "17/05/2026",
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
  const timelineEvents =
    cachedData.events.length > 0
      ? sortPetrobrasTimelineEvents(
          cachedData.events.map((event) => ({
            date: formatDate(event.event_date ?? event.created_at),
            source: event.source_id ? `Fonte #${event.source_id}` : "Banco de dados",
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
    sentiment: getPetrobrasSentiment(report),
    timelineEvents,
  };
}

export function getPetrobrasSentiment(
  report: PetrobrasReport | null,
): PetrobrasSentiment {
  return {
    label: "Neutro",
    score: 52,
    confidence: report?.status === "Saved" ? "Baixa" : "Fallback",
    basis:
      "Leitura demonstrativa baseada no resumo disponível, sem recomendação de operação.",
    source: report?.source ?? "Fallback demonstrativo",
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

function mapAgentReportToPetrobrasReport(report: {
  created_at: string;
  model_used: string | null;
  summary: string;
  title: string;
}): PetrobrasReport {
  return {
    generatedAt: formatDateTime(report.created_at),
    source: report.model_used ? `Banco de dados · ${report.model_used}` : "Banco de dados",
    status: "Saved",
    summary: report.summary,
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
