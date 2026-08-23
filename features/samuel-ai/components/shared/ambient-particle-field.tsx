"use client";

import type { CSSProperties } from "react";

const PARTICLES = Array.from({ length: 54 }, (_, index) => ({
  left: 2 + ((index * 37) % 96),
  top: 2 + ((index * 53) % 94),
  size: 1.2 + (index % 5) * 0.65,
  opacity: 0.22 + (index % 6) * 0.08,
  duration: 9 + (index % 9) * 1.7,
  delay: -(index % 13) * 1.15,
  driftX: -34 + ((index * 29) % 69),
  driftY: -28 + ((index * 41) % 57),
}));

export function AmbientParticleField({ dense = false }: { dense?: boolean }) {
  const particles = dense ? PARTICLES : PARTICLES.slice(0, 36);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <style>{`
        @keyframes samuel-neutral-particle-float {
          0%, 100% { transform: translate3d(0, 0, 0) scale(.72); opacity: var(--particle-opacity); }
          36% { transform: translate3d(calc(var(--particle-dx) * .52), calc(var(--particle-dy) * .44), 0) scale(1.18); opacity: calc(var(--particle-opacity) + .26); }
          72% { transform: translate3d(var(--particle-dx), var(--particle-dy), 0) scale(.88); opacity: calc(var(--particle-opacity) + .08); }
        }
        @keyframes samuel-neutral-particle-glow {
          0%, 100% { filter: brightness(.92); box-shadow: 0 0 4px rgba(255,255,255,.22), 0 0 12px rgba(226,232,240,.08); }
          50% { filter: brightness(1.65); box-shadow: 0 0 7px rgba(255,255,255,.72), 0 0 22px rgba(226,232,240,.28); }
        }
        @keyframes samuel-neutral-haze {
          0%, 100% { transform: translate3d(-3%, -2%, 0) scale(1); opacity: .42; }
          50% { transform: translate3d(4%, 3%, 0) scale(1.08); opacity: .68; }
        }
        @media (prefers-reduced-motion: reduce) {
          .samuel-neutral-particle,
          .samuel-neutral-haze { animation: none !important; }
        }
      `}</style>

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(255,255,255,.075),transparent_22%),radial-gradient(circle_at_84%_24%,rgba(226,232,240,.065),transparent_20%),radial-gradient(circle_at_50%_82%,rgba(203,213,225,.05),transparent_28%)]" />
      <div className="samuel-neutral-haze absolute -left-[18%] top-[12%] h-[54%] w-[54%] rounded-full bg-white/[.028] blur-3xl [animation:samuel-neutral-haze_18s_ease-in-out_infinite]" />
      <div className="samuel-neutral-haze absolute -right-[15%] bottom-[8%] h-[48%] w-[48%] rounded-full bg-slate-200/[.025] blur-3xl [animation:samuel-neutral-haze_22s_ease-in-out_infinite_reverse]" />

      {particles.map((particle, index) => (
        <i
          key={index}
          className="samuel-neutral-particle absolute rounded-full bg-white [animation:samuel-neutral-particle-float_var(--particle-duration)_ease-in-out_var(--particle-delay)_infinite,samuel-neutral-particle-glow_calc(var(--particle-duration)*.62)_ease-in-out_var(--particle-delay)_infinite]"
          style={{
            left: `${particle.left}%`,
            top: `${particle.top}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            "--particle-opacity": String(particle.opacity),
            "--particle-duration": `${particle.duration}s`,
            "--particle-delay": `${particle.delay}s`,
            "--particle-dx": `${particle.driftX}px`,
            "--particle-dy": `${particle.driftY}px`,
          } as CSSProperties}
        />
      ))}
    </div>
  );
}
