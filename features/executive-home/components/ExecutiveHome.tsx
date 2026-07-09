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

const ACTIVE_COMPANY = "Influence Publicidade";

const SIDEBAR_ITEMS: DsSidebarItem[] = [
  { id: "home", label: "Home", href: "/", active: true },
  { id: "clients", label: "Clientes", href: "/agency-workspace" },
  { id: "projects", label: "Projetos", disabled: true },
  { id: "calendar", label: "Agenda", disabled: true },
  { id: "samuel", label: "Samuel", href: "/samuel-ai" },
  { id: "settings", label: "Configurações", disabled: true },
];

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

function BrandLogo() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-[var(--ds-radius-lg)] bg-[var(--ds-primary-soft)] text-xs font-bold text-[var(--ds-primary)]">
        SF
      </div>
      <span className="hidden text-sm font-semibold text-[var(--ds-text)] sm:inline">{APP_NAME}</span>
    </div>
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

        <main className="ds-container flex-1 overflow-y-auto py-6">
          <div className="mx-auto flex max-w-5xl flex-col gap-6">
            <section className="ds-stack-2">
              <p className="ds-body-sm text-[var(--ds-text-muted)]">
                {greeting}, Samuel.
              </p>
              <h1 className="ds-display text-[var(--ds-text)]">Bem-vindo ao Samuel.</h1>
              <p className="text-xl text-[var(--ds-text-muted)]">Seu Executivo Digital.</p>
            </section>

            <section className="ds-grid ds-grid-4">
              {SUMMARY_CARDS.map((card) => (
                <DsStatCard key={card.label} label={card.label} value={card.value} />
              ))}
            </section>

            <DsCard padding="lg" className="flex flex-col gap-4">
              <h2 className="ds-heading text-[var(--ds-text)]">
                Comece criando seu primeiro cliente.
              </h2>
              <a href="/agency-workspace" className="w-fit">
                <DsButton size="lg">
                  <span aria-hidden="true">➕</span>
                  Novo Cliente
                </DsButton>
              </a>
            </DsCard>

            <DsCard padding="lg">
              <p className="ds-caption text-[var(--ds-primary)]">Samuel</p>
              <div className="ds-stack-3 mt-4 text-[var(--ds-text-muted)]">
                <p className="ds-body-sm">Olá.</p>
                <p className="ds-body-sm">Sou o Samuel.</p>
                <p className="ds-body-sm">Vou ajudá-lo a administrar sua empresa.</p>
                <p className="ds-body-sm">Começaremos criando o primeiro Company Brain.</p>
              </div>
            </DsCard>
          </div>
        </main>
      </div>
    </div>
  );
}
