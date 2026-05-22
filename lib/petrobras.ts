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
  return [
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
  ];
}
