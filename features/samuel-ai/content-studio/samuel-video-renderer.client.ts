import type { SamuelContentProject } from "./samuel-content.types";

export type SamuelVideoQuality = "720p" | "1080p" | "1440p";
export type SamuelVideoVisualStyle = "cinematic" | "clean" | "bold";
export type SamuelVideoRenderOptions = {
  quality?: SamuelVideoQuality;
  fps?: 24 | 30 | 60;
  referenceImages?: string[];
  visualStyle?: SamuelVideoVisualStyle;
  showBranding?: boolean;
};

function supportedMimeType() {
  const candidates = [
    "video/mp4;codecs=avc1.42E01E,mp4a.40.2",
    "video/mp4",
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm",
  ];
  return candidates.find((type) => MediaRecorder.isTypeSupported(type)) ?? "";
}

export function isPublishableVideoBlob(blob: Blob | null | undefined) {
  return Boolean(blob && blob.type.toLowerCase().startsWith("video/mp4"));
}

function dimensionsFor(project: SamuelContentProject, quality: SamuelVideoQuality) {
  const longEdge = quality === "1440p" ? 2560 : quality === "1080p" ? 1920 : 1280;
  if (project.aspectRatio === "16:9") return [longEdge, Math.round(longEdge * 9 / 16)] as const;
  if (project.aspectRatio === "1:1") {
    const side = quality === "1440p" ? 1440 : quality === "1080p" ? 1080 : 720;
    return [side, side] as const;
  }
  return [Math.round(longEdge * 9 / 16), longEdge] as const;
}

function bitrateFor(quality: SamuelVideoQuality, fps: 24 | 30 | 60) {
  const base = quality === "1440p" ? 14_000_000 : quality === "1080p" ? 8_000_000 : 4_000_000;
  return fps === 60 ? Math.round(base * 1.45) : base;
}

function wrapText(context: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const next = `${line} ${word}`.trim();
    if (context.measureText(next).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

async function loadReferenceImages(urls: string[]) {
  if (!urls.length || typeof createImageBitmap === "undefined") return [] as ImageBitmap[];
  const unique = [...new Set(urls.filter((url) => /^https?:|^blob:|^data:/.test(url)))].slice(0, 30);
  const images = await Promise.all(unique.map(async (url) => {
    try {
      const response = await fetch(url, { cache: "no-store" });
      if (!response.ok) return null;
      const blob = await response.blob();
      if (!blob.type.startsWith("image/")) return null;
      return await createImageBitmap(blob);
    } catch {
      return null;
    }
  }));
  return images.filter((image): image is ImageBitmap => Boolean(image));
}

function drawCoverImage(
  context: CanvasRenderingContext2D,
  image: ImageBitmap,
  width: number,
  height: number,
  progress: number,
  sceneIndex: number,
) {
  const baseScale = Math.max(width / image.width, height / image.height);
  const zoom = 1.035 + progress * 0.075;
  const scale = baseScale * zoom;
  const drawWidth = image.width * scale;
  const drawHeight = image.height * scale;
  const maxPanX = Math.max(0, (drawWidth - width) * .28);
  const maxPanY = Math.max(0, (drawHeight - height) * .24);
  const direction = sceneIndex % 2 === 0 ? 1 : -1;
  const x = (width - drawWidth) / 2 + direction * maxPanX * (.5 - progress);
  const y = (height - drawHeight) / 2 + Math.sin((progress + sceneIndex) * Math.PI) * maxPanY * .22;
  context.drawImage(image, x, y, drawWidth, drawHeight);
}

function drawGeneratedBackdrop(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  elapsed: number,
) {
  const glow = 0.5 + Math.sin(elapsed * 1.8) * 0.12;
  const gradient = context.createRadialGradient(width * .5, height * .38, 20, width * .5, height * .45, height * .72);
  gradient.addColorStop(0, `rgba(20,150,255,${glow})`);
  gradient.addColorStop(.38, "#071c43");
  gradient.addColorStop(1, "#020711");
  context.fillStyle = gradient;
  context.fillRect(0, 0, width, height);

  context.strokeStyle = "rgba(61,218,255,.24)";
  context.lineWidth = Math.max(2, width / 700);
  for (let i = 0; i < 5; i += 1) {
    context.beginPath();
    context.arc(width / 2, height * .36, width * (.15 + i * .055 + Math.sin(elapsed + i) * .008), 0, Math.PI * 2);
    context.stroke();
  }

  context.save();
  context.translate(width / 2, height * .36);
  context.rotate(elapsed * .09);
  context.strokeStyle = "rgba(139,92,246,.34)";
  context.lineWidth = Math.max(2, width / 820);
  context.beginPath();
  context.ellipse(0, 0, width * .28, width * .09, .55, 0, Math.PI * 2);
  context.stroke();
  context.restore();
}

function drawImageOverlay(context: CanvasRenderingContext2D, width: number, height: number, style: SamuelVideoVisualStyle) {
  const overlay = context.createLinearGradient(0, 0, 0, height);
  overlay.addColorStop(0, style === "clean" ? "rgba(2,7,12,.18)" : "rgba(2,7,12,.28)");
  overlay.addColorStop(.48, "rgba(2,7,12,.14)");
  overlay.addColorStop(1, style === "bold" ? "rgba(2,7,12,.86)" : "rgba(2,7,12,.76)");
  context.fillStyle = overlay;
  context.fillRect(0, 0, width, height);
  const vignette = context.createRadialGradient(width / 2, height / 2, Math.min(width, height) * .1, width / 2, height / 2, Math.max(width, height) * .75);
  vignette.addColorStop(0, "rgba(0,0,0,0)");
  vignette.addColorStop(1, "rgba(0,0,0,.34)");
  context.fillStyle = vignette;
  context.fillRect(0, 0, width, height);
}

function drawSceneText(
  context: CanvasRenderingContext2D,
  project: SamuelContentProject,
  width: number,
  height: number,
  scene: SamuelContentProject["scenes"][number],
  style: SamuelVideoVisualStyle,
  showBranding: boolean,
) {
  const portrait = project.aspectRatio === "9:16";
  const square = project.aspectRatio === "1:1";
  const horizontal = project.aspectRatio === "16:9";

  if (showBranding) {
    context.fillStyle = "rgba(120,232,255,.95)";
    context.font = `700 ${Math.round(width * (horizontal ? .016 : .025))}px system-ui`;
    context.textAlign = style === "clean" && horizontal ? "left" : "center";
    context.fillText(
      "SAMUEL IA  •  SF GROWTH AI",
      style === "clean" && horizontal ? width * .07 : width / 2,
      height * .075,
    );
  }

  const leftAligned = style === "clean" && horizontal;
  const textX = leftAligned ? width * .07 : width / 2;
  const maxWidth = width * (leftAligned ? .62 : portrait ? .82 : .78);
  const titleY = portrait ? height * .67 : square ? height * .65 : height * .69;
  const titleSize = Math.round(width * (portrait ? .072 : square ? .06 : style === "bold" ? .052 : .042));
  const supportingSize = Math.round(width * (portrait ? .034 : square ? .032 : .022));

  context.textAlign = leftAligned ? "left" : "center";
  context.fillStyle = "white";
  context.font = `800 ${titleSize}px system-ui`;
  const headlineLines = wrapText(context, scene.headline, maxWidth).slice(0, 3);
  headlineLines.forEach((line, index) => context.fillText(line, textX, titleY + index * titleSize * 1.08));

  context.fillStyle = "rgba(236,247,255,.92)";
  context.font = `500 ${supportingSize}px system-ui`;
  const bodyY = titleY + headlineLines.length * titleSize * 1.12 + supportingSize * 1.25;
  wrapText(context, scene.supportingText, maxWidth).slice(0, portrait ? 4 : 3).forEach((line, index) => {
    context.fillText(line, textX, bodyY + index * supportingSize * 1.35);
  });
}

export async function renderSamuelCampaignVideo(
  project: SamuelContentProject,
  audio: Blob,
  onProgress?: (progress: number) => void,
  options: SamuelVideoRenderOptions = {},
) {
  if (typeof MediaRecorder === "undefined" || !HTMLCanvasElement.prototype.captureStream) {
    throw new Error("Este navegador não consegue montar vídeo. Use Chrome ou Edge atualizado no computador.");
  }

  const quality = options.quality ?? "1080p";
  const fps = options.fps ?? 30;
  const visualStyle = options.visualStyle ?? "cinematic";
  const showBranding = options.showBranding ?? true;
  const [width, height] = dimensionsFor(project, quality);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("O renderizador visual não iniciou.");

  const referenceImages = await loadReferenceImages(options.referenceImages ?? []);
  const audioUrl = URL.createObjectURL(audio);
  const audioElement = new Audio(audioUrl);
  await new Promise<void>((resolve, reject) => {
    audioElement.onloadedmetadata = () => resolve();
    audioElement.onerror = () => reject(new Error("A narração não pôde ser carregada."));
  });

  const audioContext = new AudioContext();
  const source = audioContext.createMediaElementSource(audioElement);
  const destination = audioContext.createMediaStreamDestination();
  source.connect(destination);
  source.connect(audioContext.destination);
  const canvasStream = canvas.captureStream(fps);
  const stream = new MediaStream([...canvasStream.getVideoTracks(), ...destination.stream.getAudioTracks()]);
  const mimeType = supportedMimeType();
  const recorder = new MediaRecorder(
    stream,
    mimeType ? { mimeType, videoBitsPerSecond: bitrateFor(quality, fps) } : undefined,
  );
  const chunks: BlobPart[] = [];
  recorder.ondataavailable = (event) => {
    if (event.data.size) chunks.push(event.data);
  };
  const completed = new Promise<Blob>((resolve, reject) => {
    recorder.onerror = () => reject(new Error("Falha ao montar o vídeo."));
    recorder.onstop = () => resolve(new Blob(chunks, { type: recorder.mimeType || mimeType || "video/webm" }));
  });

  const totalSceneDuration = Math.max(1, project.scenes.reduce((sum, scene) => sum + scene.durationSeconds, 0));
  const duration = Number.isFinite(audioElement.duration) && audioElement.duration > 0 ? audioElement.duration : totalSceneDuration;
  const draw = () => {
    const elapsed = audioElement.currentTime;
    const normalized = duration ? Math.min(1, elapsed / duration) : 0;
    const sceneTime = normalized * totalSceneDuration;
    let sceneIndex = project.scenes.length - 1;
    let sceneStart = 0;
    let cursor = 0;
    for (let index = 0; index < project.scenes.length; index += 1) {
      const next = cursor + project.scenes[index].durationSeconds;
      if (sceneTime <= next) {
        sceneIndex = index;
        sceneStart = cursor;
        break;
      }
      cursor = next;
    }
    const scene = project.scenes[sceneIndex] ?? project.scenes.at(-1)!;
    const sceneProgress = Math.max(0, Math.min(1, (sceneTime - sceneStart) / Math.max(1, scene.durationSeconds)));

    const reference = referenceImages.length ? referenceImages[sceneIndex % referenceImages.length] : null;
    context.fillStyle = "#020711";
    context.fillRect(0, 0, width, height);
    if (reference) {
      drawCoverImage(context, reference, width, height, sceneProgress, sceneIndex);
      drawImageOverlay(context, width, height, visualStyle);
    } else {
      drawGeneratedBackdrop(context, width, height, elapsed);
    }

    drawSceneText(context, project, width, height, scene, visualStyle, showBranding);

    context.fillStyle = "rgba(32,199,255,.18)";
    context.fillRect(width * .08, height * .95, width * .84, Math.max(4, height * .005));
    context.fillStyle = "#20c7ff";
    context.fillRect(width * .08, height * .95, width * .84 * normalized, Math.max(4, height * .005));
    onProgress?.(Math.round(normalized * 100));
    if (!audioElement.ended) requestAnimationFrame(draw);
  };

  recorder.start(1_000);
  await audioContext.resume();
  await audioElement.play();
  draw();
  await new Promise<void>((resolve) => {
    audioElement.onended = () => resolve();
  });
  recorder.stop();
  const result = await completed;
  canvasStream.getTracks().forEach((track) => track.stop());
  destination.stream.getTracks().forEach((track) => track.stop());
  referenceImages.forEach((image) => image.close());
  await audioContext.close();
  URL.revokeObjectURL(audioUrl);
  return result;
}
