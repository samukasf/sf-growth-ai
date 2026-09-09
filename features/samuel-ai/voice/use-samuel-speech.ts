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

function sanitize(content: string) {
  return content
    .replace(/\[([^\]]+)]\([^)]+\)/g, "$1")
    .replace(/[*_`#>]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 2_400);
}

function words(text: string) {
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
  const frameRef = useRef<number | null>(null);
  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const settleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const neuralAbortRef = useRef<AbortController | null>(null);
  const activeEngineRef = useRef<SamuelSpeechEngine>(null);
  const activeTextRef = useRef("");

  const cleanup = useCallback(() => {
    neuralAbortRef.current?.abort();
    neuralAbortRef.current = null;
    if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    progressTimerRef.current = null;
    if (settleTimerRef.current) clearTimeout(settleTimerRef.current);
    settleTimerRef.current = null;
    if (frameRef.current !== null && typeof window !== "undefined") cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
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

  const finish = useCallback((requestId: number, text: string, wordCount: number, options: SpeakOptions) => {
    if (requestRef.current !== requestId) return;
    const finishedEngine = activeEngineRef.current;
    cleanup();
    setStatus("idle");
    setPlayback({ text, charIndex: text.length, wordIndex: Math.max(-1, wordCount - 1), progress: 1, mouthLevel: 0 });
    setSettling(true);
    settleTimerRef.current = setTimeout(() => setSettling(false), 420);
    emitOutputEvent("end", { text, engine: finishedEngine });
    activeEngineRef.current = null;
    activeTextRef.current = "";
    options.onEnd?.();
  }, [cleanup]);

  const cancel = useCallback(() => {
    const currentText = activeTextRef.current;
    const currentEngine = activeEngineRef.current;
    requestRef.current += 1;
    cleanup();
    if (currentText) emitOutputEvent("cancel", { text: currentText, engine: currentEngine });
    activeEngineRef.current = null;
    activeTextRef.current = "";
    setStatus("idle");
    setSettling(false);
    setPlayback(EMPTY);
    setEngine(null);
    setVoiceLabel(null);
    setLoadProgress(0);
    setErrorMessage(null);
  }, [cleanup]);

  const browserSpeak = useCallback((text: string, requestId: number, options: SpeakOptions) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) return false;
    const availableVoices = window.speechSynthesis.getVoices();
    const voice = selectSamuelMasculineVoice(availableVoices) ?? selectSamuelPortugueseFallbackVoice(availableVoices);
    const textWords = words(text);
    const utterance = new SpeechSynthesisUtterance(text);
    if (voice) utterance.voice = voice;
    utterance.lang = voice?.lang ?? "pt-BR";
    utterance.rate = 0.96;
    utterance.pitch = voice && selectSamuelMasculineVoice([voice]) ? 0.78 : 0.86;
    utterance.volume = 1;
    activeEngineRef.current = "browser-male";
    activeTextRef.current = text;
    setEngine("browser-male");
    setVoiceLabel(voice?.name ?? "Voz nativa do dispositivo · Português");
    setLoadProgress(1);
    setErrorMessage(null);
    utterance.onstart = () => {
      if (requestRef.current !== requestId) return;
      setStatus("speaking");
      emitOutputEvent("start", { text, engine: "browser-male" });
      options.onStart?.();
      const startedAt = performance.now();
      const estimated = Math.max(1_200, textWords.length * 285);
      progressTimerRef.current = setInterval(() => {
        const progress = Math.min(0.98, (performance.now() - startedAt) / estimated);
        const wordIndex = Math.min(Math.max(0, textWords.length - 1), Math.floor(progress * Math.max(1, textWords.length)));
        setPlayback({
          text,
          charIndex: textWords[wordIndex]?.index ?? 0,
          wordIndex,
          progress,
          mouthLevel: 0.08 + Math.abs(Math.sin(performance.now() / 145)) * 0.2,
        });
      }, 90);
    };
    utterance.onboundary = (event) => {
      if (requestRef.current !== requestId) return;
      const charIndex = Math.max(0, Math.min(text.length, event.charIndex));
      const wordIndex = Math.max(0, textWords.findLastIndex((word) => word.index <= charIndex));
      setPlayback((current) => ({ ...current, charIndex, wordIndex, progress: text.length ? charIndex / text.length : 0 }));
    };
    utterance.onend = () => finish(requestId, text, textWords.length, options);
    utterance.onerror = (event) => {
      if (requestRef.current !== requestId) return;
      setStatus(event.error === "not-allowed" ? "blocked" : "idle");
      setErrorMessage(
        event.error === "not-allowed"
          ? "O navegador bloqueou o áudio. Toque novamente em Ouvir Samuel."
          : "A voz nativa foi interrompida.",
      );
      emitOutputEvent("error", { text, engine: "browser-male" });
      activeEngineRef.current = null;
      activeTextRef.current = "";
      options.onError?.();
    };
    utteranceRef.current = utterance;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    window.speechSynthesis.resume();
    return true;
  }, [finish]);

  const piperSpeak = useCallback(async (text: string, requestId: number, options: SpeakOptions) => {
    setStatus("preparing");
    activeEngineRef.current = "piper-local";
    activeTextRef.current = text;
    setEngine("piper-local");
    setVoiceLabel("Piper · Faber Grave pt-BR");
    setLoadProgress(0);
    try {
      const tts = await import("@diffusionstudio/vits-web");
      const blob = await tts.predict(
        { text, voiceId: PIPER_VOICE },
        ({ loaded, total }) => {
          if (requestRef.current === requestId && total > 0) setLoadProgress(Math.min(0.98, loaded / total));
        },
      );
      if (requestRef.current !== requestId) return;
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      const textWords = words(text);
      audioRef.current = audio;
      audioUrlRef.current = url;
      audio.playbackRate = 0.96;
      audio.preservesPitch = true;
      setLoadProgress(1);
      audio.onplay = () => {
        setStatus("speaking");
        emitOutputEvent("start", { text, engine: "piper-local" });
        options.onStart?.();
        const track = () => {
          if (requestRef.current !== requestId || audio.paused) return;
          const duration = Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : Math.max(1.5, textWords.length * 0.31);
          const progress = Math.min(0.99, audio.currentTime / duration);
          const wordIndex = Math.min(Math.max(0, textWords.length - 1), Math.floor(progress * Math.max(1, textWords.length)));
          setPlayback({
            text,
            charIndex: textWords[wordIndex]?.index ?? 0,
            wordIndex,
            progress,
            mouthLevel: 0.1 + Math.abs(Math.sin(audio.currentTime * 9)) * 0.18,
          });
          frameRef.current = requestAnimationFrame(track);
        };
        frameRef.current = requestAnimationFrame(track);
      };
      audio.onended = () => finish(requestId, text, textWords.length, options);
      audio.onerror = () => {
        setStatus("idle");
        setErrorMessage("Não foi possível reproduzir a voz local.");
        emitOutputEvent("error", { text, engine: "piper-local" });
        activeEngineRef.current = null;
        activeTextRef.current = "";
        options.onError?.();
      };
      await audio.play();
    } catch {
      if (requestRef.current !== requestId) return;
      setStatus("unsupported");
      setEngine(null);
      setVoiceLabel(null);
      setErrorMessage("Voz local indisponível.");
      emitOutputEvent("error", { text, engine: "piper-local" });
      activeEngineRef.current = null;
      activeTextRef.current = "";
      options.onError?.();
    }
  }, [finish]);

  const neuralSpeak = useCallback(async (text: string, requestId: number, options: SpeakOptions) => {
    const controller = new AbortController();
    neuralAbortRef.current = controller;
    activeEngineRef.current = "gemini-neural";
    activeTextRef.current = text;
    setStatus("preparing");
    setEngine("gemini-neural");
    setVoiceLabel("Samuel Neural · voz adulta");
    setLoadProgress(0.12);
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
      if (requestRef.current !== requestId || controller.signal.aborted) return;
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      const textWords = words(text);
      audioRef.current = audio;
      audioUrlRef.current = url;
      audio.preload = "auto";
      setLoadProgress(1);
      audio.onplay = () => {
        if (requestRef.current !== requestId) return;
        setStatus("speaking");
        emitOutputEvent("start", { text, engine: "gemini-neural" });
        options.onStart?.();
        const track = () => {
          if (requestRef.current !== requestId || audio.paused) return;
          const duration = Number.isFinite(audio.duration) && audio.duration > 0
            ? audio.duration
            : Math.max(1.2, textWords.length * 0.3);
          const progress = Math.min(0.99, audio.currentTime / duration);
          const wordIndex = Math.min(
            Math.max(0, textWords.length - 1),
            Math.floor(progress * Math.max(1, textWords.length)),
          );
          setPlayback({
            text,
            charIndex: textWords[wordIndex]?.index ?? 0,
            wordIndex,
            progress,
            mouthLevel: 0.12 + Math.abs(Math.sin(audio.currentTime * 10.5)) * 0.24,
          });
          frameRef.current = requestAnimationFrame(track);
        };
        frameRef.current = requestAnimationFrame(track);
      };
      audio.onended = () => finish(requestId, text, textWords.length, options);
      audio.onerror = () => {
        if (requestRef.current !== requestId) return;
        emitOutputEvent("error", { text, engine: "gemini-neural" });
        if (!browserSpeak(text, requestId, options)) void piperSpeak(text, requestId, options);
      };
      await audio.play();
    } catch (error) {
      if (requestRef.current !== requestId || controller.signal.aborted) return;
      console.warn("Samuel neural voice unavailable; using local fallback", error);
      if (!browserSpeak(text, requestId, options)) void piperSpeak(text, requestId, options);
    } finally {
      if (neuralAbortRef.current === controller) neuralAbortRef.current = null;
    }
  }, [browserSpeak, companyId, finish, piperSpeak]);

  const speak = useCallback((content: string, options: SpeakOptions = {}) => {
    if (!enabled || typeof window === "undefined") return false;
    const text = sanitize(content);
    if (!text) return false;
    requestRef.current += 1;
    const requestId = requestRef.current;
    cleanup();
    setSettling(false);
    setPlayback({ ...EMPTY, text });
    setErrorMessage(null);

    if (options.automatic) {
      setStatus("idle");
      setEngine(null);
      setVoiceLabel(null);
      setLoadProgress(0);
      return true;
    }

    // High-quality server neural speech is the primary voice. Browser/Piper
    // remain reliability fallbacks if the neural provider is unavailable.
    void neuralSpeak(text, requestId, options);
    return true;
  }, [cleanup, enabled, neuralSpeak]);

  useEffect(() => () => {
    requestRef.current += 1;
    cleanup();
  }, [cleanup]);

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
