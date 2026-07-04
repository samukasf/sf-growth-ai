import { cn } from "@/utils/cn";

import type { ExecutiveMetric, MetricTrend } from "../../executive-brain/types";

type MetricTileProps = {
  metric: ExecutiveMetric;
};

const TREND_STYLES: Record<MetricTrend, string> = {
  up: "text-emerald-400",
  down: "text-red-400",
  stable: "text-muted",
};

const TREND_ARROWS: Record<MetricTrend, string> = {
  up: "↑",
  down: "↓",
  stable: "→",
};

export function MetricTile({ metric }: MetricTileProps) {
  return (
    <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-3">
      <p className="text-[10px] font-medium uppercase tracking-wider text-muted">
        {metric.label}
      </p>
      <p className="mt-1 text-lg font-semibold tabular-nums text-foreground">
        {metric.value}
      </p>
      <p className={cn("mt-0.5 text-xs tabular-nums", TREND_STYLES[metric.trend])}>
        {TREND_ARROWS[metric.trend]} {metric.change}
      </p>
    </div>
  );
}
