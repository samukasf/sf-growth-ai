import { cn } from "@/utils/cn";

import type { ExecutiveCEO } from "../../services/executive-ceo.service";
import { StatusBadge } from "../shared/status-badge";
import { SectionHeader } from "../section-header";

type ExecutiveCeoSectionProps = {
  ceo: ExecutiveCEO | null;
};

const HEALTH_VARIANTS = {
  excellent: "success",
  good: "success",
  fair: "accent",
  critical: "warning",
} as const;

const HEALTH_LABELS = {
  excellent: "Excelente",
  good: "Boa",
  fair: "Atenção",
  critical: "Crítica",
} as const;

function ScoreCard({
  label,
  score,
  accent = "accent",
}: {
  label: string;
  score: number;
  accent?: "accent" | "emerald" | "amber" | "rose";
}) {
  const barColor =
    accent === "emerald"
      ? "bg-emerald-500"
      : accent === "amber"
        ? "bg-amber-500"
        : accent === "rose"
          ? "bg-rose-500"
          : "bg-accent";

  return (
    <div className="rounded-lg border border-border/60 bg-black/10 px-3 py-2.5">
      <p className="text-[10px] font-medium uppercase tracking-wider text-muted">
        {label}
      </p>
      <p className="mt-1 text-2xl font-semibold text-foreground">
        {score}
        <span className="text-sm text-muted">/100</span>
      </p>
      <div className="mt-2 h-1 overflow-hidden rounded-full bg-black/20">
        <div className={cn("h-full rounded-full", barColor)} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

export function ExecutiveCeoSection({ ceo }: ExecutiveCeoSectionProps) {
  if (!ceo) {
    return (
      <section className="flex flex-col gap-4">
        <SectionHeader
          title="CEO Executive Summary"
          description="Visão consolidada do CEO Digital Samuel AI™"
        />
        <p className="text-sm text-muted">
          Resumo executivo indisponível — dados insuficientes.
        </p>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-4">
      <SectionHeader
        title="CEO Executive Summary"
        description="Visão consolidada do CEO Digital Samuel AI™"
      />

      <div className="rounded-xl border border-accent/20 bg-accent/5 px-4 py-3">
        <p className="text-[10px] font-medium uppercase tracking-wider text-accent">
          Resumo Executivo
        </p>
        <p className="mt-2 text-xs leading-relaxed text-foreground/90">
          {ceo.executiveSummary}
        </p>
      </div>

      <div className="rounded-lg border border-border/60 bg-white/[0.02] px-3 py-2.5">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted">
            Saúde da Empresa
          </p>
          <StatusBadge
            label={HEALTH_LABELS[ceo.companyHealth.status]}
            variant={HEALTH_VARIANTS[ceo.companyHealth.status]}
          />
        </div>
        <p className="mt-2 text-2xl font-semibold text-foreground">
          {ceo.companyHealth.score}
          <span className="text-sm text-muted">/100</span>
        </p>
        <p className="mt-2 text-[11px] leading-relaxed text-muted">
          {ceo.companyHealth.summary}
        </p>
      </div>

      <div>
        <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-muted">
          Score Geral
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <ScoreCard label="Executivo" score={ceo.executiveScore} />
          <ScoreCard label="Crescimento" score={ceo.growthScore} accent="emerald" />
          <ScoreCard label="Risco" score={ceo.riskScore} accent="rose" />
          <ScoreCard label="Oportunidade" score={ceo.opportunityScore} accent="amber" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <div className="rounded-lg border border-amber-500/15 bg-amber-500/[0.03] px-3 py-2.5">
          <p className="text-[10px] font-medium uppercase tracking-wider text-amber-400">
            Próxima Decisão
          </p>
          <p className="mt-2 text-xs leading-relaxed text-foreground/90">
            {ceo.executiveDecision}
          </p>
        </div>
        <div className="rounded-lg border border-emerald-500/15 bg-emerald-500/[0.03] px-3 py-2.5">
          <p className="text-[10px] font-medium uppercase tracking-wider text-emerald-400">
            Recomendação Principal
          </p>
          <p className="mt-2 text-xs leading-relaxed text-foreground/90">
            {ceo.executiveRecommendation}
          </p>
        </div>
      </div>

      <div>
        <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-muted">
          Próximas Ações
        </p>
        <ul className="flex flex-col gap-1.5">
          {ceo.nextActions.map((action) => (
            <li
              key={action}
              className="rounded-lg border border-border/60 bg-black/10 px-3 py-2 text-[11px] text-foreground/90"
            >
              • {action}
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-xl border border-accent/20 bg-gradient-to-br from-accent/10 to-transparent px-4 py-3">
        <p className="text-[10px] font-medium uppercase tracking-wider text-accent">
          Mensagem do CEO
        </p>
        <p className="mt-2 text-xs leading-relaxed text-foreground/90 italic">
          &ldquo;{ceo.ceoMessage}&rdquo;
        </p>
      </div>
    </section>
  );
}
