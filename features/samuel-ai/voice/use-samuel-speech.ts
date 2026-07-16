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
  "antonio",
  "antónio",
  "daniel",
  "felipe",
  "luciano",
  "paulo",
  "ricardo",
  "tiago",
  "thiago",
  "joão",
];

function speechText(content: string) {
  return content
    .replace(/\[([^\]]+)]\([^)]+\)/g, "$1")
    .replace(/[*_`#>]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 2_400);
}

function selectPortugueseVoice(synthesis: SpeechSynthesis) {
  const portuguese = synthesis
    .getVoices()
    .filter((voice) => voice.lang.toLowerCase().startsWith("pt"));

  return (
    portuguese.find((voice) => {
      const name = voice.name.toLowerCase();
      return MALE_VOICE_HINTS.some((hint) => name.includes(hint));
    }) ??
    portuguese.find((voice) => voice.lang.toLowerCase() === "pt-br") ??
    portuguese[0] ??
    null
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

  const clearAutoplayTimer = useCallback(() => {
    if (autoplayTimerRef.current) clearTimeout(autoplayTimerRef.current);
    autoplayTimerRef.current = null;
  }, []);

  const cancel = useCallback(() => {
    clearAutoplayTimer();
    utteranceRef.current = null;
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setStatus("idle");
  }, [clearAutoplayTimer]);

  const speak = useCallback(
    (content: string, options: SpeakOptions = {}) => {
      if (!enabled || typeof window === "undefined") return false;
      if (!("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) {
        setStatus("unsupported");
        return false;
      }

      const text = speechText(content);
      if (!text) return false;

      clearAutoplayTimer();
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      const voice = selectPortugueseVoice(window.speechSynthesis);
      if (voice) utterance.voice = voice;
      utterance.lang = voice?.lang ?? "pt-BR";
      utterance.rate = 0.96;
      utterance.pitch = 0.82;
      utterance.volume = 1;

      let started = false;
      utterance.onstart = () => {
        started = true;
        clearAutoplayTimer();
        setStatus("speaking");
      };
      utterance.onend = () => {
        clearAutoplayTimer();
        utteranceRef.current = null;
        setStatus("idle");
      };
      utterance.onerror = (event) => {
        clearAutoplayTimer();
        utteranceRef.current = null;
        setStatus(
          event.error === "not-allowed" || event.error === "audio-busy"
            ? "blocked"
            : "idle",
        );
      };

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
      window.speechSynthesis.resume();

      if (options.automatic) {
        autoplayTimerRef.current = setTimeout(() => {
          if (!started && utteranceRef.current === utterance) {
            setStatus("blocked");
          }
        }, 1_800);
      }

      return true;
    },
    [clearAutoplayTimer, enabled],
  );

  useEffect(
    () => () => {
      clearAutoplayTimer();
      utteranceRef.current = null;
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    },
    [clearAutoplayTimer],
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
