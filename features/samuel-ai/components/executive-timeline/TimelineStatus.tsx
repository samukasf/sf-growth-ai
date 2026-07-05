import { cn } from "@/utils/cn";

import type { TimelineStepStatus } from "./executive-timeline.types";

type TimelineStatusProps = {
  status: TimelineStepStatus;
  className?: string;
};

const STATUS_STYLES: Record<
  TimelineStepStatus,
  { badge: string; dot: string; label: string }
> = {
  Waiting: {
    badge: "bg-white/[0.04] text-muted ring-white/[0.06]",
    dot: "bg-zinc-600 ring-zinc-600/30",
    label: "Aguardando",
  },
  Running: {
    badge: "bg-accent/10 text-accent ring-accent/20",
    dot: "bg-accent ring-accent/30 animate-pulse",
    label: "Em execução",
  },
  Completed: {
    badge: "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20",
    dot: "bg-emerald-400 ring-emerald-400/30",
    label: "Concluído",
  },
  Warning: {
    badge: "bg-amber-500/10 text-amber-400 ring-amber-500/20",
    dot: "bg-amber-400 ring-amber-400/30",
    label: "Atenção",
  },
  Error: {
    badge: "bg-rose-500/10 text-rose-400 ring-rose-500/20",
    dot: "bg-rose-400 ring-rose-400/30",
    label: "Erro",
  },
};

export function TimelineStatus({ status, className }: TimelineStatusProps) {
  const styles = STATUS_STYLES[status];

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ring-1 ring-inset transition-colors duration-300",
        styles.badge,
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn("size-1.5 rounded-full ring-2 ring-background", styles.dot)}
      />
      {styles.label}
    </span>
  );
}

export function TimelineStatusDot({ status }: { status: TimelineStepStatus }) {
  const styles = STATUS_STYLES[status];

  return (
    <span
      aria-hidden="true"
      className={cn(
        "relative z-10 mt-1 size-[22px] shrink-0 rounded-full ring-4 ring-background transition-all duration-500",
        styles.dot,
      )}
    />
  );
}
