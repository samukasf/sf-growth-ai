"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Clapperboard,
  Cloud,
  Film,
  LoaderCircle,
  MonitorCog,
  Music2,
  Play,
  Sparkles,
  Volume2,
  WandSparkles,
} from "lucide-react";

import { cn } from "@/utils/cn";

import { ReferenceImageLibrary, type StudioReferenceImage } from "./ReferenceImageLibrary";
import type { ContentReadiness } from "./samuel-content.types";

type Props = { companyId: string };
type DirectorMode = "multishot" | "photo";
type AspectRatio = "9:16" | "16:9" | "1:1";
type VideoEngine = "auto" | "comfyui" | "cloud";

type GenerationPayload = {
  generationId?: string;
  provider?: string;
  mode?: string;
  status?: string;
  error?: string;
};

type VoiceOption = {
  id: string;
  name: string;
  provider: "elevenlabs" | "openai";
  category: string | null;
  description: string | null;
  previewUrl: string | null;
  labels: Record<string, string>;
};

type VoiceCatalogPayload = {
  voices?: VoiceOption[];
  defaultVoice?: { provider: "elevenlabs" | "openai"; id: string } | null;
};

type ComfyReadinessPayload = {
  readiness?: {
    ready: boolean;
    deviceId: string | null;
    deviceName: string | null;
    detail: string;
  };
};

function sleep(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function voiceKey(voice: Pick<VoiceOption, "provider" | "id">) {
  return `${voice.provider}:${voice.id}`;
}

export function ProfessionalVideoGenerator({ companyId }: Props) {
  const [readiness, setReadiness] = useState<ContentReadiness | null>(null);
  const [comfyReadiness, setComfyReadiness] =
    useState<ComfyReadinessPayload["readiness"]>(null);
  const [references, setReferences] = useState<StudioReferenceImage[]>([]);
  const [prompt, setPrompt] = useState("");
  const [mode, setMode] = useState<DirectorMode>("multishot");
  const [engine, setEngine] = useState<VideoEngine>("auto");
  const [ratio, setRatio] = useState<AspectRatio>("9:16");
  const [resolution, setResolution] = useState<"720p" | "1080p">("1080p");
  const [durationSeconds, setDurationSeconds] = useState(8);
  const [generateAudio, setGenerateAudio] = useState(true);
  const [voices, setVoices] = useState<VoiceOption[]>([]);
  const [selectedVoiceKey, setSelectedVoiceKey] = useState("");
  const [voicePreviewBusy, setVoicePreviewBusy] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [assetPath, setAssetPath] = useState<string | null>(null);
  const [provider, setProvider] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    void fetch(
      `/api/samuel-ai/content-studio?companyId=${encodeURIComponent(companyId)}`,
      { signal: controller.signal, cache: "no-store" },
    )
      .then(async (response) => {
        const payload = (await response.json().catch(() => ({}))) as {
          readiness?: ContentReadiness;
        };
        if (response.ok && payload.readiness) setReadiness(payload.readiness);
      })
      .catch(() => undefined);

    return () => controller.abort();
  }, [companyId]);

  useEffect(() => {
    const controller = new AbortController();

    void Promise.all([
      fetch(
        `/api/samuel-ai/content-studio/comfyui?companyId=${encodeURIComponent(companyId)}`,
        { signal: controller.signal, cache: "no-store" },
      ).then(async (response) => {
        const payload = (await response.json().catch(() => ({}))) as ComfyReadinessPayload;
        if (response.ok && payload.readiness) setComfyReadiness(payload.readiness);
      }),
      fetch(
        `/api/samuel-ai/voice/voices?companyId=${encodeURIComponent(companyId)}`,
        { signal: controller.signal, cache: "no-store" },
      ).then(async (response) => {
        const payload = (await response.json().catch(() => ({}))) as VoiceCatalogPayload;
        if (!response.ok) return;
        setVoices(Array.isArray(payload.voices) ? payload.voices : []);
        if (payload.defaultVoice) {
          setSelectedVoiceKey((current) =>
            current || `${payload.defaultVoice?.provider}:${payload.defaultVoice?.id}`,
          );
        }
      }),
    ]).catch(() => undefined);

    return () => controller.abort();
  }, [companyId]);

  const generativeReady = Boolean(readiness?.aiVideo.ready);
  const comfyReady = Boolean(comfyReadiness?.ready);
  const engineReady =
    engine === "comfyui"
      ? comfyReady
      : engine === "cloud"
        ? generativeReady
        : comfyReady || generativeReady;
  const canGenerate =
    engineReady &&
    prompt.trim().length >= 20 &&
    !busy &&
    (mode !== "photo" || references.length > 0);
  const referenceUrls = useMemo(
    () => references.map((item) => item.previewUrl).filter((url) => /^https:\/\//i.test(url)),
    [references],
  );
  const selectedVoice = useMemo(
    () => voices.find((voice) => voiceKey(voice) === selectedVoiceKey) ?? null,
    [selectedVoiceKey, voices],
  );

  async function previewVoice() {
    if (!selectedVoice || voicePreviewBusy) return;
    setVoicePreviewBusy(true);
    setVoiceStatus(null);

    try {
      if (selectedVoice.previewUrl) {
        const audio = new Audio(selectedVoice.previewUrl);
        await audio.play();
        setVoiceStatus(`Prévia: ${selectedVoice.name}`);
        return;
      }

      const response = await fetch("/api/samuel-ai/voice/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId,
          text:
            "Esta é uma prévia da voz selecionada para as suas produções no SF Growth AI.",
          voice: selectedVoice.provider === "openai" ? selectedVoice.id : undefined,
          elevenLabsVoiceId:
            selectedVoice.provider === "elevenlabs" ? selectedVoice.id : undefined,
        }),
      });
      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(payload.error || "Não foi possível gerar a prévia da voz.");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.addEventListener("ended", () => URL.revokeObjectURL(url), { once: true });
      audio.addEventListener("error", () => URL.revokeObjectURL(url), { once: true });
      await audio.play();
      setVoiceStatus(`Prévia: ${selectedVoice.name}`);
    } catch (cause) {
      setVoiceStatus(
        cause instanceof Error ? cause.message : "Não foi possível reproduzir a voz.",
      );
    } finally {
      setVoicePreviewBusy(false);
    }
  }

  async function startGeneration(endpoint: string, fullPrompt: string) {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        companyId,
        title: "Vídeo Profissional Samuel",
        prompt: fullPrompt,
        aspectRatio: ratio,
        resolution,
        durationSeconds,
        referenceImages: referenceUrls,
        mode: mode === "multishot" ? "multi-shot" : "single-shot",
        generateAudio,
        voiceProvider: selectedVoice?.provider,
        voiceId: selectedVoice?.id,
        voiceName: selectedVoice?.name,
      }),
    });
    const payload = (await response.json().catch(() => ({}))) as GenerationPayload;
    return { response, payload };
  }

  async function generate() {
    if (!canGenerate) return;
    setBusy(true);
    setError(null);
    setVideoUrl(null);
    setAssetPath(null);
    setProvider(null);
    setStatus(
      mode === "multishot"
        ? "Planeando cenas, takes, câmara e áudio…"
        : "Transformando a foto em uma cena viva…",
    );

    const direction =
      mode === "multishot"
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

    const fullPrompt = `${prompt.trim()}\n\nDIREÇÃO DE PRODUÇÃO:\n${direction
      .map((item) => `- ${item}`)
      .join("\n")}`;

    const localPreferred = engine === "comfyui" || (engine === "auto" && comfyReady);
    let endpoint = localPreferred
      ? "/api/samuel-ai/content-studio/comfyui"
      : "/api/samuel-ai/content-studio/ai-video";

    try {
      let startedResult = await startGeneration(endpoint, fullPrompt);

      if (
        !startedResult.response.ok &&
        engine === "auto" &&
        localPreferred &&
        generativeReady
      ) {
        setStatus("Motor local indisponível nesta execução. Alternando para o motor de nuvem…");
        endpoint = "/api/samuel-ai/content-studio/ai-video";
        startedResult = await startGeneration(endpoint, fullPrompt);
      }

      const { response, payload: started } = startedResult;
      if (!response.ok || !started.generationId) {
        throw new Error(started.error || "A geração profissional não iniciou.");
      }

      const localRun = endpoint.endsWith("/comfyui");
      setProvider(started.provider ?? null);
      setStatus(
        localRun
          ? "ComfyUI local recebeu o workflow. Gerando no seu computador…"
          : started.mode === "multi-shot"
            ? "Gerando cenas e montando os takes…"
            : "Gerando movimento e ambiente…",
      );

      for (let attempt = 0; attempt < 100; attempt += 1) {
        if (attempt > 0) await sleep(localRun ? 5_000 : 10_000);
        const check = await fetch(
          `${endpoint}?companyId=${encodeURIComponent(companyId)}&generationId=${encodeURIComponent(started.generationId)}`,
          { cache: "no-store" },
        );
        const payload = (await check.json().catch(() => ({}))) as {
          status?: string;
          previewUrl?: string;
          assetPath?: string;
          provider?: string;
          error?: string;
        };

        if (payload.status === "completed" && payload.previewUrl && payload.assetPath) {
          setVideoUrl(payload.previewUrl);
          setAssetPath(payload.assetPath);
          setProvider(payload.provider ?? started.provider ?? null);
          setStatus(
            localRun
              ? "Vídeo ComfyUI concluído no computador e guardado no workspace."
              : "Vídeo generativo concluído. Assista à versão completa antes de publicar.",
          );
          return;
        }
        if (payload.status === "failed" || (!check.ok && check.status !== 202)) {
          throw new Error(payload.error || "A geração profissional falhou.");
        }

        setStatus(
          localRun
            ? `ComfyUI local está processando… ${Math.min(96, 8 + attempt)}%`
            : `Gerando cenas, movimento, áudio e composição… ${Math.min(95, 10 + attempt * 2)}%`,
        );
      }

      throw new Error(
        "A geração continua em processamento além da janela de acompanhamento.",
      );
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
          <div className="flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[.22em] text-violet-200/60">
            <WandSparkles className="size-4" /> AI VIDEO DIRECTOR
          </div>
          <h2 className="mt-2 text-xl font-semibold text-white sm:text-2xl">
            Vídeo generativo real — local ou nuvem, com voz selecionável.
          </h2>
          <p className="mt-2 text-xs leading-5 text-white/45">
            O modo Automático prioriza o ComfyUI no Samuel Desktop quando a ponte local
            está ativa e mantém os motores de nuvem como alternativa.
          </p>
        </div>
        <div
          className={cn(
            "rounded-xl border px-3 py-2 text-xs",
            engineReady
              ? "border-emerald-300/20 bg-emerald-300/[.06] text-emerald-100"
              : "border-amber-300/20 bg-amber-300/[.06] text-amber-100",
          )}
        >
          <strong className="block">
            {engineReady ? "Motor de vídeo disponível" : "Motor de vídeo pendente"}
          </strong>
          <span className="mt-1 block max-w-xs text-[10px] leading-4 opacity-70">
            {engine === "comfyui"
              ? comfyReadiness?.detail ?? "Verificando Samuel Desktop…"
              : engine === "cloud"
                ? readiness?.aiVideo.detail ?? "Verificando provedores de nuvem…"
                : comfyReady
                  ? comfyReadiness?.detail
                  : readiness?.aiVideo.detail ?? "Verificando motores…"}
          </span>
        </div>
      </div>

      <div className="mt-5 grid gap-5 2xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,.75fr)]">
        <div className="space-y-4">
          <div className="grid gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setMode("multishot")}
              className={cn(
                "rounded-2xl border p-4 text-left transition",
                mode === "multishot"
                  ? "border-violet-300/35 bg-violet-300/[.08]"
                  : "border-white/[.07] bg-white/[.02]",
              )}
            >
              <Clapperboard className="size-5 text-violet-200" />
              <strong className="mt-3 block text-sm text-white">
                Filme completo · múltiplos takes
              </strong>
              <p className="mt-1 text-[11px] leading-5 text-white/38">
                A IA planeia cortes, movimento de câmera, continuidade e composição.
              </p>
            </button>
            <button
              type="button"
              onClick={() => setMode("photo")}
              className={cn(
                "rounded-2xl border p-4 text-left transition",
                mode === "photo"
                  ? "border-cyan-300/35 bg-cyan-300/[.07]"
                  : "border-white/[.07] bg-white/[.02]",
              )}
            >
              <Film className="size-5 text-cyan-200" />
              <strong className="mt-3 block text-sm text-white">
                Dar vida à minha foto
              </strong>
              <p className="mt-1 text-[11px] leading-5 text-white/38">
                Mantém a pessoa como referência e gera movimento, ambiente e câmera.
              </p>
            </button>
          </div>

          <div className="grid gap-2 sm:grid-cols-3">
            <button
              type="button"
              onClick={() => setEngine("auto")}
              className={cn(
                "rounded-xl border p-3 text-left text-xs transition",
                engine === "auto"
                  ? "border-violet-300/35 bg-violet-300/[.08] text-white"
                  : "border-white/[.07] bg-white/[.02] text-white/55",
              )}
            >
              <Sparkles className="mb-2 size-4" />
              <strong className="block">Automático</strong>
              <span className="mt-1 block text-[9px] opacity-60">
                Local primeiro; nuvem como fallback.
              </span>
            </button>
            <button
              type="button"
              onClick={() => setEngine("comfyui")}
              className={cn(
                "rounded-xl border p-3 text-left text-xs transition",
                engine === "comfyui"
                  ? "border-cyan-300/35 bg-cyan-300/[.08] text-white"
                  : "border-white/[.07] bg-white/[.02] text-white/55",
              )}
            >
              <MonitorCog className="mb-2 size-4" />
              <strong className="block">ComfyUI local</strong>
              <span className="mt-1 block text-[9px] opacity-60">
                {comfyReady ? comfyReadiness?.deviceName ?? "Desktop conectado" : "Desktop pendente"}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setEngine("cloud")}
              className={cn(
                "rounded-xl border p-3 text-left text-xs transition",
                engine === "cloud"
                  ? "border-sky-300/35 bg-sky-300/[.08] text-white"
                  : "border-white/[.07] bg-white/[.02] text-white/55",
              )}
            >
              <Cloud className="mb-2 size-4" />
              <strong className="block">Nuvem</strong>
              <span className="mt-1 block text-[9px] opacity-60">
                Runway, fal.ai ou ElevenLabs.
              </span>
            </button>
          </div>

          <label className="block text-xs font-medium text-white/65">
            Direção criativa
            <textarea
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              className="mt-2 min-h-36 w-full rounded-2xl border border-white/10 bg-[#020914] p-4 text-sm leading-6 text-white outline-none focus:border-violet-300/35"
              placeholder="Ex.: Use minha foto como personagem principal. Comece num escritório moderno, caminhe até a câmara; corte para um cenário urbano à noite; depois mostre detalhes do sistema e termine em um hero shot. Visual premium, realista, publicidade de alto nível."
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <label className="text-[10px] text-white/45">
              Formato
              <select
                value={ratio}
                onChange={(event) => setRatio(event.target.value as AspectRatio)}
                className="mt-2 min-h-11 w-full rounded-xl border border-white/10 bg-[#020914] px-3 text-xs text-white"
              >
                <option value="9:16">Vertical 9:16</option>
                <option value="16:9">Horizontal 16:9</option>
                <option value="1:1">Quadrado 1:1</option>
              </select>
            </label>
            <label className="text-[10px] text-white/45">
              Qualidade
              <select
                value={resolution}
                onChange={(event) =>
                  setResolution(event.target.value as "720p" | "1080p")
                }
                className="mt-2 min-h-11 w-full rounded-xl border border-white/10 bg-[#020914] px-3 text-xs text-white"
              >
                <option value="1080p">Full HD 1080p</option>
                <option value="720p">HD 720p</option>
              </select>
            </label>
            <label className="text-[10px] text-white/45">
              Duração
              <select
                value={durationSeconds}
                onChange={(event) => setDurationSeconds(Number(event.target.value))}
                className="mt-2 min-h-11 w-full rounded-xl border border-white/10 bg-[#020914] px-3 text-xs text-white"
              >
                <option value={5}>5 segundos</option>
                <option value={8}>8 segundos</option>
                <option value={10}>10 segundos</option>
                <option value={15}>15 segundos</option>
                <option value={20}>20 segundos</option>
              </select>
            </label>
            <label className="flex min-h-16 items-center gap-3 rounded-xl border border-white/[.07] bg-white/[.02] px-3 text-[10px] text-white/55">
              <input
                type="checkbox"
                checked={generateAudio}
                onChange={(event) => setGenerateAudio(event.target.checked)}
                className="size-4"
              />
              <Music2 className="size-4 text-violet-200" />
              <span>Gerar ambiente/efeitos quando o motor suportar</span>
            </label>
          </div>

          <div className="grid gap-3 rounded-2xl border border-white/[.07] bg-white/[.02] p-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
            <label className="text-[10px] text-white/45">
              <span className="flex items-center gap-2">
                <Volume2 className="size-4 text-cyan-200" /> Voz de locução
              </span>
              <select
                value={selectedVoiceKey}
                onChange={(event) => {
                  setSelectedVoiceKey(event.target.value);
                  setVoiceStatus(null);
                }}
                className="mt-2 min-h-11 w-full rounded-xl border border-white/10 bg-[#020914] px-3 text-xs text-white"
              >
                {voices.length === 0 ? (
                  <option value="">Nenhuma voz configurada</option>
                ) : null}
                {voices.map((voice) => (
                  <option key={voiceKey(voice)} value={voiceKey(voice)}>
                    {voice.name} · {voice.provider === "elevenlabs" ? "ElevenLabs" : "OpenAI"}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              onClick={() => void previewVoice()}
              disabled={!selectedVoice || voicePreviewBusy}
              className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-cyan-300/20 bg-cyan-300/[.05] px-4 text-xs text-cyan-50 disabled:opacity-35"
            >
              {voicePreviewBusy ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : (
                <Play className="size-4" />
              )}
              Ouvir voz
            </button>
            {voiceStatus ? (
              <p className="text-[10px] text-white/45 sm:col-span-2">{voiceStatus}</p>
            ) : null}
          </div>

          <button
            type="button"
            onClick={() => void generate()}
            disabled={!canGenerate}
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border border-violet-300/25 bg-gradient-to-r from-violet-500/25 to-cyan-400/15 text-sm font-semibold text-white transition hover:from-violet-500/35 hover:to-cyan-400/20 disabled:cursor-not-allowed disabled:opacity-35"
          >
            {busy ? (
              <LoaderCircle className="size-5 animate-spin" />
            ) : (
              <Sparkles className="size-5" />
            )}
            {busy ? "Produzindo vídeo profissional…" : "Gerar vídeo profissional"}
          </button>

          {mode === "photo" && references.length === 0 ? (
            <p className="text-[10px] text-amber-100/70">
              Selecione pelo menos uma foto abaixo para usar a identidade como referência.
            </p>
          ) : null}
          {status ? (
            <p className="rounded-xl border border-cyan-300/12 bg-cyan-300/[.04] p-3 text-xs text-cyan-50/75">
              {status}
              {provider ? ` · ${provider}` : ""}
            </p>
          ) : null}
          {error ? (
            <p className="rounded-xl border border-red-300/15 bg-red-300/[.05] p-3 text-xs leading-5 text-red-100/80">
              {error}
            </p>
          ) : null}
        </div>

        <div className="space-y-4">
          <ReferenceImageLibrary
            companyId={companyId}
            onReferencesChange={setReferences}
            compact
          />
          <div className="overflow-hidden rounded-2xl border border-white/[.08] bg-black/30">
            <div className="flex items-center justify-between border-b border-white/[.06] px-3 py-2">
              <span className="text-[9px] uppercase tracking-[.16em] text-white/35">
                Prévia generativa
              </span>
              {assetPath ? (
                <span className="text-[9px] text-emerald-200/60">guardado</span>
              ) : null}
            </div>
            <div className="aspect-[9/16] max-h-[560px] bg-[radial-gradient(circle_at_center,rgba(79,70,229,.12),transparent_55%),#010307]">
              {videoUrl ? (
                <video
                  src={videoUrl}
                  controls
                  playsInline
                  className="h-full w-full object-contain"
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center px-6 text-center">
                  <Clapperboard className="size-8 text-violet-200/35" />
                  <strong className="mt-3 text-sm text-white/65">
                    O vídeo aparecerá aqui
                  </strong>
                  <p className="mt-2 text-[10px] leading-5 text-white/30">
                    ComfyUI local e motores de nuvem geram novos frames; o painel acompanha
                    a produção até o arquivo final.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
