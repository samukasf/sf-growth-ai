import { cn } from "@/utils/cn";

import type {
  AreaStrategy,
  ExecutiveStrategy,
  GrowthPlan,
} from "../../services/executive-strategy.service";
import { StatusBadge } from "../shared/status-badge";
import { SectionHeader } from "../section-header";

type ExecutiveStrategySectionProps = {
  strategy: ExecutiveStrategy | null;
};

function GrowthPlanCard({ plan }: { plan: GrowthPlan }) {
  return (
    <div className="rounded-lg border border-border/60 bg-black/10 px-3 py-2.5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold text-foreground">
          Plano de Crescimento — {plan.horizon}
        </p>
      </div>
      <p className="mt-1 text-[11px] text-muted">{plan.summary}</p>
      <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wider text-emerald-400">
            Metas
          </p>
          <ul className="mt-1 flex flex-col gap-0.5">
            {plan.goals.map((goal) => (
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
            {plan.actions.map((action) => (
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

function AreaStrategyCard({
  title,
  strategy,
}: {
  title: string;
  strategy: AreaStrategy;
}) {
  return (
    <div className="rounded-lg border border-border/60 bg-white/[0.02] px-3 py-2.5">
      <p className="text-xs font-semibold text-foreground">{title}</p>
      <p className="mt-1 text-[11px] text-muted">{strategy.summary}</p>
      <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wider text-emerald-400">
            Foco
          </p>
          <ul className="mt-1 flex flex-col gap-0.5">
            {strategy.focus.map((item) => (
              <li key={item} className="text-[10px] text-foreground/80">
                • {item}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wider text-accent">
            Ações
          </p>
          <ul className="mt-1 flex flex-col gap-0.5">
            {strategy.actions.map((action) => (
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
            {strategy.kpis.map((kpi) => (
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

  const areaStrategies: Array<{ title: string; data: AreaStrategy }> = [
    { title: "Estratégia Comercial", data: strategy.commercialStrategy },
    { title: "Estratégia Financeira", data: strategy.financialStrategy },
    { title: "Estratégia de Marketing", data: strategy.marketingStrategy },
    { title: "Estratégia de Produto", data: strategy.productStrategy },
    { title: "Estratégia Operacional", data: strategy.operationalStrategy },
    { title: "Estratégia de Expansão", data: strategy.expansionStrategy },
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
          Estratégia Executiva
        </p>
        <p className="mt-2 text-xs leading-relaxed text-foreground/90">
          {strategy.executiveStrategy}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <div className="rounded-lg border border-border/60 bg-black/10 px-3 py-2.5">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted">
            Visão Estratégica
          </p>
          <p className="mt-2 text-xs leading-relaxed text-foreground/90">
            {strategy.strategicVision}
          </p>
        </div>
        <div className="rounded-lg border border-border/60 bg-black/10 px-3 py-2.5">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted">
            Missão
          </p>
          <p className="mt-2 text-xs leading-relaxed text-foreground/90">
            {strategy.mission}
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-accent/15 bg-accent/[0.03] px-3 py-2.5">
        <p className="text-[10px] font-medium uppercase tracking-wider text-accent">
          Posicionamento
        </p>
        <p className="mt-2 text-xs leading-relaxed text-foreground/90">
          {strategy.positioning}
        </p>
      </div>

      <div>
        <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-emerald-400">
          Diferenciação
        </p>
        <ul className="flex flex-col gap-1.5">
          {strategy.differentiation.map((item) => (
            <li
              key={item}
              className="rounded-lg border border-emerald-500/15 bg-emerald-500/[0.03] px-3 py-2 text-[11px] text-emerald-300/90"
            >
              • {item}
            </li>
          ))}
        </ul>
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
        <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-muted">
          Planos de Crescimento
        </p>
        <div className="flex flex-col gap-2">
          <GrowthPlanCard plan={strategy.growthPlan30d} />
          <GrowthPlanCard plan={strategy.growthPlan90d} />
          <GrowthPlanCard plan={strategy.growthPlan365d} />
        </div>
      </div>

      <div>
        <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-muted">
          Estratégias por Área
        </p>
        <div className="flex flex-col gap-2">
          {areaStrategies.map(({ title, data }) => (
            <AreaStrategyCard key={title} title={title} strategy={data} />
          ))}
        </div>
      </div>
    </section>
  );
}
