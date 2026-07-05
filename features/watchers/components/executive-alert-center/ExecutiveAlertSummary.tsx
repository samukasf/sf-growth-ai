import { cn } from "@/utils/cn";

import { StatusBadge } from "@/features/samuel-ai/components/shared/status-badge";

import type { ExecutiveAlertCenterSummary } from "./executive-alert-center.types";

type ExecutiveAlertSummaryProps = {
  summary: ExecutiveAlertCenterSummary;
  resolvedOverride?: number;
};

function KpiCard({
  label,
  value,
  accent = false,
  warning = false,
}: {
  label: string;
  value: string | number;
  accent?: boolean;
  warning?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border px-3 py-2.5",
        warning
          ? "border-rose-500/20 bg-rose-500/5"
          : accent
            ? "border-accent/20 bg-accent/5"
            : "border-border/60 bg-black/10",
      )}
    >
      <p className="text-[10px] uppercase tracking-wider text-muted">{label}</p>
      <p
        className={cn(
          "mt-1 text-xl font-semibold tabular-nums",
          warning ? "text-rose-400" : accent ? "text-accent" : "text-foreground",
        )}
      >
        {value}
      </p>
    </div>
  );
}

export function ExecutiveAlertSummary({
  summary,
  resolvedOverride,
}: ExecutiveAlertSummaryProps) {
  const resolved = resolvedOverride ?? summary.resolvedCount;
  const riskLabel =
    summary.riskScore >= 70 ? "Alto" : summary.riskScore >= 40 ? "Moderado" : "Baixo";

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      <KpiCard label="Alertas Críticos" value={summary.criticalCount} warning />
      <KpiCard label="Alertas Resolvidos" value={resolved} accent />
      <KpiCard label="Novos Alertas" value={summary.newCount} accent />
      <div className="rounded-lg border border-border/60 bg-black/10 px-3 py-2.5">
        <p className="text-[10px] uppercase tracking-wider text-muted">Score Geral de Risco</p>
        <div className="mt-1 flex items-end justify-between gap-2">
          <p className="text-xl font-semibold tabular-nums text-foreground">
            {summary.riskScore}
          </p>
          <StatusBadge
            label={riskLabel}
            variant={summary.riskScore >= 70 ? "warning" : summary.riskScore >= 40 ? "accent" : "success"}
          />
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              summary.riskScore >= 70
                ? "bg-rose-400"
                : summary.riskScore >= 40
                  ? "bg-amber-400"
                  : "bg-emerald-400",
            )}
            style={{ width: `${summary.riskScore}%` }}
          />
        </div>
      </div>
    </div>
  );
}
