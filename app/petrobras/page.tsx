import {
  ArrowLeft,
  BarChart3,
  Clock3,
  DatabaseZap,
  Radar,
  ShieldAlert,
  ShieldCheck,
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
import {
  getPetrobrasDashboardData,
} from "@/lib/petrobras";
import { APP_VERSION_BADGE } from "@/lib/app-version";
import {
  BasicDataCard,
  MetricCard,
  RecentReportsCard,
  SentimentIndicator,
  SignalCard,
  SummaryCard,
  TimelineCard,
} from "@/app/petrobras/components";

export const metadata = {
  title: "Painel Petrobras | PetroAgent",
  description:
    "Painel público do PetroAgent para acompanhamento informativo de Petrobras/PETR4 com dados persistidos quando disponíveis.",
};

export default async function PetrobrasPage() {
  const {
    basicData,
    monitoredSignals,
    panelMetrics,
    pulse,
    recentReports,
    report,
    sentiment,
    timelineEvents,
  } = await getPetrobrasDashboardData();

  return (
    <main className="dark min-h-screen overflow-hidden bg-[#070b10] text-foreground">
      <section className="border-b border-white/10 bg-[radial-gradient(circle_at_78%_8%,rgba(16,185,129,0.18),transparent_26%),radial-gradient(circle_at_18%_0%,rgba(14,165,233,0.12),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.045),transparent)]">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-5 py-7 sm:px-6 sm:py-8 lg:px-8">
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
              {APP_VERSION_BADGE}
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
                  className="max-w-4xl text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl"
                >
                  Painel Petrobras
                  <span className="block">PETR4</span>
                </h1>
                <p className="max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
                  Um painel público para acompanhar sinais, resumos e eventos
                  ligados à Petrobras com contexto visual, dados persistidos
                  quando disponíveis e estados vazios transparentes.
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              <HeroStatusCard
                detail="Sem recomendação financeira"
                icon={ShieldAlert}
                label="Aviso"
                tone="amber"
                value="Informativo"
              />
              <HeroStatusCard
                detail={basicData.origin}
                icon={DatabaseZap}
                label="Dados"
                tone="emerald"
                value={basicData.source}
              />
              <HeroStatusCard
                detail={basicData.updatedAt}
                icon={Clock3}
                label="Atualização"
                tone="sky"
                value="Monitorado"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-6 px-5 py-6 sm:px-6 sm:py-8 lg:grid-cols-[1.15fr_0.85fr] lg:px-8">
        <div className="space-y-6">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {panelMetrics.map((metric) => (
              <MetricCard key={metric.label} {...metric} />
            ))}
          </div>

          <BasicDataCard data={basicData} />

          <SummaryCard report={report} />

          <RecentReportsCard reports={recentReports} />

          <SentimentIndicator sentiment={sentiment} />

          <Card className="border-white/10 bg-white/[0.035] shadow-none">
            <CardHeader>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <CardTitle className="text-white">Sinais monitorados</CardTitle>
                  <CardDescription className="mt-1 text-slate-400">
                    Sinais derivados de eventos e relatórios persistidos.
                  </CardDescription>
                </div>
                <Badge className="w-fit border-emerald-300/20 bg-emerald-300/10 text-emerald-100">
                  <ShieldCheck className="size-3" />
                  Dados persistidos
                </Badge>
              </div>
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
                Pulso do mercado
              </CardTitle>
              <CardDescription className="text-slate-400">
                Série derivada da relevância dos eventos persistidos.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pulse.length > 0 ? (
                <div className="flex h-40 items-end gap-1.5 rounded-lg border border-white/10 bg-black/20 p-3 sm:h-48 sm:gap-2 sm:p-4">
                  {pulse.map((height, index) => (
                    <div
                      aria-label={`Pulso ${index + 1}: ${height}`}
                      className="flex-1 rounded-t bg-gradient-to-t from-emerald-500/35 to-emerald-200"
                      key={`${height}-${index}`}
                      style={{ height: `${height}%` }}
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-white/15 bg-black/20 p-5">
                  <p className="text-sm font-medium text-white">
                    Aguardando eventos persistidos
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    O pulso será calculado a partir da relevância dos eventos
                    salvos no banco.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <TimelineCard events={timelineEvents} />
        </aside>
      </section>
    </main>
  );
}

function HeroStatusCard({
  detail,
  icon: Icon,
  label,
  tone,
  value,
}: {
  detail: string;
  icon: ComponentType<{ className?: string }>;
  label: string;
  tone: "amber" | "emerald" | "sky";
  value: string;
}) {
  const toneClass = {
    amber: "border-amber-200/20 bg-amber-200/[0.06] text-amber-100",
    emerald: "border-emerald-300/20 bg-emerald-300/[0.06] text-emerald-100",
    sky: "border-sky-300/20 bg-sky-300/[0.06] text-sky-100",
  }[tone];

  return (
    <Card className={`${toneClass} shadow-none`}>
      <CardHeader className="space-y-4 p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-white/10">
            <Icon className="size-4" />
          </div>
          <span className="text-xs text-current/70">{label}</span>
        </div>
        <div>
          <CardTitle className="text-base text-white">{value}</CardTitle>
          <CardDescription className="mt-1 text-current/70">
            {detail}
          </CardDescription>
        </div>
      </CardHeader>
    </Card>
  );
}
