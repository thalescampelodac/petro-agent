import type { ComponentType } from "react";

import { Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { PetrobrasBasicData, PetrobrasReport } from "@/lib/petrobras";

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
