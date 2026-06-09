import {
  ArrowRight,
  BadgeDollarSign,
  BarChart3,
  Bot,
  Brain,
  Globe,
  HeartHandshake,
  Link,
  Newspaper,
  Radar,
  RadioTower,
  ScanSearch,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  MessageCircle,
} from "lucide-react";
import Image from "next/image";
import type { ComponentType } from "react";

import { LikeButton } from "@/components/landing/like-button";
import { PixCopyButton } from "@/components/landing/pix-copy-button";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { APP_VERSION_BADGE } from "@/lib/app-version";
import { getPetrobrasDashboardData } from "@/lib/petrobras";
import { cn } from "@/lib/utils";

const monitorItems = [
  {
    title: "PETR4",
    description: "Indicadores básicos, contexto do ativo e status do dado.",
    icon: TrendingUp,
    accent: "text-emerald-300",
  },
  {
    title: "Dividendos",
    description: "Eventos de proventos e pontos que merecem acompanhamento.",
    icon: BadgeDollarSign,
    accent: "text-amber-200",
  },
  {
    title: "Fatos relevantes",
    description: "Comunicados públicos e registros importantes de RI.",
    icon: RadioTower,
    accent: "text-sky-300",
  },
  {
    title: "Notícias",
    description: "Sinais públicos que ajudam a compor o radar informativo.",
    icon: Newspaper,
    accent: "text-cyan-200",
  },
  {
    title: "Sentimento do mercado",
    description: "Leitura textual e cautelosa, sem recomendação financeira.",
    icon: Brain,
    accent: "text-fuchsia-200",
  },
  {
    title: "Radar inteligente",
    description: "Resumo organizado do que o agente observou no período.",
    icon: Radar,
    accent: "text-lime-200",
  },
];

const workflow = [
  {
    title: "Coleta",
    description: "Fontes públicas e registros internos entram no radar.",
    icon: ScanSearch,
  },
  {
    title: "Processamento",
    description: "O sistema organiza eventos, fontes e sinais relevantes.",
    icon: BarChart3,
  },
  {
    title: "IA",
    description: "Resumos são gerados de forma pontual, com cache e limites.",
    icon: Bot,
  },
  {
    title: "Radar",
    description: "A home e o painel apresentam contexto claro para acompanhar.",
    icon: Radar,
  },
];

const roadmap = [
  {
    title: "MVP 1",
    status: "Concluído",
    description:
      "Fundação pública do PetroAgent com landing, curtidas, banco, deploy e painel inicial.",
    items: ["Portal público", "Interação sem cadastro", "Base Supabase/Vercel"],
  },
  {
    title: "MVP 2",
    status: "Em execução",
    description:
      "Camada operacional MCP-first com agente, consultas persistidas, cron diário e painel Petrobras alimentado por dados do banco.",
    items: ["Tools MCP", "Agente Gemini", "Painel com dados persistidos"],
  },
];

const staticPix = {
  city: "Juiz de Fora",
  key: "2d8597cb-c2ba-41e5-9eb4-7221e7e1c4e8",
  name: "Thales Campelo da Conceição",
  qrCodeImage: "/pix-qrcode.png",
};

export const revalidate = 60;

export default async function Home() {
  const { basicData, latestAgentUpdate, sentiment } =
    await getPetrobrasDashboardData();

  return (
    <main className="dark min-h-screen overflow-hidden bg-[#070b10] text-foreground">
      <section className="relative border-b border-white/10">
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(16,185,129,0.18),transparent_32%),radial-gradient(circle_at_78%_18%,rgba(59,130,246,0.18),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.04),transparent)]" />
        <header className="relative z-20 mx-auto flex w-full max-w-7xl flex-wrap items-start justify-between gap-4 px-5 pt-8 sm:px-6 md:grid md:grid-cols-[1fr_auto_1fr] lg:px-8">
          <div className="justify-self-start">
            <div className="flex w-fit items-center gap-3">
              <div className="flex size-11 items-center justify-center overflow-hidden rounded-lg border border-emerald-300/25 bg-emerald-300/10 shadow-lg shadow-emerald-950/20">
                <Image
                  alt=""
                  aria-hidden="true"
                  className="size-10 object-cover"
                  height={80}
                  priority
                  src="/images/logo-mark.png"
                  width={80}
                />
              </div>
              <span className="text-base font-semibold text-white">
                PetroAgent
              </span>
            </div>
          </div>

          <a
            className="order-3 w-full pt-0 text-center text-sm text-emerald-100/75 transition hover:text-emerald-100 md:order-none md:w-auto md:justify-self-center md:pt-2"
            href="#criador"
          >
            Criador
          </a>

          <div className="justify-self-end">
            <LikeButton />
          </div>
        </header>

        <div className="relative mx-auto grid w-full max-w-7xl gap-8 px-5 pb-8 pt-10 sm:px-6 sm:pb-10 sm:pt-12 lg:min-h-[calc(100vh-6.5rem)] lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:px-8">
          <div className="flex flex-col gap-6">
            <div className="space-y-5">
              <div className="flex flex-wrap gap-3">
                <Badge className="border-emerald-300/30 bg-emerald-300/10 text-emerald-100">
                  Radar Petrobras/PETR4
                </Badge>
                <Badge variant="outline" className="border-white/15 text-white/70">
                  {APP_VERSION_BADGE}
                </Badge>
              </div>

              <div className="space-y-5">
                <h1 className="max-w-4xl text-4xl font-semibold leading-[1.05] text-white sm:text-5xl lg:text-6xl">
                  Um agente inteligente acompanhando a Petrobrás para você.
                </h1>
                <p className="max-w-2xl text-base leading-7 text-slate-300 sm:text-lg sm:leading-8">
                  PetroAgent transforma sinais públicos sobre PETR4 em um radar
                  claro, visual e acessível para acompanhar fatos, dividendos,
                  notícias e contexto de mercado.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <a
                  className={buttonVariants({
                    className:
                      "h-11 bg-emerald-300 px-5 text-emerald-950 hover:bg-emerald-200",
                    size: "lg",
                  })}
                  href="/petrobras"
                >
                  Ver painel Petrobras
                  <ArrowRight className="size-4" />
                </a>
                <a
                  className={buttonVariants({
                    className:
                      "h-11 border-white/15 bg-white/[0.03] px-5 text-white hover:bg-white/[0.08]",
                    size: "lg",
                    variant: "outline",
                  })}
                  href="#roadmap"
                >
                  Explorar roadmap
                </a>
              </div>
            </div>

            <div className="grid max-w-2xl gap-3 sm:grid-cols-3">
              {[
                ["MVP 2", "fase atual"],
                ["0", "recomendações financeiras"],
                [APP_VERSION_BADGE.replace("MVP 2 • ", ""), "versão do app"],
              ].map(([value, label]) => (
                <div
                  className="rounded-lg border border-white/10 bg-white/[0.04] p-3"
                  key={label}
                >
                  <p className="font-mono text-2xl text-white">{value}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-400">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <HeroDashboard
            basicData={basicData}
            latestAgentUpdate={latestAgentUpdate}
            sentimentLabel={sentiment.label}
          />
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-5 py-16 sm:px-6 sm:py-20 lg:px-8">
        <SectionHeader
          eyebrow="Monitoramento"
          title="O que o agente monitora"
          description="Uma visão visual dos sinais que vão compor o painel público do PetroAgent."
        />
        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {monitorItems.map((item) => {
            const Icon = item.icon;

            return (
              <Card
                className="border-white/10 bg-white/[0.035] shadow-none transition hover:-translate-y-1 hover:border-emerald-300/30"
                key={item.title}
              >
                <CardHeader>
                  <div className="mb-3 flex size-11 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04]">
                    <Icon className={cn("size-5", item.accent)} />
                  </div>
                  <CardTitle className="text-white">{item.title}</CardTitle>
                  <CardDescription className="leading-6 text-slate-400">
                    {item.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </section>

      <section
        className="border-y border-white/10 bg-white/[0.025] px-5 py-16 sm:px-6 sm:py-20 lg:px-8"
        id="resumo"
      >
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <SectionHeader
            eyebrow="Resumo"
            title="Resumo inteligente do agente"
            description="A landing apresenta a proposta do produto; o painel concentra os dados operacionais gerados pelo agente."
          />

          <Card className="border-emerald-300/20 bg-[#0c151b] shadow-2xl shadow-emerald-950/30">
            <CardHeader className="gap-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <Badge className="bg-emerald-300/15 text-emerald-100">
                  Visão do produto
                </Badge>
                <span className="font-mono text-xs text-slate-500">
                  {APP_VERSION_BADGE}
                </span>
              </div>
              <div>
                <CardTitle className="text-2xl text-white">
                  O agente transforma sinais públicos em contexto acompanhado
                </CardTitle>
                <CardDescription className="mt-3 text-base leading-7 text-slate-300">
                  A proposta do PetroAgent é registrar dados, eventos e análises
                  em banco antes de exibir qualquer informação no painel. A
                  experiência é informativa, pública e sem recomendação
                  financeira.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-3">
              {["MCP-first", "Dados persistidos", "Painel operacional"].map(
                (item) => (
                  <div
                    className="rounded-lg border border-white/10 bg-white/[0.04] p-3 text-sm text-slate-300"
                    key={item}
                  >
                    {item}
                  </div>
                ),
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-5 py-16 sm:px-6 sm:py-20 lg:px-8">
        <SectionHeader
          eyebrow="Método"
          title="Como funciona"
          description="O produto evolui com agente, contratos MCP e dados persistidos antes de chegar ao painel."
        />
        <div className="mt-10 grid gap-4 md:grid-cols-4">
          {workflow.map((step, index) => {
            const Icon = step.icon;

            return (
              <Card
                className="border-white/10 bg-white/[0.035] shadow-none"
                key={step.title}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-300/12">
                      <Icon className="size-5 text-emerald-200" />
                    </div>
                    <span className="font-mono text-xs text-slate-500">
                      0{index + 1}
                    </span>
                  </div>
                  <CardTitle className="text-white">{step.title}</CardTitle>
                  <CardDescription className="leading-6 text-slate-400">
                    {step.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#091017] px-5 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-7xl" id="roadmap">
          <SectionHeader
            eyebrow="Roadmap"
            title="Roadmap do projeto"
            description="A evolução do PetroAgent está organizada em entregas pequenas, testáveis e rastreáveis."
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {roadmap.map((item) => (
              <Card
                className="border-white/10 bg-white/[0.035] shadow-none"
                key={item.title}
              >
                <CardHeader>
                  <Badge variant="outline" className="w-fit border-white/15">
                    {item.status}
                  </Badge>
                  <CardTitle className="text-2xl text-white">{item.title}</CardTitle>
                  <CardDescription className="leading-6 text-slate-400">
                    {item.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {item.items.map((roadmapItem) => (
                    <div
                      className="flex items-center gap-2 text-sm text-slate-300"
                      key={roadmapItem}
                    >
                      <ShieldCheck className="size-4 text-emerald-300" />
                      {roadmapItem}
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-5 py-16 sm:px-6 sm:py-20 lg:px-8" id="criador">
        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <SectionHeader
            eyebrow="Criador"
            title="Um projeto aberto, experimental e em evolução"
            description="PetroAgent nasce como laboratório público para transformar acompanhamento de mercado em uma experiência mais clara, visual e responsável."
          />
          <Card className="border-white/10 bg-white/[0.035] shadow-none">
            <CardHeader>
              <div className="flex size-12 items-center justify-center rounded-lg bg-emerald-300/12">
                <HeartHandshake className="size-6 text-emerald-200" />
              </div>
              <CardTitle className="text-white">Thales Campelo</CardTitle>
              <CardDescription className="leading-6 text-slate-400">
                Desenvolvimento, produto e experimentos com IA aplicada.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              <CreatorLink
                href="https://github.com/thalescampelodac"
                icon={Globe}
                label="GitHub"
              />
              <CreatorLink
                href="https://www.linkedin.com/in/thalescampelo"
                icon={Link}
                label="LinkedIn"
              />
              <CreatorLink href="https://thalescampelo.vercel.app/" icon={Globe} label="Landing profissional" />
              <CreatorLink href="https://wa.me/5532991594895?text=Olá%20vim%20pelo%20PetroAgent" icon={MessageCircle} label="WhatsApp"/>
              <PixSupport />
            </CardContent>
          </Card>
        </div>
      </section>

      <footer className="border-t border-white/10 px-5 py-8 text-sm text-slate-500 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <p>PetroAgent é informativo e experimental.</p>
          <p>Não constitui recomendação de compra, venda ou manutenção.</p>
        </div>
      </footer>
    </main>
  );
}

function PixSupport() {
  return (
    <div className="rounded-lg border border-dashed border-emerald-300/25 bg-emerald-300/5 p-4 sm:col-span-2">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex size-28 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-white p-2">
          <Image
            alt="QR Code Pix para apoiar o PetroAgent"
            className="size-full object-contain"
            height={600}
            loading="lazy"
            src={staticPix.qrCodeImage}
            width={600}
          />
        </div>

        <div className="min-w-0 space-y-3">
          <div>
            <p className="text-sm font-medium text-white">Apoie o PetroAgent</p>
            <p className="mt-1 text-sm leading-6 text-slate-400">
              PetroAgent é um projeto independente, gratuito e experimental. Se
              os sinais, indicadores e relatórios forem úteis para você,
              considere apoiar o desenvolvimento com qualquer valor via Pix.
            </p>
          </div>
          {/* <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
              Chave Pix
            </p>
            <p className="break-all rounded-md border border-white/10 bg-black/20 px-3 py-2 font-mono text-xs text-emerald-100">
              {staticPix.key}
            </p>
            <p className="text-xs leading-5 text-slate-500">
              Recebedor: {staticPix.name} · {staticPix.city}
            </p>
          </div> */}
          <PixCopyButton pixKey={staticPix.key} />
        </div>
      </div>
    </div>
  );
}

function HeroDashboard({
  basicData,
  latestAgentUpdate,
  sentimentLabel,
}: {
  basicData: {
    change: string;
    lastPrice: string;
    sourceName: string;
    ticker: string;
  };
  latestAgentUpdate: string;
  sentimentLabel: string;
}) {
  return (
    <div className="relative min-h-[360px] sm:min-h-[420px]">
      <div className="absolute inset-x-4 top-4 h-56 rounded-[2rem] border border-emerald-300/20 bg-emerald-300/10 blur-3xl" />
      <Card className="relative overflow-hidden border-white/10 bg-[#0b1218]/90 shadow-2xl shadow-black/50 backdrop-blur">
        <CardHeader className="border-b border-white/10">
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle className="text-white">Painel PETR4</CardTitle>
            </div>
            <Badge className="bg-emerald-300/15 text-emerald-100">
              Radar ativo
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-5 p-5">
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              ["Cotação", basicData.lastPrice],
              ["Variação", basicData.change],
              ["Sentimento", sentimentLabel],
            ].map(([label, value]) => (
              <div className="rounded-lg bg-white/[0.04] p-3" key={label}>
                <p className="text-xs text-slate-500">{label}</p>
                <p className="mt-2 font-mono text-lg text-white">{value}</p>
              </div>
            ))}
          </div>

          <div className="rounded-lg border border-white/10 bg-black/20 p-4">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-medium text-white">Sinais da semana</p>
              <Sparkles className="size-4 text-emerald-200" />
            </div>
            <div className="flex h-28 items-end gap-2 sm:h-32">
              {[42, 64, 51, 78, 58, 86, 72, 92, 69, 83, 75, 88].map(
                (height, index) => (
                  <div
                    className="flex-1 rounded-t bg-gradient-to-t from-emerald-500/35 to-emerald-200"
                    key={`${height}-${index}`}
                    style={{ height: `${height}%` }}
                  />
                ),
              )}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Signal label="Fonte" value={basicData.sourceName} />
            <Signal label="Última atualização" value={latestAgentUpdate} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="max-w-3xl">
      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-200">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-3xl font-semibold leading-tight text-white sm:text-4xl">
        {title}
      </h2>
      <p className="mt-4 text-base leading-7 text-slate-400">{description}</p>
    </div>
  );
}

function Signal({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.04] p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-2 text-sm text-slate-200">{value}</p>
    </div>
  );
}

function CreatorLink({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <a
      className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.04] p-3 text-sm text-slate-200 transition hover:border-emerald-300/35 hover:text-white"
      href={href}
    >
      <Icon className="size-4 text-emerald-200" />
      {label}
    </a>
  );
}
