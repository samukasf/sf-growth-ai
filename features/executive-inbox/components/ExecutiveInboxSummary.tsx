import { cn } from "@/utils/cn";

import { StatusBadge } from "@/features/samuel-ai/components/shared/status-badge";

import type { ExecutiveInboxSummaryData } from "../executive-inbox.types";

type ExecutiveInboxSummaryProps = {
  summary: ExecutiveInboxSummaryData;
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

export function ExecutiveInboxSummary({
  summary,
  resolvedOverride,
}: ExecutiveInboxSummaryProps) {
  const resolved = resolvedOverride ?? summary.resolvedCount;
  const scoreLabel =
    summary.overallScore >= 75 ? "Excelente" : summary.overallScore >= 50 ? "Moderado" : "Atenção";

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      <KpiCard label="Pendências" value={summary.pendingCount} />
      <KpiCard label="Urgentes" value={summary.urgentCount} warning />
      <KpiCard label="Resolvidas" value={resolved} accent />
      <div className="rounded-lg border border-border/60 bg-black/10 px-3 py-2.5">
        <p className="text-[10px] uppercase tracking-wider text-muted">Score Geral</p>
        <div className="mt-1 flex items-end justify-between gap-2">
          <p className="text-xl font-semibold tabular-nums text-foreground">
            {summary.overallScore}
          </p>
          <StatusBadge
            label={scoreLabel}
            variant={
              summary.overallScore >= 75
                ? "success"
                : summary.overallScore >= 50
                  ? "accent"
                  : "warning"
            }
          />
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              summary.overallScore >= 75
                ? "bg-emerald-400"
                : summary.overallScore >= 50
                  ? "bg-amber-400"
                  : "bg-rose-400",
            )}
            style={{ width: `${summary.overallScore}%` }}
          />
        </div>
      </div>
    </div>
  );
}
