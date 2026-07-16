"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

export type SamuelSpeechStatus =
  | "idle"
  | "preparing"
  | "speaking"
  | "blocked"
  | "unsupported";

export type SamuelSpeechEngine = "piper-local" | "browser-male" | null;

export type SpeakOptions = {
  automatic?: boolean;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: () => void;
};

type UseSamuelSpeechInput = {
  enabled?: boolean;
};

type SamuelSpeechPlayback = {
  text: string;
  charIndex: number;
  wordIndex: number;
  progress: number;
  mouthLevel: number;
};

type WordBoundary = {
  index: number;
  value: string;
};

const EMPTY_PLAYBACK: SamuelSpeechPlayback = {
  text: "",
  charIndex: 0,
  wordIndex: -1,
  progress: 0,
  mouthLevel: 0,
};

const PIPER_VOICE = "pt_BR-faber-medium" as const;

const MALE_VOICE_HINTS = [
  "male",
  "masculino",
  "antonio",
  "antónio",
  "carlos",
  "daniel",
  "duarte",
  "eddy",
  "felipe",
  "francisco",
  "jorge",
  "luciano",
  "miguel",
  "paulo",
  "reed",
  "ricardo",
  "rocko",
  "ruben",
  "tiago",
  "thiago",
  "joão",
];

export type SamuelVoiceCandidate = {
  name: string;
  lang: string;
  localService?: boolean;
};

function speechText(content: string) {
  return content
    .replace(/\[([^\]]+)]\([^)]+\)/g, "$1")
    .replace(/[*_`#>]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 1_600);
}

function textWords(text: string): WordBoundary[] {
  return [...text.matchAll(/\S+/g)].map((match) => ({
    index: match.index ?? 0,
    value: match[0],
  }));
}

export function selectSamuelMasculineVoice<T extends SamuelVoiceCandidate>(
  voices: readonly T[],
) {
  const masculine = voices
    .filter((voice) => voice.lang.toLowerCase().startsWith("pt"))
    .filter((voice) => {
      const name = voice.name.toLowerCase();
      return MALE_VOICE_HINTS.some((hint) => name.includes(hint));
    })
    .sort((left, right) => {
      const score = (voice: T) =>
        (voice.lang.toLowerCase() === "pt-br" ? 4 : 0) +
        (voice.localService ? 1 : 0);
      return score(right) - score(left);
    });

  return masculine[0] ?? null;
}

function subscribeToSpeechSupport() {
  return () => undefined;
}

function getSpeechSupportSnapshot() {
  if (typeof window === "undefined") return false;
  const localNeuralVoice = "WebAssembly" in window && "Audio" in window;
  const browserVoice =
    "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
  return localNeuralVoice || browserVoice;
}

function getServerSpeechSupportSnapshot() {
  return false;
}

export function useSamuelSpeech({ enabled = true }: UseSamuelSpeechInput = {}) {
  const [status, setStatus] = useState<SamuelSpeechStatus>("idle");
  const [settling, setSettling] = useState(false);
  const [playback, setPlayback] = useState<SamuelSpeechPlayback>(EMPTY_PLAYBACK);
  const [engine, setEngine] = useState<SamuelSpeechEngine>(null);
  const [voiceLabel, setVoiceLabel] = useState<string | null>(null);
  const [loadProgress, setLoadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const supported = useSyncExternalStore(
    subscribeToSpeechSupport,
    getSpeechSupportSnapshot,
    getServerSpeechSupportSnapshot,
  );

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const localAudioRef = useRef<HTMLAudioElement | null>(null);
  const localAudioUrlRef = useRef<string | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioFrameRef = useRef<number | null>(null);
  const autoplayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const voiceReadyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const settleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const voicesChangedRef = useRef<(() => void) | null>(null);
  const speechRequestRef = useRef(0);
  const boundaryDetectedRef = useRef(false);

  const clearAutoplayTimer = useCallback(() => {
    if (autoplayTimerRef.current) clearTimeout(autoplayTimerRef.current);
    autoplayTimerRef.current = null;
  }, []);

  const clearVoiceLoader = useCallback(() => {
    if (voiceReadyTimerRef.current) clearTimeout(voiceReadyTimerRef.current);
    voiceReadyTimerRef.current = null;
    if (
      voicesChangedRef.current &&
      typeof window !== "undefined" &&
      "speechSynthesis" in window
    ) {
      window.speechSynthesis.removeEventListener(
        "voiceschanged",
        voicesChangedRef.current,
      );
    }
    voicesChangedRef.current = null;
  }, []);

  const clearProgressTimer = useCallback(() => {
    if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    progressTimerRef.current = null;
  }, []);

  const clearSettleTimer = useCallback(() => {
    if (settleTimerRef.current) clearTimeout(settleTimerRef.current);
    settleTimerRef.current = null;
  }, []);

  const clearLocalAudio = useCallback(() => {
    if (audioFrameRef.current !== null && typeof window !== "undefined") {
      window.cancelAnimationFrame(audioFrameRef.current);
    }
    audioFrameRef.current = null;

    const audio = localAudioRef.current;
    if (audio) {
      audio.onplay = null;
      audio.onended = null;
      audio.onerror = null;
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
    }
    localAudioRef.current = null;

    if (localAudioUrlRef.current) URL.revokeObjectURL(localAudioUrlRef.current);
    localAudioUrlRef.current = null;

    const context = audioContextRef.current;
    audioContextRef.current = null;
    analyserRef.current = null;
    if (context && context.state !== "closed") void context.close().catch(() => undefined);
  }, []);

  const resetActiveSpeech = useCallback(() => {
    clearAutoplayTimer();
    clearVoiceLoader();
    clearProgressTimer();
    clearSettleTimer();
    clearLocalAudio();
    utteranceRef.current = null;
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }, [
    clearAutoplayTimer,
    clearLocalAudio,
    clearProgressTimer,
    clearSettleTimer,
    clearVoiceLoader,
  ]);

  const finishSpeech = useCallback((
    requestId: number,
    text: string,
    words: WordBoundary[],
    options: SpeakOptions,
  ) => {
    if (speechRequestRef.current !== requestId) return;
    clearAutoplayTimer();
    clearProgressTimer();
    clearLocalAudio();
    utteranceRef.current = null;
    setPlayback({
      text,
      charIndex: text.length,
      wordIndex: Math.max(-1, words.length - 1),
      progress: 1,
      mouthLevel: 0,
    });
    setStatus("idle");
    setSettling(true);
    settleTimerRef.current = setTimeout(() => {
      if (speechRequestRef.current === requestId) setSettling(false);
    }, 650);
    options.onEnd?.();
  }, [clearAutoplayTimer, clearLocalAudio, clearProgressTimer]);

  const cancel = useCallback(() => {
    speechRequestRef.current += 1;
    resetActiveSpeech();
    setStatus("idle");
    setSettling(false);
    setPlayback(EMPTY_PLAYBACK);
    setLoadProgress(0);
    setErrorMessage(null);
  }, [resetActiveSpeech]);

  const launchBrowserVoice = useCallback((
    text: string,
    words: WordBoundary[],
    requestId: number,
    options: SpeakOptions,
  ) => {
    if (
      typeof window === "undefined" ||
      !("speechSynthesis" in window) ||
      !("SpeechSynthesisUtterance" in window)
    ) {
      return false;
    }

    const synthesis = window.speechSynthesis;
    const voice = selectSamuelMasculineVoice(synthesis.getVoices());
    if (!voice) return false;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = voice;
    utterance.lang = voice.lang;
    utterance.rate = 0.92;
    utterance.pitch = 0.82;
    utterance.volume = 1;
    boundaryDetectedRef.current = false;
    setEngine("browser-male");
    setVoiceLabel(voice.name);
    setLoadProgress(1);
    setErrorMessage(null);

    let started = false;
    utterance.onstart = () => {
      if (speechRequestRef.current !== requestId) return;
      started = true;
      clearAutoplayTimer();
      setStatus("speaking");
      setSettling(false);
      options.onStart?.();

      const startedAt = performance.now();
      const estimatedDuration = Math.max(1_700, words.length * 380);
      progressTimerRef.current = setInterval(() => {
        if (speechRequestRef.current !== requestId) return;
        const elapsed = performance.now() - startedAt;
        const mouthLevel = 0.08 + Math.abs(Math.sin(elapsed / 145)) * 0.2;

        setPlayback((current) => {
          if (boundaryDetectedRef.current) return { ...current, mouthLevel };
          const progress = Math.min(0.985, elapsed / estimatedDuration);
          const wordIndex = Math.min(
            Math.max(0, words.length - 1),
            Math.floor(progress * Math.max(1, words.length)),
          );
          return {
            text,
            charIndex: words[wordIndex]?.index ?? 0,
            wordIndex,
            progress,
            mouthLevel,
          };
        });
      }, 90);
    };

    utterance.onboundary = (event) => {
      if (speechRequestRef.current !== requestId) return;
      if (event.name && event.name !== "word") return;
      boundaryDetectedRef.current = true;
      const charIndex = Math.max(0, Math.min(text.length, event.charIndex));
      const wordIndex = Math.max(
        0,
        words.findLastIndex((word) => word.index <= charIndex),
      );
      setPlayback((current) => ({
        ...current,
        text,
        charIndex,
        wordIndex,
        progress: text.length > 0 ? charIndex / text.length : 0,
      }));
    };

    utterance.onend = () => finishSpeech(requestId, text, words, options);
    utterance.onerror = (event) => {
      if (speechRequestRef.current !== requestId) return;
      clearAutoplayTimer();
      clearProgressTimer();
      utteranceRef.current = null;
      setPlayback(EMPTY_PLAYBACK);
      setSettling(false);
      setStatus(
        event.error === "not-allowed" || event.error === "audio-busy"
          ? "blocked"
          : "idle",
      );
      setErrorMessage("A reprodução da voz foi bloqueada pelo navegador.");
      options.onError?.();
    };

    utteranceRef.current = utterance;
    synthesis.speak(utterance);
    synthesis.resume();

    if (options.automatic) {
      autoplayTimerRef.current = setTimeout(() => {
        if (
          !started &&
          speechRequestRef.current === requestId &&
          utteranceRef.current === utterance
        ) {
          setStatus("blocked");
          setErrorMessage("O celular bloqueou o áudio automático.");
        }
      }, 2_200);
    }

    return true;
  }, [clearAutoplayTimer, clearProgressTimer, finishSpeech]);

  const launchPiperVoice = useCallback(async (
    text: string,
    words: WordBoundary[],
    requestId: number,
    options: SpeakOptions,
  ) => {
    setStatus("preparing");
    setEngine("piper-local");
    setVoiceLabel("Piper · Faber pt-BR");
    setLoadProgress(0);

    try {
      const tts = await import("@diffusionstudio/vits-web");
      const audioBlob = await tts.predict(
        { text, voiceId: PIPER_VOICE },
        ({ loaded, total }) => {
          if (speechRequestRef.current !== requestId || total <= 0) return;
          setLoadProgress(Math.min(0.98, loaded / total));
        },
      );
      if (speechRequestRef.current !== requestId) return;

      const url = URL.createObjectURL(audioBlob);
      const audio = new Audio(url);
      audio.preload = "auto";
      localAudioRef.current = audio;
      localAudioUrlRef.current = url;
      setLoadProgress(1);

      try {
        const context = new AudioContext();
        const source = context.createMediaElementSource(audio);
        const analyser = context.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.72;
        source.connect(analyser);
        analyser.connect(context.destination);
        audioContextRef.current = context;
        analyserRef.current = analyser;
        await context.resume();
      } catch {
        analyserRef.current = null;
      }

      const samples = new Uint8Array(128);
      const trackPlayback = () => {
        if (speechRequestRef.current !== requestId || audio.paused) return;
        const duration = Number.isFinite(audio.duration) && audio.duration > 0
          ? audio.duration
          : Math.max(1.7, words.length * 0.38);
        const progress = Math.min(0.995, audio.currentTime / duration);
        const wordIndex = Math.min(
          Math.max(0, words.length - 1),
          Math.floor(progress * Math.max(1, words.length)),
        );

        let mouthLevel = 0.08 + Math.abs(Math.sin(audio.currentTime * 8.5)) * 0.1;
        const analyser = analyserRef.current;
        if (analyser) {
          analyser.getByteTimeDomainData(samples);
          let energy = 0;
          for (const sample of samples) {
            const centered = (sample - 128) / 128;
            energy += centered * centered;
          }
          mouthLevel = Math.min(0.58, Math.sqrt(energy / samples.length) * 3.6);
        }

        setPlayback({
          text,
          charIndex: words[wordIndex]?.index ?? 0,
          wordIndex,
          progress,
          mouthLevel,
        });
        audioFrameRef.current = window.requestAnimationFrame(trackPlayback);
      };

      audio.onplay = () => {
        if (speechRequestRef.current !== requestId) return;
        setStatus("speaking");
        setSettling(false);
        setErrorMessage(null);
        options.onStart?.();
        audioFrameRef.current = window.requestAnimationFrame(trackPlayback);
      };
      audio.onended = () => finishSpeech(requestId, text, words, options);
      audio.onerror = () => {
        if (speechRequestRef.current !== requestId) return;
        setStatus("idle");
        setErrorMessage("Não foi possível reproduzir a voz local.");
        options.onError?.();
      };

      await audio.play();
    } catch (error) {
      if (speechRequestRef.current !== requestId) return;
      clearLocalAudio();
      const fallbackStarted = launchBrowserVoice(text, words, requestId, options);
      if (fallbackStarted) return;

      const blocked = error instanceof DOMException && error.name === "NotAllowedError";
      setStatus(blocked ? "blocked" : "unsupported");
      setEngine(null);
      setVoiceLabel(null);
      setErrorMessage(
        blocked
          ? "O celular bloqueou o áudio. Toque novamente em “Ouvir Samuel”."
          : "A voz neural local não pôde ser carregada neste navegador.",
      );
      setPlayback(EMPTY_PLAYBACK);
      options.onError?.();
    }
  }, [clearLocalAudio, finishSpeech, launchBrowserVoice]);

  const speak = useCallback((content: string, options: SpeakOptions = {}) => {
    if (!enabled || typeof window === "undefined") return false;

    const text = speechText(content);
    if (!text) return false;

    const requestId = speechRequestRef.current + 1;
    speechRequestRef.current = requestId;
    resetActiveSpeech();
    boundaryDetectedRef.current = false;
    const words = textWords(text);
    setSettling(false);
    setPlayback({ ...EMPTY_PLAYBACK, text });
    setErrorMessage(null);

    if (options.automatic) {
      const launch = () => {
        if (speechRequestRef.current !== requestId) return;
        clearVoiceLoader();
        if (!launchBrowserVoice(text, words, requestId, options)) {
          setStatus("blocked");
          setEngine(null);
          setVoiceLabel(null);
          setErrorMessage(
            "A saudação está pronta. Toque em “Ouvir Samuel” para carregar a voz masculina.",
          );
        }
      };

      if (
        "speechSynthesis" in window &&
        window.speechSynthesis.getVoices().length === 0
      ) {
        setStatus("preparing");
        voicesChangedRef.current = launch;
        window.speechSynthesis.addEventListener("voiceschanged", launch, { once: true });
        voiceReadyTimerRef.current = setTimeout(launch, 650);
      } else {
        launch();
      }
      return true;
    }

    if (!("WebAssembly" in window) || !("Audio" in window)) {
      if (launchBrowserVoice(text, words, requestId, options)) return true;
      setStatus("unsupported");
      setErrorMessage("Este navegador não oferece uma voz masculina compatível.");
      return false;
    }

    void launchPiperVoice(text, words, requestId, options);
    return true;
  }, [
    clearVoiceLoader,
    enabled,
    launchBrowserVoice,
    launchPiperVoice,
    resetActiveSpeech,
  ]);

  useEffect(() => () => {
    speechRequestRef.current += 1;
    resetActiveSpeech();
  }, [resetActiveSpeech]);

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
