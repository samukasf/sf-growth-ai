import { cn } from "@/utils/cn";

import type { ExecutiveMonitoring } from "../../services/executive-monitoring.service";
import { TimelineSteps } from "../shared/timeline-steps";
import { StatusBadge } from "../shared/status-badge";
import { SectionHeader } from "../section-header";

type ExecutiveMonitoringSectionProps = {
  monitoring: ExecutiveMonitoring | null;
};

const KPI_STATUS_VARIANTS = {
  on_track: "success",
  at_risk: "warning",
  critical: "warning",
  achieved: "success",
} as const;

const KPI_STATUS_LABELS = {
  on_track: "No alvo",
  at_risk: "Em risco",
  critical: "Crítico",
  achieved: "Atingido",
} as const;

const TREND_LABELS = {
  up: "↑ Subindo",
  down: "↓ Caindo",
  stable: "→ Estável",
} as const;

const ALERT_STYLES = {
  critical: "border-rose-500/20 bg-rose-500/[0.04]",
  high: "border-amber-500/20 bg-amber-500/[0.04]",
  medium: "border-accent/20 bg-accent/[0.04]",
  low: "border-border bg-white/[0.02]",
} as const;

export function ExecutiveMonitoringSection({
  monitoring,
}: ExecutiveMonitoringSectionProps) {
  if (!monitoring) {
    return (
      <section className="flex flex-col gap-4">
        <SectionHeader
          title="Executive Monitoring"
          description="Monitoramento contínuo da execução e resultados"
        />
        <p className="text-sm text-muted">
          Monitoramento indisponível — planos de execução não carregados.
        </p>
      </section>
    );
  }

  const { progress, kpis, alerts, bottlenecks, timeline, indicators } = monitoring;

  return (
    <section className="flex flex-col gap-4">
      <SectionHeader
        title="Executive Monitoring"
        description="Monitoramento contínuo da execução e resultados"
      />

      <div className="rounded-xl border border-accent/20 bg-accent/5 px-4 py-3">
        <div className="flex items-center justify-between gap-2 text-[11px]">
          <span className="font-medium uppercase tracking-wider text-accent">
            Progresso Geral
          </span>
          <span className="font-semibold text-foreground">{progress.overall}%</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-black/20">
          <div
            className="h-full rounded-full bg-accent transition-all"
            style={{ width: `${progress.overall}%` }}
          />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] sm:grid-cols-4">
          <div>
            <p className="text-muted">Concluídas</p>
            <p className="font-medium text-emerald-400">{progress.completedTasks}</p>
          </div>
          <div>
            <p className="text-muted">Pendentes</p>
            <p className="font-medium text-foreground">{progress.pendingTasks}</p>
          </div>
          <div>
            <p className="text-muted">Atrasadas</p>
            <p className="font-medium text-amber-400">{progress.overdueTasks}</p>
          </div>
          <div>
            <p className="text-muted">Risco de atraso</p>
            <p className="font-medium text-rose-400">{progress.delayRisk}%</p>
          </div>
        </div>
      </div>

      <div>
        <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-muted">
          KPIs
        </p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {kpis.map((kpi) => (
            <div
              key={kpi.id}
              className="rounded-lg border border-border/60 bg-black/10 px-3 py-2.5"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs font-medium text-foreground">{kpi.name}</p>
                <StatusBadge
                  label={KPI_STATUS_LABELS[kpi.status]}
                  variant={KPI_STATUS_VARIANTS[kpi.status]}
                />
              </div>
              <div className="mt-2 flex items-end justify-between gap-2">
                <div>
                  <p className="text-[10px] text-muted">Atual / Meta</p>
                  <p className="text-sm font-semibold text-foreground">
                    {kpi.currentValue}
                    <span className="text-muted"> / {kpi.target}</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-muted">Tendência</p>
                  <p className="text-[11px] text-accent">{TREND_LABELS[kpi.trend]}</p>
                </div>
              </div>
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/[0.06]">
                <div
                  className={cn(
                    "h-full rounded-full",
                    kpi.status === "critical" || kpi.status === "at_risk"
                      ? "bg-amber-400"
                      : "bg-emerald-400",
                  )}
                  style={{ width: `${kpi.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {alerts.length > 0 ? (
        <div>
          <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-rose-400">
            Alertas
          </p>
          <ul className="flex flex-col gap-2">
            {alerts.map((alert) => (
              <li
                key={alert.id}
                className={cn(
                  "rounded-lg border px-3 py-2.5",
                  ALERT_STYLES[alert.severity],
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold text-foreground">{alert.title}</p>
                  <StatusBadge label={alert.severity} variant="warning" />
                </div>
                <p className="mt-1 text-[11px] leading-relaxed text-muted">
                  {alert.message}
                </p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {bottlenecks.length > 0 ? (
        <div>
          <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-amber-400">
            Gargalos
          </p>
          <ul className="flex flex-col gap-1.5">
            {bottlenecks.map((bottleneck) => (
              <li
                key={bottleneck}
                className="rounded-lg border border-amber-500/15 bg-amber-500/[0.03] px-3 py-2 text-xs text-amber-300/90"
              >
                {bottleneck}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div>
        <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-muted">
          Timeline
        </p>
        <TimelineSteps
          steps={timeline.slice(0, 8).map((item, index) => ({
            id: item.id,
            order: index + 1,
            title: item.label,
            description: item.planTitle,
            status:
              item.status === "completed"
                ? "completed"
                : item.status === "in_progress"
                  ? "in_progress"
                  : item.status === "at_risk"
                    ? "pending"
                    : "pending",
            meta: item.deadline,
          }))}
        />
      </div>

      <div className="rounded-lg border border-border/60 bg-black/10 px-3 py-2.5">
        <p className="text-[10px] font-medium uppercase tracking-wider text-muted">
          Indicadores
        </p>
        <ul className="mt-2 flex flex-col gap-1">
          {indicators.map((indicator) => (
            <li key={indicator} className="text-xs text-foreground/90">
              • {indicator}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
