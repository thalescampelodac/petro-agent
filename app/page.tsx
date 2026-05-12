import { BarChart3, Database, GitBranch, Radar, ServerCog } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const foundations = [
  {
    title: "Portal publico",
    description:
      "Next.js App Router preparado para landing page, painel PETR4 e conteudo informativo.",
    icon: Radar,
  },
  {
    title: "Base de dados",
    description:
      "Supabase documentado e clientes iniciais prontos para uso quando as credenciais existirem.",
    icon: Database,
  },
  {
    title: "Deploy",
    description:
      "Estrutura compativel com Vercel, scripts npm e variaveis de ambiente mapeadas.",
    icon: ServerCog,
  },
  {
    title: "Rastreabilidade",
    description:
      "Roadmap organizado em issues e conectado ao GitHub Project oficial do PetroAgent.",
    icon: GitBranch,
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-10 sm:py-14 lg:py-16">
        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="secondary">MVP 1 / Fase 0</Badge>
            <Badge variant="outline">Fundacao tecnica</Badge>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
            <div className="space-y-5">
              <h1 className="max-w-3xl text-4xl font-semibold leading-tight sm:text-5xl">
                PetroAgent
              </h1>
              <p className="max-w-3xl text-lg leading-8 text-muted-foreground">
                Um radar informativo inteligente para acompanhar Petrobras/PETR4
                com dados publicos, registros internos e analises automatizadas,
                sem recomendacao de investimento.
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <BarChart3 className="size-5 text-primary" />
                  Status da base
                </CardTitle>
                <CardDescription>
                  Aplicacao inicial, UI, Supabase e organizacao do roadmap.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <a
                  className={buttonVariants({
                    className: "w-full",
                    size: "lg",
                  })}
                  href="https://github.com/users/thalescampelodac/projects/3"
                >
                  Ver GitHub Project
                </a>
              </CardContent>
            </Card>
          </div>
        </div>

        <Separator />

        <div className="grid gap-4 md:grid-cols-2">
          {foundations.map((item) => {
            const Icon = item.icon;

            return (
              <Card key={item.title}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Icon className="size-5 text-primary" />
                    {item.title}
                  </CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>

        <p className="max-w-4xl text-sm leading-6 text-muted-foreground">
          O PetroAgent e um projeto experimental e informativo. As informacoes
          exibidas sao geradas a partir de dados publicos, registros internos e
          processamento automatizado. Este projeto nao constitui recomendacao de
          compra, venda ou manutencao de ativos financeiros.
        </p>
      </section>
    </main>
  );
}
