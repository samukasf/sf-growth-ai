"use client";

import { Audio } from "@remotion/media";
import {
  AbsoluteFill,
  Img,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

import type { SamuelContentProject } from "../samuel-content.types";
import {
  buildSamuelRemotionPlan,
  type SamuelVideoQuality,
  type SamuelVideoVisualStyle,
} from "./samuel-remotion-plan";

export type SamuelRemotionVideoProps = {
  project: SamuelContentProject;
  audioUrl?: string | null;
  referenceImages?: string[];
  quality?: SamuelVideoQuality;
  visualStyle?: SamuelVideoVisualStyle;
  showBranding?: boolean;
  durationSeconds?: number;
};

function clamp(value: number) {
  return Math.max(0, Math.min(1, value));
}

function Scene({
  project,
  index,
  referenceImage,
  visualStyle,
  showBranding,
}: {
  project: SamuelContentProject;
  index: number;
  referenceImage?: string;
  visualStyle: SamuelVideoVisualStyle;
  showBranding: boolean;
}) {
  const frame = useCurrentFrame();
  const { fps, durationInFrames, width, height } = useVideoConfig();
  const scene = project.scenes[index] ?? project.scenes.at(-1);
  if (!scene) return null;

  const entrance = spring({
    fps,
    frame,
    config: { damping: 18, stiffness: 115, mass: 0.85 },
    durationInFrames: Math.max(8, Math.round(fps * 0.7)),
  });
  const sceneProgress = clamp(frame / Math.max(1, durationInFrames - 1));
  const fadeOut = interpolate(
    frame,
    [
      Math.max(0, durationInFrames - Math.round(fps * 0.35)),
      Math.max(1, durationInFrames - 1),
    ],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const titleOffset = interpolate(entrance, [0, 1], [48, 0]);
  const bodyOffset = interpolate(entrance, [0, 1], [72, 0]);
  const imageScale = interpolate(sceneProgress, [0, 1], [1.035, 1.115]);
  const horizontalPan = interpolate(
    sceneProgress,
    [0, 1],
    index % 2 === 0 ? [-1.6, 1.6] : [1.6, -1.6],
  );
  const verticalPan = interpolate(sceneProgress, [0, 1], [-0.8, 0.8]);
  const portrait = project.aspectRatio === "9:16";
  const square = project.aspectRatio === "1:1";
  const leftAligned = visualStyle === "clean" && project.aspectRatio === "16:9";
  const titleSize = Math.round(
    width * (portrait ? 0.074 : square ? 0.061 : visualStyle === "bold" ? 0.052 : 0.044),
  );
  const bodySize = Math.round(width * (portrait ? 0.035 : square ? 0.032 : 0.024));
  const maxTextWidth = leftAligned
    ? Math.round(width * 0.62)
    : Math.round(width * (portrait ? 0.84 : 0.78));

  return (
    <AbsoluteFill
      style={{
        overflow: "hidden",
        backgroundColor: "#020711",
        opacity: fadeOut,
        fontFamily:
          'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      {referenceImage ? (
        <Img
          src={referenceImage}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: `translate(${horizontalPan}%, ${verticalPan}%) scale(${imageScale})`,
          }}
        />
      ) : (
        <AbsoluteFill
          style={{
            background:
              index % 3 === 0
                ? "radial-gradient(circle at 60% 28%, rgba(37, 189, 255, .7), rgba(8, 26, 69, .72) 32%, #020711 72%)"
                : index % 3 === 1
                  ? "radial-gradient(circle at 32% 34%, rgba(132, 72, 255, .68), rgba(20, 18, 68, .7) 35%, #020711 74%)"
                  : "radial-gradient(circle at 50% 22%, rgba(20, 220, 180, .54), rgba(6, 37, 58, .72) 38%, #020711 76%)",
            transform: `scale(${1 + sceneProgress * 0.035})`,
          }}
        />
      )}

      <AbsoluteFill
        style={{
          background: referenceImage
            ? "linear-gradient(180deg, rgba(1,5,12,.14) 0%, rgba(1,5,12,.10) 38%, rgba(1,5,12,.86) 100%)"
            : "linear-gradient(180deg, rgba(1,5,12,.02) 0%, rgba(1,5,12,.12) 46%, rgba(1,5,12,.74) 100%)",
        }}
      />

      <AbsoluteFill
        style={{
          padding: portrait
            ? `${Math.round(height * 0.055)}px ${Math.round(width * 0.075)}px`
            : `${Math.round(height * 0.065)}px ${Math.round(width * 0.065)}px`,
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: leftAligned ? "flex-start" : "space-between",
            gap: Math.round(width * 0.025),
            opacity: showBranding ? 0.92 : 0,
          }}
        >
          <div
            style={{
              fontSize: Math.max(18, Math.round(width * (portrait ? 0.027 : 0.017))),
              fontWeight: 800,
              letterSpacing: "0.12em",
              color: "#86efff",
            }}
          >
            SF GROWTH AI
          </div>
          {!leftAligned ? (
            <div
              style={{
                fontSize: Math.max(16, Math.round(width * (portrait ? 0.022 : 0.014))),
                fontWeight: 700,
                letterSpacing: "0.08em",
                color: "rgba(255,255,255,.62)",
              }}
            >
              {String(index + 1).padStart(2, "0")}
            </div>
          ) : null}
        </div>

        <div
          style={{
            width: maxTextWidth,
            alignSelf: leftAligned ? "flex-start" : "center",
            textAlign: leftAligned ? "left" : "center",
            paddingBottom: portrait ? Math.round(height * 0.075) : Math.round(height * 0.05),
          }}
        >
          <div
            style={{
              color: "#ffffff",
              fontSize: titleSize,
              fontWeight: 850,
              lineHeight: 0.98,
              letterSpacing: "-0.035em",
              transform: `translateY(${titleOffset}px)`,
              opacity: entrance,
              textWrap: "balance",
            }}
          >
            {scene.headline}
          </div>
          <div
            style={{
              marginTop: Math.round(titleSize * 0.34),
              color: "rgba(241,248,255,.92)",
              fontSize: bodySize,
              fontWeight: 520,
              lineHeight: 1.28,
              transform: `translateY(${bodyOffset}px)`,
              opacity: interpolate(entrance, [0, 1], [0, 0.96]),
              textWrap: "balance",
            }}
          >
            {scene.supportingText}
          </div>
          <div
            style={{
              marginTop: Math.round(bodySize * 0.85),
              display: "flex",
              justifyContent: leftAligned ? "flex-start" : "center",
              alignItems: "center",
              gap: Math.round(width * 0.012),
              opacity: interpolate(entrance, [0.25, 1], [0, 0.78], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            <div
              style={{
                width: Math.max(32, Math.round(width * 0.05)),
                height: Math.max(3, Math.round(height * 0.0032)),
                borderRadius: 999,
                background: "#30d9ff",
              }}
            />
            <span
              style={{
                color: "rgba(180,237,255,.92)",
                fontSize: Math.max(14, Math.round(width * (portrait ? 0.021 : 0.013))),
                fontWeight: 700,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
              }}
            >
              {index === project.scenes.length - 1 ? project.callToAction : scene.visualDirection}
            </span>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

export function SamuelRemotionVideo({
  project,
  audioUrl,
  referenceImages = [],
  quality = "1080p",
  visualStyle = "cinematic",
  showBranding = true,
  durationSeconds,
}: SamuelRemotionVideoProps) {
  const { fps } = useVideoConfig();
  const normalizedFps = fps === 24 || fps === 60 ? fps : 30;
  const plan = buildSamuelRemotionPlan(
    project,
    quality,
    normalizedFps,
    durationSeconds,
  );

  return (
    <AbsoluteFill style={{ backgroundColor: "#020711" }}>
      {plan.scenes.map((scenePlan) => (
        <Sequence
          key={scenePlan.index}
          from={scenePlan.from}
          durationInFrames={scenePlan.durationInFrames}
          name={`Cena ${scenePlan.index + 1}`}
        >
          <Scene
            project={project}
            index={scenePlan.index}
            referenceImage={
              referenceImages.length
                ? referenceImages[scenePlan.index % referenceImages.length]
                : undefined
            }
            visualStyle={visualStyle}
            showBranding={showBranding}
          />
        </Sequence>
      ))}
      {audioUrl ? <Audio src={audioUrl} /> : null}
    </AbsoluteFill>
  );
}
