"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Check,
  Download,
  UsersRound,
  Film,
  Camera,
  BriefcaseBusiness,
  LoaderCircle,
  Mic2,
  PlayCircle,
  Send,
  Sparkles,
  PencilLine,
  RotateCcw,
  SlidersHorizontal,
  Eye,
} from "lucide-react";

import { cn } from "@/utils/cn";

import type {
  ContentFormat,
  ContentReadiness,
  SamuelContentProject,
  SocialPlatform,
} from "./samuel-content.types";
import { SOCIAL_PLATFORMS } from "./samuel-content.types";
import {
  isPublishableVideoBlob,
  renderSamuelCampaignVideo,
  type SamuelVideoQuality,
} from "./samuel-video-renderer.client";

type Props = { companyId: string };
type MetaPublishPlatform = SocialPlatform;
type PublishJob = {
  id: string;
  platform: MetaPublishPlatform;
  status: "queued" | "processing" | "published" | "failed";
  providerPostId?: string | null;
  providerPayload?: Record<string, unknown>;
  error?: string | null;
};
type PublishState = {
  busy: boolean;
  status?: PublishJob["status"];
  jobId?: string;
  postId?: string | null;
  permalink?: string | null;
  error?: string | null;
};
type AspectRatio = SamuelContentProject["aspectRatio"];

const LABELS: Record<SocialPlatform, string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  youtube: "YouTube",
  tiktok: "TikTok",
  linkedin: "LinkedIn",
};

const ICONS = {
  facebook: UsersRound,
  instagram: Camera,
  youtube: PlayCircle,
  tiktok: Film,
  linkedin: BriefcaseBusiness,
};

const EXAMPLES = [
  "Faça um vídeo de 30 segundos apresentando nosso produto, destaque o principal benefício e termine com convite para falar no WhatsApp.",
  "Crie uma campanha de lançamento para Instagram, TikTok e YouTube Shorts com tom premium.",
  "Crie posts para todas as redes explicando como nossa solução economiza tempo da equipe.",
];

function sleep(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 2_000);
}

function permalinkFromJob(job: PublishJob | undefined) {
  const value = job?.providerPayload?.permalink;
  return typeof value === "string" && value.startsWith("http") ? value : null;
}

export function SamuelContentStudio({ companyId }: Props) {
  const [format, setFormat] = useState<ContentFormat>("video");
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("9:16");
  const [quality, setQuality] = useState<SamuelVideoQuality>("1080p");
  const [fps, setFps] = useState<24 | 30 | 60>(30);
  const [brief, setBrief] = useState("");
  const [platforms, setPlatforms] = useState<SocialPlatform[]>([...SOCIAL_PLATFORMS]);
  const [project, setProject] = useState<SamuelContentProject | null>(null);
  const [readiness, setReadiness] = useState<ContentReadiness | null>(null);
  const [generating, setGenerating] = useState(false);
  const [rendering, setRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [videoAssetPath, setVideoAssetPath] = useState<string | null>(null);
  const [videoSource, setVideoSource] = useState<"browser" | "ai" | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [aiVideoBusy, setAiVideoBusy] = useState(false);
  const [aiVideoStatus, setAiVideoStatus] = useState<string | null>(null);
  const [publishState, setPublishState] = useState<Partial<Record<SocialPlatform, PublishState>>>({});
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [autoProduce, setAutoProduce] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [previewApproved, setPreviewApproved] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const incoming = sessionStorage.getItem("sf-growth-ai:samuel-content:incoming");
        if (!incoming) return;
        const next = JSON.parse(incoming) as SamuelContentProject;
        if (!next?.id || !Array.isArray(next.scenes)) return;
        setProject(next);
        setBrief(next.objective);
        setFormat(next.format);
        setAspectRatio(next.aspectRatio);
        setPlatforms(next.platforms);
        setAutoProduce(true);
        sessionStorage.removeItem("sf-growth-ai:samuel-content:incoming");
      } catch {
        // Ignore malformed browser state.
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void fetch(`/api/samuel-ai/content-studio?companyId=${encodeURIComponent(companyId)}`, {
      signal: controller.signal,
    })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("Status indisponível")))
      .then((payload: { readiness: ContentReadiness }) => setReadiness(payload.readiness))
      .catch(() => undefined);
    return () => controller.abort();
  }, [companyId]);

  useEffect(() => () => {
    if (videoUrl?.startsWith("blob:")) URL.revokeObjectURL(videoUrl);
    if (audioUrl?.startsWith("blob:")) URL.revokeObjectURL(audioUrl);
  }, [audioUrl, videoUrl]);

  const connectedCount = useMemo(
    () => readiness ? Object.values(readiness.publishing).filter((item) => item.ready).length : 0,
    [readiness],
  );

  function togglePlatform(platform: SocialPlatform) {
    setPlatforms((current) => current.includes(platform)
      ? current.filter((item) => item !== platform)
      : [...current, platform]);
  }

  function openPlatformSetup(platform: SocialPlatform) {
    if (platform === "facebook" || platform === "instagram") {
      window.location.assign(`/integrations/meta/connect?companyId=${encodeURIComponent(companyId)}`);
      return;
    }
    if (platform === "linkedin") {
      window.location.assign(`/integrations/linkedin/connect?companyId=${encodeURIComponent(companyId)}`);
      return;
    }
    setError(`${LABELS[platform]} ainda precisa do fluxo OAuth oficial e da aprovação de publicação da plataforma. Nenhuma postagem foi enviada.`);
  }

  function clearProducedMedia() {
    if (videoUrl?.startsWith("blob:")) URL.revokeObjectURL(videoUrl);
    if (audioUrl?.startsWith("blob:")) URL.revokeObjectURL(audioUrl);
    setVideoUrl(null);
    setVideoBlob(null);
    setVideoAssetPath(null);
    setVideoSource(null);
    setAudioUrl(null);
    setAiVideoStatus(null);
    setPublishState({});
    setPreviewApproved(false);
  }

  function updateProject(next: SamuelContentProject) {
    setProject(next);
    clearProducedMedia();
    setWarning("O roteiro foi alterado. Gere novamente a prévia antes de publicar.");
  }

  async function createCampaign() {
    if (brief.trim().length < 10 || platforms.length === 0) {
      setError(platforms.length ? "Descreva melhor o produto e o objetivo da campanha." : "Escolha ao menos uma rede social.");
      return;
    }
    setGenerating(true);
    setError(null);
    setWarning(null);
    setProject(null);
    clearProducedMedia();
    try {
      const response = await fetch("/api/samuel-ai/content-studio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId, brief, format, platforms, aspectRatio: format === "video" ? aspectRatio : "1:1" }),
      });
      const payload = await response.json() as {
        project?: SamuelContentProject;
        readiness?: ContentReadiness;
        warning?: string;
        error?: string;
      };
      if (!response.ok || !payload.project) throw new Error(payload.error || "Não foi possível criar a campanha.");
      setProject({ ...payload.project, aspectRatio: format === "video" ? aspectRatio : "1:1" });
      if (payload.readiness) setReadiness(payload.readiness);
      setWarning(payload.warning ?? null);
      setEditorOpen(true);
      if (payload.project.format === "video") setAutoProduce(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Falha ao criar campanha.");
    } finally {
      setGenerating(false);
    }
  }

  const uploadBrowserMp4 = useCallback(async (blob: Blob, activeProject: SamuelContentProject) => {
    if (!isPublishableVideoBlob(blob)) {
      throw new Error("Este navegador gerou WebM. Para publicação automática, use Chrome/Edge com suporte a MP4 ou gere o vídeo IA MP4.");
    }
    const form = new FormData();
    form.set("companyId", companyId);
    form.set("projectId", activeProject.id);
    form.set("file", new File([blob], `${activeProject.id}.mp4`, { type: "video/mp4" }));
    const response = await fetch("/api/samuel-ai/content-studio/media", { method: "POST", body: form });
    const payload = await response.json().catch(() => ({})) as { assetPath?: string; previewUrl?: string; error?: string };
    if (!response.ok || !payload.assetPath) throw new Error(payload.error || "Falha ao guardar vídeo MP4.");
    return payload;
  }, [companyId]);

  const generateNarrationAndVideo = useCallback(async () => {
    if (!project || rendering) return;
    setRendering(true);
    setRenderProgress(0);
    setError(null);
    setWarning(null);
    setPreviewApproved(false);
    try {
      const response = await fetch("/api/samuel-ai/voice/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId, text: project.script }),
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => null) as { error?: string } | null;
        throw new Error(payload?.error || "A ElevenLabs não gerou a narração.");
      }
      const audio = await response.blob();
      if (audioUrl?.startsWith("blob:")) URL.revokeObjectURL(audioUrl);
      const nextAudioUrl = URL.createObjectURL(audio);
      setAudioUrl(nextAudioUrl);
      if (project.format === "video") {
        const video = await renderSamuelCampaignVideo(project, audio, setRenderProgress, { quality, fps });
        if (videoUrl?.startsWith("blob:")) URL.revokeObjectURL(videoUrl);
        setVideoBlob(video);
        setVideoUrl(URL.createObjectURL(video));
        setVideoAssetPath(null);
        setVideoSource("browser");
        if (isPublishableVideoBlob(video)) {
          try {
            const uploaded = await uploadBrowserMp4(video, project);
            setVideoAssetPath(uploaded.assetPath ?? null);
          } catch (uploadError) {
            setWarning(uploadError instanceof Error ? uploadError.message : "O vídeo foi criado, mas não pôde ser preparado para publicação.");
          }
        } else {
          setWarning("A prévia foi criada em WebM. Para publicar automaticamente, gere MP4 pela IA ou use um navegador com MediaRecorder MP4.");
        }
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Falha ao produzir o conteúdo.");
    } finally {
      setRendering(false);
    }
  }, [audioUrl, companyId, fps, project, quality, rendering, uploadBrowserMp4, videoUrl]);

  async function generateAiVideo() {
    if (!project || project.format !== "video" || aiVideoBusy) return;
    if (!readiness?.aiVideo.ready) {
      setError(readiness?.aiVideo.detail ?? "Vídeo IA não está configurado.");
      return;
    }
    setAiVideoBusy(true);
    setError(null);
    setWarning(null);
    setPreviewApproved(false);
    setAiVideoStatus("Iniciando geração cinematográfica…");
    const visualBrief = [
      `Crie um vídeo publicitário ${project.aspectRatio === "9:16" ? "vertical" : project.aspectRatio === "1:1" ? "quadrado" : "horizontal"} premium para ${project.name}.`,
      `Objetivo: ${project.objective}. Público: ${project.audience}. Gancho: ${project.hook}.`,
      ...project.scenes.map((scene, index) => `Cena ${index + 1}: ${scene.visualDirection}. Ideia: ${scene.headline}.`),
      "Movimento de câmera natural, iluminação publicitária, aparência realista, transições elegantes. Não invente logotipos e evite texto embutido na imagem.",
    ].join("\n");
    try {
      const response = await fetch("/api/samuel-ai/content-studio/ai-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId, projectId: project.id, title: project.name, aspectRatio: project.aspectRatio, prompt: visualBrief }),
      });
      const started = await response.json().catch(() => ({})) as { generationId?: string; status?: string; error?: string };
      if (!response.ok || !started.generationId) throw new Error(started.error || "A geração IA não iniciou.");
      const generationId = started.generationId;
      for (let attempt = 0; attempt < 60; attempt += 1) {
        if (attempt > 0) await sleep(10_000);
        setAiVideoStatus(`Gerando vídeo IA… ${Math.min(95, 8 + attempt * 2)}%`);
        const check = await fetch(`/api/samuel-ai/content-studio/ai-video?companyId=${encodeURIComponent(companyId)}&generationId=${encodeURIComponent(generationId)}`, { cache: "no-store" });
        const payload = await check.json().catch(() => ({})) as { status?: string; previewUrl?: string; assetPath?: string; error?: string };
        if (payload.status === "completed" && payload.previewUrl && payload.assetPath) {
          if (videoUrl?.startsWith("blob:")) URL.revokeObjectURL(videoUrl);
          setVideoUrl(payload.previewUrl);
          setVideoBlob(null);
          setVideoAssetPath(payload.assetPath);
          setVideoSource("ai");
          setAiVideoStatus("Vídeo IA MP4 pronto. Revise a prévia antes de publicar.");
          return;
        }
        if (payload.status === "failed" || (!check.ok && check.status !== 202)) throw new Error(payload.error || "A geração IA falhou.");
      }
      throw new Error("A geração IA demorou além do esperado. O trabalho ficou guardado para consulta.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Falha ao gerar vídeo IA.");
      setAiVideoStatus(null);
    } finally {
      setAiVideoBusy(false);
    }
  }

  useEffect(() => {
    if (!autoProduce || !project || rendering) return;
    const timer = window.setTimeout(() => {
      setAutoProduce(false);
      void generateNarrationAndVideo();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [autoProduce, generateNarrationAndVideo, project, rendering]);

  async function ensurePublishAsset() {
    if (!previewApproved) throw new Error("Revise a prévia e clique em “Aprovar para publicação” antes de publicar.");
    if (videoAssetPath) return videoAssetPath;
    if (!project || !videoBlob) throw new Error("Gere o vídeo antes de publicar.");
    const uploaded = await uploadBrowserMp4(videoBlob, project);
    if (!uploaded.assetPath) throw new Error("O vídeo não recebeu um caminho de publicação.");
    setVideoAssetPath(uploaded.assetPath);
    return uploaded.assetPath;
  }

  async function pollPublication(platform: MetaPublishPlatform, jobId: string) {
    for (let attempt = 0; attempt < 45; attempt += 1) {
      if (attempt > 0) await sleep(8_000);
      const response = await fetch(`/api/samuel-ai/content-studio/publish?companyId=${encodeURIComponent(companyId)}&jobId=${encodeURIComponent(jobId)}`, { cache: "no-store" });
      const payload = await response.json().catch(() => ({})) as { job?: PublishJob; error?: string };
      const job = payload.job;
      if (!job) {
        if (!response.ok) throw new Error(payload.error || "Falha ao verificar a publicação.");
        continue;
      }
      const permalink = permalinkFromJob(job);
      setPublishState((current) => ({ ...current, [platform]: { busy: job.status === "processing" || job.status === "queued", status: job.status, jobId: job.id, postId: job.providerPostId ?? null, permalink, error: job.error ?? null } }));
      if (job.status === "published") return job;
      if (job.status === "failed") throw new Error(job.error || "A Meta recusou a publicação.");
    }
    throw new Error("A Meta ainda está processando o vídeo. O job ficou registado para verificação posterior.");
  }

  async function publishMetaVideo(platform: MetaPublishPlatform, caption: string) {
    if (platform !== "facebook" && platform !== "instagram") return;
    if (!project || publishState[platform]?.busy) return;
    if (!previewApproved) {
      setError("Antes de publicar, assista ao vídeo e clique em “Aprovar para publicação”.");
      return;
    }
    if (!readiness?.publishing[platform].ready) {
      setError(readiness?.publishing[platform].detail || `Conecte ${LABELS[platform]} antes de publicar.`);
      return;
    }
    if (!window.confirm(`Publicar o vídeo aprovado agora em ${LABELS[platform]}?`)) return;

    setError(null);
    setPublishState((current) => ({ ...current, [platform]: { busy: true, status: "queued" } }));
    try {
      const assetPath = await ensurePublishAsset();
      const response = await fetch("/api/samuel-ai/content-studio/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId, projectId: project.id, platform, assetPath, caption, confirm: true }),
      });
      const payload = await response.json().catch(() => ({})) as { job?: PublishJob; error?: string };
      if (!payload.job) throw new Error(payload.error || "A publicação não iniciou.");
      if (payload.job.status === "published") {
        setPublishState((current) => ({ ...current, [platform]: { busy: false, status: "published", jobId: payload.job!.id, postId: payload.job!.providerPostId ?? null, permalink: permalinkFromJob(payload.job) } }));
        return;
      }
      await pollPublication(platform, payload.job.id);
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "Falha ao publicar vídeo.";
      setError(message);
      setPublishState((current) => ({ ...current, [platform]: { ...current[platform], busy: false, status: "failed", error: message } }));
    }
  }

  return (
    <section className="samuel-content-studio space-y-5">
      <div className="samuel-content-studio__header">
        <div>
          <span><Sparkles /> SOCIAL CONTENT ENGINE</span>
          <h2>Criação, edição, prévia e publicação em um único fluxo.</h2>
          <p>Nenhum vídeo é publicado sem passar pela prévia e pela aprovação explícita. Edite roteiro, cenas, formato e qualidade antes da publicação.</p>
        </div>
        <div className="samuel-content-status"><strong>{connectedCount}/5</strong><span>redes com credencial de publicação</span></div>
      </div>

      <div className="grid gap-3 lg:grid-cols-4">
        {["1. Criar", "2. Editar", "3. Pré-visualizar", "4. Aprovar e publicar"].map((label, index) => (
          <div key={label} className={cn("rounded-2xl border px-4 py-3 text-sm", index === 0 || project ? "border-cyan-400/20 bg-cyan-400/[.05] text-cyan-50" : "border-white/10 bg-white/[.02] text-white/35")}>{label}</div>
        ))}
      </div>

      <section className="samuel-content-connections" aria-label="Conexões das redes sociais">
        <div className="samuel-content-connections__heading"><div><span>CONTAS DE PUBLICAÇÃO</span><h3>Contas conectadas por empresa</h3></div><strong>{connectedCount === 5 ? "Todas conectadas" : `${connectedCount} de 5 conectadas`}</strong></div>
        <div className="samuel-content-connections__grid">
          {SOCIAL_PLATFORMS.map((platform) => {
            const Icon = ICONS[platform];
            const item = readiness?.publishing[platform];
            return <article key={platform} className={cn(item?.ready && "is-ready")}><Icon /><div><strong>{LABELS[platform]}</strong><small>{item?.ready ? "Conta pronta" : item?.detail ?? "Verificando conexão…"}</small></div><button type="button" onClick={() => openPlatformSetup(platform)}>{item?.ready ? "Gerenciar" : "Conectar"}</button></article>;
          })}
        </div>
      </section>

      <div className="samuel-content-grid">
        <div className="samuel-content-composer">
          <div className="samuel-content-format" role="group" aria-label="Formato do conteúdo">
            <button type="button" className={cn(format === "video" && "is-active")} onClick={() => setFormat("video")}><Film /> Vídeo</button>
            <button type="button" className={cn(format === "post" && "is-active")} onClick={() => setFormat("post")}><Send /> Postagem</button>
          </div>

          {format === "video" && <div className="mt-4 rounded-2xl border border-cyan-300/10 bg-[#06121f] p-4">
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-white"><SlidersHorizontal className="size-4 text-cyan-300" />Configuração do vídeo</div>
            <div className="grid gap-3 sm:grid-cols-3">
              <label className="text-xs text-white/60">Formato<select value={aspectRatio} onChange={(event) => setAspectRatio(event.target.value as AspectRatio)} className="mt-2 min-h-11 w-full rounded-xl border border-white/10 bg-[#020914] px-3 text-white"><option value="9:16">Vertical 9:16 · Reels/Shorts</option><option value="1:1">Quadrado 1:1 · Feed</option><option value="16:9">Horizontal 16:9 · YouTube</option></select></label>
              <label className="text-xs text-white/60">Qualidade<select value={quality} onChange={(event) => setQuality(event.target.value as SamuelVideoQuality)} className="mt-2 min-h-11 w-full rounded-xl border border-white/10 bg-[#020914] px-3 text-white"><option value="720p">HD 720p</option><option value="1080p">Full HD 1080p</option><option value="1440p">2K 1440p</option></select></label>
              <label className="text-xs text-white/60">Movimento<select value={fps} onChange={(event) => setFps(Number(event.target.value) as 24 | 30 | 60)} className="mt-2 min-h-11 w-full rounded-xl border border-white/10 bg-[#020914] px-3 text-white"><option value={24}>24 fps · Cinematográfico</option><option value={30}>30 fps · Padrão</option><option value={60}>60 fps · Fluido</option></select></label>
            </div>
          </div>}

          <label htmlFor="campaign-brief">O que o Samuel deve criar?</label>
          <textarea id="campaign-brief" value={brief} onChange={(event) => setBrief(event.target.value)} placeholder="Ex.: Faça um vídeo sobre o produto X, explique o benefício principal e publique no Instagram e Facebook…" />
          <div className="samuel-content-examples">{EXAMPLES.map((example) => <button key={example} type="button" onClick={() => setBrief(example)}><Sparkles /> {example}</button>)}</div>
          <label>Onde deseja publicar?</label>
          <div className="samuel-platform-picker">
            {SOCIAL_PLATFORMS.map((platform) => { const Icon = ICONS[platform]; const ready = readiness?.publishing[platform].ready; return <button type="button" key={platform} onClick={() => togglePlatform(platform)} className={cn(platforms.includes(platform) && "is-selected")}><Icon /><span>{LABELS[platform]}</span><i className={cn(ready && "is-ready")} title={readiness?.publishing[platform].detail}>{ready ? <Check /> : null}</i></button>; })}
          </div>
          <button type="button" className="samuel-content-create" onClick={() => void createCampaign()} disabled={generating}>
            {generating ? <LoaderCircle className="animate-spin" /> : <Sparkles />} {generating ? "Criando campanha…" : format === "video" ? "Criar e gerar vídeo" : "Criar campanha completa"}
          </button>
          {error && <p className="samuel-content-feedback is-error">{error}</p>}
          {warning && <p className="samuel-content-feedback is-warning">{warning}</p>}
        </div>

        <aside className="samuel-content-pipeline">
          <span>FLUXO DE PRODUÇÃO</span>
          {[["01", "Roteiro editável", Boolean(project), "Revise antes de renderizar"], ["02", "Narração natural", readiness?.narration.ready, readiness?.narration.provider ?? "ElevenLabs"], ["03", "Prévia de vídeo", Boolean(videoUrl), `${aspectRatio} · ${quality} · ${fps}fps`], ["04", "Aprovação manual", previewApproved, previewApproved ? "Aprovado" : "Obrigatória antes de publicar"], ["05", "Publicação verificada", Boolean(readiness?.publishing.facebook.ready || readiness?.publishing.instagram.ready), "Meta Graph API"]].map(([number, title, ready, detail]) => <div key={String(number)}><b>{number}</b><p><strong>{title}</strong><small>{detail}</small></p><i className={cn(Boolean(ready) && "is-ready")} /></div>)}
        </aside>
      </div>

      {project && <div className="samuel-content-result">
        <div className="samuel-content-result__summary"><span>CAMPANHA CRIADA</span><h3>{project.name}</h3><p>{project.objective}</p><div><b>Público</b>{project.audience}</div><div><b>Gancho</b>{project.hook}</div><button type="button" onClick={() => setEditorOpen((current) => !current)} className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-xl border border-cyan-400/20 bg-cyan-400/[.07] px-4 text-xs text-cyan-50"><PencilLine className="size-4" />{editorOpen ? "Fechar editor" : "Editar antes de gerar"}</button></div>

        {editorOpen && <section className="col-span-full rounded-[22px] border border-cyan-400/15 bg-[#04101c] p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between gap-3"><div><span className="text-[9px] uppercase tracking-[.2em] text-cyan-300/60">EDITOR</span><h3 className="mt-1 font-semibold text-white">Revise o conteúdo antes do vídeo</h3></div><RotateCcw className="size-5 text-cyan-300/50" /></div>
          <div className="grid gap-3 lg:grid-cols-2">
            <label className="text-xs text-white/55">Gancho<input value={project.hook} onChange={(event) => updateProject({ ...project, hook: event.target.value })} className="mt-2 min-h-11 w-full rounded-xl border border-white/10 bg-[#020914] px-3 text-white" /></label>
            <label className="text-xs text-white/55">Chamada para ação<input value={project.callToAction} onChange={(event) => updateProject({ ...project, callToAction: event.target.value })} className="mt-2 min-h-11 w-full rounded-xl border border-white/10 bg-[#020914] px-3 text-white" /></label>
          </div>
          <label className="mt-3 block text-xs text-white/55">Roteiro<textarea value={project.script} onChange={(event) => updateProject({ ...project, script: event.target.value })} className="mt-2 min-h-32 w-full rounded-xl border border-white/10 bg-[#020914] p-3 text-sm text-white" /></label>
          <div className="mt-4 space-y-3">{project.scenes.map((scene, index) => <div key={index} className="rounded-2xl border border-white/[.07] bg-white/[.02] p-3"><div className="mb-2 text-[10px] font-semibold uppercase tracking-[.18em] text-cyan-300/55">Cena {index + 1}</div><input value={scene.headline} onChange={(event) => { const scenes = project.scenes.map((item, i) => i === index ? { ...item, headline: event.target.value } : item); updateProject({ ...project, scenes }); }} className="min-h-10 w-full rounded-lg border border-white/10 bg-[#020914] px-3 text-sm text-white" /><textarea value={scene.supportingText} onChange={(event) => { const scenes = project.scenes.map((item, i) => i === index ? { ...item, supportingText: event.target.value } : item); updateProject({ ...project, scenes }); }} className="mt-2 min-h-20 w-full rounded-lg border border-white/10 bg-[#020914] p-3 text-sm text-white" /><textarea value={scene.visualDirection} onChange={(event) => { const scenes = project.scenes.map((item, i) => i === index ? { ...item, visualDirection: event.target.value } : item); updateProject({ ...project, scenes }); }} className="mt-2 min-h-16 w-full rounded-lg border border-white/10 bg-[#020914] p-3 text-xs text-white/75" /></div>)}</div>
        </section>}

        <div className="samuel-content-scenes"><span>ROTEIRO E CENAS</span>{project.scenes.map((scene, index) => <article key={`${scene.headline}-${index}`}><b>{String(index + 1).padStart(2, "0")}</b><div><strong>{scene.headline}</strong><p>{scene.supportingText}</p><small>{scene.durationSeconds}s · {scene.visualDirection}</small></div></article>)}</div>

        <div className="samuel-content-preview">
          <span>PRÉVIA OBRIGATÓRIA</span>
          <div className="samuel-content-phone">{videoUrl ? <video src={videoUrl} controls playsInline preload="metadata" /> : <div><Eye /><strong>Veja antes de publicar</strong><p>Gere o vídeo, assista, edite se necessário e só então aprove.</p></div>}</div>
          {audioUrl && <audio src={audioUrl} controls />}
          <button type="button" onClick={() => void generateNarrationAndVideo()} disabled={rendering || aiVideoBusy}>{rendering ? <LoaderCircle className="animate-spin" /> : <Mic2 />}{rendering ? `Montando vídeo · ${renderProgress}%` : project.format === "video" ? `Gerar prévia ${quality} · ${fps}fps` : "Gerar narração"}</button>
          {project.format === "video" && <button type="button" className="is-secondary" onClick={() => void generateAiVideo()} disabled={aiVideoBusy || rendering || !readiness?.aiVideo.ready}>{aiVideoBusy ? <LoaderCircle className="animate-spin" /> : <Sparkles />}{aiVideoBusy ? aiVideoStatus ?? "Gerando vídeo IA…" : "Gerar vídeo visual IA MP4"}</button>}
          {aiVideoStatus && !aiVideoBusy && <p className="samuel-content-feedback">{aiVideoStatus}</p>}
          {videoSource && <small>{videoSource === "ai" ? "Fonte: vídeo IA MP4" : `Fonte: renderizador ${quality} · ${fps}fps · ${videoBlob?.type || "vídeo"}`}{videoAssetPath ? " · guardado para publicação" : ""}</small>}
          {videoUrl && <button type="button" className={cn("is-secondary", previewApproved && "!border-emerald-400/40 !bg-emerald-400/10")} onClick={() => setPreviewApproved((current) => !current)}><Check />{previewApproved ? "Aprovado para publicação" : "Aprovar para publicação"}</button>}
          {videoBlob && <button type="button" className="is-secondary" onClick={() => downloadBlob(videoBlob, `${project.name.replace(/\W+/g, "-").toLowerCase()}.${isPublishableVideoBlob(videoBlob) ? "mp4" : "webm"}`)}><Download /> Baixar vídeo</button>}
        </div>

        <div className="samuel-content-copies"><span>TEXTOS E PUBLICAÇÃO POR REDE</span>{project.socialCopies.map((copy) => {
          const Icon = ICONS[copy.platform];
          const ready = readiness?.publishing[copy.platform].ready;
          const isMeta = copy.platform === "facebook" || copy.platform === "instagram";
          const metaState = isMeta ? publishState[copy.platform] : undefined;
          const caption = `${copy.caption}\n\n${copy.hashtags.map((tag) => `#${tag}`).join(" ")}`.trim();
          return <article key={copy.platform}><div><Icon /><strong>{LABELS[copy.platform]}</strong><i className={cn(ready && "is-ready")} /></div><p>{copy.caption}</p><small>{copy.hashtags.map((tag) => `#${tag}`).join(" ")}</small>{isMeta && ready && project.format === "video" ? <button type="button" onClick={() => void publishMetaVideo(copy.platform, caption)} disabled={metaState?.busy || !videoUrl || !previewApproved}><Send />{metaState?.busy ? "Publicando e verificando…" : metaState?.status === "published" ? "Publicado e verificado" : previewApproved ? "Publicar vídeo aprovado" : "Aprove a prévia primeiro"}</button> : <button type="button" onClick={() => openPlatformSetup(copy.platform)} title={readiness?.publishing[copy.platform].detail}><Send />{ready ? "Publicador oficial pendente" : "Conectar conta"}</button>}{metaState?.status === "published" && <small>Confirmado pela Meta{metaState.postId ? ` · ID ${metaState.postId}` : ""}{metaState.permalink ? <> · <a href={metaState.permalink} target="_blank" rel="noreferrer">abrir publicação</a></> : null}</small>}{metaState?.error && <small>{metaState.error}</small>}</article>;
        })}</div>
      </div>}
    </section>
  );
}
