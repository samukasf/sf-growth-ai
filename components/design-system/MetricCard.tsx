import { cn } from "@/utils/cn";

import { dsCardClass } from "./shared";

type DsMetricCardProps = {
  label: string;
  value: string | number;
  delta?: string;
  trend?: "up" | "down" | "neutral";
  className?: string;
};

const TREND_COLORS = {
  up: "text-[var(--ds-success)]",
  down: "text-[var(--ds-danger)]",
  neutral: "text-[var(--ds-text-muted)]",
} as const;

export function DsMetricCard({ label, value, delta, trend = "neutral", className }: DsMetricCardProps) {
  return (
    <div className={cn("ds-root p-5", dsCardClass, className)}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-[var(--ds-text-muted)]">{label}</p>
        {delta ? <span className={cn("text-xs font-medium", TREND_COLORS[trend])}>{delta}</span> : null}
      </div>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-[var(--ds-text)]">{value}</p>
    </div>
  );
}

export { DsMetricCard as MetricCard };
