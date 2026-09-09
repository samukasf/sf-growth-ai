"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

export type SamuelSpeechStatus =
  | "idle"
  | "preparing"
  | "speaking"
  | "blocked"
  | "unsupported";

export type SamuelSpeechEngine = "gemini-neural" | "piper-local" | "browser-male" | null;

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
const MALE_VOICE_HINTS = [
  "male", "masculino", "antonio", "antónio", "carlos", "daniel", "duarte",
  "eddy", "felipe", "francisco", "jorge", "luciano", "miguel", "paulo",
  "reed", "ricardo", "rocko", "ruben", "tiago", "thiago", "joão",
];

export type SamuelVoiceCandidate = { name: string; lang: string; localService?: boolean };

type SpeakRequestDetail = { text?: string };

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

export function selectSamuelMasculineVoice<T extends SamuelVoiceCandidate>(voices: readonly T[]) {
  return voices
    .filter((voice) => voice.lang.toLowerCase().startsWith("pt"))
    .filter((voice) => {
      const name = voice.name.toLowerCase();
      return MALE_VOICE_HINTS.some((hint) => name.includes(hint));
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
      audioRef.current.pause();
      audioRef.current.removeAttribute("src");
      audioRef.current.load();
      audioRef.current = null;
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
    const voice = selectSamuelMasculineVoice(voices) ?? selectSamuelPortugueseFallbackVoice(voices);
    const utterance = new SpeechSynthesisUtterance(text);
    if (voice) utterance.voice = voice;
    utterance.lang = voice?.lang ?? "pt-BR";
    utterance.rate = 0.96;
    utterance.pitch = voice && selectSamuelMasculineVoice([voice]) ? 0.8 : 0.88;
    utterance.volume = 1;
    utteranceRef.current = utterance;
    activeTextRef.current = text;
    activeEngineRef.current = "browser-male";
    setEngine("browser-male");
    setVoiceLabel(voice?.name ?? "Voz nativa do dispositivo · Português");
    setLoadProgress(1);

    utterance.onstart = () => {
      if (requestRef.current !== requestId) return;
      setStatus("speaking");
      beginProgress(text);
      emitOutputEvent("start", { text, engine: "browser-male" });
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
      emitOutputEvent("error", { text, engine: "browser-male" });
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
      const audio = new Audio(url);
      audioRef.current = audio;
      audioUrlRef.current = url;
      audio.playbackRate = 0.96;
      audio.preservesPitch = true;
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
  }, [beginProgress, finish]);

  const neuralSpeak = useCallback(async (text: string, requestId: number, options: SpeakOptions) => {
    const controller = new AbortController();
    abortRef.current = controller;
    activeTextRef.current = text;
    activeEngineRef.current = "gemini-neural";
    setEngine("gemini-neural");
    setVoiceLabel("Samuel Neural · adulto grave");
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
      const blob = await response.blob();
      if (controller.signal.aborted || requestRef.current !== requestId) return;
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;
      audioUrlRef.current = url;
      audio.preload = "auto";
      setLoadProgress(1);
      audio.onplay = () => {
        if (requestRef.current !== requestId) return;
        setStatus("speaking");
        beginProgress(text, audio);
        emitOutputEvent("start", { text, engine: "gemini-neural" });
        options.onStart?.();
      };
      audio.onended = () => finish(requestId, text, options);
      audio.onerror = () => {
        if (requestRef.current !== requestId) return;
        emitOutputEvent("error", { text, engine: "gemini-neural" });
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
  }, [beginProgress, browserSpeak, companyId, finish, piperSpeak]);

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

    if (options.automatic) return true;
    void neuralSpeak(text, requestId, options);
    return true;
  }, [enabled, neuralSpeak, releaseMedia]);

  useEffect(() => {
    const handleInterrupt = () => cancel();
    const handleSpeakRequest = (event: Event) => {
      const detail = (event as CustomEvent<SpeakRequestDetail>).detail;
      const text = detail?.text?.trim();
      if (text) speak(text);
    };
    window.addEventListener("samuel:voice-interrupt", handleInterrupt);
    window.addEventListener("samuel:voice-speak-request", handleSpeakRequest as EventListener);
    return () => {
      window.removeEventListener("samuel:voice-interrupt", handleInterrupt);
      window.removeEventListener("samuel:voice-speak-request", handleSpeakRequest as EventListener);
    };
  }, [cancel, speak]);

  useEffect(() => () => {
    requestRef.current += 1;
    releaseMedia();
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
