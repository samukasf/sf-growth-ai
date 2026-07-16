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

type SpeakOptions = {
  automatic?: boolean;
};

type UseSamuelSpeechInput = {
  enabled?: boolean;
};

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

const FEMALE_VOICE_HINTS = [
  "female",
  "feminina",
  "catarina",
  "fernanda",
  "helena",
  "joana",
  "luciana",
  "mariana",
  "paulina",
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
    .slice(0, 2_400);
}

export function selectSamuelMasculineVoice<T extends SamuelVoiceCandidate>(
  voices: readonly T[],
) {
  const portuguese = voices.filter((voice) =>
    voice.lang.toLowerCase().startsWith("pt"),
  );
  const masculine = portuguese
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

  if (masculine[0]) return masculine[0];

  return (
    portuguese.find((voice) => {
      const name = voice.name.toLowerCase();
      return !FEMALE_VOICE_HINTS.some((hint) => name.includes(hint));
    }) ?? null
  );
}

function subscribeToSpeechSupport() {
  return () => undefined;
}

function getSpeechSupportSnapshot() {
  return (
    typeof window !== "undefined" &&
    "speechSynthesis" in window &&
    "SpeechSynthesisUtterance" in window
  );
}

function getServerSpeechSupportSnapshot() {
  return false;
}

export function useSamuelSpeech({ enabled = true }: UseSamuelSpeechInput = {}) {
  const [status, setStatus] = useState<SamuelSpeechStatus>("idle");
  const supported = useSyncExternalStore(
    subscribeToSpeechSupport,
    getSpeechSupportSnapshot,
    getServerSpeechSupportSnapshot,
  );
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const autoplayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const voiceReadyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const voicesChangedRef = useRef<(() => void) | null>(null);
  const speechRequestRef = useRef(0);

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

  const cancel = useCallback(() => {
    speechRequestRef.current += 1;
    clearAutoplayTimer();
    clearVoiceLoader();
    utteranceRef.current = null;
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setStatus("idle");
  }, [clearAutoplayTimer, clearVoiceLoader]);

  const speak = useCallback(
    (content: string, options: SpeakOptions = {}) => {
      if (!enabled || typeof window === "undefined") return false;
      if (!("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) {
        setStatus("unsupported");
        return false;
      }

      const text = speechText(content);
      if (!text) return false;

      const requestId = speechRequestRef.current + 1;
      speechRequestRef.current = requestId;
      clearAutoplayTimer();
      clearVoiceLoader();
      window.speechSynthesis.cancel();

      let launched = false;
      const launch = () => {
        if (launched || speechRequestRef.current !== requestId) return;
        launched = true;
        clearVoiceLoader();

        const synthesis = window.speechSynthesis;
        const utterance = new SpeechSynthesisUtterance(text);
        const voice = selectSamuelMasculineVoice(synthesis.getVoices());
        if (voice) utterance.voice = voice;
        utterance.lang = voice?.lang ?? "pt-BR";
        utterance.rate = 0.94;
        utterance.pitch = voice ? 0.88 : 0.72;
        utterance.volume = 1;

        let started = false;
        utterance.onstart = () => {
          if (speechRequestRef.current !== requestId) return;
          started = true;
          clearAutoplayTimer();
          setStatus("speaking");
        };
        utterance.onend = () => {
          if (speechRequestRef.current !== requestId) return;
          clearAutoplayTimer();
          utteranceRef.current = null;
          setStatus("idle");
        };
        utterance.onerror = (event) => {
          if (speechRequestRef.current !== requestId) return;
          clearAutoplayTimer();
          utteranceRef.current = null;
          setStatus(
            event.error === "not-allowed" || event.error === "audio-busy"
              ? "blocked"
              : "idle",
          );
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
            }
          }, 2_200);
        }
      };

      if (window.speechSynthesis.getVoices().length === 0) {
        setStatus("preparing");
        voicesChangedRef.current = launch;
        window.speechSynthesis.addEventListener("voiceschanged", launch, {
          once: true,
        });
        voiceReadyTimerRef.current = setTimeout(launch, 650);
      } else {
        launch();
      }

      return true;
    },
    [clearAutoplayTimer, clearVoiceLoader, enabled],
  );

  useEffect(
    () => () => {
      clearAutoplayTimer();
      clearVoiceLoader();
      speechRequestRef.current += 1;
      utteranceRef.current = null;
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    },
    [clearAutoplayTimer, clearVoiceLoader],
  );

  return {
    status,
    speaking: status === "speaking",
    blocked: status === "blocked",
    supported,
    speak,
    cancel,
  };
}
