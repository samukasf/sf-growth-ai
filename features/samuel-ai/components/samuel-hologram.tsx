"use client";

import { useMemo, type CSSProperties } from "react";
import { cn } from "@/utils/cn";

export type SamuelHologramState =
  | "sleeping" | "resting" | "listening" | "processing" | "speaking"
  | "executing" | "celebrating" | "alert" | "error";

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
  sleeping: "em repouso", resting: "atento", listening: "ouvindo",
  processing: "pensando", speaking: "falando", executing: "executando",
  celebrating: "concluído", alert: "em alerta", error: "atenção necessária",
};

const PARTICLES = Array.from({ length: 84 }, (_, i) => ({
  angle: (i * 137.508) % 360,
  radius: 18 + ((i * 29) % 118),
  size: 1.5 + (i % 5) * .72,
  delay: -(i % 23) * .17,
  duration: 3.4 + (i % 9) * .37,
}));

const RAYS = Array.from({ length: 18 }, (_, i) => ({ angle: i * 20, length: 88 + (i % 6) * 24 }));

function clamp(v: number) { return Math.max(0, Math.min(1, Number.isFinite(v) ? v : 0)); }

export function SamuelHologram({ state, active=false, speaking=false, compact=false, audioLevel=0, taskProgress=null, className }: SamuelHologramProps) {
  const resolvedState: SamuelHologramState = state ?? (speaking ? "speaking" : active ? "processing" : "resting");
  const level = clamp(audioLevel);
  const energy = resolvedState === "speaking" ? Math.max(.28, level) : resolvedState === "listening" ? Math.max(.22, level) : resolvedState === "processing" || resolvedState === "executing" ? .58 : resolvedState === "sleeping" ? .08 : .25;
  const scale = resolvedState === "listening" ? 1.08 : resolvedState === "processing" ? .92 : resolvedState === "executing" ? 1.12 : resolvedState === "speaking" ? 1 + energy * .13 : 1;
  const progress = typeof taskProgress === "number" ? clamp(taskProgress / 100) : 0;
  const style = useMemo(() => ({
    "--samuel-energy": energy.toFixed(3),
    "--samuel-core-scale": scale.toFixed(3),
    "--samuel-task-progress": progress.toFixed(3),
  }) as CSSProperties, [energy, scale, progress]);

  return (
    <div role="img" aria-label={`Samuel AI ${STATE_LABELS[resolvedState]}`} data-state={resolvedState} style={style}
      className={cn("samuel-hologram samuel-particle-core", `samuel-hologram--${resolvedState}`, compact && "samuel-hologram--compact", className)}>
      <div className="samuel-hologram__aura" aria-hidden="true" />
      <div className="samuel-hologram__energy" aria-hidden="true" />
      <div className="samuel-hologram__ring samuel-hologram__ring--outer" aria-hidden="true" />
      <div className="samuel-hologram__ring samuel-hologram__ring--middle" aria-hidden="true" />
      <div className="samuel-hologram__ring samuel-hologram__ring--inner" aria-hidden="true" />
      <div className="samuel-hologram__radar" aria-hidden="true" />
      <div className="samuel-particle-core__rays" aria-hidden="true">
        {RAYS.map((r) => <i key={r.angle} style={{ "--ray-angle": `${r.angle}deg`, "--ray-length": `${r.length}px` } as CSSProperties} />)}
      </div>
      <div className="samuel-particle-core__cloud" aria-hidden="true">
        {PARTICLES.slice(0, compact ? 48 : 84).map((p, i) => <i key={i} style={{
          "--particle-angle": `${p.angle}deg`, "--particle-radius": `${p.radius}px`, width: p.size, height: p.size,
          animationDelay: `${p.delay}s`, animationDuration: `${p.duration}s`
        } as CSSProperties} />)}
      </div>
      <div className="samuel-particle-core__orb" aria-hidden="true"><span /><b /><em /></div>
      <div className="samuel-hologram__voice-field" aria-hidden="true">
        {[12,22,32,18,38,26,16].map((h,i)=><i key={i} style={{height:h,animationDelay:`${-(i*.11)}s`}} />)}
      </div>
      <div className="samuel-particle-core__state"><strong>{STATE_LABELS[resolvedState]}</strong><span>Samuel AI</span></div>
      <div className="samuel-hologram__scan" aria-hidden="true" />
      <div className="samuel-hologram__base" aria-hidden="true" />
    </div>
  );
}
