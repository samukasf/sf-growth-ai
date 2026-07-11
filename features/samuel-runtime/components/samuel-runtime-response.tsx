"use client";

import { SectionHeader } from "@/features/samuel-ai/components/section-header";
import { StatusBadge } from "@/features/samuel-ai/components/shared/status-badge";
import type { RuntimeResponse } from "@/features/samuel-runtime";

type SamuelRuntimeResponseProps = {
  runtime: RuntimeResponse;
};

export function SamuelRuntimeResponse({ runtime }: SamuelRuntimeResponseProps) {
  const { response, decision, executiveCouncil, companyBrain, memory } = runtime;

  return (
    <article className="space-y-5">
      <header className="rounded-xl border border-accent/20 bg-accent/5 px-5 py-4">
        <div className="mb-3 flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-md border border-accent/30 bg-accent/10">
            <span className="text-[10px] font-bold text-accent">SA</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Samuel AI™</p>
            <p className="text-[10px] text-muted">RuntimeResponse · Orchestrator</p>
          </div>
          <StatusBadge
            label={`Confiança ${response.confidence.score}%`}
            variant="success"
            className="ml-auto"
          />
        </div>
        <h3 className="text-base font-semibold text-foreground">{response.headline}</h3>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
          {response.narrative}
        </p>
      </header>

      <section className="rounded-xl border border-border bg-white/[0.02] px-5 py-4">
        <SectionHeader
          title="Company Brain"
          description={companyBrain.headline}
          kicker="Fatos verificados"
        />
        <ul className="mt-3 space-y-2">
          {companyBrain.facts.map((fact) => (
            <li key={fact} className="flex gap-2 text-sm text-foreground/85">
              <span className="text-accent">•</span>
              <span>{fact}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-xl border border-emerald-500/15 bg-emerald-500/5 px-5 py-4">
        <SectionHeader
          title="Executive Council"
          description={`${executiveCouncil.memberCount} especialistas · Consenso formado`}
          kicker="Conselho"
        />
        <p className="mt-3 text-sm leading-relaxed text-foreground/90">
          {executiveCouncil.consensus}
        </p>
        {executiveCouncil.specialists.length > 0 && (
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {executiveCouncil.specialists.map((specialist) => (
              <div
                key={`${specialist.role}-${specialist.name}`}
                className="rounded-lg border border-white/[0.06] bg-black/20 px-3 py-2"
              >
                <p className="text-[10px] font-medium uppercase tracking-wider text-muted">
                  {specialist.role}
                </p>
                <p className="text-xs font-medium text-foreground">{specialist.name}</p>
                <p className="mt-1 text-xs text-muted">{specialist.summary}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-xl border border-border bg-white/[0.02] px-5 py-4">
        <SectionHeader
          title="Decisão"
          description={decision.title}
          kicker="Decision"
        />
        <p className="mt-3 text-sm text-foreground/90">{decision.rationale}</p>
        <p className="mt-3 text-xs text-accent">
          Próxima ação: {decision.nextAction}
        </p>
      </section>

      <section className="rounded-xl border border-border bg-white/[0.02] px-5 py-4">
        <SectionHeader
          title="Plano de ação"
          description={response.actionPlanSummary}
          kicker="Action Plan"
        />
        <div className="mt-4 space-y-3">
          {response.actions.map((action) => (
            <div
              key={action.title}
              className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3"
            >
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-medium text-foreground">{action.title}</p>
                <StatusBadge label={action.priority} variant="accent" />
              </div>
              <p className="mt-1 text-xs leading-relaxed text-muted">{action.description}</p>
              <p className="mt-2 text-[11px] text-emerald-400/90">
                Impacto: {action.impact} · Prazo: {action.timeframe}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-5 py-4">
        <SectionHeader
          title="Memory"
          description={memory.summary}
          kicker="Contexto histórico"
        />
        {memory.insights.length > 0 && (
          <ul className="mt-3 space-y-1.5">
            {memory.insights.map((insight) => (
              <li key={insight} className="text-xs text-muted">
                — {insight}
              </li>
            ))}
          </ul>
        )}
      </section>
    </article>
  );
}
