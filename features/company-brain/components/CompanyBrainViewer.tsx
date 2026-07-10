"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Brain, MessageCircle, Sparkles } from "lucide-react";

import {
  DsBadge,
  DsButton,
  DsCard,
  DsEmptyState,
  DsMetricCard,
  DsStatCard,
} from "@/components/design-system";
import type { CompanyBrainBuildResponse } from "@/apps/web/src/core/company-brain/company-brain.types";
import { presentCompanyBrain } from "@/apps/web/src/core/company-brain/company-brain.presenter";
import type { PortfolioCompanyRecord } from "@/features/executive-home/actions/create-company.action";
import { runCompanyDiscoveryAction } from "@/features/portfolio-companies/actions/company-brain.action";

function formatUpdatedAt(iso: string): string {
  return new Date(iso).toLocaleString("pt-PT", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const STATUS_LABELS: Record<string, string> = {
  Marketing: "Marketing",
  Financeiro: "Financeiro",
  Operacional: "Operações",
  "Presença Digital": "Digital",
};

type CompanyBrainViewerProps = {
  company: PortfolioCompanyRecord;
  initialBuildResponse: CompanyBrainBuildResponse | null;
};

export function CompanyBrainViewer({ company, initialBuildResponse }: CompanyBrainViewerProps) {
  const [buildResponse, setBuildResponse] = useState(initialBuildResponse);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleRunDiscovery = () => {
    setError(null);
    startTransition(async () => {
      try {
        const response = await runCompanyDiscoveryAction(company.id);
        setBuildResponse(response);
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Não foi possível executar o Discovery.");
      }
    });
  };

  if (!buildResponse) {
    return (
      <div className="mx-auto flex max-w-4xl flex-col gap-6">
        <Link
          href={`/empresas/${company.id}`}
          className="w-fit text-sm text-[var(--ds-primary)] hover:underline"
        >
          ← Voltar ao dashboard
        </Link>

        <DsCard padding="lg">
          <DsEmptyState
            icon={<Brain size={28} strokeWidth={1.75} />}
            title="Esta empresa ainda não possui um Company Brain."
            description="Execute o Discovery para que o Samuel comece a conhecer esta organização e construa o conhecimento estruturado."
            actionLabel={isPending ? "Executando Discovery…" : "Executar Discovery"}
            onAction={handleRunDiscovery}
          />
          {error ? <p className="mt-4 text-center text-sm text-[var(--ds-danger)]">{error}</p> : null}
        </DsCard>
      </div>
    );
  }

  const { companyBrain, summary } = buildResponse;
  const viewModel = presentCompanyBrain(companyBrain, summary);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8">
      <Link
        href={`/empresas/${company.id}`}
        className="w-fit text-sm text-[var(--ds-primary)] hover:underline"
      >
        ← Voltar ao dashboard
      </Link>

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="ds-title text-[var(--ds-text)]">{company.name}</h1>
          <p className="mt-2 text-sm text-[var(--ds-text-muted)]">{company.industry}</p>
        </div>
        <div className="flex flex-col items-start gap-2 sm:items-end">
          <DsBadge variant="success">Company Brain Ativo</DsBadge>
          <p className="text-xs text-[var(--ds-text-muted)]">
            Última atualização: {formatUpdatedAt(companyBrain.updatedAt)}
          </p>
        </div>
      </header>

      <DsCard padding="lg" className="relative overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-[var(--ds-primary)]/5"
        />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--ds-primary)]/10 text-[var(--ds-primary)]">
              <Sparkles size={22} strokeWidth={1.75} />
            </div>
            <div className="space-y-2 ds-body-sm leading-relaxed text-[var(--ds-text-muted)]">
              <p className="font-medium text-[var(--ds-text)]">Mensagem do Samuel</p>
              <p>Conheço esta empresa.</p>
              <p>Continuo aprendendo diariamente.</p>
              <p>Quanto mais conhecimento possuo, melhores serão minhas recomendações.</p>
            </div>
          </div>
          <Link href={`/empresas/${company.id}/conversa`}>
            <DsButton size="lg">
              <MessageCircle size={18} strokeWidth={1.75} />
              Conversar com Samuel
            </DsButton>
          </Link>
        </div>
      </DsCard>

      <div className="ds-grid ds-grid-3 gap-4">
        {viewModel.scores.map((score) => (
          <DsStatCard key={score.key} label={score.label} value={score.formatted} />
        ))}
      </div>

      <div className="ds-grid ds-grid-2 gap-4 lg:grid-cols-3">
        <DsCard padding="lg" className="lg:col-span-2">
          <h2 className="ds-heading">Resumo Executivo</h2>
          <p className="mt-4 ds-body-sm leading-relaxed text-[var(--ds-text-muted)]">
            {viewModel.executiveSummary}
          </p>
        </DsCard>

        {viewModel.statusAreas.map((area) => (
          <DsMetricCard
            key={area.label}
            label={STATUS_LABELS[area.label] ?? area.label}
            value={`${area.score}/100`}
            delta={area.summary}
            trend="neutral"
          />
        ))}
      </div>

      <DsCard padding="lg">
        <h2 className="ds-heading">Últimos aprendizados</h2>
        <ol className="mt-6 space-y-4">
          {viewModel.timeline.map((event) => (
            <li key={event.id} className="flex gap-4 border-b border-[var(--ds-border)] pb-4 last:border-0">
              <div className="mt-1 size-2 shrink-0 rounded-full bg-[var(--ds-primary)]" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium text-[var(--ds-text)]">{event.title}</p>
                  <span className="text-xs text-[var(--ds-text-subtle)]">
                    {formatUpdatedAt(event.occurredAt)}
                  </span>
                </div>
                <p className="mt-1 text-sm text-[var(--ds-text-muted)]">{event.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </DsCard>

      <div className="ds-grid ds-grid-3 gap-4">
        <DsCard padding="lg">
          <h2 className="ds-heading">Próximas recomendações</h2>
          <ul className="mt-4 space-y-2">
            {viewModel.recommendations.map((item) => (
              <li key={item} className="flex gap-2 text-sm text-[var(--ds-text-muted)]">
                <span aria-hidden="true" className="text-[var(--ds-primary)]">
                  →
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </DsCard>

        <DsCard padding="lg">
          <h2 className="ds-heading text-[var(--ds-danger)]">Riscos</h2>
          <ul className="mt-4 space-y-3">
            {companyBrain.openRisks.map((risk) => (
              <li key={risk} className="text-sm text-[var(--ds-text-muted)]">
                {risk}
              </li>
            ))}
          </ul>
        </DsCard>

        <DsCard padding="lg">
          <h2 className="ds-heading text-[var(--ds-success)]">Oportunidades</h2>
          <ul className="mt-4 space-y-3">
            {companyBrain.growthOpportunities.map((item) => (
              <li key={item} className="text-sm text-[var(--ds-text-muted)]">
                {item}
              </li>
            ))}
          </ul>
        </DsCard>
      </div>
    </div>
  );
}
