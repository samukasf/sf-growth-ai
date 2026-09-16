"use client";

import { useCallback, useMemo, useState } from "react";
import {
  Check,
  Clapperboard,
  Clock3,
  Download,
  Film,
  LoaderCircle,
  Mic2,
  PencilLine,
  PlayCircle,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";

import { cn } from "@/utils/cn";

import { mergeNarrationAudio, splitNarrationText } from "./long-audio.client";
import { ReferenceImageLibrary, type StudioReferenceImage } from "./ReferenceImageLibrary";
import type { SamuelContentProject } from "./samuel-content.types";
import {
  isPublishableVideoBlob,
  renderSamuelCampaignVideo,
  type SamuelVideoQuality,
  type SamuelVideoVisualStyle,
} from "./samuel-video-renderer.client";

type Props = { companyId: string };
type AspectRatio = SamuelContentProject["aspectRatio"];
type LongStyle = "documentary" | "educational" | "commercial" | "institutional";

const DURATIONS = [
  { value: 60, label: "1 minuto" },
  { value: 180, label: "3 minutos" },
  { value: 300, label: "5 minutos" },
  { value: 480, label: "8 minutos" },
  { value: 600, label: "10 minutos" },
];

const STYLE_LABELS: Record<LongStyle, string> = {
  documentary: "Documental",
  educational: "Educativo",
  commercial: "Comercial",
  institutional: "Institucional",
};

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 2_000);
}

function safeFilename(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^A-Za-z0-9]+/g, "-").replace(/^-|-$/g, "").toLowerCase() || "samuel-video";
}

export function LongVideoStudio({ companyId }: Props) {
  const [brief, setBrief] = useState("");
  const [durationTargetSeconds, setDurationTargetSeconds] = useState(180);
  const [style, setStyle] = useState<LongStyle>("documentary");
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("16:9");
  const [quality, setQuality] = useState<SamuelVideoQuality>("1080p");
  const [fps, setFps] = useState<24 | 30 | 60>(30);
  const [visualStyle, setVisualStyle] = useState<SamuelVideoVisualStyle>("cinematic");
  const [references, setReferences] = useState<StudioReferenceImage[]>([]);
  const [project, setProject] = useState<SamuelContentProject | null>(null);
  const [generating, setGenerating] = useState(false);
  const [rendering, setRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  const [narrationProgress, setNarrationProgress] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [approved, setApproved] = useState(false);
  const [editorOpen, setEditorOpen] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);

  const targetMinutes = useMemo(() => Math.round((durationTargetSeconds / 60) * 10) / 10, [durationTargetSeconds]);

  const clearMedia = useCallback(() => {
    if (audioUrl?.startsWith("blob:")) URL.revokeObjectURL(audioUrl);
    if (videoUrl?.startsWith("blob:")) URL.revokeObjectURL(videoUrl);
    setAudioBlob(null);
    setAudioUrl(null);
    setVideoBlob(null);
    setVideoUrl(null);
    setApproved(false);
    setRenderProgress(0);
    setNarrationProgress(0);
  }, [audioUrl, videoUrl]);

  function updateProject(next: SamuelContentProject) {
    setProject(next);
    clearMedia();
    setWarning("O roteiro foi alterado. Gere novamente a prévia final.");
  }

  async function createProject() {
    if (brief.trim().length < 10) {
      setError("Descreva o tema, público e objetivo do vídeo.");
      return;
    }
    setGenerating(true);
    setError(null);
    setWarning(null);
    clearMedia();
    try {
      const response = await fetch("/api/samuel-ai/content-studio/long-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId,
          brief,
          durationTargetSeconds,
          aspectRatio,
          style,
          platforms: ["youtube", "facebook", "linkedin"],
        }),
      });
      const payload = await response.json().catch(() => ({})) as { project?: SamuelContentProject; warning?: string; error?: string };
      if (!response.ok || !payload.project) throw new Error(payload.error || "Não foi possível criar o roteiro longo.");
      setProject({ ...payload.project, aspectRatio });
      setWarning(payload.warning ?? null);
      setEditorOpen(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Falha ao criar vídeo longo.");
    } finally {
      setGenerating(false);
    }
  }

  async function createLongNarration() {
    if (!project) throw new Error("Crie o roteiro primeiro.");
    const chunks = splitNarrationText(project.script);
    if (!chunks.length) throw new Error("O roteiro está vazio.");
    const parts: Blob[] = [];
    for (let index = 0; index < chunks.length; index += 1) {
      setNarrationProgress(Math.round((index / chunks.length) * 100));
      const response = await fetch("/api/samuel-ai/voice/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId, text: chunks[index] }),
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({})) as { error?: string };
        throw new Error(payload.error || `Falha na narração do trecho ${index + 1}.`);
      }
      parts.push(await response.blob());
    }
    setNarrationProgress(94);
    const merged = await mergeNarrationAudio(parts);
    setNarrationProgress(100);
    return merged;
  }

  async function generatePreview() {
    if (!project || rendering) return;
    setRendering(true);
    setError(null);
    setWarning(null);
    setApproved(false);
    setRenderProgress(0);
    setNarrationProgress(0);
    try {
      if (durationTargetSeconds >= 300 && quality === "1440p") {
        setWarning("Vídeos longos em 1440p consomem muita memória do navegador. Se houver lentidão, use 1080p.");
      }
      const narration = await createLongNarration();
      if (audioUrl?.startsWith("blob:")) URL.revokeObjectURL(audioUrl);
      const nextAudioUrl = URL.createObjectURL(narration);
      setAudioBlob(narration);
      setAudioUrl(nextAudioUrl);

      const video = await renderSamuelCampaignVideo(project, narration, setRenderProgress, {
        quality,
        fps,
        referenceImages: references.map((item) => item.previewUrl),
        visualStyle,
        showBranding: true,
      });
      if (videoUrl?.startsWith("blob:")) URL.revokeObjectURL(videoUrl);
      setVideoBlob(video);
      setVideoUrl(URL.createObjectURL(video));
      if (!isPublishableVideoBlob(video)) {
        setWarning("A prévia longa foi gerada em WebM neste navegador. O arquivo pode ser baixado normalmente; MP4 depende do suporte do navegador ou de um renderizador externo.");
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Falha ao montar o vídeo longo.");
    } finally {
      setRendering(false);
    }
  }

  return (
    <section className="space-y-5">
      <div className="rounded-[26px] border border-white/[.07] bg-[radial-gradient(circle_at_90%_0%,rgba(0,174,255,.12),transparent_32%),linear-gradient(180deg,#07131f,#03080e)] p-5 sm:p-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[.22em] text-cyan-300/60"><Clapperboard className="size-4" />Long Form Studio</div>
            <h2 className="mt-2 text-xl font-semibold text-white sm:text-2xl">Vídeos longos com roteiro, voz, referências e montagem real.</h2>
            <p className="mt-2 max-w-3xl text-xs leading-5 text-white/45">O vídeo longo é construído por cenas. O Samuel gera o roteiro, divide a narração em trechos, junta a voz e monta um vídeo contínuo usando as suas imagens com movimento cinematográfico.</p>
          </div>
          <div className="rounded-2xl border border-cyan-300/10 bg-cyan-300/[.045] px-4 py-3 text-right"><strong className="block text-xl text-cyan-100">{targetMinutes} min</strong><span className="text-[9px] uppercase tracking-[.14em] text-cyan-100/35">duração alvo</span></div>
        </div>
      </div>

      <div className="grid gap-5 2xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-5">
          <section className="rounded-[24px] border border-white/[.07] bg-white/[.025] p-4 sm:p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-white"><Sparkles className="size-4 text-cyan-300" />Planeamento do vídeo</div>
            <label className="mt-4 block text-xs text-white/55">Tema e objetivo<textarea value={brief} onChange={(event) => setBrief(event.target.value)} placeholder="Ex.: vídeo de 5 minutos apresentando a empresa, mostrando serviços, diferenciais, processo de atendimento e chamada final para WhatsApp..." className="mt-2 min-h-28 w-full rounded-2xl border border-white/10 bg-[#020914] p-4 text-sm leading-6 text-white outline-none focus:border-cyan-300/35" /></label>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <label className="text-xs text-white/50">Duração<select value={durationTargetSeconds} onChange={(event) => setDurationTargetSeconds(Number(event.target.value))} className="mt-2 min-h-11 w-full rounded-xl border border-white/10 bg-[#020914] px-3 text-white">{DURATIONS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
              <label className="text-xs text-white/50">Estilo<select value={style} onChange={(event) => setStyle(event.target.value as LongStyle)} className="mt-2 min-h-11 w-full rounded-xl border border-white/10 bg-[#020914] px-3 text-white">{Object.entries(STYLE_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
              <label className="text-xs text-white/50">Formato<select value={aspectRatio} onChange={(event) => setAspectRatio(event.target.value as AspectRatio)} className="mt-2 min-h-11 w-full rounded-xl border border-white/10 bg-[#020914] px-3 text-white"><option value="16:9">16:9 · YouTube</option><option value="9:16">9:16 · Vertical</option><option value="1:1">1:1 · Quadrado</option></select></label>
              <label className="text-xs text-white/50">Visual<select value={visualStyle} onChange={(event) => setVisualStyle(event.target.value as SamuelVideoVisualStyle)} className="mt-2 min-h-11 w-full rounded-xl border border-white/10 bg-[#020914] px-3 text-white"><option value="cinematic">Cinematográfico</option><option value="clean">Clean premium</option><option value="bold">Impacto forte</option></select></label>
            </div>
            <button type="button" onClick={() => void createProject()} disabled={generating} className="mt-4 inline-flex min-h-12 items-center gap-2 rounded-xl border border-cyan-300/25 bg-cyan-300/[.09] px-5 text-sm font-semibold text-cyan-50 hover:bg-cyan-300/[.14] disabled:opacity-50">{generating ? <LoaderCircle className="size-4 animate-spin" /> : <Sparkles className="size-4" />}{generating ? "Criando roteiro longo…" : "Criar roteiro e storyboard"}</button>
          </section>

          <ReferenceImageLibrary companyId={companyId} onReferencesChange={setReferences} />

          {project ? (
            <section className="rounded-[24px] border border-white/[.07] bg-white/[.025] p-4 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-3"><div><span className="text-[9px] uppercase tracking-[.18em] text-cyan-300/50">ROTEIRO LONGO</span><h3 className="mt-1 text-lg font-semibold text-white">{project.name}</h3></div><button type="button" onClick={() => setEditorOpen((current) => !current)} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/10 px-3 text-xs text-white/65"><PencilLine className="size-4" />{editorOpen ? "Fechar editor" : "Editar roteiro"}</button></div>
              <p className="mt-2 text-xs leading-5 text-white/45">{project.objective}</p>

              {editorOpen ? <div className="mt-5 space-y-4">
                <div className="grid gap-3 lg:grid-cols-2"><label className="text-xs text-white/50">Gancho<input value={project.hook} onChange={(event) => updateProject({ ...project, hook: event.target.value })} className="mt-2 min-h-11 w-full rounded-xl border border-white/10 bg-[#020914] px-3 text-white" /></label><label className="text-xs text-white/50">CTA<input value={project.callToAction} onChange={(event) => updateProject({ ...project, callToAction: event.target.value })} className="mt-2 min-h-11 w-full rounded-xl border border-white/10 bg-[#020914] px-3 text-white" /></label></div>
                <label className="block text-xs text-white/50">Narração completa<textarea value={project.script} onChange={(event) => updateProject({ ...project, script: event.target.value })} className="mt-2 min-h-64 w-full rounded-2xl border border-white/10 bg-[#020914] p-4 text-sm leading-6 text-white" /></label>
                <div className="space-y-3">{project.scenes.map((scene, index) => <article key={`${scene.headline}-${index}`} className="rounded-2xl border border-white/[.07] bg-black/15 p-3"><div className="mb-2 flex items-center justify-between"><span className="text-[9px] font-semibold uppercase tracking-[.16em] text-cyan-300/50">Cena {String(index + 1).padStart(2, "0")}</span><span className="text-[9px] text-white/30">{scene.durationSeconds}s</span></div><input value={scene.headline} onChange={(event) => updateProject({ ...project, scenes: project.scenes.map((item, i) => i === index ? { ...item, headline: event.target.value } : item) })} className="min-h-10 w-full rounded-lg border border-white/10 bg-[#020914] px-3 text-sm text-white" /><textarea value={scene.supportingText} onChange={(event) => updateProject({ ...project, scenes: project.scenes.map((item, i) => i === index ? { ...item, supportingText: event.target.value } : item) })} className="mt-2 min-h-20 w-full rounded-lg border border-white/10 bg-[#020914] p-3 text-xs leading-5 text-white/75" /><textarea value={scene.visualDirection} onChange={(event) => updateProject({ ...project, scenes: project.scenes.map((item, i) => i === index ? { ...item, visualDirection: event.target.value } : item) })} className="mt-2 min-h-16 w-full rounded-lg border border-white/10 bg-[#020914] p-3 text-xs text-white/55" /></article>)}</div>
              </div> : null}
            </section>
          ) : null}
        </div>

        <aside className="space-y-4">
          <section className="rounded-[24px] border border-cyan-300/12 bg-[#06121f] p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-white"><SlidersHorizontal className="size-4 text-cyan-300" />Renderização</div>
            <label className="mt-4 block text-xs text-white/50">Qualidade<select value={quality} onChange={(event) => setQuality(event.target.value as SamuelVideoQuality)} className="mt-2 min-h-11 w-full rounded-xl border border-white/10 bg-[#020914] px-3 text-white"><option value="720p">HD 720p</option><option value="1080p">Full HD 1080p</option><option value="1440p">2K 1440p</option></select></label>
            <label className="mt-3 block text-xs text-white/50">Movimento<select value={fps} onChange={(event) => setFps(Number(event.target.value) as 24 | 30 | 60)} className="mt-2 min-h-11 w-full rounded-xl border border-white/10 bg-[#020914] px-3 text-white"><option value={24}>24 fps · cinema</option><option value={30}>30 fps · padrão</option><option value={60}>60 fps · fluido</option></select></label>
            <div className="mt-4 space-y-2 text-[11px] text-white/42"><div className="flex items-center gap-2"><Clock3 className="size-3.5 text-cyan-300" />{targetMinutes} min alvo</div><div className="flex items-center gap-2"><Film className="size-3.5 text-cyan-300" />{references.length} imagem(ns) de referência</div><div className="flex items-center gap-2"><Mic2 className="size-3.5 text-cyan-300" />narração dividida e reunida automaticamente</div></div>
            <button type="button" onClick={() => void generatePreview()} disabled={!project || rendering} className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-cyan-300/25 bg-cyan-300/[.09] text-sm font-semibold text-cyan-50 hover:bg-cyan-300/[.14] disabled:opacity-35">{rendering ? <LoaderCircle className="size-4 animate-spin" /> : <PlayCircle className="size-4" />}{rendering ? renderProgress > 0 ? `Montando vídeo · ${renderProgress}%` : `Gerando voz · ${narrationProgress}%` : "Gerar vídeo completo"}</button>
          </section>

          <section className="rounded-[24px] border border-white/[.07] bg-white/[.025] p-4">
            <div className="text-[9px] font-semibold uppercase tracking-[.18em] text-white/35">PRÉVIA FINAL</div>
            <div className={cn("mt-3 overflow-hidden rounded-2xl border border-white/[.08] bg-black", aspectRatio === "9:16" ? "aspect-[9/16]" : aspectRatio === "1:1" ? "aspect-square" : "aspect-video")}>{videoUrl ? <video src={videoUrl} controls playsInline preload="metadata" className="h-full w-full object-contain" /> : <div className="flex h-full min-h-52 flex-col items-center justify-center p-6 text-center text-white/30"><Clapperboard className="size-9" /><strong className="mt-3 text-sm text-white/50">Vídeo ainda não renderizado</strong><p className="mt-1 text-xs leading-5">Roteiro + voz + imagens serão montados aqui.</p></div>}</div>
            {audioUrl ? <audio src={audioUrl} controls className="mt-3 w-full" /> : null}
            {videoUrl ? <button type="button" onClick={() => setApproved((current) => !current)} className={cn("mt-3 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border text-xs font-semibold", approved ? "border-emerald-300/30 bg-emerald-300/[.08] text-emerald-100" : "border-white/10 text-white/65")}><Check className="size-4" />{approved ? "Prévia aprovada" : "Aprovar versão final"}</button> : null}
            {videoBlob ? <button type="button" onClick={() => downloadBlob(videoBlob, `${safeFilename(project?.name ?? "samuel-video")}.${isPublishableVideoBlob(videoBlob) ? "mp4" : "webm"}`)} className="mt-2 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-cyan-300/20 bg-cyan-300/[.055] text-xs font-semibold text-cyan-50"><Download className="size-4" />Baixar vídeo</button> : null}
            {audioBlob ? <button type="button" onClick={() => downloadBlob(audioBlob, `${safeFilename(project?.name ?? "samuel-video")}-narracao.wav`)} className="mt-2 flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border border-white/10 text-[11px] text-white/55"><Download className="size-3.5" />Baixar narração</button> : null}
          </section>
        </aside>
      </div>

      {warning ? <p className="rounded-xl border border-amber-300/15 bg-amber-300/[.05] p-3 text-xs text-amber-100/75">{warning}</p> : null}
      {error ? <p className="rounded-xl border border-red-400/15 bg-red-400/[.05] p-3 text-xs text-red-100/80">{error}</p> : null}
    </section>
  );
}
