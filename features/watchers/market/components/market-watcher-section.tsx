import { cn } from "@/utils/cn";

import { StatusBadge } from "@/features/samuel-ai/components/shared/status-badge";
import { SectionHeader } from "@/features/samuel-ai/components/section-header";

import type {
  CompetitiveMovement,
  MarketAlert,
  MarketOpportunity,
  MarketSeverity,
  MarketThreat,
  MarketTrend,
  MarketWatcherResult,
} from "../market-watcher.types";

type MarketWatcherSectionProps = {
  marketWatcher: MarketWatcherResult | null;
};

function severityVariant(severity: MarketSeverity) {
  switch (severity) {
    case "Critical":
      return "warning" as const;
    case "High":
      return "accent" as const;
    case "Medium":
      return "muted" as const;
    default:
      return "muted" as const;
  }
}

function TrendCard({ trend }: { trend: MarketTrend }) {
  const directionLabel =
    trend.direction === "up" ? "↑" : trend.direction === "down" ? "↓" : "→";

  return (
    <li className="rounded-lg border border-border/60 bg-black/10 px-3 py-2.5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-foreground">
            {directionLabel} {trend.title}
          </p>
          <p className="mt-1 text-[11px] text-muted">{trend.description}</p>
        </div>
        <StatusBadge label={trend.severity} variant={severityVariant(trend.severity)} />
      </div>
      <p className="mt-1.5 text-[10px] text-muted">Confiança: {trend.confidence}%</p>
    </li>
  );
}

function CompetitorCard({ movement }: { movement: CompetitiveMovement }) {
  return (
    <li className="rounded-lg border border-border/60 bg-black/10 px-3 py-2.5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-foreground">{movement.competitor}</p>
          <p className="mt-0.5 text-[10px] text-accent">{movement.movement}</p>
          <p className="mt-1 text-[11px] text-muted">{movement.description}</p>
        </div>
        <StatusBadge label={movement.severity} variant={severityVariant(movement.severity)} />
      </div>
      <p className="mt-1.5 text-[10px] text-muted">Confiança: {movement.confidence}%</p>
    </li>
  );
}

function OpportunityCard({ opportunity }: { opportunity: MarketOpportunity }) {
  return (
    <li className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-2.5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-foreground">{opportunity.title}</p>
          <p className="mt-1 text-[11px] text-muted">{opportunity.description}</p>
          <p className="mt-1 text-[10px] text-emerald-400">
            Potencial: {opportunity.growthPotential}
          </p>
        </div>
        <StatusBadge label={opportunity.severity} variant="success" />
      </div>
    </li>
  );
}

function ThreatCard({ threat }: { threat: MarketThreat }) {
  return (
    <li className="rounded-lg border border-rose-500/20 bg-rose-500/5 px-3 py-2.5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-foreground">{threat.title}</p>
          <p className="mt-1 text-[11px] text-muted">{threat.description}</p>
          <p className="mt-1 text-[10px] text-rose-400">Impacto: {threat.impact}</p>
        </div>
        <StatusBadge label={threat.severity} variant={severityVariant(threat.severity)} />
      </div>
    </li>
  );
}

function AlertCard({ alert }: { alert: MarketAlert }) {
  return (
    <li className="rounded-lg border border-border/60 bg-black/10 px-3 py-2.5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-foreground">{alert.title}</p>
          <p className="mt-1 text-[11px] text-muted">{alert.description}</p>
        </div>
        <StatusBadge label={alert.severity} variant={severityVariant(alert.severity)} />
      </div>
      <p className="mt-1.5 text-[10px] text-accent">
        Recomendação: {alert.recommendation.title} — {alert.recommendation.description}
      </p>
      <p className="mt-1 text-[10px] text-muted">
        Confiança: {alert.confidence}% · Área: {alert.responsibleArea}
      </p>
    </li>
  );
}

export function MarketWatcherSection({ marketWatcher }: MarketWatcherSectionProps) {
  if (!marketWatcher) {
    return (
      <section className="flex flex-col gap-4">
        <SectionHeader
          title="Market Watcher"
          description="Monitoramento contínuo de mercado, concorrentes e tendências"
        />
        <p className="text-sm text-muted">Nenhum sinal de mercado detectado.</p>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-4">
      <SectionHeader
        title="Market Watcher"
        description="Monitoramento contínuo de mercado, concorrentes e tendências"
      />

      <div className="rounded-xl border border-accent/20 bg-accent/5 px-4 py-3">
        <p className="text-[10px] font-medium uppercase tracking-wider text-accent">
          Resumo de Mercado
        </p>
        <p className="mt-2 text-xs leading-relaxed text-muted">
          {marketWatcher.executiveSummary}
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Metric label="Tendências" value={marketWatcher.trends.length} />
          <Metric label="Concorrentes" value={marketWatcher.newCompetitors.length} />
          <Metric label="Oportunidades" value={marketWatcher.opportunities.length} />
          <Metric label="Confiança" value={`${marketWatcher.averageConfidence}%`} />
        </div>
      </div>

      <div>
        <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-muted">
          Tendências Detectadas
        </p>
        <ul className="flex flex-col gap-1.5">
          {marketWatcher.trends.map((trend) => (
            <TrendCard key={trend.id} trend={trend} />
          ))}
        </ul>
      </div>

      <div>
        <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-muted">
          Novos Concorrentes
        </p>
        <ul className="flex flex-col gap-1.5">
          {marketWatcher.newCompetitors.length > 0 ? (
            marketWatcher.newCompetitors.map((movement) => (
              <CompetitorCard key={movement.id} movement={movement} />
            ))
          ) : (
            <li className="text-[11px] text-muted">Nenhum novo concorrente detectado</li>
          )}
        </ul>
      </div>

      <div>
        <p className={cn("mb-2 text-[10px] font-medium uppercase tracking-wider", "text-emerald-400")}>
          Oportunidades
        </p>
        <ul className="flex flex-col gap-1.5">
          {marketWatcher.opportunities.map((opportunity) => (
            <OpportunityCard key={opportunity.id} opportunity={opportunity} />
          ))}
        </ul>
      </div>

      <div>
        <p className={cn("mb-2 text-[10px] font-medium uppercase tracking-wider", "text-rose-400")}>
          Ameaças
        </p>
        <ul className="flex flex-col gap-1.5">
          {marketWatcher.threats.map((threat) => (
            <ThreatCard key={threat.id} threat={threat} />
          ))}
        </ul>
      </div>

      <div>
        <p className={cn("mb-2 text-[10px] font-medium uppercase tracking-wider", "text-amber-400")}>
          Alertas
        </p>
        <ul className="flex flex-col gap-1.5">
          {marketWatcher.alerts.map((alert) => (
            <AlertCard key={alert.id} alert={alert} />
          ))}
        </ul>
      </div>

      <div>
        <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-muted">
          Recomendações
        </p>
        <ul className="flex flex-col gap-1.5">
          {marketWatcher.recommendations.map((rec) => (
            <li
              key={rec.id}
              className="rounded-lg border border-border/60 bg-black/10 px-3 py-2 text-[11px]"
            >
              <span className="font-medium text-foreground">{rec.title}</span>
              <span className="text-muted"> — {rec.description}</span>
              <span className="mt-1 block text-[10px] text-muted">
                Prioridade: {rec.priority} · Área: {rec.responsibleArea}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-border/60 bg-black/10 px-3 py-2">
      <p className="text-[10px] uppercase tracking-wider text-muted">{label}</p>
      <p className="mt-1 text-lg font-semibold text-foreground">{value}</p>
    </div>
  );
}
