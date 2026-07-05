import { cn } from "@/utils/cn";

import type {
  ExecutiveStrategy,
  StrategicObjective,
  StrategicPlan,
} from "../../services/executive-strategy.service";
import { StatusBadge } from "../shared/status-badge";
import { SectionHeader } from "../section-header";

type ExecutiveStrategySectionProps = {
  strategy: ExecutiveStrategy | null;
};

function ObjectiveList({ objectives }: { objectives: StrategicObjective[] }) {
  if (objectives.length === 0) {
    return <p className="text-[11px] text-muted">Nenhum objetivo definido</p>;
  }

  return (
    <ul className="flex flex-col gap-2">
      {objectives.map((objective) => (
        <li
          key={objective.id}
          className="rounded-lg border border-border/60 bg-black/10 px-3 py-2.5"
        >
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold text-foreground">{objective.title}</p>
            <StatusBadge label={objective.priority} variant="muted" />
          </div>
          <p className="mt-1 text-[11px] text-muted">{objective.description}</p>
          <p className="mt-1 text-[10px] text-accent">Métrica: {objective.metric}</p>
        </li>
      ))}
    </ul>
  );
}

function PlanCard({ plan }: { plan: StrategicPlan }) {
  return (
    <div className="rounded-lg border border-border/60 bg-white/[0.02] px-3 py-2.5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold text-foreground">{plan.title}</p>
        <span className="text-[10px] text-muted">{plan.horizon}</span>
      </div>
      <p className="mt-1 text-[11px] text-muted">{plan.summary}</p>
      <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wider text-emerald-400">
            Metas
          </p>
          <ul className="mt-1 flex flex-col gap-0.5">
            {plan.goals.slice(0, 3).map((goal) => (
              <li key={goal} className="text-[10px] text-foreground/80">
                • {goal}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wider text-accent">
            Ações
          </p>
          <ul className="mt-1 flex flex-col gap-0.5">
            {plan.actions.slice(0, 3).map((action) => (
              <li key={action} className="text-[10px] text-foreground/80">
                • {action}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted">
            KPIs
          </p>
          <ul className="mt-1 flex flex-col gap-0.5">
            {plan.kpis.map((kpi) => (
              <li key={kpi} className="text-[10px] text-foreground/80">
                • {kpi}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export function ExecutiveStrategySection({
  strategy,
}: ExecutiveStrategySectionProps) {
  if (!strategy) {
    return (
      <section className="flex flex-col gap-4">
        <SectionHeader
          title="Executive Strategy Engine"
          description="Motor estratégico consolidado do Samuel AI™"
        />
        <p className="text-sm text-muted">
          Estratégia indisponível — dados executivos insuficientes.
        </p>
      </section>
    );
  }

  const plans: StrategicPlan[] = [
    strategy.commercialPlan,
    strategy.financialPlan,
    strategy.marketingPlan,
    strategy.productPlan,
    strategy.operationsPlan,
    strategy.growthPlan,
    strategy.expansionPlan,
  ];

  return (
    <section className="flex flex-col gap-4">
      <SectionHeader
        title="Executive Strategy Engine"
        description="Motor estratégico consolidado do Samuel AI™"
      />

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <div className="rounded-xl border border-accent/20 bg-accent/5 px-4 py-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[10px] font-medium uppercase tracking-wider text-accent">
              Executive Score
            </p>
            <StatusBadge
              label={
                strategy.executiveScore >= 70
                  ? "Maduro"
                  : strategy.executiveScore >= 50
                    ? "Em evolução"
                    : "Inicial"
              }
              variant={strategy.executiveScore >= 70 ? "success" : "accent"}
            />
          </div>
          <p className="mt-2 text-3xl font-semibold text-foreground">
            {strategy.executiveScore}
            <span className="text-base text-muted">/100</span>
          </p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-black/20">
            <div
              className="h-full rounded-full bg-accent"
              style={{ width: `${strategy.executiveScore}%` }}
            />
          </div>
        </div>

        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.04] px-4 py-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[10px] font-medium uppercase tracking-wider text-emerald-400">
              Confidence Score
            </p>
            <StatusBadge
              label={
                strategy.confidenceScore >= 70
                  ? "Alta"
                  : strategy.confidenceScore >= 50
                    ? "Média"
                    : "Baixa"
              }
              variant={strategy.confidenceScore >= 70 ? "success" : "muted"}
            />
          </div>
          <p className="mt-2 text-3xl font-semibold text-foreground">
            {strategy.confidenceScore}
            <span className="text-base text-muted">/100</span>
          </p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-black/20">
            <div
              className={cn("h-full rounded-full bg-emerald-500")}
              style={{ width: `${strategy.confidenceScore}%` }}
            />
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-accent/15 bg-accent/[0.03] px-3 py-2.5">
        <p className="text-[10px] font-medium uppercase tracking-wider text-accent">
          Estratégia Principal
        </p>
        <p className="mt-2 text-xs leading-relaxed text-foreground/90">
          {strategy.mainStrategy}
        </p>
      </div>

      <div className="rounded-lg border border-border/60 bg-black/10 px-3 py-2.5">
        <p className="text-[10px] font-medium uppercase tracking-wider text-muted">
          Missão Operacional
        </p>
        <p className="mt-2 text-xs leading-relaxed text-foreground/90">
          {strategy.operationalMission}
        </p>
      </div>

      <div>
        <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-muted">
          Top Prioridades
        </p>
        <ul className="flex flex-col gap-1">
          {strategy.topPriorities.map((item) => (
            <li
              key={item}
              className="rounded-lg border border-border/60 bg-black/10 px-3 py-2 text-[11px] text-foreground/90"
            >
              • {item}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-emerald-400">
          Diferenciais Competitivos
        </p>
        <ul className="flex flex-col gap-1.5">
          {strategy.competitiveDifferentiators.map((item) => (
            <li
              key={item}
              className="rounded-lg border border-emerald-500/15 bg-emerald-500/[0.03] px-3 py-2 text-[11px] text-emerald-300/90"
            >
              • {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <div>
          <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-muted">
            Objetivos — 30 dias
          </p>
          <ObjectiveList objectives={strategy.objectives.days30} />
        </div>
        <div>
          <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-muted">
            Objetivos — 90 dias
          </p>
          <ObjectiveList objectives={strategy.objectives.days90} />
        </div>
        <div>
          <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-muted">
            Objetivos — 365 dias
          </p>
          <ObjectiveList objectives={strategy.objectives.days365} />
        </div>
      </div>

      <div>
        <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-muted">
          Planos Estratégicos
        </p>
        <div className="flex flex-col gap-2">
          {plans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} />
          ))}
        </div>
      </div>
    </section>
  );
}
