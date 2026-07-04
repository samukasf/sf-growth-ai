import { cn } from "@/utils/cn";

export type TimelineStepStatus = "completed" | "in_progress" | "pending" | "skipped";

export type TimelineStep = {
  id: string;
  order: number;
  title: string;
  description: string;
  status: TimelineStepStatus;
  meta?: string;
};

type TimelineStepsProps = {
  steps: TimelineStep[];
};

const STATUS_LABELS: Record<TimelineStepStatus, string> = {
  completed: "Concluído",
  in_progress: "Em andamento",
  pending: "Pendente",
  skipped: "Ignorado",
};

const STATUS_DOT_STYLES: Record<TimelineStepStatus, string> = {
  completed: "bg-emerald-400 ring-emerald-400/30",
  in_progress: "bg-accent ring-accent/30 animate-pulse",
  pending: "bg-zinc-600 ring-zinc-600/30",
  skipped: "bg-zinc-700 ring-zinc-700/30",
};

const STATUS_TEXT_STYLES: Record<TimelineStepStatus, string> = {
  completed: "text-emerald-400",
  in_progress: "text-accent",
  pending: "text-muted",
  skipped: "text-zinc-600",
};

export function TimelineSteps({ steps }: TimelineStepsProps) {
  return (
    <ol className="relative flex flex-col gap-0">
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;

        return (
          <li key={step.id} className="relative flex gap-3 pb-5 last:pb-0">
            {!isLast && (
              <span
                aria-hidden="true"
                className="absolute left-[11px] top-6 h-[calc(100%-12px)] w-px bg-border"
              />
            )}

            <span
              aria-hidden="true"
              className={cn(
                "relative z-10 mt-1 size-[22px] shrink-0 rounded-full ring-4 ring-background",
                STATUS_DOT_STYLES[step.status],
              )}
            />

            <div className="min-w-0 flex-1 pt-0.5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-foreground">
                  <span className="mr-1.5 text-xs text-muted">{step.order}.</span>
                  {step.title}
                </p>
                <span
                  className={cn(
                    "shrink-0 text-[10px] font-medium uppercase tracking-wider",
                    STATUS_TEXT_STYLES[step.status],
                  )}
                >
                  {STATUS_LABELS[step.status]}
                </span>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-muted">
                {step.description}
              </p>
              {step.meta && (
                <p className="mt-1 text-[11px] text-accent">{step.meta}</p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
