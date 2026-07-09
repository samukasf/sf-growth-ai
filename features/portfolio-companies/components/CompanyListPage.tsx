"use client";

import Link from "next/link";
import {
  Building2,
  Calendar,
  FolderKanban,
  Home,
  Settings,
  Sparkles,
} from "lucide-react";

import { APP_NAME } from "@/constants";
import { DsBadge, DsCard, DsSidebar, DsTopNavigation, type DsSidebarItem } from "@/components/design-system";
import type { PortfolioCompanyRecord } from "@/features/executive-home/actions/create-company.action";

const ACTIVE_AGENCY = "Influence Publicidade";
const ICON_SIZE = 18;
const ICON_STROKE = 2;

function portfolioSidebar(active: "home" | "companies"): DsSidebarItem[] {
  return [
    {
      id: "home",
      label: "Home",
      href: "/",
      active: active === "home",
      icon: <Home size={ICON_SIZE} strokeWidth={ICON_STROKE} />,
    },
    {
      id: "companies",
      label: "Empresas",
      href: "/empresas",
      active: active === "companies",
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

type PortfolioShellProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
};

export function PortfolioShell({ title, subtitle, children }: PortfolioShellProps) {
  return (
    <div className="ds-root flex min-h-dvh bg-[var(--ds-background)]">
      <DsSidebar
        title={APP_NAME}
        subtitle={ACTIVE_AGENCY}
        items={portfolioSidebar("companies")}
        className="hidden lg:flex"
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <DsTopNavigation brand={<BrandLogo />} title={title} subtitle={subtitle} />
        <main className="ds-container flex-1 overflow-y-auto py-8">{children}</main>
      </div>
    </div>
  );
}

type CompanyListPageProps = {
  companies: PortfolioCompanyRecord[];
};

function brainBadge(status: PortfolioCompanyRecord["brain_status"]) {
  return status === "active" ? (
    <DsBadge variant="success">Company Brain Ativo</DsBadge>
  ) : (
    <DsBadge variant="warning">Aguardando ativação</DsBadge>
  );
}

export function CompanyListPage({ companies }: CompanyListPageProps) {
  return (
    <PortfolioShell title="Empresas" subtitle="Lista de empresas cadastradas">
      <div className="mx-auto flex max-w-4xl flex-col gap-6">
        <div>
          <h1 className="ds-title text-[var(--ds-text)]">Empresas</h1>
          <p className="mt-2 text-sm text-[var(--ds-text-muted)]">
            Selecione uma empresa para abrir o dashboard e ativar o Company Brain.
          </p>
        </div>

        {companies.length === 0 ? (
          <DsCard padding="lg">
            <p className="text-sm text-[var(--ds-text-muted)]">Nenhuma empresa cadastrada.</p>
            <Link href="/" className="mt-4 inline-block text-sm text-[var(--ds-primary)] hover:underline">
              Voltar para Home
            </Link>
          </DsCard>
        ) : (
          <ul className="flex flex-col gap-3">
            {companies.map((company) => (
              <li key={company.id}>
                <Link href={`/empresas/${company.id}`}>
                  <DsCard
                    padding="lg"
                    className="transition-shadow hover:shadow-[var(--ds-shadow-md)]"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <p className="text-base font-semibold text-[var(--ds-text)]">{company.name}</p>
                        <p className="mt-1 text-sm text-[var(--ds-text-muted)]">
                          {[company.industry, company.city].filter(Boolean).join(" · ") || "—"}
                        </p>
                      </div>
                      {brainBadge(company.brain_status ?? "inactive")}
                    </div>
                  </DsCard>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </PortfolioShell>
  );
}
