"use client";

import { useEffect, useMemo, useState } from "react";
import { Clapperboard, Film, LoaderCircle, Music2, Sparkles, WandSparkles } from "lucide-react";

import { cn } from "@/utils/cn";

import { ReferenceImageLibrary, type StudioReferenceImage } from "./ReferenceImageLibrary";
import type { ContentReadiness } from "./samuel-content.types";

type Props = { companyId: string };
type DirectorMode = "multishot" | "photo";
type AspectRatio = "9:16" | "16:9" | "1:1";

type GenerationPayload = {
  generationId?: string;
  provider?: string;
  mode?: string;
  status?: string;
  error?: string;
};

function sleep(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

export function ProfessionalVideoGenerator({ companyId }: Props) {
  const [readiness, setReadiness] = useState<ContentReadiness | null>(null);
  const [references, setReferences] = useState<StudioReferenceImage[]>([]);
  const [prompt, setPrompt] = useState("");
  const [mode, setMode] = useState<DirectorMode>("multishot");
  const [ratio, setRatio] = useState<AspectRatio>("9:16");
  const [resolution, setResolution] = useState<"720p" | "1080p">("1080p");
  const [generateAudio, setGenerateAudio] = useState(true);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [assetPath, setAssetPath] = useState<string | null>(null);
  const [provider, setProvider] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    void fetch(`/api/samuel-ai/content-studio?companyId=${encodeURIComponent(companyId)}`, { signal: controller.signal, cache: "no-store" })
      .then(async (response) => {
        const payload = await response.json().catch(() => ({})) as { readiness?: ContentReadiness };
        if (response.ok && payload.readiness) setReadiness(payload.readiness);
      })
      .catch(() => undefined);
    return () => controller.abort();
  }, [companyId]);

  const generativeReady = Boolean(readiness?.aiVideo.ready);
  const canGenerate = generativeReady && prompt.trim().length >= 20 && !busy && (mode !== "photo" || references.length > 0);
  const referenceUrls = useMemo(() => references.map((item) => item.previewUrl).filter((url) => /^https:\/\//i.test(url)), [references]);

  async function generate() {
    if (!canGenerate) return;
    setBusy(true);
    setError(null);
    setVideoUrl(null);
    setAssetPath(null);
    setProvider(null);
    setStatus(mode === "multishot" ? "Planeando cenas, takes, câmara e áudio…" : "Transformando a foto em uma cena viva…");

    const direction = mode === "multishot"
      ? [
          "Produza um vídeo profissional completo com 3 a 5 takes diferentes, não um slideshow.",
          "Mude enquadramentos e distância de câmara entre os takes: plano geral, médio, close-up, detalhe e hero shot quando fizer sentido.",
          "Crie movimento real de pessoas, objetos, ambiente, tecido, cabelo, luz e câmera. Use continuidade visual entre as cenas.",
          "Quando houver uma pessoa de referência, preserve a identidade facial e proporções. Pode mudar roupa, cenário e pose somente quando o briefing pedir.",
          "Use transições cinematográficas discretas, ritmo editorial e desenho sonoro coerente. Evite texto gerado dentro da imagem.",
        ]
      : [
          "Anime de verdade a pessoa/foto de referência: movimento corporal natural, expressão, cabelo, roupa, profundidade e movimento de câmera.",
          "Não faça apenas zoom ou pan na foto. Reconstrua a cena como vídeo realista mantendo a identidade do sujeito.",
          "Pode alterar cenário, roupa, iluminação e pose conforme o briefing, preservando rosto e características principais.",
        ];

    const fullPrompt = `${prompt.trim()}\n\nDIREÇÃO DE PRODUÇÃO:\n${direction.map((item) => `- ${item}`).join("\n")}`;
    try {
      const response = await fetch("/api/samuel-ai/content-studio/ai-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId,
          title: "Vídeo Profissional Samuel",
          prompt: fullPrompt,
          aspectRatio: ratio,
          resolution,
          referenceImages: referenceUrls,
          mode: mode === "multishot" ? "multi-shot" : "single-shot",
          generateAudio,
        }),
      });
      const started = await response.json().catch(() => ({})) as GenerationPayload;
      if (!response.ok || !started.generationId) throw new Error(started.error || "A geração profissional não iniciou.");
      setProvider(started.provider ?? null);
      setStatus(started.mode === "multi-shot" ? "Gerando cenas e montando os takes…" : "Gerando movimento e ambiente…");

      for (let attempt = 0; attempt < 75; attempt += 1) {
        if (attempt > 0) await sleep(10_000);
        const check = await fetch(`/api/samuel-ai/content-studio/ai-video?companyId=${encodeURIComponent(companyId)}&generationId=${encodeURIComponent(started.generationId)}`, { cache: "no-store" });
        const payload = await check.json().catch(() => ({})) as { status?: string; previewUrl?: string; assetPath?: string; provider?: string; error?: string };
        if (payload.status === "completed" && payload.previewUrl && payload.assetPath) {
          setVideoUrl(payload.previewUrl);
          setAssetPath(payload.assetPath);
          setProvider(payload.provider ?? started.provider ?? null);
          setStatus("Vídeo generativo concluído. Assista à versão completa antes de publicar.");
          return;
        }
        if (payload.status === "failed" || (!check.ok && check.status !== 202)) throw new Error(payload.error || "A geração profissional falhou.");
        setStatus(`Gerando cenas, movimento, áudio e composição… ${Math.min(95, 10 + attempt * 2)}%`);
      }
      throw new Error("A geração continua em processamento além da janela de acompanhamento. O job ficou registado no painel.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Falha ao gerar vídeo profissional.");
      setStatus(null);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-[28px] border border-violet-300/15 bg-[radial-gradient(circle_at_80%_0%,rgba(124,58,237,.16),transparent_35%),linear-gradient(180deg,#07111d,#03070d)] p-4 shadow-[0_24px_80px_rgba(0,0,0,.24)] sm:p-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[.22em] text-violet-200/60"><WandSparkles className="size-4" /> AI VIDEO DIRECTOR</div>
          <h2 className="mt-2 text-xl font-semibold text-white sm:text-2xl">Vídeo generativo de verdade — cenas, pessoas, takes, áudio e movimento.</h2>
          <p className="mt-2 text-xs leading-5 text-white/45">Este modo é separado do renderizador local. O fallback local continua útil para montar fotos, mas aqui o objetivo é gerar novos frames e movimento real, alterar cenário/roupa quando pedido e construir uma sequência audiovisual.</p>
        </div>
        <div className={cn("rounded-xl border px-3 py-2 text-xs", generativeReady ? "border-emerald-300/20 bg-emerald-300/[.06] text-emerald-100" : "border-amber-300/20 bg-amber-300/[.06] text-amber-100")}>
          <strong className="block">{generativeReady ? "Motor generativo ativo" : "Motor generativo externo pendente"}</strong>
          <span className="mt-1 block max-w-xs text-[10px] leading-4 opacity-70">{readiness?.aiVideo.detail ?? "Verificando provedores…"}</span>
        </div>
      </div>

      <div className="mt-5 grid gap-5 2xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,.75fr)]">
        <div className="space-y-4">
          <div className="grid gap-2 sm:grid-cols-2">
            <button type="button" onClick={() => setMode("multishot")} className={cn("rounded-2xl border p-4 text-left transition", mode === "multishot" ? "border-violet-300/35 bg-violet-300/[.08]" : "border-white/[.07] bg-white/[.02]")}>
              <Clapperboard className="size-5 text-violet-200" /><strong className="mt-3 block text-sm text-white">Filme completo · múltiplos takes</strong><p className="mt-1 text-[11px] leading-5 text-white/38">A IA planeia e gera cortes diferentes, movimento de câmera, continuidade e áudio.</p>
            </button>
            <button type="button" onClick={() => setMode("photo")} className={cn("rounded-2xl border p-4 text-left transition", mode === "photo" ? "border-cyan-300/35 bg-cyan-300/[.07]" : "border-white/[.07] bg-white/[.02]")}>
              <Film className="size-5 text-cyan-200" /><strong className="mt-3 block text-sm text-white">Dar vida à minha foto</strong><p className="mt-1 text-[11px] leading-5 text-white/38">Mantém a pessoa como referência e gera movimento real, novo ambiente, roupa ou pose conforme o pedido.</p>
            </button>
          </div>

          <label className="block text-xs font-medium text-white/65">Direção criativa<textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} className="mt-2 min-h-36 w-full rounded-2xl border border-white/10 bg-[#020914] p-4 text-sm leading-6 text-white outline-none focus:border-violet-300/35" placeholder="Ex.: Use minha foto como personagem principal. Comece num escritório moderno, eu caminho até a câmara falando sobre o produto; corte para um cenário urbano à noite com roupa social escura; depois mostre detalhes do sistema em takes rápidos e termine comigo em um hero shot. Visual premium, realista, publicidade de alto nível." /></label>

          <div className="grid gap-3 sm:grid-cols-3">
            <label className="text-[10px] text-white/45">Formato<select value={ratio} onChange={(event) => setRatio(event.target.value as AspectRatio)} className="mt-2 min-h-11 w-full rounded-xl border border-white/10 bg-[#020914] px-3 text-xs text-white"><option value="9:16">Vertical 9:16</option><option value="16:9">Horizontal 16:9</option><option value="1:1">Quadrado 1:1</option></select></label>
            <label className="text-[10px] text-white/45">Qualidade<select value={resolution} onChange={(event) => setResolution(event.target.value as "720p" | "1080p")} className="mt-2 min-h-11 w-full rounded-xl border border-white/10 bg-[#020914] px-3 text-xs text-white"><option value="1080p">Full HD 1080p</option><option value="720p">HD 720p</option></select></label>
            <label className="flex min-h-16 items-center gap-3 rounded-xl border border-white/[.07] bg-white/[.02] px-3 text-[10px] text-white/55"><input type="checkbox" checked={generateAudio} onChange={(event) => setGenerateAudio(event.target.checked)} className="size-4" /><Music2 className="size-4 text-violet-200" /><span>Gerar ambiente/efeitos sonoros quando o motor suportar</span></label>
          </div>

          <button type="button" onClick={() => void generate()} disabled={!canGenerate} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border border-violet-300/25 bg-gradient-to-r from-violet-500/25 to-cyan-400/15 text-sm font-semibold text-white transition hover:from-violet-500/35 hover:to-cyan-400/20 disabled:cursor-not-allowed disabled:opacity-35">
            {busy ? <LoaderCircle className="size-5 animate-spin" /> : <Sparkles className="size-5" />}
            {busy ? "Produzindo vídeo profissional…" : "Gerar vídeo profissional"}
          </button>
          {mode === "photo" && references.length === 0 ? <p className="text-[10px] text-amber-100/70">Selecione pelo menos uma foto abaixo para usar sua identidade como referência.</p> : null}
          {status ? <p className="rounded-xl border border-cyan-300/12 bg-cyan-300/[.04] p-3 text-xs text-cyan-50/75">{status}{provider ? ` · ${provider}` : ""}</p> : null}
          {error ? <p className="rounded-xl border border-red-300/15 bg-red-300/[.05] p-3 text-xs leading-5 text-red-100/80">{error}</p> : null}
        </div>

        <div className="space-y-4">
          <ReferenceImageLibrary companyId={companyId} onReferencesChange={setReferences} compact />
          <div className="overflow-hidden rounded-2xl border border-white/[.08] bg-black/30">
            <div className="flex items-center justify-between border-b border-white/[.06] px-3 py-2"><span className="text-[9px] uppercase tracking-[.16em] text-white/35">Prévia generativa</span>{assetPath ? <span className="text-[9px] text-emerald-200/60">guardado</span> : null}</div>
            <div className="aspect-[9/16] max-h-[560px] bg-[radial-gradient(circle_at_center,rgba(79,70,229,.12),transparent_55%),#010307]">
              {videoUrl ? <video src={videoUrl} controls playsInline className="h-full w-full object-contain" /> : <div className="flex h-full flex-col items-center justify-center px-6 text-center"><Clapperboard className="size-8 text-violet-200/35" /><strong className="mt-3 text-sm text-white/65">O vídeo aparecerá aqui</strong><p className="mt-2 text-[10px] leading-5 text-white/30">A geração profissional cria novos frames. Não é o efeito de mover uma fotografia estática.</p></div>}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
