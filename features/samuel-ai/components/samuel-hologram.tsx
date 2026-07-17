"use client";

import {
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

const PORTRAIT_SPARKS = Array.from({ length: 96 }, (_, index) => {
  const column = index % 12;
  const row = Math.floor(index / 12);
  const left = 24 + column * 4.75 + ((row % 2) * 1.8);
  const top = 18 + row * 7.2 + ((column % 3) * 0.7);
  const centerBias = Math.abs(left - 50) / 30;

  return {
    left,
    top,
    size: 1.6 + ((index * 11) % 7) * 0.34,
    opacity: Math.max(0.18, 0.72 - centerBias * 0.22 - Math.max(0, top - 60) * 0.004),
    delay: -((index % 19) * 0.14),
  };
});

const PORTRAIT_THREADS = Array.from({ length: 20 }, (_, index) => ({
  rotation: -72 + index * 7.6,
  top: 16 + (index % 10) * 6.2,
  left: 12 + ((index * 17) % 76),
  delay: -(index * 0.17),
  length: 70 + (index % 5) * 18,
}));

const ORBIT_DOTS = Array.from({ length: 44 }, (_, index) => ({
  angle: (index * 360) / 44,
  delay: -(index * 0.19),
  size: 2 + (index % 4) * 0.52,
}));

const LIGHT_STRANDS = Array.from({ length: 16 }, (_, index) => ({
  rotation: index * 22.5,
  delay: -(index * 0.23),
  length: 130 + (index % 5) * 22,
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
  const resolvedState: SamuelHologramState =
    state ?? (speaking ? "speaking" : active ? "processing" : "resting");
  const isSpeaking = resolvedState === "speaking";
  const particleCount = compact ? 18 : 36;
  const progress = clamp(speechProgress);
  const hasTaskProgress = typeof taskProgress === "number" && Number.isFinite(taskProgress);
  const normalizedTaskProgress = hasTaskProgress ? clamp(taskProgress / 100) : 0;
  const measuredAudio = clamp(audioLevel);
  const speechCycle = isSpeaking ? (Math.sin(progress * Math.PI * 18) + 1) / 2 : 0;
  const speechAccent = isSpeaking ? (Math.sin(progress * Math.PI * 31 + 0.8) + 1) / 2 : 0;
  const mouthOpen = isSpeaking
    ? clamp(Math.pow(measuredAudio, 0.72) * 1.34)
    : smiling
      ? 0.16
      : 0;
  const mouthWide = isSpeaking
    ? clamp(0.26 + measuredAudio * 0.58 + speechCycle * measuredAudio * 0.18)
    : smiling
      ? 0.42
      : 0.18;
  const mouthRound = isSpeaking ? clamp(measuredAudio * (0.34 + speechAccent * 0.42)) : 0;
  const cheekLift = isSpeaking ? clamp(measuredAudio * 0.62 + speechCycle * 0.12) : smiling ? 0.38 : 0;
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
        ? 0.34
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
        "--samuel-mouth-wide": mouthWide.toFixed(3),
        "--samuel-mouth-round": mouthRound.toFixed(3),
        "--samuel-cheek-lift": cheekLift.toFixed(3),
        "--samuel-speech-progress": progress.toFixed(3),
        "--samuel-task-progress": normalizedTaskProgress.toFixed(3),
        "--samuel-tilt-x": "0deg",
        "--samuel-tilt-y": "0deg",
        "--samuel-gaze-x": "0px",
        "--samuel-gaze-y": "0px",
      }) as CSSProperties,
    [
      cheekLift,
      energyLevel,
      eyeLight,
      eyeOpen,
      mouthOpen,
      mouthRound,
      mouthWide,
      normalizedTaskProgress,
      progress,
    ],
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
      <div className="samuel-hologram__light-strands" aria-hidden="true">
        {LIGHT_STRANDS.map((strand) => (
          <i
            key={strand.rotation}
            style={{
              "--samuel-strand-rotation": `${strand.rotation}deg`,
              "--samuel-strand-length": `${strand.length}px`,
              animationDelay: `${strand.delay}s`,
            } as CSSProperties}
          />
        ))}
      </div>

      <div className="samuel-hologram__core samuel-hologram__portrait-core" aria-hidden="true">
        <div className="samuel-hologram__portrait-rig">
          <div className="samuel-hologram__portrait-image" />
          <div className="samuel-hologram__portrait-vignette" />
          <div className="samuel-hologram__portrait-scanlines" />
          <div className="samuel-hologram__portrait-circuit-map">
            {PORTRAIT_THREADS.map((thread) => (
              <i
                key={`${thread.rotation}-${thread.top}-${thread.left}`}
                style={{
                  "--samuel-portrait-thread-rotation": `${thread.rotation}deg`,
                  "--samuel-portrait-thread-left": `${thread.left}%`,
                  "--samuel-portrait-thread-top": `${thread.top}%`,
                  "--samuel-portrait-thread-length": `${thread.length}px`,
                  animationDelay: `${thread.delay}s`,
                } as CSSProperties}
              />
            ))}
          </div>
          <div className="samuel-hologram__portrait-sparks">
            {PORTRAIT_SPARKS.map((spark, index) => (
              <i
                key={index}
                style={{
                  left: `${spark.left}%`,
                  top: `${spark.top}%`,
                  width: `${spark.size}px`,
                  height: `${spark.size}px`,
                  opacity: spark.opacity,
                  animationDelay: `${spark.delay}s`,
                }}
              />
            ))}
          </div>
          <div className="samuel-hologram__portrait-eye-rig">
            {["left", "right"].map((side) => (
              <span
                key={side}
                className={`samuel-hologram__portrait-eye samuel-hologram__portrait-eye--${side}`}
              >
                <b className="samuel-hologram__portrait-eye-glow" />
                <em className="samuel-hologram__portrait-eye-pupil" />
              </span>
            ))}
          </div>
          <div className="samuel-hologram__portrait-brow-rig">
            <i className="samuel-hologram__portrait-brow samuel-hologram__portrait-brow--left" />
            <i className="samuel-hologram__portrait-brow samuel-hologram__portrait-brow--right" />
          </div>
          <div className="samuel-hologram__portrait-mouth-rig">
            <i className="samuel-hologram__portrait-cheek samuel-hologram__portrait-cheek--left" />
            <i className="samuel-hologram__portrait-cheek samuel-hologram__portrait-cheek--right" />
            <i className="samuel-hologram__portrait-upper-lip" />
            <i className="samuel-hologram__portrait-mouth-aperture" />
            <i className="samuel-hologram__portrait-mouth-core" />
            <i className="samuel-hologram__portrait-lower-lip" />
            <i className="samuel-hologram__portrait-smile" />
          </div>
          <div className="samuel-hologram__portrait-chest-core">
            <span />
            <b />
          </div>
        </div>
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