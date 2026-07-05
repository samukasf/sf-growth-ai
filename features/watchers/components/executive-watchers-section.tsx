import { cn } from "@/utils/cn";

import { CATEGORY_LABELS } from "../constants/watcher.constants";
import type { WatcherAlert, WatcherExecutive } from "../types/watcher.types";
import { StatusBadge } from "@/features/samuel-ai/components/shared/status-badge";
import { SectionHeader } from "@/features/samuel-ai/components/section-header";

type ExecutiveWatchersSectionProps = {
  watchers: WatcherExecutive | null;
};

function severityVariant(severity: WatcherAlert["severity"]) {
  switch (severity) {
    case "critical":
      return "warning" as const;
    case "high":
      return "accent" as const;
    case "medium":
      return "muted" as const;
    default:
      return "muted" as const;
  }
}

function AlertCard({ alert }: { alert: WatcherAlert }) {
  return (
    <li className="rounded-lg border border-border/60 bg-black/10 px-3 py-2.5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-foreground">{alert.title}</p>
          <p className="mt-1 text-[11px] text-muted">{alert.description}</p>
        </div>
        <StatusBadge label={alert.severity} variant={severityVariant(alert.severity)} />
      </div>
      <div className="mt-2 flex flex-wrap gap-2 text-[10px] text-muted">
        <span>Fonte: {alert.source}</span>
        <span>·</span>
        <span>Área: {alert.responsibleArea}</span>
        <span>·</span>
        <span>Confiança: {alert.confidence}%</span>
        <span>·</span>
        <span>Status: {alert.status}</span>
      </div>
      <p className="mt-1.5 text-[10px] text-accent">
        Recomendação: {alert.recommendation.title} — {alert.recommendation.description}
      </p>
      <p className="mt-1 text-[10px] text-muted">
        Impacto: {alert.expectedImpact}
      </p>
    </li>
  );
}

export function ExecutiveWatchersSection({ watchers }: ExecutiveWatchersSectionProps) {
  if (!watchers) {
    return (
      <section className="flex flex-col gap-4">
        <SectionHeader
          title="Executive Watchers"
          description="Monitoramento contínuo de sinais internos e externos"
        />
        <p className="text-sm text-muted">Nenhum watcher ativo no momento.</p>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-4">
      <SectionHeader
        title="Executive Watchers"
        description="Monitoramento contínuo de sinais internos e externos"
      />

      <div className="rounded-xl border border-accent/20 bg-accent/5 px-4 py-3">
        <p className="text-[10px] font-medium uppercase tracking-wider text-accent">
          Resumo do Monitoramento
        </p>
        <p className="mt-2 text-xs leading-relaxed text-muted">
          {watchers.watcherExecutiveSummary}
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Metric label="Ativos" value={watchers.summary.activeWatchers} />
          <Metric label="Alertas" value={watchers.summary.totalAlerts} />
          <Metric label="Críticos" value={watchers.summary.criticalAlerts} />
          <Metric label="Confiança" value={`${watchers.summary.averageConfidence}%`} />
        </div>
      </div>

      <div>
        <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-muted">
          Watchers Ativos
        </p>
        <ul className="flex flex-col gap-1.5">
          {watchers.activeWatchers.map((watcher) => (
            <li
              key={watcher.id}
              className="flex items-center justify-between rounded-lg border border-border/60 bg-black/10 px-3 py-2 text-[11px]"
            >
              <div>
                <span className="font-medium text-foreground">{watcher.name}</span>
                <span className="text-muted">
                  {" "}
                  — {CATEGORY_LABELS[watcher.category]} · {watcher.frequency}
                </span>
              </div>
              <StatusBadge
                label={watcher.status}
                variant={watcher.status === "triggered" ? "warning" : "success"}
              />
            </li>
          ))}
        </ul>
      </div>

      <div>
        <p className={cn("mb-2 text-[10px] font-medium uppercase tracking-wider", "text-rose-400")}>
          Alertas Recentes
        </p>
        <ul className="flex flex-col gap-1.5">
          {watchers.recentAlerts.length > 0 ? (
            watchers.recentAlerts.map((alert) => <AlertCard key={alert.id} alert={alert} />)
          ) : (
            <li className="text-[11px] text-muted">Nenhum alerta recente</li>
          )}
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
