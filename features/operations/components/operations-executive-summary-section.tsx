import { cn } from "@/utils/cn";

import type { OperationsExecutive } from "../services/operations-executive.service";
import { StatusBadge } from "@/features/samuel-ai/components/shared/status-badge";
import { SectionHeader } from "@/features/samuel-ai/components/section-header";

type OperationsExecutiveSummarySectionProps = {
  operations: OperationsExecutive | null;
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

export function OperationsExecutiveSummarySection({
  operations,
}: OperationsExecutiveSummarySectionProps) {
  if (!operations) {
    return (
      <section className="flex flex-col gap-4">
        <SectionHeader
          title="Operations Executive Summary"
          description="Inteligência operacional integrada ao Samuel AI™"
        />
        <p className="text-sm text-muted">Dados operacionais indisponíveis.</p>
      </section>
    );
  }

  const healthLabel =
    operations.operationsHealthScore >= 75
      ? "Saudável"
      : operations.operationsHealthScore >= 50
        ? "Atenção"
        : "Crítico";

  return (
    <section className="flex flex-col gap-4">
      <SectionHeader
        title="Operations Executive Summary"
        description="Inteligência operacional integrada ao Samuel AI™"
      />

      <div className="rounded-xl border border-accent/20 bg-accent/5 px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[10px] font-medium uppercase tracking-wider text-accent">
            Saúde Operacional
          </p>
          <StatusBadge
            label={healthLabel}
            variant={
              operations.operationsHealthScore >= 75
                ? "success"
                : operations.operationsHealthScore >= 50
                  ? "accent"
                  : "warning"
            }
          />
        </div>
        <p className="mt-2 text-3xl font-semibold text-foreground">
          {operations.operationsHealthScore}
          <span className="text-base text-muted">/100</span>
        </p>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-black/20">
          <div
            className="h-full rounded-full bg-accent"
            style={{ width: `${operations.operationsHealthScore}%` }}
          />
        </div>
        <p className="mt-2 text-xs leading-relaxed text-muted">
          {operations.operationsExecutiveSummary}
        </p>
        <p className="mt-1 text-[11px] text-accent">
          Utilização: {operations.resourceUtilization}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <ScoreTile label="Produtividade" score={operations.productivityScore} />
        <ScoreTile label="Eficiência" score={operations.processEfficiencyScore} />
        <ScoreTile label="Capacidade" score={operations.capacityScore} />
      </div>

      <InsightList
        title="Gargalos"
        items={operations.bottlenecks}
        accent="text-amber-400"
      />

      <div>
        <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-violet-400">
          Automações Possíveis
        </p>
        <ul className="flex flex-col gap-1.5">
          {operations.automationOpportunities.map((item) => (
            <li
              key={item.id}
              className="rounded-lg border border-violet-500/15 bg-violet-500/[0.03] px-3 py-2 text-[11px]"
            >
              <span className="font-medium text-foreground">{item.title}: </span>
              <span className="text-muted">
                {item.description} · Impacto: {item.estimatedImpact}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <InsightList
        title="Riscos"
        items={operations.operationalRisks}
        accent="text-rose-400"
      />

      <InsightList
        title="Oportunidades"
        items={operations.operationalOpportunities}
        accent="text-emerald-400"
      />

      <div>
        <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-accent">
          Recomendações
        </p>
        <ul className="flex flex-col gap-1.5">
          {operations.operationalRecommendations.map((rec) => (
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
