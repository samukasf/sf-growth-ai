import { renderMediaOnWeb } from "@remotion/web-renderer";

import type { SamuelContentProject } from "./samuel-content.types";
import { SamuelRemotionVideo } from "./remotion/SamuelRemotionVideo";
import {
  buildSamuelRemotionPlan,
  type SamuelVideoQuality,
  type SamuelVideoVisualStyle,
} from "./remotion/samuel-remotion-plan";

export type { SamuelVideoQuality, SamuelVideoVisualStyle };

export type SamuelVideoRenderOptions = {
  quality?: SamuelVideoQuality;
  fps?: 24 | 30 | 60;
  referenceImages?: string[];
  visualStyle?: SamuelVideoVisualStyle;
  showBranding?: boolean;
};

type PreparedReferences = {
  urls: string[];
  revoke: string[];
};

export function isPublishableVideoBlob(blob: Blob | null | undefined) {
  return Boolean(blob && blob.type.toLowerCase().startsWith("video/mp4"));
}

export function storedReferenceUrls() {
  if (typeof window === "undefined") return [] as string[];

  try {
    const raw = sessionStorage.getItem("sf-growth-ai:studio:active-reference-urls");
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter(
        (item): item is string =>
          typeof item === "string" && /^(https?:|blob:|data:)/.test(item),
      )
      .slice(0, 30);
  } catch {
    return [];
  }
}

function bitrateFor(quality: SamuelVideoQuality, fps: 24 | 30 | 60) {
  const base =
    quality === "1440p"
      ? 14_000_000
      : quality === "1080p"
        ? 8_000_000
        : 4_000_000;

  return fps === 60 ? Math.round(base * 1.45) : base;
}

async function mediaDurationSeconds(blob: Blob) {
  const url = URL.createObjectURL(blob);

  try {
    const audio = document.createElement("audio");
    audio.preload = "metadata";
    audio.src = url;

    await new Promise<void>((resolve, reject) => {
      const cleanup = () => {
        audio.onloadedmetadata = null;
        audio.onerror = null;
      };

      audio.onloadedmetadata = () => {
        cleanup();
        resolve();
      };
      audio.onerror = () => {
        cleanup();
        reject(new Error("A duração da narração não pôde ser lida."));
      };
    });

    return Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : 0;
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function prepareReferences(urls: string[]): Promise<PreparedReferences> {
  const unique = [
    ...new Set(
      urls
        .filter((url) => /^(https?:|blob:|data:)/.test(url))
        .slice(0, 30),
    ),
  ];
  const prepared: string[] = [];
  const revoke: string[] = [];

  for (const url of unique) {
    if (url.startsWith("data:") || url.startsWith("blob:")) {
      prepared.push(url);
      continue;
    }

    try {
      const response = await fetch(url, { cache: "no-store" });
      if (!response.ok) continue;
      const blob = await response.blob();
      if (!blob.type.startsWith("image/")) continue;
      const localUrl = URL.createObjectURL(blob);
      prepared.push(localUrl);
      revoke.push(localUrl);
    } catch {
      // A reference is optional. A failed image should not abort the video render.
    }
  }

  return { urls: prepared, revoke };
}

export async function renderSamuelCampaignVideo(
  project: SamuelContentProject,
  audio: Blob,
  onProgress?: (progress: number) => void,
  options: SamuelVideoRenderOptions = {},
) {
  if (typeof window === "undefined") {
    throw new Error("O renderizador Remotion precisa ser executado no navegador.");
  }

  if (!("VideoEncoder" in window) || !("AudioEncoder" in window)) {
    throw new Error(
      "Este navegador não oferece WebCodecs suficientes para renderizar MP4. Use Safari 26+, Chrome 94+ ou Firefox 130+.",
    );
  }

  const quality = options.quality ?? "1080p";
  const fps = options.fps ?? 30;
  const visualStyle = options.visualStyle ?? "cinematic";
  const showBranding = options.showBranding ?? true;
  const requestedReferences =
    options.referenceImages?.length ? options.referenceImages : storedReferenceUrls();
  const preparedReferences = await prepareReferences(requestedReferences);
  const audioUrl = URL.createObjectURL(audio);

  try {
    const narrationDuration = await mediaDurationSeconds(audio);
    const plan = buildSamuelRemotionPlan(
      project,
      quality,
      fps,
      narrationDuration,
    );

    const renderProps = {
      project,
      audioUrl,
      referenceImages: preparedReferences.urls,
      quality,
      visualStyle,
      showBranding,
      durationSeconds: plan.durationSeconds,
    };

    const result = await renderMediaOnWeb({
      composition: {
        id: "samuel-campaign-video",
        component: SamuelRemotionVideo,
        durationInFrames: plan.durationInFrames,
        fps: plan.fps,
        width: plan.width,
        height: plan.height,
        defaultProps: renderProps,
      },
      inputProps: renderProps,
      container: "mp4",
      videoCodec: "h264",
      audioCodec: "aac",
      videoBitrate: bitrateFor(quality, fps),
      audioBitrate: "high",
      hardwareAcceleration: "no-preference",
      pageResponsiveness: "medium",
      metadata: {
        title: project.name,
        artist: "SF Growth AI",
        comment: "Samuel IA browser render",
      },
      onProgress: ({ progress }) => {
        onProgress?.(Math.max(0, Math.min(100, Math.round(progress * 100))));
      },
    });

    const blob = await result.getBlob();
    if (blob.size < 32_000) {
      throw new Error("O Remotion encerrou a renderização antes de gerar um MP4 válido.");
    }

    onProgress?.(100);
    return blob;
  } finally {
    URL.revokeObjectURL(audioUrl);
    preparedReferences.revoke.forEach((url) => URL.revokeObjectURL(url));
  }
}
