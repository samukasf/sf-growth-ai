import {
  Building2,
  Calendar,
  FolderKanban,
  Home,
  Settings,
  Sparkles,
} from "lucide-react";

import { APP_NAME } from "@/constants";
import {
  DsAvatar,
  DsButton,
  DsCard,
  DsSidebar,
  DsStatCard,
  DsTopNavigation,
  type DsSidebarItem,
} from "@/components/design-system";
import { cn } from "@/utils/cn";

const ACTIVE_COMPANY = "Influence Publicidade";
const CREATE_COMPANY_HREF = "/agency-workspace";

const ICON_SIZE = 18;
const ICON_STROKE = 2;

const SIDEBAR_ITEMS: DsSidebarItem[] = [
  {
    id: "home",
    label: "Home",
    href: "/",
    active: true,
    icon: <Home size={ICON_SIZE} strokeWidth={ICON_STROKE} />,
  },
  {
    id: "companies",
    label: "Empresas",
    href: CREATE_COMPANY_HREF,
    icon: <Building2 size={ICON_SIZE} strokeWidth={ICON_STROKE} />,
  },
  {
    id: "samuel",
    label: "Samuel",
    href: "/samuel-ai",
    icon: <Sparkles size={ICON_SIZE} strokeWidth={ICON_STROKE} />,
  },
  {
    id: "projects",
    label: "Projetos",
    disabled: true,
    icon: <FolderKanban size={ICON_SIZE} strokeWidth={ICON_STROKE} />,
  },
  {
    id: "calendar",
    label: "Agenda",
    disabled: true,
    icon: <Calendar size={ICON_SIZE} strokeWidth={ICON_STROKE} />,
  },
  {
    id: "settings",
    label: "Configurações",
    disabled: true,
    icon: <Settings size={ICON_SIZE} strokeWidth={ICON_STROKE} />,
  },
];

const SUMMARY_CARDS = [
  { label: "Clientes", value: 0, hint: "Nenhuma empresa cadastrada." },
  { label: "Projetos", value: 0, hint: "Nenhum projeto ativo." },
  { label: "Oportunidades", value: 0, hint: "Nenhuma oportunidade identificada." },
  { label: "Company Brains", value: 0, hint: "Nenhum Supercérebro ativo." },
] as const;

const FIRST_STEPS = [
  { label: "Criar primeira empresa", status: "current" as const },
  { label: "Ativar Company Brain", status: "pending" as const },
  { label: "Executar Discovery", status: "pending" as const },
  { label: "Gerar Assessment", status: "pending" as const },
  { label: "Primeira conversa com Samuel", status: "pending" as const },
];

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "Bom dia";
  if (hour >= 12 && hour < 18) return "Boa tarde";
  return "Boa noite";
}

function BrandLogo() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-[var(--ds-radius-lg)] bg-[var(--ds-primary-soft)] text-xs font-bold text-[var(--ds-primary)]">
        SF
      </div>
      <span className="hidden text-sm font-semibold tracking-tight text-[var(--ds-text)] sm:inline">
        {APP_NAME}
      </span>
    </div>
  );
}

function CreateCompanyButton({ size = "md" }: { size?: "md" | "lg" }) {
  return (
    <a href={CREATE_COMPANY_HREF} className="w-fit">
      <DsButton size={size}>Criar primeira empresa</DsButton>
    </a>
  );
}

function FirstStepsTimeline() {
  return (
    <DsCard padding="lg" className="xl:sticky xl:top-6">
      <h2 className="ds-heading text-[var(--ds-text)]">Primeiros Passos</h2>
      <ol className="mt-5 space-y-4">
        {FIRST_STEPS.map((step) => (
          <li key={step.label} className="flex items-start gap-3">
            <span
              className={cn(
                "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                step.status === "current"
                  ? "bg-[var(--ds-primary)] text-[var(--ds-text-inverse)]"
                  : "border border-[var(--ds-border)] text-[var(--ds-text-subtle)]",
              )}
              aria-hidden="true"
            >
              {step.status === "current" ? "✓" : "○"}
            </span>
            <span
              className={cn(
                "text-sm leading-relaxed",
                step.status === "current"
                  ? "font-medium text-[var(--ds-text)]"
                  : "text-[var(--ds-text-muted)]",
              )}
            >
              {step.label}
            </span>
          </li>
        ))}
      </ol>
    </DsCard>
  );
}

export function ExecutiveHome() {
  const greeting = getGreeting();

  return (
    <div className="ds-root flex min-h-dvh bg-[var(--ds-background)]">
      <DsSidebar
        title={APP_NAME}
        subtitle={ACTIVE_COMPANY}
        items={SIDEBAR_ITEMS}
        className="hidden lg:flex"
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <DsTopNavigation
          brand={<BrandLogo />}
          title={ACTIVE_COMPANY}
          actions={<DsAvatar name="Conta" size="md" />}
        />

        <main className="ds-container flex-1 overflow-y-auto py-8">
          <div className="mx-auto flex max-w-6xl flex-col gap-8">
            <section className="space-y-2">
              <h1 className="ds-title text-[var(--ds-text)]">
                {greeting}, Samuel.
              </h1>
              <p className="max-w-2xl text-base leading-relaxed text-[var(--ds-text-muted)]">
                Seu Executivo Digital preparou seu resumo de hoje.
              </p>
            </section>

            <section className="ds-grid ds-grid-4">
              {SUMMARY_CARDS.map((card) => (
                <DsStatCard
                  key={card.label}
                  label={card.label}
                  value={card.value}
                  hint={card.hint}
                />
              ))}
            </section>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_280px] xl:items-start">
              <div className="flex flex-col gap-6">
                <DsCard
                  padding="lg"
                  className="border-[var(--ds-primary)]/20 bg-[var(--ds-primary-soft)]/40"
                >
                  <p className="ds-caption text-[var(--ds-primary)]">Samuel</p>
                  <div className="mt-4 space-y-3">
                    <p className="ds-body-sm leading-relaxed text-[var(--ds-text)]">
                      Olá, Samuel.
                    </p>
                    <p className="ds-body-sm leading-relaxed text-[var(--ds-text-muted)]">
                      Sou seu Executivo Digital.
                    </p>
                    <p className="ds-body-sm leading-relaxed text-[var(--ds-text-muted)]">
                      Vou ajudá-lo a administrar sua empresa.
                    </p>
                    <p className="ds-body-sm leading-relaxed text-[var(--ds-text-muted)]">
                      Nosso primeiro passo será cadastrar sua primeira empresa e iniciar seu
                      Company Brain.
                    </p>
                  </div>
                  <div className="mt-6">
                    <CreateCompanyButton size="lg" />
                  </div>
                </DsCard>

                <DsCard padding="lg" className="flex flex-col gap-4">
                  <div className="space-y-2">
                    <p className="ds-caption">Próximo passo recomendado</p>
                    <h2 className="ds-heading text-[var(--ds-text)]">
                      Cadastre sua primeira empresa.
                    </h2>
                    <p className="ds-body-sm leading-relaxed text-[var(--ds-text-muted)]">
                      Depois iniciaremos automaticamente o Company Brain.
                    </p>
                  </div>
                  <CreateCompanyButton />
                </DsCard>
              </div>

              <FirstStepsTimeline />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
