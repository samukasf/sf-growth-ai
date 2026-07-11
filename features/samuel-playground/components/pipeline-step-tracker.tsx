import { cn } from "@/utils/cn";

import type { RuntimePipelineStep } from "@/features/samuel-runtime";

type PipelineStepTrackerProps = {
  steps: RuntimePipelineStep[];
};

const STATUS_DOT: Record<RuntimePipelineStep["status"], string> = {
  pending: "bg-white/20",
  running: "bg-amber-400 animate-pulse",
  complete: "bg-emerald-400",
};

function formatDuration(ms?: number): string | null {
  if (ms == null) return null;
  return ms < 1000 ? `${Math.round(ms)}ms` : `${(ms / 1000).toFixed(2)}s`;
}

/**
 * Renderiza as fases reais devolvidas pelo Samuel Runtime
 * (`runtime.pipeline`) — nunca inventadas. Desde a Sprint 76, cada fase
 * também exibe sua duração real (`durationMs`), medida entre o início e a
 * conclusão efetiva da fase (observabilidade aditiva, sem alterar nenhum
 * comportamento do runtime).
 */
export function PipelineStepTracker({ steps }: PipelineStepTrackerProps) {
  return (
    <ol className="flex flex-wrap gap-2">
      {steps.map((step, index) => {
        const duration = formatDuration(step.durationMs);
        return (
          <li
            key={step.id}
            className="flex items-center gap-2 rounded-full border border-border bg-white/[0.02] px-3 py-1.5 text-xs"
          >
            <span className={cn("size-1.5 rounded-full", STATUS_DOT[step.status])} />
            <span className="text-muted">{index + 1}.</span>
            <span className="text-foreground/90">{step.label}</span>
            {duration && <span className="text-muted">· {duration}</span>}
          </li>
        );
      })}
    </ol>
  );
}
