import type { SamuelContentProject } from "../samuel-content.types";

export type SamuelVideoQuality = "720p" | "1080p" | "1440p";
export type SamuelVideoVisualStyle = "cinematic" | "clean" | "bold";

export type SamuelRemotionScenePlan = {
  index: number;
  from: number;
  durationInFrames: number;
};

export type SamuelRemotionPlan = {
  width: number;
  height: number;
  fps: 24 | 30 | 60;
  durationInFrames: number;
  durationSeconds: number;
  scenes: SamuelRemotionScenePlan[];
};

function dimensionsFor(
  aspectRatio: SamuelContentProject["aspectRatio"],
  quality: SamuelVideoQuality,
) {
  const longEdge = quality === "1440p" ? 2560 : quality === "1080p" ? 1920 : 1280;

  if (aspectRatio === "16:9") {
    return [longEdge, Math.round((longEdge * 9) / 16)] as const;
  }

  if (aspectRatio === "1:1") {
    const side = quality === "1440p" ? 1440 : quality === "1080p" ? 1080 : 720;
    return [side, side] as const;
  }

  return [Math.round((longEdge * 9) / 16), longEdge] as const;
}

export function buildSamuelRemotionPlan(
  project: SamuelContentProject,
  quality: SamuelVideoQuality,
  fps: 24 | 30 | 60,
  requestedDurationSeconds?: number,
): SamuelRemotionPlan {
  const [width, height] = dimensionsFor(project.aspectRatio, quality);
  const sourceDuration = Math.max(
    1,
    project.scenes.reduce(
      (total, scene) => total + Math.max(0.1, Number(scene.durationSeconds) || 0),
      0,
    ),
  );
  const durationSeconds = Math.max(
    sourceDuration,
    Number.isFinite(requestedDurationSeconds)
      ? Number(requestedDurationSeconds)
      : sourceDuration,
  );
  const durationInFrames = Math.max(1, Math.ceil(durationSeconds * fps));
  const scale = durationSeconds / sourceDuration;

  let cursor = 0;
  const scenes = project.scenes.map((scene, index) => {
    const remaining = durationInFrames - cursor;
    const isLast = index === project.scenes.length - 1;
    const desired = Math.max(
      1,
      Math.round(Math.max(0.1, Number(scene.durationSeconds) || 0.1) * scale * fps),
    );
    const sceneDuration = isLast ? Math.max(1, remaining) : Math.min(desired, Math.max(1, remaining));

    const result = {
      index,
      from: cursor,
      durationInFrames: sceneDuration,
    };
    cursor += sceneDuration;
    return result;
  });

  if (scenes.length === 0) {
    scenes.push({ index: 0, from: 0, durationInFrames });
  } else {
    const last = scenes[scenes.length - 1];
    last.durationInFrames = Math.max(1, durationInFrames - last.from);
  }

  return {
    width,
    height,
    fps,
    durationInFrames,
    durationSeconds,
    scenes,
  };
}
