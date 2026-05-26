import type { ComponentType } from "react";

import { Activity, Clock3, Gauge, Sparkles } from "lucide-react";
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
  PetrobrasRecentReport,
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
    <Card className="border-white/10 bg-white/[0.035] shadow-none transition hover:-translate-y-0.5 hover:border-emerald-300/25">
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
    <Card className="overflow-hidden border-white/10 bg-white/[0.035] shadow-none">
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
      <CardContent className="grid gap-3 p-5 text-slate-200 sm:grid-cols-2">
        <InfoCell label="Ticker" value={data.ticker} mono />
        <InfoCell label="Empresa" value={data.company} />
        <InfoCell label="Último preço" value={data.lastPrice} mono highlight />
        <InfoCell label="Variação" value={data.change} mono highlight />
        <InfoCell label="Última atualização" value={data.updatedAt} />
        <InfoCell label="Fonte" value={data.origin} />
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
        <div className="rounded-lg border border-emerald-300/15 bg-gradient-to-br from-emerald-300/[0.08] to-sky-300/[0.035] p-4">
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

export function RecentReportsCard({
  reports,
}: {
  reports: PetrobrasRecentReport[];
}) {
  return (
    <Card className="overflow-hidden border-white/10 bg-white/[0.035] shadow-none">
      <CardHeader className="border-b border-white/10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-white">Relatórios recentes</CardTitle>
            <CardDescription className="mt-1 text-slate-400">
              Últimos resumos salvos pelo agente, sem gerar IA no carregamento.
            </CardDescription>
          </div>
          <Badge className="h-auto w-fit whitespace-normal border-emerald-300/20 bg-emerald-300/10 text-emerald-100">
            {reports.length > 0 ? "Banco de dados" : "Aguardando registros"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 p-5">
        {reports.length > 0 ? (
          reports.map((report) => (
            <article
              className="rounded-lg border border-white/10 bg-black/20 p-4 transition hover:border-emerald-300/25"
              key={`${report.generatedAt}-${report.title}`}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="border-white/15 text-xs">
                      {report.sentiment}
                    </Badge>
                    <time className="font-mono text-xs text-slate-500">
                      {report.generatedAt}
                    </time>
                  </div>
                  <h2 className="mt-3 text-base font-semibold leading-6 text-white">
                    {report.title}
                  </h2>
                </div>
                <div className="flex min-w-0 shrink-0 flex-wrap gap-2 text-xs text-slate-400 sm:justify-end">
                  <span className="rounded bg-white/[0.06] px-2 py-1">
                    {report.modelUsed}
                  </span>
                  <span className="rounded bg-white/[0.06] px-2 py-1">
                    {report.sourceCount}
                  </span>
                </div>
              </div>
              <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-300">
                {report.summary}
              </p>
            </article>
          ))
        ) : (
          <div className="rounded-lg border border-dashed border-white/15 bg-black/20 p-5">
            <p className="text-sm font-medium text-white">
              Nenhum relatório salvo ainda
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Quando o pipeline salvar relatórios em banco, eles aparecerão aqui
              com resumo, sentimento, data e modelo utilizado.
            </p>
          </div>
        )}
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
    <Card className="overflow-hidden border-white/10 bg-white/[0.035] shadow-none">
      <CardHeader className="border-b border-white/10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="text-white">Eventos recentes</CardTitle>
            <CardDescription className="mt-1 text-slate-400">
              Timeline ordenada por data com tipo, contexto e relevância.
            </CardDescription>
          </div>
          <Badge className="h-auto w-fit whitespace-normal border-sky-300/20 bg-sky-300/10 text-sky-100">
            {events.length > 0 ? `${events.length} sinais` : "Sem eventos"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 p-5">
        {events.length > 0 ? (
          events.map((event) => (
            <article
              className="group relative overflow-hidden rounded-lg border border-white/10 bg-black/20 p-4 transition hover:border-sky-300/25"
              key={`${event.date}-${event.title}`}
            >
              <div className="absolute bottom-4 left-0 top-4 w-px bg-gradient-to-b from-sky-300/20 via-emerald-300/70 to-sky-300/20" />
              <div className="flex flex-col gap-4 pl-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="border-emerald-300/20 bg-emerald-300/10 text-xs text-emerald-100">
                    {event.type}
                  </Badge>
                  <span className="flex items-center gap-1 font-mono text-xs text-slate-500">
                    <Clock3 className="size-3" />
                    <time>{event.date}</time>
                  </span>
                </div>

                <div>
                  <h2 className="text-sm font-semibold leading-6 text-white">
                    {event.title}
                  </h2>
                  <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-400">
                    {event.summary ??
                      "Evento registrado sem resumo textual estruturado. O painel mantém o item visível para preservar rastreabilidade."}
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                  <p className="text-xs text-slate-500">Fonte: {event.source}</p>
                  <div className="flex w-fit items-center gap-2 rounded bg-white/[0.06] px-2 py-1 text-xs text-slate-300">
                    <Gauge className="size-3 text-sky-200" />
                    <span>{event.relevanceLabel}</span>
                    {typeof event.relevanceScore === "number" ? (
                      <span className="font-mono text-slate-500">
                        {event.relevanceScore}/100
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="rounded-lg border border-dashed border-white/15 bg-black/20 p-5">
            <p className="text-sm font-medium text-white">Nenhum evento recente</p>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              O painel exibirá eventos salvos no banco quando o radar encontrar
              fatos relevantes, notícias ou registros públicos.
            </p>
          </div>
        )}
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
    <div className="min-h-36 rounded-lg border border-white/10 bg-black/20 p-4 transition hover:border-emerald-300/25">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
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
            "h-auto w-fit shrink-0 whitespace-normal border-white/10 bg-white/[0.04] text-xs text-slate-200",
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

function InfoCell({
  highlight = false,
  label,
  mono = false,
  value,
}: {
  highlight?: boolean;
  label: string;
  mono?: boolean;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-black/20 p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <p
        className={cn(
          "mt-2 break-words text-lg text-white",
          mono && "font-mono",
          highlight && "text-emerald-100",
        )}
      >
        {value}
      </p>
    </div>
  );
}
