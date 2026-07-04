import { cn } from "@/utils/cn";

import type { ExecutiveStrategy } from "../../services/executive-strategy.service";
import { StatusBadge } from "../shared/status-badge";
import { SectionHeader } from "../section-header";

type ExecutiveStrategySectionProps = {
  strategy: ExecutiveStrategy | null;
};

const QUADRANT_LABELS = {
  quick_wins: "Quick Wins",
  major_projects: "Projetos Maiores",
  fill_ins: "Preenchimento",
  thankless: "Baixo Retorno",
} as const;

const QUADRANT_STYLES = {
  quick_wins: "border-emerald-500/20 bg-emerald-500/[0.04]",
  major_projects: "border-accent/20 bg-accent/[0.04]",
  fill_ins: "border-border/60 bg-white/[0.02]",
  thankless: "border-amber-500/20 bg-amber-500/[0.04]",
} as const;

function SwotGrid({
  title,
  items,
  accent,
}: {
  title: string;
  items: string[];
  accent: string;
}) {
  return (
    <div className={cn("rounded-lg border px-3 py-2.5", accent)}>
      <p className="text-[10px] font-medium uppercase tracking-wider text-muted">
        {title}
      </p>
      <ul className="mt-2 flex flex-col gap-1">
        {items.length > 0 ? (
          items.map((item) => (
            <li key={item} className="text-[11px] leading-relaxed text-foreground/90">
              • {item}
            </li>
          ))
        ) : (
          <li className="text-[11px] text-muted">Nenhum item detectado</li>
        )}
      </ul>
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
          title="Executive Strategy"
          description="Cérebro estratégico do Samuel AI™"
        />
        <p className="text-sm text-muted">
          Estratégia indisponível — dados executivos insuficientes.
        </p>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-4">
      <SectionHeader
        title="Executive Strategy"
        description="Cérebro estratégico do Samuel AI™"
      />

      <div className="rounded-xl border border-accent/20 bg-accent/5 px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[10px] font-medium uppercase tracking-wider text-accent">
            Score Estratégico
          </p>
          <StatusBadge
            label={
              strategy.strategicScore >= 70
                ? "Maduro"
                : strategy.strategicScore >= 50
                  ? "Em evolução"
                  : "Inicial"
            }
            variant={strategy.strategicScore >= 70 ? "success" : "accent"}
          />
        </div>
        <p className="mt-2 text-3xl font-semibold text-foreground">
          {strategy.strategicScore}
          <span className="text-base text-muted">/100</span>
        </p>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-black/20">
          <div
            className="h-full rounded-full bg-accent"
            style={{ width: `${strategy.strategicScore}%` }}
          />
        </div>
        <p className="mt-2 text-xs leading-relaxed text-muted">{strategy.summary}</p>
      </div>

      <div>
        <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-muted">
          SWOT
        </p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <SwotGrid
            title="Forças"
            items={strategy.swot.strengths}
            accent="border-emerald-500/15 bg-emerald-500/[0.03]"
          />
          <SwotGrid
            title="Fraquezas"
            items={strategy.swot.weaknesses}
            accent="border-amber-500/15 bg-amber-500/[0.03]"
          />
          <SwotGrid
            title="Oportunidades"
            items={strategy.swot.opportunities}
            accent="border-accent/15 bg-accent/[0.03]"
          />
          <SwotGrid
            title="Ameaças"
            items={strategy.swot.threats}
            accent="border-rose-500/15 bg-rose-500/[0.03]"
          />
        </div>
      </div>

      <div>
        <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-muted">
          Objetivos Estratégicos
        </p>
        <ul className="flex flex-col gap-2">
          {strategy.objectives.map((objective) => (
            <li
              key={objective.id}
              className="rounded-lg border border-border/60 bg-black/10 px-3 py-2.5"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold text-foreground">
                  {objective.title}
                </p>
                <StatusBadge label={objective.horizon} variant="muted" />
              </div>
              <p className="mt-1 text-[11px] text-muted">{objective.description}</p>
              <p className="mt-1 text-[10px] text-accent">Métrica: {objective.metric}</p>
            </li>
          ))}
        </ul>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <div className="rounded-lg border border-border/60 bg-black/10 px-3 py-2.5">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted">
            Prioridades Trimestrais
          </p>
          <ul className="mt-2 flex flex-col gap-1">
            {strategy.quarterlyPriorities.map((item) => (
              <li key={item} className="text-[11px] text-foreground/90">
                • {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-lg border border-accent/15 bg-accent/[0.03] px-3 py-2.5">
          <p className="text-[10px] font-medium uppercase tracking-wider text-accent">
            Prioridades Anuais
          </p>
          <ul className="mt-2 flex flex-col gap-1">
            {strategy.annualPriorities.map((item) => (
              <li key={item} className="text-[11px] text-foreground/90">
                • {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div>
        <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-muted">
          Roadmap Executivo
        </p>
        <div className="flex flex-col gap-2">
          {strategy.roadmap.map((phase) => (
            <div
              key={phase.id}
              className="rounded-lg border border-border/60 bg-white/[0.02] px-3 py-2.5"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold text-foreground">{phase.phase}</p>
                <span className="text-[10px] text-muted">{phase.period}</span>
              </div>
              <p className="mt-1 text-[11px] text-accent">{phase.focus}</p>
              <ul className="mt-2 flex flex-col gap-1">
                {phase.milestones.map((milestone) => (
                  <li key={milestone} className="text-[11px] text-muted">
                    • {milestone}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-muted">
          Pilares Estratégicos
        </p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {strategy.pillars.map((pillar) => (
            <div
              key={pillar.id}
              className="rounded-lg border border-border/60 bg-black/10 px-3 py-2"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold text-foreground">{pillar.name}</p>
                <span className="text-[10px] font-medium text-accent">{pillar.score}</span>
              </div>
              <p className="mt-1 text-[11px] text-muted">{pillar.description}</p>
              <p className="mt-1 text-[10px] text-foreground/80">Foco: {pillar.focus}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-muted">
          Matriz Impacto × Esforço
        </p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {strategy.impactEffortMatrix.slice(0, 6).map((item) => (
            <div
              key={item.id}
              className={cn(
                "rounded-lg border px-3 py-2",
                QUADRANT_STYLES[item.quadrant],
              )}
            >
              <p className="text-xs font-medium text-foreground">{item.title}</p>
              <p className="mt-1 text-[10px] text-muted">
                {QUADRANT_LABELS[item.quadrant]} · Impacto {item.impact} · Esforço{" "}
                {item.effort}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-muted">
          Próximos Movimentos
        </p>
        <ul className="flex flex-col gap-2">
          {strategy.nextMoves.map((move) => (
            <li
              key={move.id}
              className="rounded-lg border border-emerald-500/15 bg-emerald-500/[0.03] px-3 py-2.5"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold text-foreground">{move.title}</p>
                <span className="text-[10px] text-muted">{move.timing}</span>
              </div>
              <p className="mt-1 text-[11px] text-muted">{move.description}</p>
              <p className="mt-1 text-[10px] text-emerald-400">
                Resultado: {move.expectedOutcome}
              </p>
            </li>
          ))}
        </ul>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <div>
          <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-emerald-400">
            Vantagens Competitivas
          </p>
          <ul className="flex flex-col gap-1.5">
            {strategy.advantages.map((advantage) => (
              <li
                key={advantage.id}
                className="rounded-lg border border-emerald-500/15 bg-emerald-500/[0.03] px-3 py-2 text-[11px] text-emerald-300/90"
              >
                <span className="font-medium text-foreground">{advantage.title}: </span>
                {advantage.description}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-rose-400">
            Riscos Estratégicos
          </p>
          <ul className="flex flex-col gap-1.5">
            {strategy.risks.map((risk) => (
              <li
                key={risk.id}
                className="rounded-lg border border-rose-500/15 bg-rose-500/[0.03] px-3 py-2 text-[11px] text-rose-300/90"
              >
                <span className="font-medium text-foreground">{risk.title}: </span>
                {risk.description}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
