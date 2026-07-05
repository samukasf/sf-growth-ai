import type { ReactNode } from "react";

import { cn } from "@/utils/cn";

type TimelineEventProps = {
  title: string;
  children: ReactNode;
  accent?: boolean;
  live?: boolean;
};

export function TimelineEvent({
  title,
  children,
  accent = false,
  live = false,
}: TimelineEventProps) {
  return (
    <div
      className={cn(
        "rounded-lg border p-3 transition-all duration-500",
        accent ? "border-accent/25 bg-accent/5" : "border-border bg-white/[0.02]",
        live && "shadow-[0_0_24px_rgba(59,130,246,0.06)]",
      )}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <p
          className={cn(
            "text-[10px] font-semibold uppercase tracking-wider",
            accent ? "text-accent" : "text-muted",
          )}
        >
          {title}
        </p>
        {live && (
          <span className="flex items-center gap-1.5 text-[10px] text-accent">
            <span className="size-1.5 animate-pulse rounded-full bg-accent" />
            Ao vivo
          </span>
        )}
      </div>
      {children}
    </div>
  );
}
