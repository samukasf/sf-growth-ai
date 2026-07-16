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

const FACE_DOTS = Array.from({ length: 112 }, (_, index) => {
  const row = Math.floor(index / 14);
  const col = index % 14;
  const x = 212 + col * 13.5 + ((row % 2) * 5.5);
  const y = 165 + row * 28 + ((col % 3) * 2.2);
  const centerBias = Math.abs(x - 300) / 95;
  const lowerBias = Math.max(0, (y - 300) / 210);

  return {
    x,
    y,
    r: 1.15 + ((index * 7) % 9) / 10,
    opacity: Math.max(0.18, 0.68 - centerBias * 0.18 - lowerBias * 0.16),
    delay: -((index % 17) * 0.16),
  };
});

const ORBIT_DOTS = Array.from({ length: 34 }, (_, index) => ({
  angle: (index * 360) / 34,
  delay: -(index * 0.19),
  size: 2 + (index % 4) * 0.52,
}));

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
  const particleCount = compact ? 18 : 36;
  const progress = clamp(speechProgress);
  const hasTaskProgress = typeof taskProgress === "number" && Number.isFinite(taskProgress);
  const normalizedTaskProgress = hasTaskProgress ? clamp(taskProgress / 100) : 0;
  const measuredAudio = clamp(audioLevel);
  const mouthOpen = isSpeaking ? Math.min(1, measuredAudio * 1.48) : smiling ? 0.18 : 0;
  const energyLevel = isSpeaking
    ? Math.max(0.16, measuredAudio)
    : resolvedState === "processing" || resolvedState === "executing"
      ? 0.46
      : resolvedState === "sleeping"
        ? 0.04
        : 0.18;
  const eyeOpen = resolvedState === "sleeping" ? 0.12 : 1;
  const eyeLight =
    resolvedState === "sleeping"
      ? 0.06
      : resolvedState === "resting"
        ? 0.52
        : resolvedState === "listening"
          ? 0.72
          : isSpeaking
            ? 1
            : 0.86;

  const style = useMemo(
    () =>
      ({
        "--samuel-audio-level": energyLevel.toFixed(3),
        "--samuel-eye-light": eyeLight.toFixed(3),
        "--samuel-eye-open": eyeOpen.toFixed(3),
        "--samuel-mouth-open": mouthOpen.toFixed(3),
        "--samuel-speech-progress": progress.toFixed(3),
        "--samuel-task-progress": normalizedTaskProgress.toFixed(3),
        "--samuel-tilt-x": "0deg",
        "--samuel-tilt-y": "0deg",
        "--samuel-gaze-x": "0px",
        "--samuel-gaze-y": "0px",
      }) as CSSProperties,
    [energyLevel, eyeLight, eyeOpen, mouthOpen, normalizedTaskProgress, progress],
  );

  function trackGaze(event: PointerEvent<HTMLDivElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
    const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;

    rootRef.current?.style.setProperty("--samuel-tilt-y", `${x * 1.25}deg`);
    rootRef.current?.style.setProperty("--samuel-tilt-x", `${y * -0.85}deg`);
    rootRef.current?.style.setProperty("--samuel-gaze-x", `${x * 4.2}px`);
    rootRef.current?.style.setProperty("--samuel-gaze-y", `${y * 2.8}px`);
  }

  function centerPresence() {
    rootRef.current?.style.setProperty("--samuel-tilt-x", "0deg");
    rootRef.current?.style.setProperty("--samuel-tilt-y", "0deg");
    rootRef.current?.style.setProperty("--samuel-gaze-x", "0px");
    rootRef.current?.style.setProperty("--samuel-gaze-y", "0px");
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
              left: `${4 + ((index * 37) % 92)}%`,
              top: `${7 + ((index * 43) % 84)}%`,
              animationDelay: `${-(index * 0.27)}s`,
              animationDuration: `${3.2 + (index % 7) * 0.42}s`,
            }}
          />
        ))}
      </div>
      <div className="samuel-hologram__orbit-dots" aria-hidden="true">
        {ORBIT_DOTS.map((dot) => (
          <i
            key={dot.angle}
            style={{
              "--samuel-dot-angle": `${dot.angle}deg`,
              "--samuel-dot-size": `${dot.size}px`,
              animationDelay: `${dot.delay}s`,
            } as CSSProperties}
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
            <linearGradient id={`${svgId}-skin`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#08214f" stopOpacity="0.84" />
              <stop offset="0.42" stopColor="#0a5eb7" stopOpacity="0.58" />
              <stop offset="0.74" stopColor="#071f55" stopOpacity="0.72" />
              <stop offset="1" stopColor="#020817" stopOpacity="0.95" />
            </linearGradient>
            <linearGradient id={`${svgId}-edge`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#e9feff" stopOpacity="0.96" />
              <stop offset="0.38" stopColor="#54e7ff" stopOpacity="0.88" />
              <stop offset="1" stopColor="#2563eb" stopOpacity="0.22" />
            </linearGradient>
            <radialGradient id={`${svgId}-eye`}>
              <stop offset="0" stopColor="#ffffff" />
              <stop offset="0.22" stopColor="#b8fbff" />
              <stop offset="0.55" stopColor="#45dcff" />
              <stop offset="1" stopColor="#2563eb" stopOpacity="0" />
            </radialGradient>
            <radialGradient id={`${svgId}-core`}>
              <stop offset="0" stopColor="#ffffff" />
              <stop offset="0.25" stopColor="#9df8ff" />
              <stop offset="0.62" stopColor="#2f8dff" />
              <stop offset="1" stopColor="#081c54" stopOpacity="0" />
            </radialGradient>
            <clipPath id={`${svgId}-head-clip`}>
              <path d="M184 238c0-114 44-183 116-183s116 69 116 183v115c0 105-45 172-116 172s-116-67-116-172V238Z" />
            </clipPath>
            <filter id={`${svgId}-soft-glow`} x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="7" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id={`${svgId}-tight-glow`} x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="2.2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <g className="samuel-hologram__back-rays">
            {Array.from({ length: 34 }, (_, index) => (
              <path
                key={index}
                d={`M300 338 L${78 + ((index * 37) % 444)} ${30 + ((index * 59) % 214)}`}
              />
            ))}
          </g>

          <g className="samuel-hologram__body">
            <path
              d="M63 713c11-112 67-176 164-200l31-8h84l31 8c97 24 153 88 164 200H63Z"
              fill={`url(#${svgId}-skin)`}
              stroke={`url(#${svgId}-edge)`}
              strokeWidth="3"
            />
            <path className="samuel-hologram__light-thread" d="M154 706c22-87 65-140 127-160M446 706c-22-87-65-140-127-160M300 535v166" />
            <path className="samuel-hologram__circuit-thread" d="M174 640c76-22 176-22 252 0M205 595c57 22 133 22 190 0" />
            <g className="samuel-hologram__chest-core" filter={`url(#${svgId}-soft-glow)`}>
              <circle cx="300" cy="635" r="67" fill="none" stroke="#38bdf8" strokeOpacity=".24" strokeWidth="2" strokeDasharray="4 10" />
              <circle cx="300" cy="635" r="42" fill={`url(#${svgId}-core)`} opacity=".78" />
              <circle cx="300" cy="635" r="12" fill="#e6feff" />
              <path d="M277 635h10l7-18 12 36 8-18h10" fill="none" stroke="#061230" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
            </g>
          </g>

          <g className="samuel-hologram__head">
            <path
              className="samuel-hologram__head-shell"
              d="M184 238c0-114 44-183 116-183s116 69 116 183v115c0 105-45 172-116 172s-116-67-116-172V238Z"
              fill={`url(#${svgId}-skin)`}
              stroke={`url(#${svgId}-edge)`}
              strokeWidth="4"
            />
            <path className="samuel-hologram__hair-shadow" d="M207 151c16-67 47-101 93-101 44 0 75 31 93 93-29-17-63-26-101-26-33 0-62 11-85 34Z" />
            <path className="samuel-hologram__ear samuel-hologram__ear--left" d="M184 295h-20c-14 0-25 12-25 27v52c0 22 14 39 34 43l11 2" />
            <path className="samuel-hologram__ear samuel-hologram__ear--right" d="M416 295h20c14 0 25 12 25 27v52c0 22-14 39-34 43l-11 2" />

            <g clipPath={`url(#${svgId}-head-clip)`}>
              <g className="samuel-hologram__face-grid">
                {FACE_DOTS.map((dot, index) => (
                  <circle
                    key={index}
                    cx={dot.x}
                    cy={dot.y}
                    r={dot.r}
                    opacity={dot.opacity}
                    style={{ animationDelay: `${dot.delay}s` }}
                  />
                ))}
              </g>
              <g className="samuel-hologram__face-scan-lines">
                {Array.from({ length: 18 }, (_, index) => (
                  <path
                    key={index}
                    d={`M205 ${165 + index * 18}c47 ${index % 2 ? 9 : -7} 143 ${index % 2 ? -9 : 7} 190 0`}
                  />
                ))}
              </g>
              <g className="samuel-hologram__face-circuits">
                <path d="M214 269c23-20 55-24 78-10M386 269c-23-20-55-24-78-10" />
                <path d="M216 313c22 31 49 45 82 44M384 313c-22 31-49 45-82 44" />
                <path d="M236 391c27 18 48 27 64 27s37-9 64-27" />
                <path d="M252 456c28 25 68 25 96 0" />
                <path d="M300 179v230M267 203c10 41 10 78 0 111M333 203c-10 41-10 78 0 111" />
              </g>
            </g>

            <g className="samuel-hologram__brow-rig" filter={`url(#${svgId}-tight-glow)`}>
              <path className="samuel-hologram__svg-brow samuel-hologram__svg-brow--left" d="M216 254c18-14 47-17 70-8" />
              <path className="samuel-hologram__svg-brow samuel-hologram__svg-brow--right" d="M384 254c-18-14-47-17-70-8" />
            </g>

            <g className="samuel-hologram__eye-rig" filter={`url(#${svgId}-soft-glow)`}>
              <g className="samuel-hologram__eye-unit samuel-hologram__eye-unit--left">
                <path className="samuel-hologram__eye-shell" d="M218 283c18-15 48-15 66 0-18 16-48 16-66 0Z" />
                <ellipse className="samuel-hologram__eye-glow" cx="251" cy="283" rx="24" ry="7" fill={`url(#${svgId}-eye)`} />
                <circle className="samuel-hologram__pupil" cx="251" cy="283" r="3.5" />
              </g>
              <g className="samuel-hologram__eye-unit samuel-hologram__eye-unit--right">
                <path className="samuel-hologram__eye-shell" d="M316 283c18-15 48-15 66 0-18 16-48 16-66 0Z" />
                <ellipse className="samuel-hologram__eye-glow" cx="349" cy="283" rx="24" ry="7" fill={`url(#${svgId}-eye)`} />
                <circle className="samuel-hologram__pupil" cx="349" cy="283" r="3.5" />
              </g>
            </g>

            <g className="samuel-hologram__nose-rig">
              <path d="M300 294c-10 33-15 58-15 75 9 9 21 13 36 8" />
              <path d="M279 399c12 9 30 9 42 0" />
            </g>

            <g className="samuel-hologram__mouth-rig" filter={`url(#${svgId}-tight-glow)`}>
              <path className="samuel-hologram__lip-line" d="M258 433c26 13 58 13 84 0" />
              <ellipse className="samuel-hologram__mouth-aperture" cx="300" cy="434" rx="33" ry="10" />
              <path className="samuel-hologram__smile-line" d="M263 432c25 23 49 25 74 0" />
            </g>

            <g className="samuel-hologram__beard-grid" clipPath={`url(#${svgId}-head-clip)`}>
              {Array.from({ length: 54 }, (_, index) => {
                const x = 222 + (index % 9) * 19 + ((Math.floor(index / 9) % 2) * 8);
                const y = 407 + Math.floor(index / 9) * 19;
                return <circle key={index} cx={x} cy={y} r={1.35 + (index % 3) * 0.28} />;
              })}
            </g>
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
