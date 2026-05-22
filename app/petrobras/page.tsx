import { ArrowLeft, BarChart3, Radar, ShieldAlert } from "lucide-react";
import Link from "next/link";

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
  getLatestPetrobrasReport,
  getPetrobrasBasicData,
  getPetrobrasPanelMetrics,
  getPetrobrasMonitoredSignals,
  getPetrobrasSentiment,
  getPetrobrasTimelineEvents,
} from "@/lib/petrobras";
import {
  BasicDataCard,
  MetricCard,
  SentimentIndicator,
  SignalCard,
  SummaryCard,
  TimelineCard,
} from "@/app/petrobras/components";

export const metadata = {
  title: "Painel Petrobras | PetroAgent",
  description:
    "Painel público demonstrativo do PetroAgent para acompanhamento informativo de Petrobras/PETR4.",
};

export default function PetrobrasPage() {
  const basicData = getPetrobrasBasicData();
  const report = getLatestPetrobrasReport();
  const sentiment = getPetrobrasSentiment(report);
  const panelMetrics = getPetrobrasPanelMetrics(basicData);
  const monitoredSignals = getPetrobrasMonitoredSignals();
  const timelineEvents = getPetrobrasTimelineEvents();

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

          <BasicDataCard data={basicData} />

          <SummaryCard report={report} />

          <SentimentIndicator sentiment={sentiment} />

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

          <TimelineCard events={timelineEvents} />
        </aside>
      </section>
    </main>
  );
}
