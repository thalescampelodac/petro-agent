import type { ComponentType } from "react";

import { Activity, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type {
  PetrobrasBasicData,
  PetrobrasReport,
  PetrobrasSentiment,
  PetrobrasTimelineEvent,
} from "@/lib/petrobras";

export function MetricCard({
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
          <CardDescription className="mt-1 text-slate-400">{detail}</CardDescription>
        </div>
      </CardHeader>
    </Card>
  );
}

export function BasicDataCard({
  data,
}: {
  data: PetrobrasBasicData;
}) {
  return (
    <Card className="border-white/10 bg-white/[0.035] shadow-none">
      <CardHeader className="border-b border-white/10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-white">Dados básicos PETR4</CardTitle>
            <CardDescription className="text-slate-400">
              Dados demonstrativos do ativo e indicação de origem.
            </CardDescription>
          </div>
          <Badge variant="outline" className="w-fit border-white/15">
            {data.source}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2 p-5 text-slate-200">
        <div>
          <p className="text-xs text-slate-500">Ticker</p>
          <p className="mt-2 font-mono text-lg text-white">{data.ticker}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Empresa</p>
          <p className="mt-2 text-lg text-white">{data.company}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Último preço</p>
          <p className="mt-2 font-mono text-lg text-white">{data.lastPrice}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Variação</p>
          <p className="mt-2 font-mono text-lg text-white">{data.change}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Última atualização</p>
          <p className="mt-2 text-lg text-white">{data.updatedAt}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Fonte</p>
          <p className="mt-2 text-lg text-white">{data.origin}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export function SummaryCard({
  report,
}: {
  report: PetrobrasReport | null;
}) {
  const hasReport = Boolean(report && report.status === "Saved");

  return (
    <Card className="overflow-hidden border-white/10 bg-white/[0.035] shadow-none">
      <CardHeader className="border-b border-white/10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-white">Resumo inteligente</CardTitle>
            <CardDescription className="mt-1 text-slate-400">
              {hasReport
                ? "Resumo salvo no banco de dados."
                : "Fallback exibido enquanto não há resumo salvo."}
            </CardDescription>
          </div>
          <Badge variant="outline" className="w-fit border-white/15">
            {hasReport ? "Banco de dados" : "Fallback mockado"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-5 p-5">
        <div className="rounded-lg border border-emerald-300/15 bg-emerald-300/[0.055] p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-emerald-100">
            <Sparkles className="size-4" />
            {hasReport ? "Resumo do agente" : "Resumo de fallback"}
          </div>
          <p className="mt-3 max-w-3xl text-base leading-8 text-slate-200">
            {report?.summary ??
              "Sem relatório salvo no banco. Este conteúdo é um fallback demonstrativo para manter o painel informativo sem sugerir operação."}
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          {[
            ["Data da geração", report?.generatedAt ?? "—"],
            ["Fonte", report?.source ?? "Fallback"],
            ["Confiança do dado", hasReport ? "Salvo" : "Fallback"],
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
  );
}

export function SentimentIndicator({
  sentiment,
}: {
  sentiment: PetrobrasSentiment;
}) {
  const scoreLabel = `${sentiment.score}/100`;

  return (
    <Card className="overflow-hidden border-white/10 bg-white/[0.035] shadow-none">
      <CardHeader className="border-b border-white/10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-white">Indicador de sentimento</CardTitle>
            <CardDescription className="mt-1 text-slate-400">
              Leitura informativa derivada do resumo disponível.
            </CardDescription>
          </div>
          <Badge className="w-fit border-sky-300/20 bg-sky-300/10 text-sky-100">
            {sentiment.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-5 p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-sky-100">
              <Activity className="size-4" />
              Escore demonstrativo
            </div>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              {sentiment.basis}
            </p>
          </div>
          <div className="font-mono text-3xl font-semibold text-white">
            {scoreLabel}
          </div>
        </div>

        <div
          aria-label={`Sentimento ${sentiment.label} com escore ${scoreLabel}`}
          className="h-3 overflow-hidden rounded-full bg-white/10"
          role="meter"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={sentiment.score}
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-sky-300 to-emerald-200"
            style={{ width: `${sentiment.score}%` }}
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-white/10 bg-black/20 p-4">
            <p className="text-xs text-slate-500">Confiabilidade</p>
            <p className="mt-2 font-mono text-lg text-white">
              {sentiment.confidence}
            </p>
          </div>
          <div className="rounded-lg border border-white/10 bg-black/20 p-4">
            <p className="text-xs text-slate-500">Fonte</p>
            <p className="mt-2 text-lg text-white">{sentiment.source}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function TimelineCard({
  events,
}: {
  events: PetrobrasTimelineEvent[];
}) {
  return (
    <Card className="border-white/10 bg-white/[0.035] shadow-none">
      <CardHeader>
        <CardTitle className="text-white">Linha do tempo</CardTitle>
        <CardDescription className="text-slate-400">
          Eventos ordenados por data, com tipo e fonte disponíveis.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {events.map((event) => (
          <article
            className="border-l border-emerald-300/25 pl-4"
            key={`${event.date}-${event.title}`}
          >
            <div className="flex flex-wrap items-center gap-2">
              <time className="font-mono text-xs text-slate-500">{event.date}</time>
              <Badge variant="outline" className="border-white/15 text-xs">
                {event.type}
              </Badge>
            </div>
            <h2 className="mt-2 text-sm font-medium leading-6 text-white">
              {event.title}
            </h2>
            <p className="mt-1 text-xs text-slate-500">Fonte: {event.source}</p>
          </article>
        ))}
      </CardContent>
    </Card>
  );
}

export function SignalCard({
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
            status === "Neutro" &&
              "border-sky-300/20 bg-sky-300/10 text-sky-100",
          )}
          variant="outline"
        >
          {status}
        </Badge>
      </div>
    </div>
  );
}
