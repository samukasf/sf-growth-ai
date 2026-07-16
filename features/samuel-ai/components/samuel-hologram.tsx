"use client";

import Image from "next/image";

import { cn } from "@/utils/cn";

type SamuelHologramProps = {
  active?: boolean;
  speaking?: boolean;
  compact?: boolean;
  className?: string;
};

export function SamuelHologram({
  active = false,
  speaking = false,
  compact = false,
  className,
}: SamuelHologramProps) {
  const particleCount = compact ? 12 : 24;

  return (
    <div
      role="img"
      aria-label="Samuel AI, assistente executivo digital"
      className={cn(
        "samuel-hologram",
        active && "samuel-hologram--active",
        speaking && "samuel-hologram--speaking",
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
      <Image
        src="/samuel-hologram-v2.webp"
        alt=""
        width={1122}
        height={1402}
        priority={!compact}
        sizes={compact ? "150px" : "(max-width: 640px) 310px, (max-width: 1024px) 430px, 520px"}
        className="samuel-hologram__portrait"
      />
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
      <div className="samuel-hologram__scan" aria-hidden="true" />
      <div className="samuel-hologram__base" aria-hidden="true" />
    </div>
  );
}
