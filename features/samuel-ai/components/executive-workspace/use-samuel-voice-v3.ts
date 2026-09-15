"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  SAMUEL_VOICE_PRE_ROLL_MS,
  SAMUEL_VOICE_SAMPLE_RATE,
  SamuelTurnDetector,
  calculatePcmRms,
  concatPcm,
  downsamplePcm,
  encodePcm16Wav,
} from "../../voice/samuel-turn-detector";

export type SamuelVoicePhase =
  | "idle"
  | "connecting"
  | "listening"
  | "processing"
  | "error";

type VoiceTranscript = {
  text: string;
  provider: string | null;
  bargeIn: boolean;
};

type TranscriptionResponse = {
  ok?: boolean;
  text?: string;
  provider?: string;
  model?: string;
  error?: string;
};

type UseSamuelVoiceV3Input = {
  companyId: string;
  assistantSpeaking: boolean;
  assistantText: string;
  onInterrupt: () => void;
  onTranscript: (turn: VoiceTranscript) => void | Promise<void>;
};

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function isSamuelStopPhrase(value: string) {
  return /^(para|pare|parar|chega|silencio|cala|cala a boca|stop|quieto|quiet|enough)( agora)?$/i.test(
    normalizeText(value),
  );
}

export function isSamuelConfirmationPhrase(value: string) {
  return /^(sim|sim confirma|confirmo|confirma|confirmar|pode confirmar|pode criar|pode fazer|pode executar|execute|executa|faz isso|pode marcar|pode agendar)$/i.test(
    normalizeText(value),
  );
}

function isLikelyEcho(userText: string, assistantText: string) {
  const user = normalizeText(userText);
  const assistant = normalizeText(assistantText);
  if (!user || !assistant || user.length < 8) return false;
  if (assistant.includes(user)) return true;

  const userWords = user.split(" ").filter((word) => word.length > 2);
  const assistantWords = new Set(assistant.split(" ").filter((word) => word.length > 2));
  if (userWords.length < 3) return false;
  const overlap = userWords.filter((word) => assistantWords.has(word)).length / userWords.length;
  return overlap >= 0.82;
}

function postTelemetry(
  companyId: string,
  event: string,
  details: Record<string, unknown> = {},
) {
  const body = JSON.stringify({ companyId, event, details, at: new Date().toISOString() });
  void fetch("/api/samuel-ai/voice/telemetry", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => undefined);
}

export function useSamuelVoiceV3({
  companyId,
  assistantSpeaking,
  assistantText,
  onInterrupt,
  onTranscript,
}: UseSamuelVoiceV3Input) {
  const [active, setActive] = useState(false);
  const [phase, setPhase] = useState<SamuelVoicePhase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [lastTranscript, setLastTranscript] = useState("");

  const activeRef = useRef(false);
  const assistantSpeakingRef = useRef(assistantSpeaking);
  const assistantTextRef = useRef(assistantText);
  const onInterruptRef = useRef(onInterrupt);
  const onTranscriptRef = useRef(onTranscript);
  const streamRef = useRef<MediaStream | null>(null);
  const contextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const silentGainRef = useRef<GainNode | null>(null);
  const detectorRef = useRef(new SamuelTurnDetector({ endSilenceMs: 850, bargeStartMs: 70 }));
  const transcribingRef = useRef(false);
  const preRollRef = useRef<Float32Array[]>([]);
  const preRollSamplesRef = useRef(0);
  const segmentRef = useRef<Float32Array[]>([]);
  const segmentBargeInRef = useRef(false);

  useEffect(() => {
    assistantSpeakingRef.current = assistantSpeaking;
  }, [assistantSpeaking]);
  useEffect(() => {
    assistantTextRef.current = assistantText;
  }, [assistantText]);
  useEffect(() => {
    onInterruptRef.current = onInterrupt;
  }, [onInterrupt]);
  useEffect(() => {
    onTranscriptRef.current = onTranscript;
  }, [onTranscript]);

  const maxPreRollSamples = Math.round(
    (SAMUEL_VOICE_SAMPLE_RATE * SAMUEL_VOICE_PRE_ROLL_MS) / 1_000,
  );

  const clearBuffers = useCallback(() => {
    preRollRef.current = [];
    preRollSamplesRef.current = 0;
    segmentRef.current = [];
    segmentBargeInRef.current = false;
  }, []);

  const pushPreRoll = useCallback((pcm: Float32Array) => {
    preRollRef.current.push(pcm.slice());
    preRollSamplesRef.current += pcm.length;
    while (
      preRollSamplesRef.current > maxPreRollSamples &&
      preRollRef.current.length > 1
    ) {
      const removed = preRollRef.current.shift();
      preRollSamplesRef.current -= removed?.length ?? 0;
    }
  }, [maxPreRollSamples]);

  const transcribe = useCallback(async (pcm: Float32Array, bargeIn: boolean) => {
    if (!activeRef.current || transcribingRef.current) return;
    if (pcm.length < SAMUEL_VOICE_SAMPLE_RATE * 0.14) return;

    transcribingRef.current = true;
    setPhase("processing");
    const startedAt = performance.now();
    try {
      const wav = encodePcm16Wav(pcm, SAMUEL_VOICE_SAMPLE_RATE);
      const form = new FormData();
      form.set("audio", new File([wav], "samuel-turn.wav", { type: "audio/wav" }));
      const response = await fetch("/api/samuel-ai/transcribe", {
        method: "POST",
        headers: { "X-Samuel-Company-Id": companyId },
        body: form,
        cache: "no-store",
      });
      const payload = (await response.json().catch(() => ({}))) as TranscriptionResponse;
      if (!response.ok || !payload.text?.trim()) {
        throw new Error(payload.error || "Não consegui entender sua fala.");
      }

      const text = payload.text.trim();
      setLastTranscript(text);
      postTelemetry(companyId, "v3_transcription_ok", {
        provider: payload.provider ?? "unknown",
        model: payload.model ?? "unknown",
        latencyMs: Math.round(performance.now() - startedAt),
        bargeIn,
      });

      if (isSamuelStopPhrase(text)) {
        onInterruptRef.current();
        return;
      }
      if (bargeIn && isLikelyEcho(text, assistantTextRef.current)) {
        postTelemetry(companyId, "v3_echo_rejected", { transcriptLength: text.length });
        return;
      }

      await onTranscriptRef.current({
        text,
        provider: payload.provider ?? null,
        bargeIn,
      });
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Falha na conversa por voz.";
      setError(message);
      setPhase("error");
      postTelemetry(companyId, "v3_transcription_error", { message });
    } finally {
      transcribingRef.current = false;
      if (activeRef.current) setPhase("listening");
    }
  }, [companyId]);

  const finalizeSegment = useCallback(() => {
    if (!segmentRef.current.length) return;
    const pcm = concatPcm(segmentRef.current);
    const bargeIn = segmentBargeInRef.current;
    segmentRef.current = [];
    segmentBargeInRef.current = false;
    preRollRef.current = [];
    preRollSamplesRef.current = 0;
    void transcribe(pcm, bargeIn);
  }, [transcribe]);

  const handlePcm = useCallback((pcm: Float32Array) => {
    if (!activeRef.current || !pcm.length) return;
    const detector = detectorRef.current;
    const wasActive = detector.isActive;
    const decision = detector.observe(
      calculatePcmRms(pcm),
      performance.now(),
      assistantSpeakingRef.current,
    );

    if (decision.started) {
      segmentBargeInRef.current = decision.bargeIn;
      segmentRef.current = preRollRef.current.map((part) => part.slice());
      segmentRef.current.push(pcm.slice());
      preRollRef.current = [];
      preRollSamplesRef.current = 0;
      if (decision.bargeIn) {
        onInterruptRef.current();
        postTelemetry(companyId, "v3_barge_in", {
          threshold: decision.threshold,
          noiseFloor: decision.noiseFloor,
        });
      } else {
        postTelemetry(companyId, "v3_speech_started");
      }
      return;
    }

    if (wasActive || detector.isActive) {
      segmentRef.current.push(pcm.slice());
    } else {
      pushPreRoll(pcm);
    }

    if (decision.ended) finalizeSegment();
  }, [companyId, finalizeSegment, pushPreRoll]);

  const stop = useCallback(() => {
    activeRef.current = false;
    processorRef.current?.disconnect();
    processorRef.current = null;
    sourceRef.current?.disconnect();
    sourceRef.current = null;
    silentGainRef.current?.disconnect();
    silentGainRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (contextRef.current && contextRef.current.state !== "closed") {
      void contextRef.current.close();
    }
    contextRef.current = null;
    detectorRef.current.reset();
    clearBuffers();
    setActive(false);
    setPhase("idle");
    postTelemetry(companyId, "v3_session_ended");
  }, [clearBuffers, companyId]);

  const start = useCallback(async () => {
    if (activeRef.current) return;
    setError(null);
    setPhase("connecting");
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Este navegador não disponibiliza o microfone.");
      }
      const AudioContextCtor =
        window.AudioContext ||
        (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextCtor) throw new Error("AudioContext indisponível neste navegador.");

      // Created directly from the user's click so later neural audio is not
      // rejected by browser autoplay policies.
      const context = new AudioContextCtor({ latencyHint: "interactive" });
      contextRef.current = context;
      if (context.state === "suspended") await context.resume();
      const unlock = context.createBufferSource();
      unlock.buffer = context.createBuffer(1, 1, context.sampleRate);
      unlock.connect(context.destination);
      unlock.start(0);

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1,
        },
        video: false,
      });
      streamRef.current = stream;

      const source = context.createMediaStreamSource(stream);
      sourceRef.current = source;
      const processor = context.createScriptProcessor(2048, 1, 1);
      processorRef.current = processor;
      const silentGain = context.createGain();
      silentGain.gain.value = 0;
      silentGainRef.current = silentGain;

      processor.onaudioprocess = (event) => {
        const sourcePcm = event.inputBuffer.getChannelData(0);
        const pcm = downsamplePcm(sourcePcm, context.sampleRate, SAMUEL_VOICE_SAMPLE_RATE);
        handlePcm(pcm);
      };
      source.connect(processor);
      processor.connect(silentGain);
      silentGain.connect(context.destination);

      activeRef.current = true;
      setActive(true);
      setPhase("listening");
      postTelemetry(companyId, "v3_session_started", {
        sampleRate: context.sampleRate,
        targetSampleRate: SAMUEL_VOICE_SAMPLE_RATE,
      });
    } catch (caught) {
      const message =
        caught instanceof DOMException && caught.name === "NotAllowedError"
          ? "Permissão do microfone bloqueada no navegador."
          : caught instanceof Error
            ? caught.message
            : "Não consegui abrir o microfone.";
      setError(message);
      setPhase("error");
      activeRef.current = false;
      setActive(false);
      postTelemetry(companyId, "v3_microphone_error", { message });
    }
  }, [companyId, handlePcm]);

  useEffect(() => () => stop(), [stop]);

  return {
    active,
    phase,
    error,
    lastTranscript,
    start,
    stop,
    toggle: active ? stop : start,
  };
}
