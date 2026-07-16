"use client";

import {
  useId,
  useMemo,
  useRef,
  type CSSProperties,
  type PointerEvent,
} from "react";

import { cn } from "@/utils/cn";

export type SamuelHologramState =
  | "sleeping"
  | "resting"
  | "listening"
  | "processing"
  | "speaking"
  | "executing"
  | "celebrating"
  | "alert"
  | "error";

type SamuelHologramProps = {
  state?: SamuelHologramState;
  active?: boolean;
  speaking?: boolean;
  compact?: boolean;
  audioLevel?: number;
  speechProgress?: number;
  taskProgress?: number | null;
  smiling?: boolean;
  className?: string;
};

const STATE_LABELS: Record<SamuelHologramState, string> = {
  sleeping: "em repouso",
  resting: "atento",
  listening: "ouvindo",
  processing: "pensando",
  speaking: "falando",
  executing: "executando uma tarefa",
  celebrating: "celebrando uma conclusão",
  alert: "em alerta",
  error: "com atenção necessária",
};

function clamp(value: number) {
  return Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
}

export function SamuelHologram({
  state,
  active = false,
  speaking = false,
  compact = false,
  audioLevel = 0,
  speechProgress = 0,
  taskProgress = null,
  smiling = false,
  className,
}: SamuelHologramProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const svgId = useId().replaceAll(":", "");
  const resolvedState: SamuelHologramState =
    state ?? (speaking ? "speaking" : active ? "processing" : "resting");
  const isSpeaking = resolvedState === "speaking";
  const particleCount = compact ? 14 : 28;
  const progress = clamp(speechProgress);
  const hasTaskProgress = typeof taskProgress === "number" && Number.isFinite(taskProgress);
  const normalizedTaskProgress = hasTaskProgress ? clamp(taskProgress / 100) : 0;
  const measuredAudio = clamp(audioLevel);
  const naturalCadence = 0.12 + Math.abs(Math.sin(progress * Math.PI * 15)) * 0.18;
  const energyLevel = isSpeaking
    ? Math.min(1, Math.max(naturalCadence, measuredAudio * 1.9))
    : resolvedState === "processing" || resolvedState === "executing"
      ? 0.34
      : 0.12;

  const style = useMemo(
    () =>
      ({
        "--samuel-audio-level": energyLevel.toFixed(3),
        "--samuel-speech-progress": progress.toFixed(3),
        "--samuel-task-progress": normalizedTaskProgress.toFixed(3),
        "--samuel-tilt-x": "0deg",
        "--samuel-tilt-y": "0deg",
      }) as CSSProperties,
    [energyLevel, normalizedTaskProgress, progress],
  );

  function trackGaze(event: PointerEvent<HTMLDivElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
    const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;
    rootRef.current?.style.setProperty("--samuel-tilt-y", `${x * 1.2}deg`);
    rootRef.current?.style.setProperty("--samuel-tilt-x", `${y * -0.8}deg`);
  }

  function centerPresence() {
    rootRef.current?.style.setProperty("--samuel-tilt-x", "0deg");
    rootRef.current?.style.setProperty("--samuel-tilt-y", "0deg");
  }

  return (
    <div
      ref={rootRef}
      role="img"
      aria-label={`Samuel AI, assistente executivo digital, ${STATE_LABELS[resolvedState]}`}
      data-state={resolvedState}
      onPointerMove={trackGaze}
      onPointerLeave={centerPresence}
      style={style}
      className={cn(
        "samuel-hologram",
        `samuel-hologram--${resolvedState}`,
        resolvedState !== "resting" && resolvedState !== "sleeping" && "samuel-hologram--active",
        isSpeaking && "samuel-hologram--speaking",
        smiling && "samuel-hologram--smiling",
        compact && "samuel-hologram--compact",
        className,
      )}
    >
      <div className="samuel-hologram__aura" aria-hidden="true" />
      <div className="samuel-hologram__energy" aria-hidden="true" />
      <div className="samuel-hologram__ring samuel-hologram__ring--outer" aria-hidden="true" />
      <div className="samuel-hologram__ring samuel-hologram__ring--middle" aria-hidden="true" />
      <div className="samuel-hologram__ring samuel-hologram__ring--inner" aria-hidden="true" />
      <div className="samuel-hologram__radar" aria-hidden="true" />
      <div className="samuel-hologram__particles" aria-hidden="true">
        {Array.from({ length: particleCount }, (_, index) => (
          <i
            key={index}
            style={{
              left: `${5 + ((index * 37) % 91)}%`,
              top: `${8 + ((index * 43) % 82)}%`,
              animationDelay: `${-(index * 0.29)}s`,
              animationDuration: `${3 + (index % 6) * 0.48}s`,
            }}
          />
        ))}
      </div>
      <div className="samuel-hologram__core" aria-hidden="true">
        <svg
          className="samuel-hologram__figure"
          viewBox="0 0 600 720"
          focusable="false"
        >
          <defs>
            <linearGradient id={`${svgId}-shell`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#07142f" />
              <stop offset="0.48" stopColor="#0d2f63" />
              <stop offset="1" stopColor="#030916" />
            </linearGradient>
            <linearGradient id={`${svgId}-edge`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#d9fbff" stopOpacity=".95" />
              <stop offset=".38" stopColor="#43dcff" stopOpacity=".8" />
              <stop offset="1" stopColor="#2563eb" stopOpacity=".16" />
            </linearGradient>
            <radialGradient id={`${svgId}-core`}>
              <stop offset="0" stopColor="#ffffff" />
              <stop offset=".25" stopColor="#8cf4ff" />
              <stop offset=".62" stopColor="#2f8dff" />
              <stop offset="1" stopColor="#081c54" stopOpacity="0" />
            </radialGradient>
            <filter id={`${svgId}-glow`} x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="7" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          <g className="samuel-hologram__body">
            <path
              d="M56 713c10-109 63-173 158-198l34-9 104 0 34 9c95 25 148 89 158 198H56Z"
              fill={`url(#${svgId}-shell)`}
              stroke={`url(#${svgId}-edge)`}
              strokeWidth="3"
            />
            <path d="M181 543c23 45 64 68 119 68s96-23 119-68" fill="none" stroke="#5ee9ff" strokeOpacity=".28" strokeWidth="2" />
            <path d="M205 530 161 701M395 530l44 171M300 535v166" fill="none" stroke="#4ac7ff" strokeOpacity=".18" strokeWidth="2" />
            <path d="M190 555c-50 44-82 94-91 150M410 555c50 44 82 94 91 150" fill="none" stroke="#78efff" strokeOpacity=".28" />
          </g>

          <g className="samuel-hologram__helmet">
            <path
              d="M183 223c0-107 43-172 117-172s117 65 117 172v152c0 96-46 158-117 158s-117-62-117-158V223Z"
              fill={`url(#${svgId}-shell)`}
              stroke={`url(#${svgId}-edge)`}
              strokeWidth="4"
            />
            <path d="M210 155c20-54 50-80 90-80s70 26 90 80" fill="none" stroke="#87f3ff" strokeOpacity=".34" strokeWidth="2" />
            <path d="M183 293h-21c-13 0-23 11-23 24v58c0 17 12 31 28 34l16 3M417 293h21c13 0 23 11 23 24v58c0 17-12 31-28 34l-16 3" fill="#081a3a" stroke="#54dcff" strokeOpacity=".55" strokeWidth="3" />
            <path d="M215 421c20 58 49 86 85 86s65-28 85-86" fill="none" stroke="#58dfff" strokeOpacity=".2" />
          </g>

          <g className="samuel-hologram__visor" filter={`url(#${svgId}-glow)`}>
            <path d="M204 230c48-30 144-30 192 0l-14 84c-51 21-113 21-164 0l-14-84Z" fill="#020817" fillOpacity=".96" stroke="#65e7ff" strokeWidth="3" />
            <path className="samuel-hologram__visor-light" d="M224 262c43-16 109-16 152 0" fill="none" stroke="#a5f3fc" strokeWidth="8" strokeLinecap="round" />
            <path className="samuel-hologram__visor-scan" d="M222 286c46 11 110 11 156 0" fill="none" stroke="#38bdf8" strokeOpacity=".55" strokeWidth="2" strokeLinecap="round" />
            <circle cx="300" cy="263" r="5" fill="#fff" />
          </g>

          <g className="samuel-hologram__chest-core" filter={`url(#${svgId}-glow)`}>
            <circle cx="300" cy="622" r="64" fill="none" stroke="#38bdf8" strokeOpacity=".3" strokeWidth="2" strokeDasharray="4 10" />
            <circle cx="300" cy="622" r="42" fill={`url(#${svgId}-core)`} opacity=".78" />
            <circle cx="300" cy="622" r="14" fill="#dffcff" />
            <path d="M278 622h9l7-17 12 34 8-17h9" fill="none" stroke="#061230" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
          </g>

          <g className="samuel-hologram__data-lines">
            <path d="M246 337h-31l-27 27M354 337h31l27 27M247 455l-40 48M353 455l40 48" fill="none" stroke="#52e0ff" strokeOpacity=".34" strokeWidth="2" />
            <circle cx="188" cy="364" r="3" fill="#a5f3fc" /><circle cx="412" cy="364" r="3" fill="#a5f3fc" />
          </g>
        </svg>
      </div>
      <div className="samuel-hologram__voice-field" aria-hidden="true">
        {[12, 22, 32, 18, 38, 26, 16].map((height, index) => (
          <i
            key={`${height}-${index}`}
            style={{
              height,
              animationDelay: `${-(index * 0.11)}s`,
            }}
          />
        ))}
      </div>
      <div
        className="samuel-hologram__task-progress"
        data-mode={hasTaskProgress ? "determinate" : "indeterminate"}
        aria-hidden="true"
      >
        {hasTaskProgress ? (
          <>
            <span><b /></span>
            <strong>{Math.round(normalizedTaskProgress * 100)}%</strong>
          </>
        ) : (
          <><i /><i /><i /></>
        )}
      </div>
      <div className="samuel-hologram__scan" aria-hidden="true" />
      <div className="samuel-hologram__base" aria-hidden="true" />
    </div>
  );
}
