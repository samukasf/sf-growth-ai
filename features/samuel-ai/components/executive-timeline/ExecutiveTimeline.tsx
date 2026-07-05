"use client";

import { useEffect, useMemo, useState } from "react";

import { cn } from "@/utils/cn";

import { SectionHeader } from "../section-header";
import { buildExecutiveTimeline, type BuildExecutiveTimelineInput } from "./build-executive-timeline";
import { applyInboxActionsToTimeline } from "@/features/executive-inbox";
import type { ExecutiveInboxActionRecord } from "@/features/executive-inbox/executive-inbox.types";
import { TimelineStep } from "./TimelineStep";
import { TimelineEvent } from "./TimelineEvent";

export type ExecutiveTimelineProps = BuildExecutiveTimelineInput & {
  inboxActions?: ExecutiveInboxActionRecord[];
};

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  const seconds = ms / 1000;
  if (seconds < 60) return `${seconds.toFixed(1)}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.round(seconds % 60);
  return `${minutes}m ${remainingSeconds}s`;
}

export function ExecutiveTimeline(props: ExecutiveTimelineProps) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!props.isProcessing) return;

    const interval = window.setInterval(() => {
      setNow(Date.now());
    }, 200);

    return () => window.clearInterval(interval);
  }, [props.isProcessing]);

  const timeline = useMemo(() => {
    const baseTimeline = buildExecutiveTimeline({ ...props, now });
    return applyInboxActionsToTimeline(baseTimeline, props.inboxActions ?? []);
  }, [props, now]);

  return (
    <section className="flex flex-col gap-4">
      <SectionHeader
        title="Executive Timeline"
        description="Raciocínio executivo em tempo real do Samuel AI™"
      />

      <TimelineEvent title="Progresso Geral" accent live={timeline.isLive}>
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-2xl font-semibold tabular-nums text-foreground">
              {timeline.progressPercent}%
            </p>
            <p className="mt-0.5 text-[10px] uppercase tracking-wider text-muted">
              Pipeline executivo
            </p>
          </div>
          <div className="text-right text-[10px] text-muted">
            {timeline.totalDurationMs !== null && (
              <p>Total: {formatDuration(timeline.totalDurationMs)}</p>
            )}
            {timeline.averageConfidence !== null && (
              <p className="mt-0.5 text-accent">
                Confiança média: {timeline.averageConfidence}%
              </p>
            )}
          </div>
        </div>

        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500 ease-out",
              timeline.isLive ? "bg-accent" : "bg-emerald-400",
            )}
            style={{ width: `${timeline.progressPercent}%` }}
          />
        </div>
      </TimelineEvent>

      <TimelineEvent title="Etapas do Raciocínio" live={timeline.isLive}>
        <ol className="relative flex flex-col gap-0">
          {timeline.steps.map((step, index) => (
            <TimelineStep
              key={`${step.id}-${step.order}`}
              step={step}
              isLast={index === timeline.steps.length - 1}
            />
          ))}
        </ol>
      </TimelineEvent>
    </section>
  );
}
