"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
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

import {
  listPortfolioCompaniesAction,
  type PortfolioCompanyRecord,
} from "../actions/create-company.action";
import { CreateCompanyModal } from "./CreateCompanyModal";

const ACTIVE_COMPANY = "Influence Publicidade";

const ICON_SIZE = 18;
const ICON_STROKE = 2;

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

function companyHint(count: number, empty: string, singular: string, plural: string): string {
  if (count === 0) return empty;
  if (count === 1) return singular;
  return plural.replace("{count}", String(count));
}

type FirstStepStatus = "completed" | "current" | "pending";

function getFirstSteps(
  hasCompanies: boolean,
  hasActiveBrain: boolean,
): Array<{ label: string; status: FirstStepStatus }> {
  return [
    {
      label: "Criar primeira empresa",
      status: hasCompanies ? "completed" : "current",
    },
    {
      label: "Ativar Company Brain",
      status: hasActiveBrain ? "completed" : hasCompanies ? "current" : "pending",
    },
    { label: "Executar Discovery", status: "pending" },
    { label: "Gerar Assessment", status: "pending" },
    { label: "Primeira conversa com Samuel", status: "pending" },
  ];
}

function FirstStepsTimeline({
  hasCompanies,
  hasActiveBrain,
}: {
  hasCompanies: boolean;
  hasActiveBrain: boolean;
}) {
  const steps = getFirstSteps(hasCompanies, hasActiveBrain);

  return (
    <DsCard padding="lg" className="xl:sticky xl:top-6">
      <h2 className="ds-heading text-[var(--ds-text)]">Primeiros Passos</h2>
      <ol className="mt-5 space-y-4">
        {steps.map((step) => (
          <li key={step.label} className="flex items-start gap-3">
            <span
              className={cn(
                "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                step.status === "completed" && "bg-[var(--ds-success)] text-[var(--ds-text-inverse)]",
                step.status === "current" &&
                  "border-2 border-[var(--ds-primary)] text-[var(--ds-primary)]",
                step.status === "pending" &&
                  "border border-[var(--ds-border)] text-[var(--ds-text-subtle)]",
              )}
              aria-hidden="true"
            >
              {step.status === "completed" ? "✓" : "○"}
            </span>
            <span
              className={cn(
                "text-sm leading-relaxed",
                step.status === "pending"
                  ? "text-[var(--ds-text-muted)]"
                  : "font-medium text-[var(--ds-text)]",
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

function CompanyList({ companies }: { companies: PortfolioCompanyRecord[] }) {
  if (companies.length === 0) return null;

  return (
    <DsCard padding="lg">
      <h2 className="ds-heading text-[var(--ds-text)]">Empresas cadastradas</h2>
      <ul className="mt-4 divide-y divide-[var(--ds-border)]">
        {companies.map((company) => (
          <li key={company.id}>
            <Link
              href={`/empresas/${company.id}`}
              className="flex items-center justify-between gap-4 py-3 first:pt-0 transition-colors hover:bg-[var(--ds-surface-muted)]/50 -mx-2 px-2 rounded-[var(--ds-radius-md)]"
            >
              <div>
                <p className="text-sm font-medium text-[var(--ds-text)]">{company.name}</p>
                <p className="text-xs text-[var(--ds-text-muted)]">
                  {[company.industry, company.city].filter(Boolean).join(" · ") || "—"}
                </p>
              </div>
              <span className="text-xs text-[var(--ds-primary)]">Abrir dashboard →</span>
            </Link>
          </li>
        ))}
      </ul>
    </DsCard>
  );
}

export function ExecutiveHome({
  initialCompanies = [],
}: {
  initialCompanies?: PortfolioCompanyRecord[];
}) {
  const greeting = getGreeting();
  const [companies, setCompanies] = useState<PortfolioCompanyRecord[]>(initialCompanies);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const companyCount = companies.length;
  const activeBrainCount = companies.filter((c) => c.brain_status === "active").length;
  const hasCompanies = companyCount > 0;
  const hasActiveBrain = activeBrainCount > 0;
  const samuelHref =
    companies.find((company) => company.operational_company_id)?.operational_company_id
      ? `/samuel-ai?companyId=${companies.find((company) => company.operational_company_id)!.operational_company_id}`
      : "/samuel-ai";

  const sidebarItems: DsSidebarItem[] = [
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
      href: "/empresas",
      icon: <Building2 size={ICON_SIZE} strokeWidth={ICON_STROKE} />,
    },
    {
      id: "samuel",
      label: "Samuel",
      href: samuelHref,
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

  const refreshCompanies = useCallback(async () => {
    try {
      const data = await listPortfolioCompaniesAction();
      setCompanies(data);
      setLoadError(null);
    } catch (cause) {
      setLoadError(cause instanceof Error ? cause.message : "Não foi possível carregar empresas.");
    }
  }, []);

  const openModal = () => setIsModalOpen(true);

  return (
    <div className="ds-root flex min-h-dvh bg-[var(--ds-background)]">
      <DsSidebar
        title={APP_NAME}
        subtitle={ACTIVE_COMPANY}
        items={sidebarItems}
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
              <h1 className="ds-title text-[var(--ds-text)]">{greeting}, Samuel.</h1>
              <p className="max-w-2xl text-base leading-relaxed text-[var(--ds-text-muted)]">
                Seu Executivo Digital preparou seu resumo de hoje.
              </p>
            </section>

            {loadError ? (
              <p className="text-sm text-[var(--ds-danger)]">{loadError}</p>
            ) : null}

            <section className="ds-grid ds-grid-4">
              <DsStatCard
                label="Clientes"
                value={companyCount}
                hint={companyHint(
                  companyCount,
                  "Nenhuma empresa cadastrada.",
                  "1 empresa cadastrada.",
                  "{count} empresas cadastradas.",
                )}
              />
              <DsStatCard
                label="Projetos"
                value={0}
                hint="Nenhum projeto ativo."
              />
              <DsStatCard
                label="Oportunidades"
                value={0}
                hint="Nenhuma oportunidade identificada."
              />
              <DsStatCard
                label="Company Brains"
                value={activeBrainCount}
                hint={
                  activeBrainCount === 0
                    ? "Nenhum Supercérebro ativo."
                    : activeBrainCount === 1
                      ? "1 Supercérebro ativo."
                      : `${activeBrainCount} Supercérebros ativos.`
                }
              />
            </section>

            <CompanyList companies={companies} />

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_280px] xl:items-start">
              <div className="flex flex-col gap-6">
                <DsCard
                  padding="lg"
                  className="border-[var(--ds-primary)]/20 bg-[var(--ds-primary-soft)]/40"
                >
                  <p className="ds-caption text-[var(--ds-primary)]">Samuel</p>
                  <div className="mt-4 space-y-3">
                    <p className="ds-body-sm leading-relaxed text-[var(--ds-text)]">Olá, Samuel.</p>
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
                    <DsButton size="lg" onClick={openModal}>
                      Criar primeira empresa
                    </DsButton>
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
                  <DsButton onClick={openModal}>Criar primeira empresa</DsButton>
                </DsCard>
              </div>

              <FirstStepsTimeline hasCompanies={hasCompanies} hasActiveBrain={hasActiveBrain} />
            </div>
          </div>
        </main>
      </div>

      <CreateCompanyModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaved={() => void refreshCompanies()}
      />
    </div>
  );
}
