"use client";

import { useEffect, useMemo, useState } from "react";
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
} from "lucide-react";

import { cn } from "@/utils/cn";

import type {
  ContentFormat,
  ContentReadiness,
  SamuelContentProject,
  SocialPlatform,
} from "./samuel-content.types";
import { SOCIAL_PLATFORMS } from "./samuel-content.types";
import { renderSamuelCampaignVideo } from "./samuel-video-renderer.client";

type Props = { companyId: string };

const LABELS: Record<SocialPlatform, string> = {
  facebook: "Facebook", instagram: "Instagram", youtube: "YouTube", tiktok: "TikTok", linkedin: "LinkedIn",
};

const ICONS = { facebook: UsersRound, instagram: Camera, youtube: PlayCircle, tiktok: Film, linkedin: BriefcaseBusiness };

const EXAMPLES = [
  "Faça um vídeo de 30 segundos apresentando nosso produto, destaque o principal benefício e termine com convite para falar no WhatsApp.",
  "Crie uma campanha de lançamento para Instagram, TikTok e YouTube Shorts com tom premium.",
  "Crie posts para todas as redes explicando como nossa solução economiza tempo da equipe.",
];

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a"); anchor.href = url; anchor.download = filename; anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 2_000);
}

export function SamuelContentStudio({ companyId }: Props) {
  const [format, setFormat] = useState<ContentFormat>("video");
  const [brief, setBrief] = useState("");
  const [platforms, setPlatforms] = useState<SocialPlatform[]>([...SOCIAL_PLATFORMS]);
  const [project, setProject] = useState<SamuelContentProject | null>(null);
  const [readiness, setReadiness] = useState<ContentReadiness | null>(null);
  const [generating, setGenerating] = useState(false);
  const [rendering, setRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const incoming = sessionStorage.getItem("sf-growth-ai:samuel-content:incoming");
        if (!incoming) return;
        const next = JSON.parse(incoming) as SamuelContentProject;
        if (!next?.id || !Array.isArray(next.scenes)) return;
        setProject(next); setBrief(next.objective); setFormat(next.format); setPlatforms(next.platforms);
        sessionStorage.removeItem("sf-growth-ai:samuel-content:incoming");
      } catch {
        // Ignore malformed browser state.
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void fetch(`/api/samuel-ai/content-studio?companyId=${encodeURIComponent(companyId)}`, { signal: controller.signal })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("Status indisponível")))
      .then((payload: { readiness: ContentReadiness }) => setReadiness(payload.readiness))
      .catch(() => undefined);
    return () => controller.abort();
  }, [companyId]);

  useEffect(() => () => { if (videoUrl) URL.revokeObjectURL(videoUrl); if (audioUrl) URL.revokeObjectURL(audioUrl); }, [audioUrl, videoUrl]);

  const connectedCount = useMemo(() => readiness ? Object.values(readiness.publishing).filter((item) => item.ready).length : 0, [readiness]);

  function togglePlatform(platform: SocialPlatform) {
    setPlatforms((current) => current.includes(platform) ? current.filter((item) => item !== platform) : [...current, platform]);
  }

  function openPlatformSetup(platform: SocialPlatform) {
    if (platform === "facebook" || platform === "instagram") {
      window.location.assign("/integrations/meta/connect");
      return;
    }
    if (platform === "linkedin") {
      window.location.assign("/integrations/linkedin/connect");
      return;
    }
    setError(`${LABELS[platform]} ainda precisa do fluxo OAuth oficial e da aprovação de publicação da plataforma. O conteúdo está pronto, mas nenhuma postagem foi enviada.`);
  }

  async function createCampaign() {
    if (brief.trim().length < 10 || platforms.length === 0) {
      setError(platforms.length ? "Descreva melhor o produto e o objetivo da campanha." : "Escolha ao menos uma rede social.");
      return;
    }
    setGenerating(true); setError(null); setWarning(null); setProject(null);
    if (videoUrl) URL.revokeObjectURL(videoUrl); if (audioUrl) URL.revokeObjectURL(audioUrl);
    setVideoUrl(null); setVideoBlob(null); setAudioUrl(null);
    try {
      const response = await fetch("/api/samuel-ai/content-studio", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId, brief, format, platforms, aspectRatio: format === "video" ? "9:16" : "1:1" }),
      });
      const payload = await response.json() as { project?: SamuelContentProject; readiness?: ContentReadiness; warning?: string; error?: string };
      if (!response.ok || !payload.project) throw new Error(payload.error || "Não foi possível criar a campanha.");
      setProject(payload.project); if (payload.readiness) setReadiness(payload.readiness); setWarning(payload.warning ?? null);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Falha ao criar campanha."); }
    finally { setGenerating(false); }
  }

  async function generateNarrationAndVideo() {
    if (!project || rendering) return;
    setRendering(true); setRenderProgress(0); setError(null);
    try {
      const response = await fetch("/api/samuel-ai/voice/tts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ companyId, text: project.script }) });
      if (!response.ok) { const payload = await response.json().catch(() => null) as { error?: string } | null; throw new Error(payload?.error || "A ElevenLabs não gerou a narração."); }
      const audio = await response.blob();
      const nextAudioUrl = URL.createObjectURL(audio); setAudioUrl(nextAudioUrl);
      if (project.format === "video") {
        const video = await renderSamuelCampaignVideo(project, audio, setRenderProgress);
        const nextVideoUrl = URL.createObjectURL(video); setVideoBlob(video); setVideoUrl(nextVideoUrl);
      }
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Falha ao produzir o conteúdo."); }
    finally { setRendering(false); }
  }

  return (
    <section className="samuel-content-studio">
      <div className="samuel-content-studio__header">
        <div><span><Sparkles /> SOCIAL CONTENT ENGINE</span><h2>Vídeos e posts, do pedido à publicação.</h2><p>Escreva ou fale com o Samuel. Ele cria a estratégia, o roteiro, a voz ElevenLabs e adapta a campanha para cada rede.</p></div>
        <div className="samuel-content-status"><strong>{connectedCount}/5</strong><span>redes prontas para publicar</span></div>
      </div>

      <div className="samuel-content-grid">
        <div className="samuel-content-composer">
          <div className="samuel-content-format" role="group" aria-label="Formato do conteúdo">
            <button type="button" className={cn(format === "video" && "is-active")} onClick={() => setFormat("video")}><Film /> Vídeo</button>
            <button type="button" className={cn(format === "post" && "is-active")} onClick={() => setFormat("post")}><Send /> Postagem</button>
          </div>
          <label htmlFor="campaign-brief">O que o Samuel deve criar?</label>
          <textarea id="campaign-brief" value={brief} onChange={(event) => setBrief(event.target.value)} placeholder="Ex.: Faça um vídeo sobre o produto X, explique o benefício principal e publique no Instagram, Facebook e TikTok…" />
          <div className="samuel-content-examples">{EXAMPLES.map((example) => <button key={example} type="button" onClick={() => setBrief(example)}><Sparkles /> {example}</button>)}</div>
          <label>Onde deseja publicar?</label>
          <div className="samuel-platform-picker">
            {SOCIAL_PLATFORMS.map((platform) => { const Icon = ICONS[platform]; const ready = readiness?.publishing[platform].ready; return <button type="button" key={platform} onClick={() => togglePlatform(platform)} className={cn(platforms.includes(platform) && "is-selected")}><Icon /><span>{LABELS[platform]}</span><i className={cn(ready && "is-ready")} title={readiness?.publishing[platform].detail}>{ready ? <Check /> : null}</i></button>; })}
          </div>
          <button type="button" className="samuel-content-create" onClick={() => void createCampaign()} disabled={generating}>
            {generating ? <LoaderCircle className="animate-spin" /> : <Sparkles />} {generating ? "Criando campanha…" : "Criar campanha completa"}
          </button>
          {error && <p className="samuel-content-feedback is-error">{error}</p>}
          {warning && <p className="samuel-content-feedback is-warning">{warning}</p>}
        </div>

        <aside className="samuel-content-pipeline">
          <span>PIPELINE DE PRODUÇÃO</span>
          {[
            ["01", "Estratégia e roteiro", readiness?.generation.ready, "AI Gateway"],
            ["02", "Narração natural", readiness?.narration.ready, readiness?.narration.provider ?? "ElevenLabs"],
            ["03", "Montagem do vídeo", true, "Renderizador Samuel"],
            ["04", "Revisão humana", true, "Confirmação obrigatória"],
            ["05", "Publicação oficial", connectedCount > 0, `${connectedCount} redes conectadas`],
          ].map(([number, title, ready, detail]) => <div key={String(number)}><b>{number}</b><p><strong>{title}</strong><small>{detail}</small></p><i className={cn(Boolean(ready) && "is-ready")} /></div>)}
        </aside>
      </div>

      {project && <div className="samuel-content-result">
        <div className="samuel-content-result__summary"><span>CAMPANHA CRIADA</span><h3>{project.name}</h3><p>{project.objective}</p><div><b>Público</b>{project.audience}</div><div><b>Gancho</b>{project.hook}</div></div>
        <div className="samuel-content-scenes"><span>ROTEIRO E CENAS</span>{project.scenes.map((scene, index) => <article key={`${scene.headline}-${index}`}><b>{String(index + 1).padStart(2, "0")}</b><div><strong>{scene.headline}</strong><p>{scene.supportingText}</p><small>{scene.durationSeconds}s · {scene.visualDirection}</small></div></article>)}</div>
        <div className="samuel-content-preview">
          <span>PRODUÇÃO</span>
          <div className="samuel-content-phone">{videoUrl ? <video src={videoUrl} controls playsInline /> : <div><Film /><strong>Prévia do vídeo</strong><p>Gere a narração para montar o arquivo final.</p></div>}</div>
          {audioUrl && <audio src={audioUrl} controls />}
          <button type="button" onClick={() => void generateNarrationAndVideo()} disabled={rendering}>{rendering ? <LoaderCircle className="animate-spin" /> : <Mic2 />}{rendering ? `Montando vídeo · ${renderProgress}%` : project.format === "video" ? "Gerar voz + vídeo" : "Gerar narração"}</button>
          {videoBlob && <button type="button" className="is-secondary" onClick={() => downloadBlob(videoBlob, `${project.name.replace(/\W+/g, "-").toLowerCase()}.webm`)}><Download /> Baixar vídeo</button>}
        </div>
        <div className="samuel-content-copies"><span>TEXTOS POR REDE</span>{project.socialCopies.map((copy) => { const Icon = ICONS[copy.platform]; const ready = readiness?.publishing[copy.platform].ready; return <article key={copy.platform}><div><Icon /><strong>{LABELS[copy.platform]}</strong><i className={cn(ready && "is-ready")} /></div><p>{copy.caption}</p><small>{copy.hashtags.map((tag) => `#${tag}`).join(" ")}</small><button type="button" onClick={() => openPlatformSetup(copy.platform)} title={readiness?.publishing[copy.platform].detail}><Send />{ready ? "Preparar publicação" : "Conectar conta"}</button></article>; })}</div>
      </div>}
    </section>
  );
}
