"use client";

import { Player } from "@remotion/player";
import { useEffect, useMemo, useState } from "react";

import type { SamuelContentProject } from "./samuel-content.types";
import { SamuelRemotionVideo } from "./remotion/SamuelRemotionVideo";
import { buildSamuelRemotionPlan } from "./remotion/samuel-remotion-plan";
import { storedReferenceUrls } from "./samuel-video-renderer.client";

type Props = {
  project: SamuelContentProject;
  audioUrl?: string | null;
};

export function SamuelRemotionPreview({ project, audioUrl }: Props) {
  const [references, setReferences] = useState<string[]>([]);

  useEffect(() => {
    const refresh = () => setReferences(storedReferenceUrls());
    refresh();

    window.addEventListener("storage", refresh);
    window.addEventListener("samuel:studio-reference-change", refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("samuel:studio-reference-change", refresh);
    };
  }, [project.id]);

  const plan = useMemo(
    () => buildSamuelRemotionPlan(project, "720p", 30),
    [project],
  );

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#010307",
      }}
    >
      <Player
        component={SamuelRemotionVideo}
        inputProps={{
          project,
          audioUrl: audioUrl ?? null,
          referenceImages: references,
          quality: "720p",
          visualStyle: "cinematic",
          showBranding: true,
          durationSeconds: plan.durationSeconds,
        }}
        durationInFrames={plan.durationInFrames}
        compositionWidth={plan.width}
        compositionHeight={plan.height}
        fps={plan.fps}
        controls
        loop
        style={{
          width: project.aspectRatio === "9:16" ? "100%" : "100%",
          height: "100%",
          maxWidth: "100%",
          maxHeight: "100%",
          backgroundColor: "#020711",
        }}
      />
    </div>
  );
}
