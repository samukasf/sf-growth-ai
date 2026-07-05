import { cn } from "@/utils/cn";

import type { LegalExecutive } from "../services/legal-executive.service";
import { StatusBadge } from "@/features/samuel-ai/components/shared/status-badge";
import { SectionHeader } from "@/features/samuel-ai/components/section-header";

type LegalExecutiveSummarySectionProps = {
  legal: LegalExecutive | null;
};

function ScoreTile({ label, score }: { label: string; score: number }) {
  return (
    <div className="rounded-lg border border-border/60 bg-black/10 px-3 py-2.5">
      <p className="text-[10px] font-medium uppercase tracking-wider text-muted">{label}</p>
      <p className="mt-1 text-lg font-semibold text-foreground">
        {score}
        <span className="text-xs text-muted">/100</span>
      </p>
      <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-black/20">
        <div className="h-full rounded-full bg-accent" style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

function InsightList({
  title,
  items,
  accent,
}: {
  title: string;
  items: Array<{ id: string; title: string; description: string }>;
  accent: string;
}) {
  return (
    <div>
      <p className={cn("mb-2 text-[10px] font-medium uppercase tracking-wider", accent)}>
        {title}
      </p>
      <ul className="flex flex-col gap-1.5">
        {items.length > 0 ? (
          items.map((item) => (
            <li
              key={item.id}
              className="rounded-lg border border-border/60 bg-black/10 px-3 py-2 text-[11px]"
            >
              <span className="font-medium text-foreground">{item.title}: </span>
              <span className="text-muted">{item.description}</span>
            </li>
          ))
        ) : (
          <li className="text-[11px] text-muted">Nenhum item detectado</li>
        )}
      </ul>
    </div>
  );
}

function GapList({
  title,
  items,
  accent,
}: {
  title: string;
  items: Array<{ id: string; title: string; area: string; impact: string }>;
  accent: string;
}) {
  return (
    <div>
      <p className={cn("mb-2 text-[10px] font-medium uppercase tracking-wider", accent)}>
        {title}
      </p>
      <ul className="flex flex-col gap-1.5">
        {items.map((item) => (
          <li
            key={item.id}
            className="rounded-lg border border-border/60 bg-black/10 px-3 py-2 text-[11px]"
          >
            <span className="font-medium text-foreground">{item.title}</span>
            <span className="text-muted"> · {item.area}: {item.impact}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function LegalExecutiveSummarySection({ legal }: LegalExecutiveSummarySectionProps) {
  if (!legal) {
    return (
      <section className="flex flex-col gap-4">
        <SectionHeader
          title="Legal Executive Summary"
          description="Inteligência jurídica e compliance integrada ao Samuel AI™"
        />
        <p className="text-sm text-muted">Dados jurídicos indisponíveis.</p>
      </section>
    );
  }

  const healthLabel =
    legal.legalHealthScore >= 75
      ? "Saudável"
      : legal.legalHealthScore >= 50
        ? "Atenção"
        : "Crítico";

  const contractHealthScore = Math.max(0, 100 - legal.contractRiskScore);

  return (
    <section className="flex flex-col gap-4">
      <SectionHeader
        title="Legal Executive Summary"
        description="Inteligência jurídica e compliance integrada ao Samuel AI™"
      />

      <div className="rounded-xl border border-accent/20 bg-accent/5 px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[10px] font-medium uppercase tracking-wider text-accent">
            Saúde Jurídica
          </p>
          <StatusBadge
            label={healthLabel}
            variant={
              legal.legalHealthScore >= 75
                ? "success"
                : legal.legalHealthScore >= 50
                  ? "accent"
                  : "warning"
            }
          />
        </div>
        <p className="mt-2 text-3xl font-semibold text-foreground">
          {legal.legalHealthScore}
          <span className="text-base text-muted">/100</span>
        </p>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-black/20">
          <div
            className="h-full rounded-full bg-accent"
            style={{ width: `${legal.legalHealthScore}%` }}
          />
        </div>
        <p className="mt-2 text-xs leading-relaxed text-muted">{legal.legalExecutiveSummary}</p>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <ScoreTile label="Compliance" score={legal.complianceScore} />
        <ScoreTile label="Contratos" score={contractHealthScore} />
        <ScoreTile label="Proteção de Dados" score={legal.dataProtectionScore} />
      </div>

      <div className="rounded-lg border border-rose-500/15 bg-rose-500/[0.03] px-3 py-2.5">
        <p className="text-[10px] font-medium uppercase tracking-wider text-rose-400">
          Riscos Regulatórios
        </p>
        <p className="mt-1 text-lg font-semibold text-foreground">
          {legal.regulatoryRiskScore}
          <span className="text-xs text-muted">/100</span>
        </p>
        <p className="mt-0.5 text-[10px] text-muted">
          Quanto maior, maior a exposição regulatória
        </p>
      </div>

      <InsightList
        title="LGPD / GDPR"
        items={legal.lgpdGdprRisks}
        accent="text-amber-400"
      />

      <GapList title="Gaps de Políticas" items={legal.policyGaps} accent="text-violet-400" />

      <div>
        <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-rose-400">
          Ações Urgentes
        </p>
        <ul className="flex flex-col gap-1.5">
          {legal.urgentLegalActions.map((action) => (
            <li
              key={action.id}
              className="rounded-lg border border-rose-500/15 bg-rose-500/[0.03] px-3 py-2.5"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold text-foreground">{action.title}</p>
                <StatusBadge label={action.priority} variant="muted" />
              </div>
              <p className="mt-1 text-[11px] text-muted">{action.description}</p>
              <p className="mt-1 text-[10px] text-rose-400">Prazo: {action.deadline}</p>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-accent">
          Recomendações
        </p>
        <ul className="flex flex-col gap-1.5">
          {legal.legalRecommendations.map((rec) => (
            <li
              key={rec.id}
              className="rounded-lg border border-accent/15 bg-accent/[0.03] px-3 py-2.5"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold text-foreground">{rec.title}</p>
                <StatusBadge label={rec.priority} variant="muted" />
              </div>
              <p className="mt-1 text-[11px] text-muted">{rec.description}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
