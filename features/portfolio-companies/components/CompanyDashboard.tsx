"use client";

import { useState, useTransition } from "react";
import Link from "next/link";

import { DsBadge, DsButton, DsCard } from "@/components/design-system";
import { cn } from "@/utils/cn";
import type { PortfolioCompanyRecord } from "@/features/executive-home/actions/create-company.action";

import { activateCompanyBrainAction } from "../actions/company-brain.action";

const ACTIVATION_STEPS = [
  "Criando Company Brain",
  "Criando Executive Memory",
  "Criando Executive Timeline",
  "Criando Executive Workspace",
  "Criando Executive Council",
] as const;

type ModalPhase = "confirm" | "progress" | "complete";

type ActivateBrainModalProps = {
  open: boolean;
  companyName: string;
  companyId: string;
  onClose: () => void;
  onActivated: (company: PortfolioCompanyRecord) => void;
};

function formatActivationDate(iso: string): string {
  return new Date(iso).toLocaleString("pt-PT", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ActivateBrainModal({
  open,
  companyName,
  companyId,
  onClose,
  onActivated,
}: ActivateBrainModalProps) {
  const [phase, setPhase] = useState<ModalPhase>("confirm");
  const [completedSteps, setCompletedSteps] = useState(0);
  const [activatedCompany, setActivatedCompany] = useState<PortfolioCompanyRecord | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!open) return null;

  const handleClose = () => {
    setPhase("confirm");
    setCompletedSteps(0);
    setActivatedCompany(null);
    setError(null);
    onClose();
  };

  const runActivation = () => {
    setPhase("progress");
    setCompletedSteps(0);
    setError(null);

    ACTIVATION_STEPS.forEach((_, index) => {
      window.setTimeout(() => {
        setCompletedSteps(index + 1);
      }, (index + 1) * 500);
    });

    window.setTimeout(() => {
      startTransition(async () => {
        try {
          const company = await activateCompanyBrainAction(companyId);
          setActivatedCompany(company);
          setPhase("complete");
          onActivated(company);
        } catch (cause) {
          setError(cause instanceof Error ? cause.message : "Não foi possível ativar o Company Brain.");
          setPhase("confirm");
        }
      });
    }, ACTIVATION_STEPS.length * 500 + 300);
  };

  return (
    <div className="ds-root ds-modal-overlay" role="dialog" aria-modal="true">
      <div className="ds-modal-panel w-full max-w-lg">
        {phase === "confirm" ? (
          <>
            <div className="border-b border-[var(--ds-border)] px-6 py-5">
              <h2 className="ds-heading">Ativar Company Brain</h2>
              <p className="mt-3 ds-body-sm leading-relaxed text-[var(--ds-text-muted)]">
                Você está prestes a criar o Supercérebro de{" "}
                <span className="font-medium text-[var(--ds-text)]">{companyName}</span>.
              </p>
              <p className="mt-3 ds-body-sm leading-relaxed text-[var(--ds-text-muted)]">
                Isso preparará toda a estrutura necessária para que o Samuel conheça, acompanhe e
                ajude esta organização.
              </p>
            </div>
            {error ? <p className="px-6 pt-4 text-sm text-[var(--ds-danger)]">{error}</p> : null}
            <div className="flex justify-end gap-2 border-t border-[var(--ds-border)] px-6 py-4">
              <DsButton variant="secondary" onClick={handleClose} disabled={isPending}>
                Cancelar
              </DsButton>
              <DsButton onClick={runActivation} disabled={isPending}>
                Ativar Company Brain
              </DsButton>
            </div>
          </>
        ) : null}

        {phase === "progress" ? (
          <div className="px-6 py-6">
            <h2 className="ds-heading">Ativando Company Brain</h2>
            <p className="mt-2 ds-body-sm text-[var(--ds-text-muted)]">{companyName}</p>
            <ol className="mt-6 space-y-3">
              {ACTIVATION_STEPS.map((step, index) => {
                const done = completedSteps > index;
                return (
                  <li key={step} className="flex items-center gap-3">
                    <span
                      className={cn(
                        "flex size-5 items-center justify-center rounded-full text-xs font-semibold",
                        done
                          ? "bg-[var(--ds-success)] text-[var(--ds-text-inverse)]"
                          : "border border-[var(--ds-border)] text-[var(--ds-text-subtle)]",
                      )}
                    >
                      {done ? "✓" : "○"}
                    </span>
                    <span
                      className={cn(
                        "text-sm",
                        done ? "font-medium text-[var(--ds-text)]" : "text-[var(--ds-text-muted)]",
                      )}
                    >
                      {step}
                    </span>
                  </li>
                );
              })}
            </ol>
          </div>
        ) : null}

        {phase === "complete" && activatedCompany ? (
          <>
            <div className="px-6 py-6">
              <div className="flex items-center gap-2">
                <span aria-hidden="true">🟢</span>
                <h2 className="ds-heading text-[var(--ds-success)]">Company Brain Ativo</h2>
              </div>
              <dl className="mt-6 space-y-4">
                <div>
                  <dt className="ds-caption">Empresa</dt>
                  <dd className="mt-1 text-sm font-medium text-[var(--ds-text)]">
                    {activatedCompany.name}
                  </dd>
                </div>
                <div>
                  <dt className="ds-caption">Data de ativação</dt>
                  <dd className="mt-1 text-sm text-[var(--ds-text)]">
                    {activatedCompany.brain_activated_at
                      ? formatActivationDate(activatedCompany.brain_activated_at)
                      : "—"}
                  </dd>
                </div>
                <div>
                  <dt className="ds-caption">Status</dt>
                  <dd className="mt-2">
                    <DsBadge variant="success">Ativo</DsBadge>
                  </dd>
                </div>
              </dl>
            </div>
            <div className="flex justify-end border-t border-[var(--ds-border)] px-6 py-4">
              <DsButton onClick={handleClose}>Concluir</DsButton>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

type CompanyDashboardProps = {
  company: PortfolioCompanyRecord;
};

export function CompanyDashboard({ company: initialCompany }: CompanyDashboardProps) {
  const [company, setCompany] = useState(initialCompany);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isActive = (company.brain_status ?? "inactive") === "active";

  return (
    <>
      <div className="mx-auto flex max-w-4xl flex-col gap-6">
        <Link href="/empresas" className="w-fit text-sm text-[var(--ds-primary)] hover:underline">
          ← Voltar à lista
        </Link>

        <div>
          <h1 className="ds-title text-[var(--ds-text)]">{company.name}</h1>
          <p className="mt-2 text-sm text-[var(--ds-text-muted)]">
            Dashboard da empresa · {company.industry}
          </p>
        </div>

        <DsCard padding="lg">
          <h2 className="ds-heading">Company Brain</h2>
          {isActive ? (
            <div className="mt-4 space-y-4">
              <div className="flex items-center gap-2">
                <span aria-hidden="true">🟢</span>
                <p className="text-sm font-semibold text-[var(--ds-success)]">Company Brain Ativo</p>
              </div>
              <dl className="grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="ds-caption">Data de ativação</dt>
                  <dd className="mt-1 text-sm text-[var(--ds-text)]">
                    {company.brain_activated_at
                      ? formatActivationDate(company.brain_activated_at)
                      : "—"}
                  </dd>
                </div>
                <div>
                  <dt className="ds-caption">Status</dt>
                  <dd className="mt-2">
                    <DsBadge variant="success">Ativo</DsBadge>
                  </dd>
                </div>
              </dl>
            </div>
          ) : (
            <div className="mt-4 flex flex-col gap-4">
              <p className="ds-body-sm text-[var(--ds-text-muted)]">
                O Supercérebro ainda não foi ativado para esta empresa.
              </p>
              <DsButton size="lg" onClick={() => setIsModalOpen(true)}>
                <span aria-hidden="true">🧠</span>
                Ativar Company Brain
              </DsButton>
            </div>
          )}
        </DsCard>

        <DsCard padding="lg">
          <h2 className="ds-heading">Informações</h2>
          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="ds-caption">Cidade</dt>
              <dd className="mt-1 text-sm text-[var(--ds-text)]">{company.city ?? "—"}</dd>
            </div>
            <div>
              <dt className="ds-caption">País</dt>
              <dd className="mt-1 text-sm text-[var(--ds-text)]">{company.country ?? "—"}</dd>
            </div>
            <div>
              <dt className="ds-caption">Responsável</dt>
              <dd className="mt-1 text-sm text-[var(--ds-text)]">{company.responsible_name ?? "—"}</dd>
            </div>
            <div>
              <dt className="ds-caption">Email</dt>
              <dd className="mt-1 text-sm text-[var(--ds-text)]">{company.email ?? "—"}</dd>
            </div>
          </dl>
        </DsCard>
      </div>

      <ActivateBrainModal
        open={isModalOpen}
        companyId={company.id}
        companyName={company.name}
        onClose={() => setIsModalOpen(false)}
        onActivated={setCompany}
      />
    </>
  );
}
