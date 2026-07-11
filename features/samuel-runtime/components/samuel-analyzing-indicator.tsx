"use client";

import { cn } from "@/utils/cn";

type SamuelAnalyzingIndicatorProps = {
  className?: string;
};

export function SamuelAnalyzingIndicator({ className }: SamuelAnalyzingIndicatorProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-accent/20 bg-accent/5 px-5 py-4",
        className,
      )}
      role="status"
      aria-live="polite"
      aria-label="Samuel está analisando"
    >
      <div className="flex items-center gap-3">
        <span className="relative flex size-3">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent/40 opacity-75" />
          <span className="relative inline-flex size-3 rounded-full bg-accent" />
        </span>
        <div>
          <p className="text-sm font-semibold text-accent">Samuel está analisando...</p>
          <p className="text-xs text-muted">
            Orchestrator · Memory · Context · Company Brain · Council · Decision
          </p>
        </div>
      </div>
      <div className="mt-4 h-1 overflow-hidden rounded-full bg-white/[0.06]">
        <div className="h-full w-2/5 animate-pulse rounded-full bg-accent/70" />
      </div>
    </div>
  );
}
