"use client";

import Image from "next/image";
import { useMemo, useRef, type CSSProperties, type PointerEvent } from "react";

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
  className,
}: SamuelHologramProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const resolvedState: SamuelHologramState =
    state ?? (speaking ? "speaking" : active ? "processing" : "resting");
  const isSpeaking = resolvedState === "speaking";
  const particleCount = compact ? 14 : 28;
  const progress = clamp(speechProgress);
  const syntheticMouth = isSpeaking
    ? 0.34 + Math.abs(Math.sin(progress * 58 + 0.8)) * 0.58
    : 0;
  const mouthLevel = isSpeaking
    ? Math.max(0.22, clamp(audioLevel), syntheticMouth)
    : 0;
  const viseme = isSpeaking ? Math.floor((progress * 41 + mouthLevel * 5) % 5) : 0;

  const style = useMemo(
    () =>
      ({
        "--samuel-mouth-open": mouthLevel.toFixed(3),
        "--samuel-speech-progress": progress.toFixed(3),
        "--samuel-gaze-x": "0px",
        "--samuel-gaze-y": "0px",
      }) as CSSProperties,
    [mouthLevel, progress],
  );

  function trackGaze(event: PointerEvent<HTMLDivElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
    const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;
    rootRef.current?.style.setProperty("--samuel-gaze-x", `${clamp((x + 1) / 2) * 4 - 2}px`);
    rootRef.current?.style.setProperty("--samuel-gaze-y", `${clamp((y + 1) / 2) * 3 - 1.5}px`);
  }

  function centerGaze() {
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
      onPointerLeave={centerGaze}
      style={style}
      className={cn(
        "samuel-hologram",
        `samuel-hologram--${resolvedState}`,
        resolvedState !== "resting" && resolvedState !== "sleeping" && "samuel-hologram--active",
        isSpeaking && "samuel-hologram--speaking",
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
      <div className="samuel-hologram__portrait">
        <Image
          src="/samuel-hologram-v2.webp"
          alt=""
          fill
          priority={!compact}
          sizes={compact ? "150px" : "(max-width: 640px) 310px, (max-width: 1024px) 430px, 520px"}
          className="samuel-hologram__portrait-image"
        />
        <div className="samuel-hologram__facial-rig" aria-hidden="true">
          <i className="samuel-hologram__brow samuel-hologram__brow--left" />
          <i className="samuel-hologram__brow samuel-hologram__brow--right" />
          <i className="samuel-hologram__eye samuel-hologram__eye--left"><b /></i>
          <i className="samuel-hologram__eye samuel-hologram__eye--right"><b /></i>
          <i className={cn("samuel-hologram__mouth", `samuel-hologram__mouth--viseme-${viseme}`)} />
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
      <div className="samuel-hologram__task-progress" aria-hidden="true">
        <i /><i /><i />
      </div>
      <div className="samuel-hologram__scan" aria-hidden="true" />
      <div className="samuel-hologram__base" aria-hidden="true" />
    </div>
  );
}
