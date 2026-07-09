import Link from "next/link";

import { APP_NAME } from "@/constants";
import { cn } from "@/utils/cn";

const ACTIVE_COMPANY = "Influence Publicidade";

const SIDEBAR_ITEMS = [
  { label: "Home", href: "/", active: true },
  { label: "Clientes", href: "/agency-workspace", active: false },
  { label: "Projetos", href: "#", active: false },
  { label: "Agenda", href: "#", active: false },
  { label: "Samuel", href: "/samuel-ai", active: false },
  { label: "Configurações", href: "#", active: false },
] as const;

const SUMMARY_CARDS = [
  { label: "Clientes", value: 0 },
  { label: "Projetos", value: 0 },
  { label: "Oportunidades", value: 0 },
  { label: "Company Brains", value: 0 },
] as const;

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "Bom dia";
  if (hour >= 12 && hour < 18) return "Boa tarde";
  return "Boa noite";
}

export function ExecutiveHome() {
  const greeting = getGreeting();

  return (
    <div className="relative flex min-h-dvh flex-col xl:h-dvh xl:overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_40%_at_50%_-10%,rgba(59,130,246,0.12),transparent_55%)]"
      />

      <header className="relative z-30 shrink-0 border-b border-white/[0.06] bg-black/40 backdrop-blur-xl">
        <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-4">
            <div className="flex size-10 items-center justify-center rounded-xl border border-accent/30 bg-accent/10 text-xs font-bold text-accent">
              SF
            </div>
            <div>
              <p className="text-sm font-semibold tracking-tight text-foreground">{APP_NAME}</p>
              <p className="mt-0.5 text-xs text-muted">{ACTIVE_COMPANY}</p>
            </div>
          </div>
          <p className="text-sm text-muted">{greeting}</p>
        </div>
      </header>

      <div className="relative z-10 flex min-h-0 flex-1 overflow-hidden">
        <aside className="hidden w-56 shrink-0 overflow-y-auto border-r border-white/[0.06] bg-black/20 lg:block">
          <nav className="flex flex-col gap-1 p-4">
            {SIDEBAR_ITEMS.map((item) =>
              item.href === "#" ? (
                <span
                  key={item.label}
                  className="rounded-lg px-3 py-2 text-sm text-muted/60"
                  title="Em breve"
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  key={item.label}
                  href={item.href}
                  className={cn(
                    "rounded-lg px-3 py-2 text-sm transition-colors",
                    item.active
                      ? "bg-accent/15 text-accent"
                      : "text-muted hover:bg-white/[0.04] hover:text-foreground",
                  )}
                >
                  {item.label}
                </Link>
              ),
            )}
          </nav>
        </aside>

        <main className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="mx-auto flex max-w-5xl flex-col gap-6">
            <section className="space-y-2">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                Bem-vindo ao Samuel.
              </h1>
              <p className="text-lg text-muted sm:text-xl">Seu Executivo Digital.</p>
            </section>

            <section className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 backdrop-blur-sm sm:p-6">
              <p className="text-sm leading-relaxed text-foreground sm:text-base">
                Hoje vamos começar construindo o Supercérebro da sua empresa.
              </p>
              <p className="mt-3 text-sm text-muted">
                Próximo passo recomendado:{" "}
                <span className="text-foreground">Cadastrar o primeiro cliente.</span>
              </p>
              <Link
                href="/agency-workspace"
                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
              >
                <span aria-hidden="true">➕</span>
                Novo Cliente
              </Link>
            </section>

            <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {SUMMARY_CARDS.map((card) => (
                <div
                  key={card.label}
                  className="rounded-xl border border-white/[0.06] bg-black/20 p-4"
                >
                  <p className="text-[10px] font-medium uppercase tracking-wider text-muted">
                    {card.label}
                  </p>
                  <p className="mt-2 text-3xl font-semibold text-foreground">{card.value}</p>
                </div>
              ))}
            </section>

            <section className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 backdrop-blur-sm sm:p-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">
                Samuel
              </p>
              <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted sm:text-base">
                <p>Olá.</p>
                <p>Sou o Samuel.</p>
                <p>Vou ajudá-lo a administrar sua empresa.</p>
                <p>Começaremos cadastrando seu primeiro cliente.</p>
                <p>Depois construiremos o Company Brain dessa empresa.</p>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
