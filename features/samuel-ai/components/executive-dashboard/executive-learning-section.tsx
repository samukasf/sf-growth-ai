import { cn } from "@/utils/cn";

import type { ExecutiveLearning } from "../../services/executive-learning.service";
import { StatusBadge } from "../shared/status-badge";
import { SectionHeader } from "../section-header";

type ExecutiveLearningSectionProps = {
  learning: ExecutiveLearning | null;
};

const TRAJECTORY_LABELS = {
  ascending: "↑ Ascendente",
  stable: "→ Estável",
  declining: "↓ Em queda",
} as const;

const CATEGORY_VARIANTS = {
  success: "success",
  failure: "warning",
  opportunity: "accent",
  risk: "warning",
  pattern: "default",
} as const;

function formatDate(date: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function ExecutiveLearningSection({
  learning,
}: ExecutiveLearningSectionProps) {
  if (!learning) {
    return (
      <section className="flex flex-col gap-4">
        <SectionHeader
          title="Executive Learning"
          description="Aprendizado contínuo e evolução estratégica"
        />
        <p className="text-sm text-muted">
          Motor de aprendizado indisponível — dados executivos insuficientes.
        </p>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-4">
      <SectionHeader
        title="Executive Learning"
        description="Aprendizado contínuo e evolução estratégica"
      />

      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.04] px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[10px] font-medium uppercase tracking-wider text-emerald-400">
            Score de Evolução
          </p>
          <StatusBadge
            label={TRAJECTORY_LABELS[learning.evolution.trajectory]}
            variant="success"
          />
        </div>
        <p className="mt-2 text-3xl font-semibold text-foreground">
          {learning.evolutionScore}
          <span className="text-base text-muted">/100</span>
        </p>
        <p className="mt-1 text-xs text-muted">
          Maturidade: {learning.evolution.strategicMaturity} · Anterior:{" "}
          {learning.evolution.previousLevel}
        </p>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-black/20">
          <div
            className="h-full rounded-full bg-emerald-400"
            style={{ width: `${learning.evolutionScore}%` }}
          />
        </div>
      </div>

      <div className="rounded-lg border border-accent/20 bg-accent/5 px-3 py-2.5">
        <p className="text-[10px] font-medium uppercase tracking-wider text-accent">
          Evolução Estratégica
        </p>
        <p className="mt-1 text-xs leading-relaxed text-foreground/90">
          {learning.evolution.summary}
        </p>
      </div>

      <div>
        <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-muted">
          Insights Aprendidos
        </p>
        <ul className="flex flex-col gap-2">
          {learning.insights.slice(0, 6).map((insight) => (
            <li
              key={insight.id}
              className="rounded-lg border border-border/60 bg-black/10 px-3 py-2.5"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs font-semibold text-foreground">
                  {insight.title}
                </p>
                <StatusBadge
                  label={`${insight.confidence}%`}
                  variant={CATEGORY_VARIANTS[insight.category]}
                />
              </div>
              <p className="mt-1 text-[11px] leading-relaxed text-muted">
                {insight.description}
              </p>
              <p className="mt-1 text-[10px] text-accent">{insight.source}</p>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-muted">
          Experiências Acumuladas
        </p>
        <ul className="flex flex-col gap-1.5">
          {learning.experiences.slice(0, 5).map((experience) => (
            <li
              key={experience.id}
              className="rounded-lg border border-border/60 bg-white/[0.02] px-3 py-2"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-medium text-foreground">
                  {experience.title}
                </p>
                <StatusBadge
                  label={experience.outcome}
                  variant={
                    experience.outcome === "success"
                      ? "success"
                      : experience.outcome === "failure"
                        ? "warning"
                        : "muted"
                  }
                />
              </div>
              <p className="mt-1 text-[11px] text-muted">{experience.description}</p>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-muted">
          Regras Aprendidas
        </p>
        <ul className="flex flex-col gap-2">
          {learning.rules.map((rule) => (
            <li
              key={rule.id}
              className="rounded-lg border border-accent/15 bg-accent/[0.03] px-3 py-2.5"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold text-foreground">{rule.title}</p>
                <StatusBadge label={rule.priority} variant="accent" />
              </div>
              <p className="mt-1 text-xs text-foreground/90">{rule.rule}</p>
              <p className="mt-1 text-[11px] text-muted">{rule.rationale}</p>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-muted">
          Histórico de Melhoria
        </p>
        <ul className="flex flex-col gap-1.5">
          {learning.improvementHistory.map((item) => (
            <li
              key={`${item.date}-${item.milestone}`}
              className="flex items-center justify-between gap-2 rounded-lg border border-border/60 bg-black/10 px-3 py-2"
            >
              <div>
                <p className="text-xs font-medium text-foreground">{item.milestone}</p>
                <p className="text-[10px] text-muted">{formatDate(item.date)}</p>
              </div>
              <span className="text-xs font-semibold text-emerald-400">
                +{item.scoreDelta}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <div className="rounded-lg border border-border/60 bg-black/10 px-3 py-2.5">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted">
            Lições Aprendidas
          </p>
          <ul className="mt-2 flex flex-col gap-1">
            {learning.lessonsLearned.map((lesson) => (
              <li key={lesson} className="text-[11px] text-foreground/90">
                • {lesson}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-lg border border-emerald-500/15 bg-emerald-500/[0.03] px-3 py-2.5">
          <p className="text-[10px] font-medium uppercase tracking-wider text-emerald-400">
            Boas Práticas
          </p>
          <ul className="mt-2 flex flex-col gap-1">
            {learning.bestPractices.map((practice) => (
              <li key={practice} className="text-[11px] text-emerald-300/90">
                • {practice}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {learning.patterns.length > 0 ? (
        <div>
          <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-muted">
            Padrões Detectados
          </p>
          <ul className="flex flex-col gap-1.5">
            {learning.patterns.map((pattern) => (
              <li
                key={pattern.id}
                className={cn(
                  "rounded-lg border px-3 py-2 text-[11px]",
                  pattern.impact === "high"
                    ? "border-amber-500/15 bg-amber-500/[0.03] text-amber-300/90"
                    : "border-border/60 bg-white/[0.02] text-muted",
                )}
              >
                <span className="font-medium text-foreground">{pattern.title}: </span>
                {pattern.description}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="rounded-lg border border-border/60 bg-white/[0.02] px-3 py-2.5">
        <p className="text-[10px] font-medium uppercase tracking-wider text-muted">
          Recomendações Permanentes
        </p>
        <ul className="mt-2 flex flex-col gap-1">
          {learning.permanentRecommendations.map((recommendation) => (
            <li key={recommendation} className="text-xs text-foreground/90">
              • {recommendation}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
