import type {
  ActionImpact,
  ActionPriority,
  ExecutiveActionPlan,
} from "../../executive-brain/types";
import { StatusBadge } from "../shared/status-badge";
import { SectionHeader } from "../section-header";

type ExecutiveActionPlanSectionProps = {
  actionPlan: ExecutiveActionPlan;
};

const PRIORITY_LABELS: Record<ActionPriority, string> = {
  critical: "Crítica",
  high: "Alta",
  medium: "Média",
  low: "Baixa",
};

const PRIORITY_VARIANTS: Record<
  ActionPriority,
  "warning" | "accent" | "default" | "muted"
> = {
  critical: "warning",
  high: "accent",
  medium: "default",
  low: "muted",
};

const IMPACT_LABELS: Record<ActionImpact, string> = {
  high: "Alto",
  medium: "Médio",
  low: "Baixo",
};

const IMPACT_VARIANTS: Record<ActionImpact, "success" | "default" | "muted"> = {
  high: "success",
  medium: "default",
  low: "muted",
};

export function ExecutiveActionPlanSection({
  actionPlan,
}: ExecutiveActionPlanSectionProps) {
  return (
    <section className="flex flex-col gap-4">
      <SectionHeader
        title="Executive Action Plan"
        description="Prioridades, impacto esperado e próximos passos"
      />

      <p className="rounded-lg border border-border bg-white/[0.02] px-3 py-2.5 text-sm leading-relaxed text-foreground">
        {actionPlan.summary}
      </p>

      <ul className="flex flex-col gap-3">
        {actionPlan.actions.map((action, index) => (
          <li
            key={action.id}
            className="rounded-lg border border-border bg-white/[0.02] px-3 py-3"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-medium text-foreground">
                <span className="mr-1.5 text-xs text-muted">{index + 1}.</span>
                {action.title}
              </p>
              <StatusBadge
                label={PRIORITY_LABELS[action.priority]}
                variant={PRIORITY_VARIANTS[action.priority]}
              />
            </div>

            <p className="mt-1.5 text-xs leading-relaxed text-muted">
              {action.description}
            </p>

            <div className="mt-3 flex flex-col gap-2 border-t border-border pt-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] text-muted">Impacto esperado</span>
                <StatusBadge
                  label={IMPACT_LABELS[action.expectedImpact]}
                  variant={IMPACT_VARIANTS[action.expectedImpact]}
                />
              </div>
              <p className="text-xs text-foreground">{action.impactDescription}</p>
              <div>
                <p className="text-[11px] text-muted">Próximo passo</p>
                <p className="mt-0.5 text-xs text-foreground">{action.nextStep}</p>
              </div>
              <p className="text-[11px] text-muted">
                Prazo: <span className="text-foreground">{action.timeframe}</span>
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
