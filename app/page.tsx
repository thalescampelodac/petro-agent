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
  Zap,
} from "lucide-react";
import type { ComponentType } from "react";

import { LikeButton } from "@/components/landing/like-button";
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
    status: "Em construção",
    description:
      "Landing page, painel Petrobras, curtidas públicas, banco de conhecimento e primeiros resumos mockados.",
    items: ["Portal público", "Painel PETR4", "Interação sem cadastro"],
  },
  {
    title: "MVP 2",
    status: "Planejado",
    description:
      "Camada MCP para agentes consultarem relatórios, eventos, snapshots e memória do PetroAgent.",
    items: ["Tools MCP", "Memória consultável", "Arquitetura multiagente"],
  },
];

export default function Home() {
  return (
    <main className="dark min-h-screen overflow-hidden bg-[#070b10] text-foreground">
      <section className="relative border-b border-white/10">
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(16,185,129,0.18),transparent_32%),radial-gradient(circle_at_78%_18%,rgba(59,130,246,0.18),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.04),transparent)]" />
        <a
          className="absolute left-1/2 top-9 z-20 -translate-x-1/2 text-sm text-emerald-100/75 transition hover:text-emerald-100"
          href="#criador"
        >
          Criador
        </a>
        <div className="absolute right-6 top-6 z-20 sm:right-8 sm:top-8">
          <LikeButton />
        </div>
        <div className="relative mx-auto grid min-h-[92vh] w-full max-w-7xl gap-10 px-6 py-8 sm:py-10 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:px-8">
          <div className="flex flex-col gap-8">
            <nav className="pr-44 sm:pr-72">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg border border-emerald-300/30 bg-emerald-300/15">
                  <Radar className="size-5 text-emerald-200" />
                </div>
                <span className="text-sm font-semibold tracking-wide text-white">
                  PetroAgent
                </span>
              </div>
            </nav>

            <div className="space-y-6">
              <div className="flex flex-wrap gap-3">
                <Badge className="border-emerald-300/30 bg-emerald-300/10 text-emerald-100">
                  Radar Petrobras/PETR4
                </Badge>
                <Badge variant="outline" className="border-white/15 text-white/70">
                  MVP 1 em andamento
                </Badge>
              </div>

              <div className="space-y-5">
                <h1 className="max-w-4xl text-5xl font-semibold leading-[1.02] text-white sm:text-6xl lg:text-7xl">
                  Um agente inteligente acompanhando Petrobras para você.
                </h1>
                <p className="max-w-2xl text-lg leading-8 text-slate-300">
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
                  href="#resumo"
                >
                  Ver resumo do agente
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

            <div className="grid max-w-2xl grid-cols-3 gap-3">
              {[
                ["6", "sinais monitorados"],
                ["0", "recomendações financeiras"],
                ["24h", "radar preparado"],
              ].map(([value, label]) => (
                <div
                  className="rounded-lg border border-white/10 bg-white/[0.04] p-4"
                  key={label}
                >
                  <p className="font-mono text-2xl text-white">{value}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-400">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <HeroDashboard />
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-6 py-20 lg:px-8">
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
        className="border-y border-white/10 bg-white/[0.025] px-6 py-20 lg:px-8"
        id="resumo"
      >
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <SectionHeader
            eyebrow="Resumo mockado"
            title="Resumo inteligente do agente"
            description="Conteúdo simulado para validar experiência, tom e estrutura antes de conectar dados reais."
          />

          <Card className="border-emerald-300/20 bg-[#0c151b] shadow-2xl shadow-emerald-950/30">
            <CardHeader className="gap-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <Badge className="bg-emerald-300/15 text-emerald-100">
                  Simulação
                </Badge>
                <span className="font-mono text-xs text-slate-500">
                  Atualizado: 19/05/2026
                </span>
              </div>
              <div>
                <CardTitle className="text-2xl text-white">
                  O agente observou uma sessão de atenção moderada
                </CardTitle>
                <CardDescription className="mt-3 text-base leading-7 text-slate-300">
                  PETR4 segue no radar por combinação de notícias setoriais,
                  expectativa sobre dividendos e comunicados corporativos. A
                  leitura é informativa: vale acompanhar os próximos eventos e
                  diferenciar fato publicado de interpretação de mercado.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-3">
              {["Sentimento neutro", "Dividendos em foco", "Sem dado real"].map(
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

      <section className="mx-auto w-full max-w-7xl px-6 py-20 lg:px-8">
        <SectionHeader
          eyebrow="Método"
          title="Como funciona"
          description="O MVP começa simples, com dados mockados e arquitetura preparada para evoluir."
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

      <section className="border-y border-white/10 bg-[#091017] px-6 py-20 lg:px-8">
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

      <section className="mx-auto w-full max-w-7xl px-6 py-20 lg:px-8" id="criador">
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
                href="https://www.linkedin.com/in/thalescampelodac"
                icon={Link}
                label="LinkedIn"
              />
              <CreatorLink href="#" icon={Globe} label="Landing profissional" />
              <CreatorLink href="mailto:contato@petroagent.dev" icon={Zap} label="Contato" />
              <div className="rounded-lg border border-dashed border-emerald-300/25 bg-emerald-300/5 p-4 sm:col-span-2">
                <p className="text-sm font-medium text-white">QRCode PIX futuro</p>
                <p className="mt-1 text-sm leading-6 text-slate-400">
                  Espaço reservado para apoio opcional, sem paywall e sem
                  promessa de benefício financeiro.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <footer className="border-t border-white/10 px-6 py-8 text-sm text-slate-500 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <p>PetroAgent é informativo e experimental.</p>
          <p>Não constitui recomendação de compra, venda ou manutenção.</p>
        </div>
      </footer>
    </main>
  );
}

function HeroDashboard() {
  return (
    <div className="relative min-h-[520px]">
      <div className="absolute inset-x-4 top-4 h-56 rounded-[2rem] border border-emerald-300/20 bg-emerald-300/10 blur-3xl" />
      <Card className="relative overflow-hidden border-white/10 bg-[#0b1218]/90 shadow-2xl shadow-black/50 backdrop-blur">
        <CardHeader className="border-b border-white/10">
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle className="text-white">Painel PETR4</CardTitle>
              <CardDescription className="text-slate-400">
                Preview visual com dados demonstrativos
              </CardDescription>
            </div>
            <Badge className="bg-emerald-300/15 text-emerald-100">
              Radar ativo
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-5 p-5">
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              ["Ticker", "PETR4"],
              ["Sentimento", "Neutro"],
              ["Fonte", "Mock"],
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
            <div className="flex h-36 items-end gap-2">
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
            <Signal label="Dividendos" value="Em observação" />
            <Signal label="Fatos relevantes" value="Sem alerta crítico" />
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
