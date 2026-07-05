import { cn } from "@/utils/cn";

import { StatusBadge } from "@/features/samuel-ai/components/shared/status-badge";
import { SectionHeader } from "@/features/samuel-ai/components/section-header";
import { ExecutiveWatchersSection } from "@/features/watchers/components/executive-watchers-section";
import {
  buildExecutiveAlertCenter,
} from "@/features/watchers/components/executive-alert-center";

import type { ExecutiveWorkspaceData } from "./executive-workspace.types";

type ExecutiveWorkspaceRightPanelProps = ExecutiveWorkspaceData;

function ScoreTile({
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
      ? "bg-emerald-400"
      : accent === "amber"
        ? "bg-amber-400"
        : accent === "rose"
          ? "bg-rose-400"
          : "bg-accent";

  return (
    <div className="rounded-lg border border-border/60 bg-black/10 px-3 py-2">
      <p className="text-[10px] uppercase tracking-wider text-muted">{label}</p>
      <p className="mt-1 text-lg font-semibold tabular-nums text-foreground">
        {score}
        <span className="text-xs text-muted">/100</span>
      </p>
      <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/10">
        <div className={cn("h-full rounded-full transition-all duration-500", barColor)} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

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

export function ExecutiveWorkspaceRightPanel(props: ExecutiveWorkspaceRightPanelProps) {
  const { executiveCeo, watcherExecutive } = props;
  const { alerts } = buildExecutiveAlertCenter({
    watcherExecutive: props.watcherExecutive,
    marketWatcher: props.marketWatcher,
    seoWatcher: props.seoWatcher,
    googleBusinessExecutive: props.googleBusinessExecutive,
    metaExecutive: props.metaExecutive,
    crmExecutive: props.crmExecutive,
    marketingExecutive: props.marketingExecutive,
    financeExecutive: props.financeExecutive,
    salesExecutive: props.salesExecutive,
    operationsExecutive: props.operationsExecutive,
    hrExecutive: props.hrExecutive,
    legalExecutive: props.legalExecutive,
    executiveMonitoring: props.executiveMonitoring,
  });

  const recentAlerts = alerts
    .filter((alert) => alert.status === "active")
    .slice(0, 5);

  return (
    <aside className="flex w-full shrink-0 flex-col gap-4 xl:w-[320px] 2xl:w-[340px]">
      <SectionHeader
        headingLevel="h2"
        title="Painel Executivo"
        description="Indicadores e alertas em tempo real"
      />

      {executiveCeo ? (
        <div className="rounded-xl border border-accent/20 bg-accent/5 p-4 transition-all duration-300">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[10px] font-medium uppercase tracking-wider text-accent">
              Company Health
            </p>
            <StatusBadge
              label={HEALTH_LABELS[executiveCeo.companyHealth.status]}
              variant={HEALTH_VARIANTS[executiveCeo.companyHealth.status]}
            />
          </div>
          <p className="mt-2 text-3xl font-semibold tabular-nums text-foreground">
            {executiveCeo.companyHealth.score}
            <span className="text-sm text-muted">/100</span>
          </p>
          <div className="mt-3 grid grid-cols-1 gap-2">
            <ScoreTile label="Growth Score" score={executiveCeo.growthScore} accent="emerald" />
            <ScoreTile label="Risk Score" score={executiveCeo.riskScore} accent="rose" />
            <ScoreTile label="Opportunity Score" score={executiveCeo.opportunityScore} accent="amber" />
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-border/60 bg-black/10 p-4 text-xs text-muted">
          Scores executivos indisponíveis.
        </div>
      )}

      <div className="rounded-xl border border-border/60 bg-black/10 p-4">
        <ExecutiveWatchersSection watchers={watcherExecutive ?? null} />
      </div>

      <div className="rounded-xl border border-border/60 bg-black/10 p-4">
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-rose-400">
          Últimos Alertas
        </p>
        <ul className="flex flex-col gap-1.5">
          {recentAlerts.length > 0 ? (
            recentAlerts.map((alert) => (
              <li
                key={alert.id}
                className="rounded-lg border border-border/50 bg-white/[0.02] px-2.5 py-2 text-[11px] transition-colors duration-200"
              >
                <p className="font-medium text-foreground">{alert.title}</p>
                <p className="mt-0.5 text-[10px] text-muted">{alert.originLabel}</p>
              </li>
            ))
          ) : (
            <li className="text-[11px] text-muted">Nenhum alerta ativo.</li>
          )}
        </ul>
      </div>
    </aside>
  );
}
