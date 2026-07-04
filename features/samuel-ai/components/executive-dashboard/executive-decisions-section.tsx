import { cn } from "@/utils/cn";

import type { ExecutiveDecision } from "../../services/executive-decision.service";
import { StatusBadge } from "../shared/status-badge";
import { SectionHeader } from "../section-header";

type ExecutiveDecisionsSectionProps = {
  decisions: ExecutiveDecision[];
};

const PRIORITY_VARIANTS = {
  Critical: "warning",
  High: "accent",
  Medium: "default",
  Low: "muted",
} as const;

const SOURCE_LABELS = {
  weakness: "Fraqueza",
  risk: "Risco",
  opportunity: "Oportunidade",
  priority: "Prioridade",
  strength: "Força",
} as const;

const SOURCE_STYLES = {
  weakness: "border-amber-500/15 bg-amber-500/[0.03]",
  risk: "border-rose-500/15 bg-rose-500/[0.03]",
  opportunity: "border-accent/15 bg-accent/[0.03]",
  priority: "border-white/10 bg-white/[0.03]",
  strength: "border-emerald-500/15 bg-emerald-500/[0.03]",
} as const;

export function ExecutiveDecisionsSection({
  decisions,
}: ExecutiveDecisionsSectionProps) {
  return (
    <section className="flex flex-col gap-4">
      <SectionHeader
        title="Executive Decisions"
        description="Decisões executivas derivadas da inteligência estratégica"
      />

      {decisions.length === 0 ? (
        <p className="text-sm text-muted">
          Nenhuma decisão executiva gerada — inteligência estratégica indisponível.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {decisions.map((decision, index) => (
            <li
              key={decision.id}
              className={cn(
                "rounded-xl border px-4 py-4",
                SOURCE_STYLES[decision.source],
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-muted">
                    Decisão {index + 1} · {SOURCE_LABELS[decision.source]}
                  </p>
                  <h3 className="mt-1 text-sm font-semibold text-foreground">
                    {decision.title}
                  </h3>
                </div>
                <StatusBadge
                  label={decision.priority}
                  variant={PRIORITY_VARIANTS[decision.priority]}
                />
              </div>

              <p className="mt-2 text-xs leading-relaxed text-muted">
                {decision.description}
              </p>

              <div className="mt-3 rounded-lg border border-border/60 bg-black/20 px-3 py-2">
                <p className="text-[10px] font-medium uppercase tracking-wider text-muted">
                  Motivo
                </p>
                <p className="mt-1 text-xs leading-relaxed text-foreground/90">
                  {decision.reason}
                </p>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
                <div className="rounded-lg border border-border/60 bg-black/10 px-2.5 py-2">
                  <p className="text-muted">Impacto</p>
                  <p className="mt-0.5 font-medium text-foreground">
                    {decision.impact}
                  </p>
                </div>
                <div className="rounded-lg border border-border/60 bg-black/10 px-2.5 py-2">
                  <p className="text-muted">Departamento</p>
                  <p className="mt-0.5 font-medium text-foreground">
                    {decision.department}
                  </p>
                </div>
                <div className="rounded-lg border border-border/60 bg-black/10 px-2.5 py-2">
                  <p className="text-muted">Dificuldade</p>
                  <p className="mt-0.5 font-medium text-foreground">
                    {decision.difficulty}
                  </p>
                </div>
                <div className="rounded-lg border border-border/60 bg-black/10 px-2.5 py-2">
                  <p className="text-muted">Prazo</p>
                  <p className="mt-0.5 font-medium text-foreground">
                    {decision.deadline}
                  </p>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-3">
                <p className="text-[11px] text-muted">
                  ROI estimado:{" "}
                  <span className="text-emerald-400">{decision.estimatedROI}</span>
                </p>
                <StatusBadge label={decision.status} variant="muted" />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
