"use client";

import { useEffect } from "react";

const MAX_UTTERANCE_MS = 45_000;
const END_SILENCE_MS = 1_150;
const START_SPEECH_MS = 90;
const BARGE_IN_SPEECH_MS = 150;
const MIN_SPEECH_RMS = 0.019;
const MIN_BARGE_RMS = 0.034;
const ANALYSER_FFT_SIZE = 1024;

type TranscriptionResponse = {
  ok?: boolean;
  text?: string;
  provider?: string;
  model?: string;
  error?: string;
};

type OutputEventDetail = {
  text?: string;
  engine?: string | null;
};

type VoicePhase = "idle" | "connecting" | "listening" | "processing" | "speaking" | "error";

function preferredMimeType() {
  if (typeof MediaRecorder === "undefined") return "";
  return [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4;codecs=mp4a.40.2",
    "audio/mp4",
  ].find((type) => MediaRecorder.isTypeSupported(type)) ?? "";
}

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isStopPhrase(value: string) {
  const text = normalizeText(value);
  return /^(para|pare|parar|chega|silencio|cala|cala a boca|stop|quieto|quiet|shush|enough)( agora)?[.!]?$/i.test(text);
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

function calculateRms(analyser: AnalyserNode, samples: Float32Array) {
  analyser.getFloatTimeDomainData(samples);
  let energy = 0;
  for (const sample of samples) energy += sample * sample;
  return Math.sqrt(energy / samples.length);
}

/**
 * Deterministic Jarvis-style voice controller for the large Samuel microphone.
 *
 * The microphone stays open for the whole session. Client VAD segments each
 * utterance, the existing STT + Samuel chat runtime handles the turn, and TTS
 * playback is independent so user speech can cancel it immediately. This is the
 * reliability baseline even when provider-native Realtime is unavailable.
 */
export function SamuelVoiceReliabilityBridge() {
  useEffect(() => {
    let sessionActive = false;
    let stream: MediaStream | null = null;
    let audioContext: AudioContext | null = null;
    let analyser: AnalyserNode | null = null;
    let animationFrame = 0;
    let recorder: MediaRecorder | null = null;
    let chunks: Blob[] = [];
    let recordingStartedAt = 0;
    let lastSpeechAt = 0;
    let speechCandidateAt = 0;
    let noiseFloor = 0.006;
    let transcriptInFlight = false;
    let recordingBargeIn = false;
    let assistantSpeaking = false;
    let lastAssistantText = "";
    let activeCockpit: HTMLElement | null = null;
    let activeButton: HTMLButtonElement | null = null;
    let stopWithoutSending = false;

    const setState = (phase: VoicePhase, errorMessage?: string) => {
      const buttons = Array.from(
        document.querySelectorAll<HTMLButtonElement>(
          ".samuel-focus-cockpit .samuel-reference-mic",
        ),
      );
      if (activeButton && !buttons.includes(activeButton)) buttons.push(activeButton);

      for (const button of buttons) {
        button.dataset.voiceMode = sessionActive ? "jarvis" : "none";
        button.dataset.voicePhase = phase;
        button.dataset.voiceCaptureState =
          phase === "error" ? "error" : phase === "processing" ? "processing" : sessionActive ? "recording" : "idle";
        const cockpit = button.closest<HTMLElement>(".samuel-focus-cockpit");
        if (cockpit) {
          cockpit.dataset.samuelVoiceMode = sessionActive ? "jarvis" : "none";
          cockpit.dataset.samuelVoicePhase = phase;
          if (errorMessage) cockpit.dataset.samuelVoiceError = errorMessage;
          else delete cockpit.dataset.samuelVoiceError;
        }
        button.setAttribute(
          "aria-label",
          phase === "connecting"
            ? "A abrir o microfone."
            : phase === "listening"
              ? "Conversa ativa. Samuel está ouvindo. Toque para encerrar."
              : phase === "processing"
                ? "Samuel está entendendo sua fala. O microfone continua ativo."
                : phase === "speaking"
                  ? "Samuel está falando. Fale para interromper ou toque para encerrar."
                  : phase === "error"
                    ? `Falha na conversa por voz${errorMessage ? `: ${errorMessage}` : ""}.`
                    : "Iniciar conversa por voz",
        );
      }
    };

    const stopRecorder = () => {
      if (recorder && recorder.state !== "inactive") recorder.stop();
    };

    const cleanup = () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
      animationFrame = 0;
      if (recorder?.state === "recording") {
        stopWithoutSending = true;
        recorder.stop();
      }
      recorder = null;
      analyser?.disconnect();
      analyser = null;
      if (audioContext && audioContext.state !== "closed") void audioContext.close();
      audioContext = null;
      stream?.getTracks().forEach((track) => track.stop());
      stream = null;
      transcriptInFlight = false;
      speechCandidateAt = 0;
      recordingStartedAt = 0;
      lastSpeechAt = 0;
      assistantSpeaking = false;
    };

    const endSession = () => {
      sessionActive = false;
      stopWithoutSending = true;
      window.dispatchEvent(new CustomEvent("samuel:voice-interrupt"));
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
      cleanup();
      setState("idle");
      activeCockpit = null;
      activeButton = null;
    };

    const transcribe = async (blob: Blob, wasBargeIn: boolean) => {
      if (!sessionActive || !activeCockpit) return;
      transcriptInFlight = true;
      setState("processing");
      const cockpit = activeCockpit;
      const companyId =
        cockpit.querySelector<HTMLElement>("[data-samuel-company-id]")?.dataset.samuelCompanyId ||
        "default-company";
      try {
        const extension = blob.type.includes("mp4") ? "m4a" : "webm";
        const form = new FormData();
        form.set(
          "audio",
          new File([blob], `samuel-turn.${extension}`, {
            type: blob.type || "audio/webm",
          }),
        );
        const startedAt = performance.now();
        const response = await fetch("/api/samuel-ai/transcribe", {
          method: "POST",
          headers: { "X-Samuel-Company-Id": companyId },
          body: form,
          cache: "no-store",
        });
        const payload = (await response.json().catch(() => ({}))) as TranscriptionResponse;
        if (!response.ok || !payload.text?.trim()) {
          throw new Error(payload.error || "Não foi possível entender sua fala.");
        }

        const text = payload.text.trim();
        console.info("Samuel voice turn transcribed", {
          provider: payload.provider ?? "unknown",
          model: payload.model ?? "unknown",
          latencyMs: Math.round(performance.now() - startedAt),
          bargeIn: wasBargeIn,
        });

        if (isStopPhrase(text)) {
          setState("listening");
          return;
        }

        if (wasBargeIn && isLikelyEcho(text, lastAssistantText)) {
          console.info("Samuel voice echo rejected", { bargeIn: true });
          setState("listening");
          return;
        }

        window.dispatchEvent(
          new CustomEvent("samuel:voice-transcript", {
            detail: {
              text,
              source: "jarvis",
              provider: payload.provider ?? null,
              bargeIn: wasBargeIn,
            },
          }),
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : "Falha na transcrição.";
        console.error("Samuel continuous voice transcription failed", { message });
        setState("error", message);
      } finally {
        transcriptInFlight = false;
      }
    };

    const startRecording = (bargeIn: boolean) => {
      if (!sessionActive || !stream || recorder?.state === "recording" || transcriptInFlight) return;
      const mimeType = preferredMimeType();
      chunks = [];
      recordingBargeIn = bargeIn;
      stopWithoutSending = false;
      try {
        recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      } catch (error) {
        const message = error instanceof Error ? error.message : "MediaRecorder indisponível.";
        setState("error", message);
        return;
      }

      const currentRecorder = recorder;
      currentRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunks.push(event.data);
      };
      currentRecorder.onerror = () => setState("error", "Falha ao gravar a fala.");
      currentRecorder.onstop = () => {
        const shouldDiscard = stopWithoutSending || !sessionActive;
        const type = currentRecorder.mimeType || mimeType || "audio/webm";
        const blob = new Blob(chunks, { type });
        recorder = null;
        recordingStartedAt = 0;
        lastSpeechAt = 0;
        speechCandidateAt = 0;
        chunks = [];
        if (!shouldDiscard && blob.size > 0) void transcribe(blob, recordingBargeIn);
      };
      currentRecorder.start(180);
      recordingStartedAt = performance.now();
      lastSpeechAt = recordingStartedAt;
      setState(bargeIn ? "listening" : "listening");
    };

    const monitor = () => {
      if (!sessionActive || !analyser) return;
      const samples = new Float32Array(analyser.fftSize);
      const rms = calculateRms(analyser, samples);
      const now = performance.now();

      const speechThreshold = Math.max(MIN_SPEECH_RMS, noiseFloor * 2.7);
      const bargeThreshold = Math.max(MIN_BARGE_RMS, noiseFloor * 4.1);
      const threshold = assistantSpeaking ? bargeThreshold : speechThreshold;

      if (recorder?.state === "recording") {
        if (rms >= speechThreshold) lastSpeechAt = now;
        const duration = now - recordingStartedAt;
        if (
          duration >= MAX_UTTERANCE_MS ||
          (duration > 380 && lastSpeechAt > 0 && now - lastSpeechAt >= END_SILENCE_MS)
        ) {
          stopRecorder();
        }
      } else if (!transcriptInFlight) {
        if (!assistantSpeaking && rms < speechThreshold) {
          noiseFloor = Math.max(0.0025, Math.min(0.025, noiseFloor * 0.965 + rms * 0.035));
        }

        if (rms >= threshold) {
          if (!speechCandidateAt) speechCandidateAt = now;
          const needed = assistantSpeaking ? BARGE_IN_SPEECH_MS : START_SPEECH_MS;
          if (now - speechCandidateAt >= needed) {
            const bargeIn = assistantSpeaking;
            speechCandidateAt = 0;
            if (bargeIn) {
              assistantSpeaking = false;
              window.dispatchEvent(new CustomEvent("samuel:voice-interrupt"));
              if ("speechSynthesis" in window) window.speechSynthesis.cancel();
            }
            startRecording(bargeIn);
          }
        } else {
          speechCandidateAt = 0;
        }
      }

      animationFrame = requestAnimationFrame(monitor);
    };

    const startSession = async (cockpit: HTMLElement, button: HTMLButtonElement) => {
      if (sessionActive) return;
      if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
        setState("error", "Este navegador não oferece captura de áudio compatível.");
        return;
      }

      activeCockpit = cockpit;
      activeButton = button;
      sessionActive = true;
      setState("connecting");
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            channelCount: 1,
          },
          video: false,
        });
        const AudioContextCtor =
          window.AudioContext ||
          (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (!AudioContextCtor) throw new Error("AudioContext indisponível.");
        audioContext = new AudioContextCtor({ latencyHint: "interactive" });
        if (audioContext.state === "suspended") await audioContext.resume();
        const source = audioContext.createMediaStreamSource(stream);
        analyser = audioContext.createAnalyser();
        analyser.fftSize = ANALYSER_FFT_SIZE;
        analyser.smoothingTimeConstant = 0.12;
        source.connect(analyser);
        noiseFloor = 0.006;
        setState("listening");
        animationFrame = requestAnimationFrame(monitor);
      } catch (error) {
        const message =
          error instanceof DOMException && error.name === "NotAllowedError"
            ? "Permissão do microfone bloqueada."
            : error instanceof Error
              ? error.message
              : "Não foi possível abrir o microfone.";
        console.error("Samuel continuous microphone failed", { message });
        sessionActive = false;
        cleanup();
        setState("error", message);
      }
    };

    const onPrimaryMic = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const button = target.closest<HTMLButtonElement>(
        ".samuel-focus-cockpit .samuel-reference-mic",
      );
      if (!button) return;
      const cockpit = button.closest<HTMLElement>(".samuel-focus-cockpit");
      if (!cockpit) return;

      event.preventDefault();
      event.stopImmediatePropagation();
      if (sessionActive) endSession();
      else void startSession(cockpit, button);
    };

    const onOutputStart = (event: Event) => {
      const detail = (event as CustomEvent<OutputEventDetail>).detail;
      lastAssistantText = detail?.text?.trim() || lastAssistantText;
      assistantSpeaking = true;
      if (sessionActive) setState("speaking");
    };
    const onOutputEnd = () => {
      assistantSpeaking = false;
      if (sessionActive && !transcriptInFlight && recorder?.state !== "recording") setState("listening");
    };
    const onExternalStop = () => endSession();

    window.addEventListener("click", onPrimaryMic, true);
    window.addEventListener("samuel:voice-output-start", onOutputStart as EventListener);
    window.addEventListener("samuel:voice-output-end", onOutputEnd);
    window.addEventListener("samuel:voice-output-cancel", onOutputEnd);
    window.addEventListener("samuel:voice-output-error", onOutputEnd);
    window.addEventListener("samuel:voice-stop", onExternalStop);
    setState("idle");

    return () => {
      window.removeEventListener("click", onPrimaryMic, true);
      window.removeEventListener("samuel:voice-output-start", onOutputStart as EventListener);
      window.removeEventListener("samuel:voice-output-end", onOutputEnd);
      window.removeEventListener("samuel:voice-output-cancel", onOutputEnd);
      window.removeEventListener("samuel:voice-output-error", onOutputEnd);
      window.removeEventListener("samuel:voice-stop", onExternalStop);
      sessionActive = false;
      cleanup();
    };
  }, []);

  return null;
}
