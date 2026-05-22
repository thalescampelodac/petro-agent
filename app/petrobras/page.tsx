import {
  Activity,
  ArrowLeft,
  BadgeDollarSign,
  BarChart3,
  CalendarClock,
  DatabaseZap,
  FileText,
  Newspaper,
  Radar,
  ShieldAlert,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import type { ComponentType } from "react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

const panelMetrics = [
  {
    label: "Ativo monitorado",
    value: "PETR4",
    detail: "Petrobras PN",
    icon: TrendingUp,
  },
  {
    label: "Origem dos dados",
    value: "Mock",
    detail: "Fallback demonstrativo",
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
    value: "19/05",
    detail: "Conteúdo simulado",
    icon: CalendarClock,
  },
];

const monitoredSignals = [
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

const timelineEvents = [
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

export const metadata = {
  title: "Painel Petrobras | PetroAgent",
  description:
    "Painel público demonstrativo do PetroAgent para acompanhamento informativo de Petrobras/PETR4.",
};

export default function PetrobrasPage() {
  return (
    <main className="dark min-h-screen bg-[#070b10] text-foreground">
      <section className="border-b border-white/10 bg-[radial-gradient(circle_at_80%_0%,rgba(16,185,129,0.18),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.045),transparent)]">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-8 lg:px-8">
          <nav className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Link
              className={buttonVariants({
                className:
                  "w-fit border-white/15 bg-white/[0.03] text-white hover:bg-white/[0.08]",
                size: "sm",
                variant: "outline",
              })}
              href="/"
            >
              <ArrowLeft className="size-4" />
              Voltar para home
            </Link>
            <Badge className="w-fit border-emerald-300/25 bg-emerald-300/10 text-emerald-100">
              MVP 1 • Painel demonstrativo
            </Badge>
          </nav>

          <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-lg border border-emerald-300/30 bg-emerald-300/15">
                  <Radar className="size-5 text-emerald-200" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-emerald-100">
                    PetroAgent
                  </p>
                  <p className="text-xs text-slate-500">Radar Petrobras/PETR4</p>
                </div>
              </div>

              <div className="space-y-4">
                <h1
                  aria-label="Painel Petrobras PETR4"
                  className="max-w-4xl text-4xl font-semibold leading-tight text-white sm:text-5xl"
                >
                  Painel Petrobras
                  <span className="block">PETR4</span>
                </h1>
                <p className="max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
                  Uma primeira área pública para acompanhar sinais, resumos e
                  eventos ligados à Petrobras. Nesta etapa, os dados são
                  demonstrativos e preparados para receber integração real.
                </p>
              </div>
            </div>

            <Card className="border-amber-200/20 bg-amber-200/[0.06] shadow-none">
              <CardHeader className="flex-row items-start gap-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-amber-200/12">
                  <ShieldAlert className="size-5 text-amber-100" />
                </div>
                <div>
                  <CardTitle className="text-base text-white">
                    Aviso informativo
                  </CardTitle>
                  <CardDescription className="mt-2 leading-6 text-amber-50/75">
                    Este painel não constitui recomendação de compra, venda ou
                    manutenção de ativos. O objetivo é organizar sinais públicos
                    e contexto de acompanhamento.
                  </CardDescription>
                </div>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-6 px-6 py-8 lg:grid-cols-[1.15fr_0.85fr] lg:px-8">
        <div className="space-y-6">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {panelMetrics.map((metric) => (
              <MetricCard key={metric.label} {...metric} />
            ))}
          </div>

          <Card className="overflow-hidden border-white/10 bg-white/[0.035] shadow-none">
            <CardHeader className="border-b border-white/10">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="text-white">Resumo inteligente</CardTitle>
                  <CardDescription className="mt-1 text-slate-400">
                    Conteúdo simulado para validar a experiência do painel.
                  </CardDescription>
                </div>
                <Badge variant="outline" className="w-fit border-white/15">
                  Fallback mockado
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-5 p-5">
              <div className="rounded-lg border border-emerald-300/15 bg-emerald-300/[0.055] p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-emerald-100">
                  <Sparkles className="size-4" />
                  Leitura do agente
                </div>
                <p className="mt-3 max-w-3xl text-base leading-8 text-slate-200">
                  PETR4 permanece no radar por combinação de discussões sobre
                  dividendos, dinâmica do setor de energia e comunicados
                  corporativos. A leitura atual é neutra e orientada a
                  acompanhamento, sem sugestão de operação.
                </p>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                {[
                  ["Sentimento", "Neutro"],
                  ["Nível de atenção", "Moderado"],
                  ["Confiança do dado", "Mock"],
                ].map(([label, value]) => (
                  <div
                    className="rounded-lg border border-white/10 bg-black/20 p-4"
                    key={label}
                  >
                    <p className="text-xs text-slate-500">{label}</p>
                    <p className="mt-2 font-mono text-lg text-white">{value}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white/[0.035] shadow-none">
            <CardHeader>
              <CardTitle className="text-white">Sinais monitorados</CardTitle>
              <CardDescription className="text-slate-400">
                Estrutura visual preparada para dados reais, cache e fallback.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              {monitoredSignals.map((signal) => (
                <SignalCard key={signal.title} {...signal} />
              ))}
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-6">
          <Card className="border-white/10 bg-[#0b1218] shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <BarChart3 className="size-5 text-emerald-200" />
                Pulso demonstrativo
              </CardTitle>
              <CardDescription className="text-slate-400">
                Visualização mockada dos sinais recentes.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex h-48 items-end gap-2 rounded-lg border border-white/10 bg-black/20 p-4">
                {[48, 66, 54, 78, 61, 88, 72, 83, 69, 91].map((height, index) => (
                  <div
                    className="flex-1 rounded-t bg-gradient-to-t from-emerald-500/35 to-emerald-200"
                    key={`${height}-${index}`}
                    style={{ height: `${height}%` }}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white/[0.035] shadow-none">
            <CardHeader>
              <CardTitle className="text-white">Linha do tempo</CardTitle>
              <CardDescription className="text-slate-400">
                Eventos demonstrativos ordenados por data.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {timelineEvents.map((event) => (
                <div
                  className="border-l border-emerald-300/25 pl-4"
                  key={`${event.date}-${event.title}`}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs text-slate-500">
                      {event.date}
                    </span>
                    <Badge variant="outline" className="border-white/15 text-xs">
                      {event.type}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm font-medium leading-6 text-white">
                    {event.title}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Fonte: {event.source}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </aside>
      </section>
    </main>
  );
}

function MetricCard({
  label,
  value,
  detail,
  icon: Icon,
}: {
  label: string;
  value: string;
  detail: string;
  icon: ComponentType<{ className?: string }>;
}) {
  return (
    <Card className="border-white/10 bg-white/[0.035] shadow-none">
      <CardHeader className="space-y-4 p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-300/12">
            <Icon className="size-4 text-emerald-200" />
          </div>
          <span className="text-xs text-slate-500">{label}</span>
        </div>
        <div>
          <CardTitle className="font-mono text-2xl text-white">{value}</CardTitle>
          <CardDescription className="mt-1 text-slate-400">
            {detail}
          </CardDescription>
        </div>
      </CardHeader>
    </Card>
  );
}

function SignalCard({
  title,
  description,
  status,
  icon: Icon,
}: {
  title: string;
  description: string;
  status: string;
  icon: ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-black/20 p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.06]">
            <Icon className="size-4 text-emerald-200" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
          </div>
        </div>
        <Badge
          className={cn(
            "shrink-0 border-white/10 bg-white/[0.04] text-xs text-slate-200",
            status === "Neutro" && "border-sky-300/20 bg-sky-300/10 text-sky-100",
          )}
          variant="outline"
        >
          {status}
        </Badge>
      </div>
    </div>
  );
}
