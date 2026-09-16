"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Check,
  CheckCircle2,
  Download,
  Film,
  LoaderCircle,
  Pencil,
  Play,
  RefreshCw,
  Send,
  Settings2,
  Sparkles,
} from "lucide-react";

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
  type SamuelVideoFileFormat,
  type SamuelVideoQuality,
} from "./samuel-video-renderer.client";

type Props = { companyId: string };
type AspectRatio = "9:16" | "1:1" | "16:9";
type PublishState = { busy: boolean; status?: string; error?: string; permalink?: string | null };

const LABELS: Record<SocialPlatform, string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  youtube: "YouTube",
  tiktok: "TikTok",
  linkedin: "LinkedIn",
};

function sleep(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function revoke(url: string | null) {
  if (url?.startsWith("blob:")) URL.revokeObjectURL(url);
}

function copyFor(project: SamuelContentProject, platform: SocialPlatform) {
  return project.socialCopies.find((copy) => copy.platform === platform)?.caption ?? `${project.hook}\n\n${project.callToAction}`;
}

export function SamuelContentStudioV2({ companyId }: Props) {
  const [brief, setBrief] = useState("");
  const [format, setFormat] = useState<ContentFormat>("video");
  const [platforms, setPlatforms] = useState<SocialPlatform[]>(["instagram", "facebook"]);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("9:16");
  const [quality, setQuality] = useState<SamuelVideoQuality>("1080p");
  const [fileFormat, setFileFormat] = useState<SamuelVideoFileFormat>("mp4");
  const [project, setProject] = useState<SamuelContentProject | null>(null);
  const [readiness, setReadiness] = useState<ContentReadiness | null>(null);
  const [creating, setCreating] = useState(false);
  const [rendering, setRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  const [aiBusy, setAiBusy] = useState(false);
  const [aiStatus, setAiStatus] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [assetPath, setAssetPath] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [approved, setApproved] = useState(false);
  const [editing, setEditing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [publishing, setPublishing] = useState<Partial<Record<SocialPlatform, PublishState>>>({});

  useEffect(() => {
    const controller = new AbortController();
    void fetch(`/api/samuel-ai/content-studio?companyId=${encodeURIComponent(companyId)}`, { signal: controller.signal })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("Status indisponível")))
      .then((payload: { readiness: ContentReadiness }) => setReadiness(payload.readiness))
      .catch(() => undefined);
    return () => controller.abort();
  }, [companyId]);

  useEffect(() => () => {
    revoke(videoUrl);
    revoke(audioUrl);
  }, [videoUrl, audioUrl]);

  const connected = useMemo(() => readiness ? SOCIAL_PLATFORMS.filter((platform) => readiness.publishing[platform].ready) : [], [readiness]);
  const metaPublishable = platforms.filter((platform) => (platform === "facebook" || platform === "instagram") && readiness?.publishing[platform].ready);

  function resetMedia() {
    revoke(videoUrl);
    revoke(audioUrl);
    setVideoUrl(null);
    setVideoBlob(null);
    setAssetPath(null);
    setAudioUrl(null);
    setApproved(false);
    setPublishing({});
  }

  function changeProject(next: SamuelContentProject) {
    setProject(next);
    setApproved(false);
    setNotice("Alteração guardada no rascunho. Gere novamente o vídeo para aplicar a edição ao ficheiro final.");
  }

  function togglePlatform(platform: SocialPlatform) {
    setPlatforms((current) => current.includes(platform) ? current.filter((item) => item !== platform) : [...current, platform]);
    setApproved(false);
  }

  async function createProject() {
    if (brief.trim().length < 10) return setError("Descreva o vídeo/campanha com mais detalhe.");
    if (!platforms.length) return setError("Escolha ao menos uma rede social.");
    setCreating(true);
    setError(null);
    setNotice(null);
    resetMedia();
    try {
      const response = await fetch("/api/samuel-ai/content-studio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId, brief, format, platforms, aspectRatio }),
      });
      const payload = await response.json() as { project?: SamuelContentProject; readiness?: ContentReadiness; error?: string; warning?: string };
      if (!response.ok || !payload.project) throw new Error(payload.error || "Não foi possível criar a campanha.");
      setProject({ ...payload.project, aspectRatio });
      if (payload.readiness) setReadiness(payload.readiness);
      setEditing(true);
      setNotice(payload.warning ?? "Roteiro criado. Revise e edite antes de produzir o vídeo.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Falha ao criar campanha.");
    } finally {
      setCreating(false);
    }
  }

  async function uploadBrowserVideo(blob: Blob, current: SamuelContentProject) {
    if (!isPublishableVideoBlob(blob)) return null;
    const form = new FormData();
    form.set("companyId", companyId);
    form.set("projectId", current.id);
    form.set("file", new File([blob], `${current.id}.mp4`, { type: "video/mp4" }));
    const response = await fetch("/api/samuel-ai/content-studio/media", { method: "POST", body: form });
    const payload = await response.json().catch(() => ({})) as { assetPath?: string; previewUrl?: string; error?: string };
    if (!response.ok || !payload.assetPath) throw new Error(payload.error || "Falha ao guardar o vídeo.");
    return payload;
  }

  async function renderWithVoice() {
    if (!project || rendering) return;
    setRendering(true);
    setRenderProgress(0);
    setError(null);
    setNotice(null);
    setApproved(false);
    try {
      const speech = await fetch("/api/samuel-ai/voice/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId, text: project.script }),
      });
      if (!speech.ok) {
        const payload = await speech.json().catch(() => ({})) as { error?: string };
        throw new Error(payload.error || "A narração não foi gerada.");
      }
      const audio = await speech.blob();
      revoke(audioUrl);
      const nextAudioUrl = URL.createObjectURL(audio);
      setAudioUrl(nextAudioUrl);

      if (project.format === "video") {
        const nextProject = { ...project, aspectRatio };
        const blob = await renderSamuelCampaignVideo(nextProject, audio, setRenderProgress, { quality, aspectRatio, fileFormat });
        revoke(videoUrl);
        const nextUrl = URL.createObjectURL(blob);
        setVideoBlob(blob);
        setVideoUrl(nextUrl);
        setAssetPath(null);
        if (isPublishableVideoBlob(blob)) {
          const uploaded = await uploadBrowserVideo(blob, nextProject);
          setAssetPath(uploaded?.assetPath ?? null);
        }
        setNotice(isPublishableVideoBlob(blob)
          ? "Vídeo pronto. Assista inteiro, aprove ou volte para editar."
          : "Prévia criada em WebM. Pode descarregar e revisar; para publicar automaticamente na Meta, gere MP4.");
      }
      setEditing(false);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Falha ao produzir o vídeo.");
    } finally {
      setRendering(false);
    }
  }

  async function generateAiVideo() {
    if (!project || aiBusy) return;
    if (!readiness?.aiVideo.ready) return setError(readiness?.aiVideo.detail ?? "Vídeo IA não está disponível.");
    setAiBusy(true);
    setApproved(false);
    setError(null);
    setAiStatus("A iniciar vídeo IA…");
    try {
      const prompt = [
        `Vídeo publicitário premium para ${project.name}.`,
        `Objetivo: ${project.objective}. Público: ${project.audience}.`,
        `Gancho: ${project.hook}. CTA: ${project.callToAction}.`,
        ...project.scenes.map((scene, index) => `Cena ${index + 1}: ${scene.visualDirection}. ${scene.headline}. ${scene.supportingText}.`),
        "Movimento cinematográfico natural, iluminação publicitária, aparência realista, transições elegantes. Não inventar logotipos nem inserir texto ilegível.",
      ].join("\n");
      const response = await fetch("/api/samuel-ai/content-studio/ai-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId, projectId: project.id, title: project.name, aspectRatio, resolution: quality, prompt }),
      });
      const started = await response.json().catch(() => ({})) as { generationId?: string; error?: string };
      if (!response.ok || !started.generationId) throw new Error(started.error || "A geração IA não iniciou.");

      for (let attempt = 0; attempt < 60; attempt += 1) {
        if (attempt) await sleep(10_000);
        setAiStatus(`A gerar vídeo IA… ${Math.min(95, 8 + attempt * 2)}%`);
        const check = await fetch(`/api/samuel-ai/content-studio/ai-video?companyId=${encodeURIComponent(companyId)}&generationId=${encodeURIComponent(started.generationId)}`, { cache: "no-store" });
        const result = await check.json().catch(() => ({})) as { status?: string; previewUrl?: string; assetPath?: string; error?: string };
        if (result.status === "completed" && result.previewUrl && result.assetPath) {
          revoke(videoUrl);
          setVideoUrl(result.previewUrl);
          setVideoBlob(null);
          setAssetPath(result.assetPath);
          setAiStatus(`${quality} · MP4 · ${aspectRatio} pronto para revisão.`);
          setEditing(false);
          setNotice("Vídeo IA pronto. Assista e aprove antes de publicar.");
          return;
        }
        if (result.status === "failed" || (!check.ok && check.status !== 202)) throw new Error(result.error || "A geração IA falhou.");
      }
      throw new Error("A geração demorou além do esperado. O job ficou guardado.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Falha ao gerar vídeo IA.");
      setAiStatus(null);
    } finally {
      setAiBusy(false);
    }
  }

  async function publish(platform: "facebook" | "instagram") {
    if (!project || !assetPath || !approved || publishing[platform]?.busy) return;
    if (!readiness?.publishing[platform].ready) return setError(`Conecte ${LABELS[platform]} antes de publicar.`);
    if (!window.confirm(`Publicar agora em ${LABELS[platform]}? O vídeo aprovado será enviado à conta conectada desta empresa.`)) return;
    setPublishing((current) => ({ ...current, [platform]: { busy: true, status: "processing" } }));
    setError(null);
    try {
      const response = await fetch("/api/samuel-ai/content-studio/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId, projectId: project.id, platform, assetPath, caption: copyFor(project, platform), confirm: true }),
      });
      const payload = await response.json().catch(() => ({})) as { job?: { status?: string; providerPayload?: Record<string, unknown>; error?: string }; error?: string };
      if (!response.ok || !payload.job) throw new Error(payload.error || payload.job?.error || "A publicação não iniciou.");
      const permalinkValue = payload.job.providerPayload?.permalink;
      const permalink = typeof permalinkValue === "string" ? permalinkValue : null;
      setPublishing((current) => ({ ...current, [platform]: { busy: false, status: payload.job?.status ?? "queued", permalink } }));
      setNotice(`${LABELS[platform]} recebeu a publicação. O estado mostrado vem da API da plataforma.`);
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "Falha ao publicar.";
      setPublishing((current) => ({ ...current, [platform]: { busy: false, status: "failed", error: message } }));
      setError(message);
    }
  }

  function downloadVideo() {
    if (!videoUrl) return;
    const anchor = document.createElement("a");
    anchor.href = videoUrl;
    anchor.download = `${project?.id ?? "samuel-video"}.${videoBlob?.type.includes("webm") ? "webm" : "mp4"}`;
    anchor.target = "_blank";
    anchor.rel = "noreferrer";
    anchor.click();
  }

  return (
    <section className="min-h-full bg-[radial-gradient(circle_at_10%_0%,rgba(0,137,255,.11),transparent_24%),linear-gradient(180deg,#06111c,#03080e)] p-3 text-white sm:p-5">
      <header className="flex flex-col gap-3 border-b border-cyan-300/10 pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div><p className="text-[9px] font-semibold uppercase tracking-[.25em] text-cyan-200/55">Studio de produção</p><h2 className="mt-1 text-2xl font-semibold">Vídeos e Redes</h2><p className="mt-1 max-w-2xl text-xs leading-5 text-white/45">Criar → editar → produzir → assistir → aprovar → publicar. A publicação só é liberada depois da sua aprovação.</p></div>
        <div className="rounded-2xl border border-white/[.07] bg-black/20 px-4 py-3 text-right"><strong className="text-lg text-cyan-100">{connected.length}/5</strong><span className="ml-2 text-[10px] text-white/35">redes prontas</span></div>
      </header>

      <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,.85fr)_minmax(0,1.15fr)]">
        <div className="space-y-4">
          <Panel title="1. Pedido e configurações" icon={Settings2}>
            <div className="grid gap-3 sm:grid-cols-2">
              <Choice label="Tipo" value={format} options={[{value:"video",label:"Vídeo"},{value:"post",label:"Post"}]} onChange={(value) => { setFormat(value as ContentFormat); setApproved(false); }} />
              <Choice label="Formato" value={aspectRatio} options={[{value:"9:16",label:"Vertical 9:16"},{value:"1:1",label:"Quadrado 1:1"},{value:"16:9",label:"Horizontal 16:9"}]} onChange={(value) => { setAspectRatio(value as AspectRatio); setApproved(false); }} />
              <Choice label="Qualidade" value={quality} options={[{value:"720p",label:"720p"},{value:"1080p",label:"1080p"}]} onChange={(value) => { setQuality(value as SamuelVideoQuality); setApproved(false); }} />
              <Choice label="Arquivo (render local)" value={fileFormat} options={[{value:"mp4",label:"MP4"},{value:"webm",label:"WebM"},{value:"auto",label:"Automático"}]} onChange={(value) => { setFileFormat(value as SamuelVideoFileFormat); setApproved(false); }} />
            </div>
            <label className="mt-4 block text-[10px] font-semibold uppercase tracking-wider text-white/45">O que deve ser criado?</label>
            <textarea value={brief} onChange={(event) => setBrief(event.target.value)} className="mt-2 min-h-28 w-full rounded-2xl border border-white/10 bg-black/25 p-4 text-sm text-white outline-none placeholder:text-white/25 focus:border-cyan-300/35" placeholder="Ex.: vídeo de 30 segundos sobre o MoveFlow, mostrando controlo de serviços, localização e equipa, com CTA para cadastro…" />
            <div className="mt-4"><span className="text-[10px] font-semibold uppercase tracking-wider text-white/45">Redes</span><div className="mt-2 flex flex-wrap gap-2">{SOCIAL_PLATFORMS.map((platform) => <button key={platform} type="button" onClick={() => togglePlatform(platform)} className={`min-h-10 rounded-xl border px-3 text-[11px] transition ${platforms.includes(platform) ? "border-cyan-300/35 bg-cyan-300/[.09] text-cyan-50" : "border-white/[.07] bg-white/[.02] text-white/40"}`}>{LABELS[platform]} {readiness?.publishing[platform].ready ? "✓" : ""}</button>)}</div></div>
            <button type="button" onClick={() => void createProject()} disabled={creating} className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border border-cyan-300/30 bg-cyan-300/[.10] text-sm font-semibold text-cyan-50 transition hover:bg-cyan-300/[.16] disabled:opacity-50">{creating ? <LoaderCircle className="size-4 animate-spin" /> : <Sparkles className="size-4" />}{creating ? "A criar estratégia…" : project ? "Criar nova versão" : "Criar roteiro e campanha"}</button>
          </Panel>

          {project && <Panel title="2. Editar antes de produzir" icon={Pencil}>
            <div className="flex justify-between gap-3"><p className="text-xs leading-5 text-white/45">Edite texto, roteiro e direção visual. Qualquer alteração retira a aprovação anterior.</p><button type="button" onClick={() => setEditing(!editing)} className="shrink-0 rounded-xl border border-white/10 px-3 text-[10px] text-white/60">{editing ? "Recolher" : "Editar"}</button></div>
            {editing && <div className="mt-4 space-y-3">
              <EditField label="Nome" value={project.name} onChange={(value) => changeProject({ ...project, name: value })} />
              <EditField label="Gancho" value={project.hook} onChange={(value) => changeProject({ ...project, hook: value })} />
              <EditField label="Roteiro / narração" value={project.script} multiline onChange={(value) => changeProject({ ...project, script: value })} />
              <EditField label="Chamada para ação" value={project.callToAction} onChange={(value) => changeProject({ ...project, callToAction: value })} />
              <div className="space-y-2">{project.scenes.map((scene, index) => <div key={index} className="rounded-2xl border border-white/[.07] bg-black/15 p-3"><span className="text-[9px] uppercase text-cyan-200/50">Cena {index + 1}</span><input value={scene.headline} onChange={(event) => { const scenes = project.scenes.map((item, itemIndex) => itemIndex === index ? { ...item, headline: event.target.value } : item); changeProject({ ...project, scenes }); }} className="mt-2 w-full border-b border-white/10 bg-transparent pb-2 text-sm font-semibold outline-none" /><textarea value={scene.visualDirection} onChange={(event) => { const scenes = project.scenes.map((item, itemIndex) => itemIndex === index ? { ...item, visualDirection: event.target.value } : item); changeProject({ ...project, scenes }); }} className="mt-2 min-h-16 w-full resize-y rounded-xl border border-white/[.07] bg-black/15 p-2 text-xs text-white/55 outline-none" /></div>)}</div>
            </div>}
          </Panel>}
        </div>

        <div className="space-y-4">
          <Panel title="3. Produzir e visualizar" icon={Film}>
            {!project ? <Empty text="Crie o roteiro primeiro. A prévia e os controles de produção aparecem aqui." /> : <>
              <div className="grid gap-2 sm:grid-cols-2"><button type="button" disabled={rendering || aiBusy} onClick={() => void renderWithVoice()} className="flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-cyan-300/25 bg-cyan-300/[.07] text-xs font-semibold text-cyan-50 disabled:opacity-50">{rendering ? <LoaderCircle className="size-4 animate-spin" /> : <Play className="size-4" />}{rendering ? `A montar ${renderProgress}%` : "Montar com voz"}</button><button type="button" disabled={rendering || aiBusy || !readiness?.aiVideo.ready} onClick={() => void generateAiVideo()} className="flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-violet-300/20 bg-violet-300/[.06] text-xs font-semibold text-violet-50 disabled:opacity-40">{aiBusy ? <LoaderCircle className="size-4 animate-spin" /> : <Sparkles className="size-4" />}{aiBusy ? "A gerar vídeo IA" : "Gerar vídeo visual IA"}</button></div>
              {aiStatus && <p className="mt-2 text-[10px] text-violet-200/65">{aiStatus}</p>}
              <div className={`mx-auto mt-4 overflow-hidden rounded-[26px] border border-cyan-300/15 bg-black/45 shadow-[0_0_35px_rgba(0,118,255,.10)] ${aspectRatio === "9:16" ? "max-w-[360px] aspect-[9/16]" : aspectRatio === "1:1" ? "max-w-[520px] aspect-square" : "max-w-[720px] aspect-video"}`}>{videoUrl ? <video key={videoUrl} src={videoUrl} controls playsInline className="h-full w-full object-contain" /> : <div className="flex h-full min-h-72 flex-col items-center justify-center gap-3 text-center text-white/30"><Film className="size-10" /><strong className="text-sm text-white/55">Prévia obrigatória</strong><span className="max-w-xs text-xs leading-5">Produza o vídeo. Ele não será publicado automaticamente.</span></div>}</div>
              {audioUrl && <audio src={audioUrl} controls className="mt-3 w-full" />}
              {videoUrl && <div className="mt-4 grid gap-2 sm:grid-cols-3"><button type="button" onClick={downloadVideo} className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/10 text-xs text-white/65"><Download className="size-4" />Descarregar</button><button type="button" onClick={() => { setEditing(true); setApproved(false); }} className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/10 text-xs text-white/65"><Pencil className="size-4" />Editar / refazer</button><button type="button" onClick={() => setApproved(true)} className={`flex min-h-11 items-center justify-center gap-2 rounded-xl border text-xs font-semibold ${approved ? "border-emerald-300/30 bg-emerald-300/[.10] text-emerald-100" : "border-cyan-300/30 bg-cyan-300/[.08] text-cyan-50"}`}><CheckCircle2 className="size-4" />{approved ? "Vídeo aprovado" : "Aprovar para publicar"}</button></div>}
            </>}
          </Panel>

          <Panel title="4. Publicar somente após aprovação" icon={Send}>
            {!videoUrl ? <Empty text="A publicação fica bloqueada até existir uma prévia." /> : !approved ? <Empty text="Assista ao vídeo e clique em “Aprovar para publicar”." /> : !assetPath ? <Empty text="O arquivo atual não está em MP4 publicável. Gere MP4 ou vídeo IA para publicar automaticamente." /> : <div className="space-y-2">{(["instagram", "facebook"] as const).map((platform) => { const ready = readiness?.publishing[platform].ready; const selected = platforms.includes(platform); const state = publishing[platform]; return <div key={platform} className="flex items-center justify-between gap-3 rounded-2xl border border-white/[.07] bg-black/15 p-3"><div><strong className="text-sm">{LABELS[platform]}</strong><p className="mt-1 text-[10px] text-white/35">{!selected ? "Não selecionado nesta campanha" : ready ? state?.status ? `Estado: ${state.status}` : "Pronto para publicar" : readiness?.publishing[platform].detail}</p>{state?.permalink && <a href={state.permalink} target="_blank" rel="noreferrer" className="mt-1 block text-[10px] text-cyan-300 underline">Abrir publicação</a>}</div><button type="button" disabled={!selected || !ready || state?.busy} onClick={() => void publish(platform)} className="min-h-10 rounded-xl border border-cyan-300/25 bg-cyan-300/[.07] px-4 text-[10px] font-semibold text-cyan-50 disabled:opacity-30">{state?.busy ? "A publicar…" : "Publicar agora"}</button></div>; })}<p className="pt-2 text-[10px] leading-5 text-white/30">YouTube, TikTok e LinkedIn permanecem sem publicação automática enquanto os respectivos publicadores oficiais não estiverem autorizados. Não mostramos “publicado” sem retorno real da plataforma.</p></div>}
          </Panel>
        </div>
      </div>

      {(error || notice) && <div className={`fixed bottom-24 left-1/2 z-50 w-[min(92vw,620px)] -translate-x-1/2 rounded-2xl border p-4 text-xs shadow-2xl backdrop-blur-xl lg:bottom-6 ${error ? "border-red-300/25 bg-[#2a0b12]/95 text-red-100" : "border-cyan-300/20 bg-[#061a2a]/95 text-cyan-50"}`}><div className="flex items-start gap-3">{error ? <RefreshCw className="mt-0.5 size-4 shrink-0" /> : <Check className="mt-0.5 size-4 shrink-0" />}<span className="leading-5">{error ?? notice}</span><button type="button" className="ml-auto text-white/40" onClick={() => { setError(null); setNotice(null); }}>×</button></div></div>}
    </section>
  );
}

function Panel({ title, icon: Icon, children }: { title: string; icon: typeof Film; children: React.ReactNode }) {
  return <section className="rounded-[24px] border border-cyan-300/[.09] bg-[#06131f]/88 p-4 shadow-[0_18px_55px_rgba(0,0,0,.16)] sm:p-5"><div className="mb-4 flex items-center gap-2"><span className="flex size-8 items-center justify-center rounded-xl bg-cyan-300/[.07] text-cyan-200"><Icon className="size-4" /></span><h3 className="text-sm font-semibold text-white">{title}</h3></div>{children}</section>;
}

function Choice({ label, value, options, onChange }: { label: string; value: string; options: Array<{ value: string; label: string }>; onChange: (value: string) => void }) {
  return <label className="block"><span className="text-[9px] font-semibold uppercase tracking-wider text-white/35">{label}</span><select value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 h-11 w-full rounded-xl border border-white/10 bg-[#07121d] px-3 text-xs text-white outline-none focus:border-cyan-300/35">{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>;
}

function EditField({ label, value, multiline = false, onChange }: { label: string; value: string; multiline?: boolean; onChange: (value: string) => void }) {
  return <label className="block"><span className="text-[9px] font-semibold uppercase tracking-wider text-white/35">{label}</span>{multiline ? <textarea value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 min-h-28 w-full rounded-xl border border-white/10 bg-black/20 p-3 text-xs text-white/80 outline-none focus:border-cyan-300/35" /> : <input value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 h-11 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-xs text-white/80 outline-none focus:border-cyan-300/35" />}</label>;
}

function Empty({ text }: { text: string }) {
  return <div className="rounded-2xl border border-dashed border-white/10 bg-black/10 p-6 text-center text-xs leading-5 text-white/35">{text}</div>;
}
