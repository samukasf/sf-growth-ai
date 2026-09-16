import type { SamuelContentProject } from "./samuel-content.types";

export type SamuelVideoQuality = "720p" | "1080p" | "1440p";
export type SamuelVideoRenderOptions = {
  quality?: SamuelVideoQuality;
  fps?: 24 | 30 | 60;
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
  const [width, height] = dimensionsFor(project, quality);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("O renderizador visual não iniciou.");

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

  const totalSceneDuration = project.scenes.reduce((sum, scene) => sum + scene.durationSeconds, 0);
  const duration = Number.isFinite(audioElement.duration) ? audioElement.duration : totalSceneDuration;
  const draw = () => {
    const elapsed = audioElement.currentTime;
    const normalized = duration ? elapsed / duration : 0;
    let cursor = 0;
    const sceneTime = normalized * totalSceneDuration;
    const scene = project.scenes.find((item) => {
      cursor += item.durationSeconds;
      return sceneTime <= cursor;
    }) ?? project.scenes.at(-1)!;

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

    context.fillStyle = "#54e5ff";
    context.font = `700 ${Math.round(width * .027)}px system-ui`;
    context.textAlign = "center";
    context.fillText("SAMUEL IA  •  SF GROWTH AI", width / 2, height * .08);
    context.fillStyle = "white";
    context.font = `800 ${Math.round(width * .075)}px system-ui`;
    wrapText(context, scene.headline, width * .82).slice(0, 3).forEach((line, index) => context.fillText(line, width / 2, height * .60 + index * width * .085));
    context.fillStyle = "rgba(222,241,255,.86)";
    context.font = `500 ${Math.round(width * .035)}px system-ui`;
    wrapText(context, scene.supportingText, width * .78).slice(0, 4).forEach((line, index) => context.fillText(line, width / 2, height * .79 + index * width * .047));
    context.fillStyle = "#20c7ff";
    context.fillRect(width * .1, height * .94, width * .8 * Math.min(1, normalized), Math.max(4, height * .005));
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
  await audioContext.close();
  URL.revokeObjectURL(audioUrl);
  return result;
}
