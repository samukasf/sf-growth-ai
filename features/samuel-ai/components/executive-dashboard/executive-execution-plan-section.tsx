import { cn } from "@/utils/cn";

import type { ExecutionPlan } from "../../services/executive-execution-planner.service";
import { TimelineSteps } from "../shared/timeline-steps";
import { StatusBadge } from "../shared/status-badge";
import { SectionHeader } from "../section-header";

type ExecutiveExecutionPlanSectionProps = {
  plans: ExecutionPlan[];
};

export function ExecutiveExecutionPlanSection({
  plans,
}: ExecutiveExecutionPlanSectionProps) {
  return (
    <section className="flex flex-col gap-4">
      <SectionHeader
        title="Executive Execution Plan"
        description="Planos de execução derivados das decisões executivas"
      />

      {plans.length === 0 ? (
        <p className="text-sm text-muted">
          Nenhum plano de execução gerado — decisões executivas indisponíveis.
        </p>
      ) : (
        <ul className="flex flex-col gap-4">
          {plans.map((plan, index) => (
            <li
              key={plan.id}
              className="rounded-xl border border-accent/15 bg-accent/[0.02] px-4 py-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-muted">
                    Plano {index + 1}
                  </p>
                  <h3 className="mt-1 text-sm font-semibold text-foreground">
                    {plan.title}
                  </h3>
                </div>
                <StatusBadge label={plan.status} variant="muted" />
              </div>

              <div className="mt-3 rounded-lg border border-border/60 bg-black/20 px-3 py-2.5">
                <p className="text-[10px] font-medium uppercase tracking-wider text-accent">
                  Objetivo
                </p>
                <p className="mt-1 text-xs leading-relaxed text-foreground/90">
                  {plan.objective}
                </p>
              </div>

              <div className="mt-3">
                <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-muted">
                  Timeline
                </p>
                <div className="flex flex-col gap-3">
                  {plan.phases.map((phase) => (
                    <div
                      key={phase.id}
                      className="rounded-lg border border-border/60 bg-black/10 px-3 py-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-semibold text-foreground">
                          Fase {phase.order}: {phase.title}
                        </p>
                        <span className="text-[10px] text-muted">{phase.deadline}</span>
                      </div>
                      <p className="mt-1 text-[11px] text-muted">{phase.description}</p>
                      <div className="mt-3">
                        <TimelineSteps
                          steps={phase.steps.map((step) => ({
                            id: step.id,
                            order: step.order,
                            title: step.title,
                            description: step.description,
                            status: "pending",
                            meta: `${step.responsible} · ${step.deadline}`,
                          }))}
                        />
                      </div>
                      {phase.milestones[0] ? (
                        <div className="mt-2 rounded-md border border-emerald-500/15 bg-emerald-500/[0.03] px-2.5 py-2">
                          <p className="text-[10px] font-medium uppercase tracking-wider text-emerald-400">
                            Marco — {phase.milestones[0].title}
                          </p>
                          <p className="mt-1 text-[11px] text-muted">
                            {phase.milestones[0].criteria}
                          </p>
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-3 rounded-lg border border-border/60 bg-black/10 px-3 py-2.5">
                <p className="text-[10px] font-medium uppercase tracking-wider text-muted">
                  Próximos passos
                </p>
                <ul className="mt-2 flex flex-col gap-1">
                  {plan.nextSteps.map((step) => (
                    <li key={step} className="text-xs text-foreground/90">
                      • {step}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                <div className="rounded-lg border border-border/60 bg-black/10 px-3 py-2.5">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-muted">
                    Indicadores
                  </p>
                  <ul className="mt-2 flex flex-col gap-1">
                    {plan.successIndicators.map((indicator) => (
                      <li key={indicator} className="text-[11px] text-foreground/90">
                        • {indicator}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-lg border border-rose-500/15 bg-rose-500/[0.03] px-3 py-2.5">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-rose-400">
                    Riscos
                  </p>
                  <ul className="mt-2 flex flex-col gap-1">
                    {plan.risks.map((risk) => (
                      <li key={risk} className="text-[11px] text-rose-300/90">
                        • {risk}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-3 border-t border-border/60 pt-3">
                <div className="flex items-center justify-between gap-2 text-[11px]">
                  <span className="text-muted">Impacto esperado</span>
                  <span className="font-medium text-emerald-400">
                    {plan.expectedImpact}
                  </span>
                </div>
                <div className="mt-3">
                  <div className="flex items-center justify-between gap-2 text-[11px]">
                    <span className="text-muted">Progresso</span>
                    <span className="font-medium text-foreground">{plan.progress}%</span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                    <div
                      className={cn(
                        "h-full rounded-full bg-accent transition-all",
                      )}
                      style={{ width: `${plan.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
