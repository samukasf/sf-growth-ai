"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

export type SamuelSpeechStatus =
  | "idle"
  | "preparing"
  | "speaking"
  | "blocked"
  | "unsupported";

export type SamuelSpeechEngine =
  | "server-neural"
  | "elevenlabs-neural"
  | "openai-neural"
  | "piper-local"
  | "browser-female"
  | null;

export type SpeakOptions = {
  automatic?: boolean;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: () => void;
};

type UseSamuelSpeechInput = { enabled?: boolean; companyId?: string };
type Playback = {
  text: string;
  charIndex: number;
  wordIndex: number;
  progress: number;
  mouthLevel: number;
};

const EMPTY: Playback = { text: "", charIndex: 0, wordIndex: -1, progress: 0, mouthLevel: 0 };
const PIPER_VOICE = "pt_BR-faber-medium" as const;
const SILENT_WAV_DATA_URI =
  "data:audio/wav;base64,UklGRjQAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YRAAAAAAAAAAAAAAAAAAAAAAAAAA";
const FEMALE_VOICE_HINTS = [
  "female", "feminina", "luciana", "joana", "francisca", "mariana", "camila",
  "camilla", "beatriz", "bruna", "victoria", "vitória", "leticia", "letícia",
  "heloisa", "heloísa", "fernanda", "alessandra", "raquel", "keren", "priscila",
];

export type SamuelVoiceCandidate = { name: string; lang: string; localService?: boolean };

type SpeakRequestDetail = { text?: string };

export function resolveSamuelNeuralEngine(provider: string | null): SamuelSpeechEngine {
  if (provider === "elevenlabs") return "elevenlabs-neural";
  if (provider === "openai") return "openai-neural";
  return "server-neural";
}

export function resolveSamuelNeuralVoiceLabel(provider: string | null) {
  if (provider === "elevenlabs") return "ElevenLabs · Camilla";
  if (provider === "openai") return "OpenAI · voz feminina";
  return "Samuel Neural";
}

function sanitize(content: string) {
  return content
    .replace(/\[([^\]]+)]\([^)]+\)/g, "$1")
    .replace(/[*_`#>]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 2_400);
}

function wordPositions(text: string) {
  return [...text.matchAll(/\S+/g)].map((match) => ({ index: match.index ?? 0, value: match[0] }));
}

function emitOutputEvent(
  type: "start" | "end" | "cancel" | "error",
  detail: { text: string; engine: SamuelSpeechEngine },
) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(`samuel:voice-output-${type}`, { detail }));
}

export function selectSamuelFeminineVoice<T extends SamuelVoiceCandidate>(voices: readonly T[]) {
  return voices
    .filter((voice) => voice.lang.toLowerCase().startsWith("pt"))
    .filter((voice) => {
      const name = voice.name.toLowerCase();
      return FEMALE_VOICE_HINTS.some((hint) => name.includes(hint));
    })
    .sort((left, right) => {
      const score = (voice: T) =>
        (voice.lang.toLowerCase() === "pt-br" ? 4 : 0) + (voice.localService ? 1 : 0);
      return score(right) - score(left);
    })[0] ?? null;
}

export function selectSamuelPortugueseFallbackVoice<T extends SamuelVoiceCandidate>(voices: readonly T[]) {
  return voices
    .filter((voice) => voice.lang.toLowerCase().startsWith("pt"))
    .sort((left, right) => {
      const score = (voice: T) =>
        (voice.lang.toLowerCase() === "pt-br" ? 4 : 0) +
        (voice.lang.toLowerCase() === "pt-pt" ? 3 : 0) +
        (voice.localService ? 1 : 0);
      return score(right) - score(left);
    })[0] ?? null;
}

function subscribeSupport() { return () => undefined; }
function supportSnapshot() {
  if (typeof window === "undefined") return false;
  return "Audio" in window ||
    ("speechSynthesis" in window && "SpeechSynthesisUtterance" in window);
}
function serverSnapshot() { return false; }

export function useSamuelSpeech({ enabled = true, companyId = "default-company" }: UseSamuelSpeechInput = {}) {
  const [status, setStatus] = useState<SamuelSpeechStatus>("idle");
  const [settling, setSettling] = useState(false);
  const [playback, setPlayback] = useState<Playback>(EMPTY);
  const [engine, setEngine] = useState<SamuelSpeechEngine>(null);
  const [voiceLabel, setVoiceLabel] = useState<string | null>(null);
  const [loadProgress, setLoadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const supported = useSyncExternalStore(subscribeSupport, supportSnapshot, serverSnapshot);

  const requestRef = useRef(0);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const settleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeEngineRef = useRef<SamuelSpeechEngine>(null);
  const activeTextRef = useRef("");
  const audioUnlockedRef = useRef(false);
  const audioUnlockPromiseRef = useRef<Promise<boolean> | null>(null);

  const ensureAudioElement = useCallback(() => {
    if (typeof Audio === "undefined") return null;
    if (!audioRef.current) {
      const audio = new Audio();
      audio.preload = "auto";
      audio.setAttribute("playsinline", "");
      audioRef.current = audio;
    }
    return audioRef.current;
  }, []);

  const unlockAudioPlayback = useCallback(() => {
    if (audioUnlockedRef.current) return Promise.resolve(true);
    if (audioUnlockPromiseRef.current) return audioUnlockPromiseRef.current;

    const audio = ensureAudioElement();
    if (!audio) return Promise.resolve(false);
    audio.muted = false;
    audio.src = SILENT_WAV_DATA_URI;

    const unlockPromise = audio.play()
      .then(() => {
        audio.pause();
        audio.currentTime = 0;
        audioUnlockedRef.current = true;
        return true;
      })
      .catch(() => false)
      .finally(() => {
        audioUnlockPromiseRef.current = null;
      });
    audioUnlockPromiseRef.current = unlockPromise;
    return unlockPromise;
  }, [ensureAudioElement]);

  const releaseMedia = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    progressTimerRef.current = null;
    if (settleTimerRef.current) clearTimeout(settleTimerRef.current);
    settleTimerRef.current = null;
    if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
    utteranceRef.current = null;
    if (audioRef.current) {
      audioRef.current.onplay = null;
      audioRef.current.onended = null;
      audioRef.current.onerror = null;
      audioRef.current.pause();
      audioRef.current.removeAttribute("src");
      audioRef.current.load();
    }
    if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
    audioUrlRef.current = null;
  }, []);

  const beginProgress = useCallback((text: string, audio?: HTMLAudioElement) => {
    const positions = wordPositions(text);
    const startedAt = performance.now();
    if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    progressTimerRef.current = setInterval(() => {
      const duration = audio && Number.isFinite(audio.duration) && audio.duration > 0
        ? audio.duration * 1000
        : Math.max(1_250, positions.length * 295);
      const elapsed = audio ? audio.currentTime * 1000 : performance.now() - startedAt;
      const progress = Math.min(0.985, elapsed / duration);
      const wordIndex = Math.min(
        Math.max(0, positions.length - 1),
        Math.floor(progress * Math.max(1, positions.length)),
      );
      setPlayback({
        text,
        charIndex: positions[wordIndex]?.index ?? 0,
        wordIndex,
        progress,
        mouthLevel: 0.1 + Math.abs(Math.sin(performance.now() / 115)) * 0.23,
      });
    }, 75);
  }, []);

  const finish = useCallback((requestId: number, text: string, options: SpeakOptions) => {
    if (requestRef.current !== requestId) return;
    const finishedEngine = activeEngineRef.current;
    const positions = wordPositions(text);
    releaseMedia();
    setStatus("idle");
    setPlayback({
      text,
      charIndex: text.length,
      wordIndex: Math.max(-1, positions.length - 1),
      progress: 1,
      mouthLevel: 0,
    });
    emitOutputEvent("end", { text, engine: finishedEngine });
    activeTextRef.current = "";
    activeEngineRef.current = null;
    setSettling(true);
    settleTimerRef.current = setTimeout(() => setSettling(false), 350);
    options.onEnd?.();
  }, [releaseMedia]);

  const cancel = useCallback(() => {
    const text = activeTextRef.current;
    const currentEngine = activeEngineRef.current;
    requestRef.current += 1;
    releaseMedia();
    if (text) emitOutputEvent("cancel", { text, engine: currentEngine });
    activeTextRef.current = "";
    activeEngineRef.current = null;
    setStatus("idle");
    setSettling(false);
    setPlayback(EMPTY);
    setEngine(null);
    setVoiceLabel(null);
    setLoadProgress(0);
    setErrorMessage(null);
  }, [releaseMedia]);

  const browserSpeak = useCallback((text: string, requestId: number, options: SpeakOptions) => {
    if (
      typeof window === "undefined" ||
      !("speechSynthesis" in window) ||
      !("SpeechSynthesisUtterance" in window)
    ) return false;

    const voices = window.speechSynthesis.getVoices();
    const voice = selectSamuelFeminineVoice(voices) ?? selectSamuelPortugueseFallbackVoice(voices);
    const utterance = new SpeechSynthesisUtterance(text);
    if (voice) utterance.voice = voice;
    utterance.lang = voice?.lang ?? "pt-BR";
    utterance.rate = 1;
    utterance.pitch = 1.02;
    utterance.volume = 1;
    utteranceRef.current = utterance;
    activeTextRef.current = text;
    activeEngineRef.current = "browser-female";
    setEngine("browser-female");
    setVoiceLabel(voice?.name ?? "Voz nativa do dispositivo · Português");
    setLoadProgress(1);

    utterance.onstart = () => {
      if (requestRef.current !== requestId) return;
      setStatus("speaking");
      beginProgress(text);
      emitOutputEvent("start", { text, engine: "browser-female" });
      options.onStart?.();
    };
    utterance.onboundary = (event) => {
      if (requestRef.current !== requestId) return;
      const positions = wordPositions(text);
      const charIndex = Math.max(0, Math.min(text.length, event.charIndex));
      const wordIndex = Math.max(0, positions.findLastIndex((word) => word.index <= charIndex));
      setPlayback((current) => ({
        ...current,
        charIndex,
        wordIndex,
        progress: text.length ? charIndex / text.length : 0,
      }));
    };
    utterance.onend = () => finish(requestId, text, options);
    utterance.onerror = (event) => {
      if (requestRef.current !== requestId) return;
      setStatus(event.error === "not-allowed" ? "blocked" : "idle");
      setErrorMessage(
        event.error === "not-allowed"
          ? "O navegador bloqueou a reprodução de áudio."
          : "A voz nativa foi interrompida.",
      );
      emitOutputEvent("error", { text, engine: "browser-female" });
      activeTextRef.current = "";
      activeEngineRef.current = null;
      options.onError?.();
    };
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    window.speechSynthesis.resume();
    return true;
  }, [beginProgress, finish]);

  const piperSpeak = useCallback(async (text: string, requestId: number, options: SpeakOptions) => {
    activeTextRef.current = text;
    activeEngineRef.current = "piper-local";
    setEngine("piper-local");
    setVoiceLabel("Piper · Faber Grave pt-BR");
    setStatus("preparing");
    setLoadProgress(0);
    try {
      const tts = await import("@diffusionstudio/vits-web");
      const blob = await tts.predict(
        { text, voiceId: PIPER_VOICE },
        ({ loaded, total }) => {
          if (requestRef.current === requestId && total > 0) {
            setLoadProgress(Math.min(0.98, loaded / total));
          }
        },
      );
      if (requestRef.current !== requestId) return;
      const url = URL.createObjectURL(blob);
      const audio = ensureAudioElement();
      if (!audio) throw new Error("Elemento de áudio indisponível.");
      audioUrlRef.current = url;
      audio.src = url;
      audio.muted = false;
      audio.playbackRate = 0.96;
      audio.preservesPitch = true;
      audio.load();
      setLoadProgress(1);
      audio.onplay = () => {
        if (requestRef.current !== requestId) return;
        setStatus("speaking");
        beginProgress(text, audio);
        emitOutputEvent("start", { text, engine: "piper-local" });
        options.onStart?.();
      };
      audio.onended = () => finish(requestId, text, options);
      audio.onerror = () => {
        if (requestRef.current !== requestId) return;
        setStatus("idle");
        setErrorMessage("Não foi possível reproduzir a voz local.");
        emitOutputEvent("error", { text, engine: "piper-local" });
        activeTextRef.current = "";
        activeEngineRef.current = null;
        options.onError?.();
      };
      await audio.play();
    } catch {
      if (requestRef.current !== requestId) return;
      setStatus("unsupported");
      setErrorMessage("Voz local indisponível.");
      emitOutputEvent("error", { text, engine: "piper-local" });
      activeTextRef.current = "";
      activeEngineRef.current = null;
      options.onError?.();
    }
  }, [beginProgress, ensureAudioElement, finish]);

  const neuralSpeak = useCallback(async (text: string, requestId: number, options: SpeakOptions) => {
    const controller = new AbortController();
    abortRef.current = controller;
    activeTextRef.current = text;
    activeEngineRef.current = "server-neural";
    setEngine("server-neural");
    setVoiceLabel("ElevenLabs · a preparar");
    setStatus("preparing");
    setLoadProgress(0.08);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/samuel-ai/voice/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId, text }),
        signal: controller.signal,
        cache: "no-store",
      });
      if (!response.ok) throw new Error(`TTS neural HTTP ${response.status}`);
      const neuralEngine = resolveSamuelNeuralEngine(
        response.headers.get("X-Samuel-TTS-Provider"),
      );
      const neuralVoiceLabel = resolveSamuelNeuralVoiceLabel(
        response.headers.get("X-Samuel-TTS-Provider"),
      );
      const blob = await response.blob();
      if (!blob.size) throw new Error("TTS neural retornou áudio vazio.");
      if (controller.signal.aborted || requestRef.current !== requestId) return;
      const url = URL.createObjectURL(blob);
      const audio = ensureAudioElement();
      if (!audio) throw new Error("Elemento de áudio indisponível.");
      audioUrlRef.current = url;
      audio.src = url;
      audio.muted = false;
      audio.preload = "auto";
      audio.playbackRate = 1;
      audio.preservesPitch = true;
      audio.load();
      activeEngineRef.current = neuralEngine;
      setEngine(neuralEngine);
      setVoiceLabel(neuralVoiceLabel);
      setLoadProgress(1);
      audio.onplay = () => {
        if (requestRef.current !== requestId) return;
        setStatus("speaking");
        beginProgress(text, audio);
        emitOutputEvent("start", { text, engine: neuralEngine });
        options.onStart?.();
      };
      audio.onended = () => finish(requestId, text, options);
      audio.onerror = () => {
        if (requestRef.current !== requestId) return;
        emitOutputEvent("error", { text, engine: neuralEngine });
        if (!browserSpeak(text, requestId, options)) void piperSpeak(text, requestId, options);
      };
      await audio.play();
    } catch (error) {
      if (controller.signal.aborted || requestRef.current !== requestId) return;
      console.warn("Samuel neural voice unavailable; using local fallback", error);
      if (!browserSpeak(text, requestId, options)) void piperSpeak(text, requestId, options);
    } finally {
      if (abortRef.current === controller) abortRef.current = null;
    }
  }, [beginProgress, browserSpeak, companyId, ensureAudioElement, finish, piperSpeak]);

  const speak = useCallback((content: string, options: SpeakOptions = {}) => {
    if (!enabled || typeof window === "undefined") return false;
    const text = sanitize(content);
    if (!text) return false;

    requestRef.current += 1;
    const requestId = requestRef.current;
    releaseMedia();
    setSettling(false);
    setPlayback({ ...EMPTY, text });
    setErrorMessage(null);

    if (options.automatic && !audioUnlockedRef.current) {
      setStatus("blocked");
      setVoiceLabel("ElevenLabs · pronta para ativar");
      return true;
    }
    void unlockAudioPlayback();
    void neuralSpeak(text, requestId, options);
    return true;
  }, [enabled, neuralSpeak, releaseMedia, unlockAudioPlayback]);

  useEffect(() => {
    const handleInterrupt = () => cancel();
    const handleUnlock = () => {
      void unlockAudioPlayback();
    };
    const handleSpeakRequest = (event: Event) => {
      const detail = (event as CustomEvent<SpeakRequestDetail>).detail;
      const text = detail?.text?.trim();
      if (text) speak(text);
    };
    window.addEventListener("pointerdown", handleUnlock, true);
    window.addEventListener("keydown", handleUnlock, true);
    window.addEventListener("samuel:voice-unlock", handleUnlock);
    window.addEventListener("samuel:voice-interrupt", handleInterrupt);
    window.addEventListener("samuel:voice-speak-request", handleSpeakRequest as EventListener);
    return () => {
      window.removeEventListener("pointerdown", handleUnlock, true);
      window.removeEventListener("keydown", handleUnlock, true);
      window.removeEventListener("samuel:voice-unlock", handleUnlock);
      window.removeEventListener("samuel:voice-interrupt", handleInterrupt);
      window.removeEventListener("samuel:voice-speak-request", handleSpeakRequest as EventListener);
    };
  }, [cancel, speak, unlockAudioPlayback]);

  useEffect(() => () => {
    requestRef.current += 1;
    releaseMedia();
    audioRef.current = null;
  }, [releaseMedia]);

  return {
    status,
    speaking: status === "speaking",
    settling,
    blocked: status === "blocked",
    supported,
    engine,
    voiceLabel,
    loadProgress,
    errorMessage,
    activeText: playback.text,
    charIndex: playback.charIndex,
    wordIndex: playback.wordIndex,
    progress: playback.progress,
    mouthLevel: playback.mouthLevel,
    speak,
    cancel,
  };
}
