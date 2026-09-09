"use client";

import { useEffect } from "react";

const MAX_FALLBACK_RECORDING_MS = 60_000;
const FALLBACK_SILENCE_MS = 1_800;
const VOICE_RMS_THRESHOLD = 0.028;
const REALTIME_BOOT_TIMEOUT_MS = 12_000;
const STATE_SYNC_MS = 120;

type TranscriptionResponse = {
  ok?: boolean;
  text?: string;
  error?: string;
};

type VoiceState = "idle" | "recording" | "processing" | "error";
type VoiceMode = "realtime" | "fallback" | "none";
type VoicePhase =
  | "idle"
  | "connecting"
  | "listening"
  | "processing"
  | "speaking"
  | "fallback-listening"
  | "fallback-processing"
  | "error";

function preferredMimeType() {
  if (typeof MediaRecorder === "undefined") return "";
  return [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4;codecs=mp4a.40.2",
    "audio/mp4",
  ].find((type) => MediaRecorder.isTypeSupported(type)) ?? "";
}

function realtimeElements(cockpit: HTMLElement) {
  return {
    consoleElement: cockpit.querySelector<HTMLElement>(".samuel-voice-console"),
    startButton: cockpit.querySelector<HTMLButtonElement>(".samuel-voice-console__start"),
  };
}

function realtimeSessionActive(startButton: HTMLButtonElement | null) {
  return startButton?.getAttribute("aria-pressed") === "true";
}

function realtimePhase(consoleElement: HTMLElement | null): VoicePhase {
  if (!consoleElement) return "idle";
  if (consoleElement.classList.contains("samuel-voice-console--speaking")) return "speaking";
  const text = consoleElement.textContent?.toLowerCase() ?? "";
  if (text.includes("solicitando microfone")) return "connecting";
  if (text.includes("processando")) return "processing";
  if (text.includes("samuel falando") || text.includes("· falando")) return "speaking";
  return "listening";
}

function setTextareaValue(textarea: HTMLTextAreaElement, value: string) {
  const descriptor = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value");
  descriptor?.set?.call(textarea, value);
  textarea.dispatchEvent(new Event("input", { bubbles: true }));
}

function sendTranscriptToChat(cockpit: HTMLElement, transcript: string) {
  const textarea = cockpit.querySelector<HTMLTextAreaElement>(".samuel-chat-textarea");
  if (!textarea) return false;

  setTextareaValue(textarea, transcript);
  textarea.focus();

  const trySend = (attempt = 0) => {
    const send = cockpit.querySelector<HTMLButtonElement>(
      ".samuel-chat-send:not(.is-cancel)",
    );
    if (send && !send.disabled) {
      send.click();
      return;
    }
    if (attempt < 8) window.setTimeout(() => trySend(attempt + 1), 45);
  };
  window.setTimeout(() => trySend(), 0);
  return true;
}

function primeAudioOutput() {
  if (!("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) return;
  try {
    const utterance = new SpeechSynthesisUtterance(" ");
    utterance.volume = 0;
    window.speechSynthesis.speak(utterance);
  } catch {
    // Text-chat TTS keeps its own fallback/error handling.
  }
}

/**
 * Connects the large dashboard microphone to the already-mounted ChatPanel.
 * Realtime is the primary path; MediaRecorder is a one-turn contingency only.
 */
export function SamuelVoiceReliabilityBridge() {
  useEffect(() => {
    let desired = false;
    let connected = false;
    let fallbackUsed = false;
    let activeCockpit: HTMLElement | null = null;
    let activeButton: HTMLButtonElement | null = null;
    let bootTimer = 0;
    let syncTimer = 0;

    let recorder: MediaRecorder | null = null;
    let stream: MediaStream | null = null;
    let audioContext: AudioContext | null = null;
    let analyser: AnalyserNode | null = null;
    let animationFrame = 0;
    let fallbackTimer = 0;
    let chunks: Blob[] = [];
    let speechStarted = false;
    let lastVoiceAt = 0;
    let fallbackProcessing = false;

    const setState = (
      state: VoiceState,
      mode: VoiceMode,
      phase: VoicePhase,
      sourceButton = activeButton,
    ) => {
      const buttons = Array.from(
        document.querySelectorAll<HTMLButtonElement>(
          ".samuel-focus-cockpit .samuel-reference-mic",
        ),
      );
      if (sourceButton && !buttons.includes(sourceButton)) buttons.push(sourceButton);

      for (const button of buttons) {
        button.dataset.voiceCaptureState = state;
        button.dataset.voiceMode = mode;
        button.dataset.voicePhase = phase;
        const cockpit = button.closest<HTMLElement>(".samuel-focus-cockpit");
        if (cockpit) {
          cockpit.dataset.samuelVoiceMode = mode;
          cockpit.dataset.samuelVoicePhase = phase;
        }
        button.setAttribute(
          "aria-label",
          phase === "connecting"
            ? "A iniciar conversa de voz em tempo real. Toque para encerrar."
            : phase === "speaking"
              ? "Samuel está falando. Fale para interromper ou toque para encerrar."
              : state === "recording" && mode === "realtime"
                ? "Conversa de voz ativa. Fale naturalmente. Toque para encerrar."
                : state === "recording"
                  ? "Modo de contingência ativo. Fale e aguarde a transcrição."
                  : state === "processing"
                    ? "Samuel está processando sua fala."
                    : state === "error"
                      ? "Falha na voz. Toque para tentar novamente."
                      : "Iniciar conversa por voz",
        );
      }
    };

    const clearBootTimer = () => {
      if (bootTimer) window.clearTimeout(bootTimer);
      bootTimer = 0;
    };

    const cleanupFallbackAudio = () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
      animationFrame = 0;
      if (fallbackTimer) window.clearTimeout(fallbackTimer);
      fallbackTimer = 0;
      analyser?.disconnect();
      analyser = null;
      if (audioContext && audioContext.state !== "closed") void audioContext.close();
      audioContext = null;
      stream?.getTracks().forEach((track) => track.stop());
      stream = null;
    };

    const stopFallbackRecording = () => {
      if (recorder && recorder.state !== "inactive") recorder.stop();
    };

    const transcribeFallback = async (blob: Blob, cockpit: HTMLElement) => {
      fallbackProcessing = true;
      setState("processing", "fallback", "fallback-processing");
      try {
        const companyId =
          cockpit.querySelector<HTMLElement>("[data-samuel-company-id]")?.dataset
            .samuelCompanyId || "default-company";
        const extension = blob.type.includes("mp4") ? "m4a" : "webm";
        const form = new FormData();
        form.set(
          "audio",
          new File([blob], `samuel-voice.${extension}`, {
            type: blob.type || "audio/webm",
          }),
        );

        const response = await fetch("/api/samuel-ai/transcribe", {
          method: "POST",
          headers: { "X-Samuel-Company-Id": companyId },
          body: form,
          cache: "no-store",
        });
        const payload = (await response.json().catch(() => ({}))) as TranscriptionResponse;
        if (!response.ok || !payload.text?.trim()) {
          throw new Error(payload.error || "Não foi possível transcrever sua fala.");
        }
        if (!sendTranscriptToChat(cockpit, payload.text.trim())) {
          throw new Error("O campo de conversa do Samuel não está disponível.");
        }
        setState("idle", "none", "idle");
      } catch (error) {
        console.error("Samuel fallback voice capture failed", error);
        setState("error", "fallback", "error");
      } finally {
        fallbackProcessing = false;
        desired = false;
        activeCockpit = null;
        activeButton = null;
      }
    };

    const monitorFallbackVoice = () => {
      if (!recorder || recorder.state !== "recording" || !analyser) return;
      const samples = new Float32Array(analyser.fftSize);
      analyser.getFloatTimeDomainData(samples);
      let energy = 0;
      for (const sample of samples) energy += sample * sample;
      const rms = Math.sqrt(energy / samples.length);
      const now = performance.now();

      if (rms >= VOICE_RMS_THRESHOLD) {
        speechStarted = true;
        lastVoiceAt = now;
      } else if (
        speechStarted &&
        lastVoiceAt > 0 &&
        now - lastVoiceAt >= FALLBACK_SILENCE_MS
      ) {
        stopFallbackRecording();
        return;
      }
      animationFrame = requestAnimationFrame(monitorFallbackVoice);
    };

    const startFallback = async (cockpit: HTMLElement, button: HTMLButtonElement) => {
      if (fallbackUsed || fallbackProcessing || recorder?.state === "recording") return;
      fallbackUsed = true;
      desired = false;
      connected = false;
      clearBootTimer();

      const { startButton } = realtimeElements(cockpit);
      if (realtimeSessionActive(startButton) && !startButton?.disabled) startButton.click();

      if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
        setState("error", "fallback", "error", button);
        return;
      }

      activeCockpit = cockpit;
      activeButton = button;
      chunks = [];
      speechStarted = false;
      lastVoiceAt = 0;
      primeAudioOutput();

      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
          video: false,
        });

        const mimeType = preferredMimeType();
        recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) chunks.push(event.data);
        };
        recorder.onerror = () => {
          setState("error", "fallback", "error", button);
          cleanupFallbackAudio();
        };
        recorder.onstop = () => {
          const type = recorder?.mimeType || mimeType || "audio/webm";
          const blob = new Blob(chunks, { type });
          const target = activeCockpit;
          cleanupFallbackAudio();
          recorder = null;
          if (target && blob.size > 0) void transcribeFallback(blob, target);
          else setState("error", "fallback", "error", button);
        };

        const AudioContextCtor =
          window.AudioContext ||
          (window as typeof window & { webkitAudioContext?: typeof AudioContext })
            .webkitAudioContext;
        if (AudioContextCtor) {
          try {
            audioContext = new AudioContextCtor({ latencyHint: "interactive" });
            if (audioContext.state === "suspended") void audioContext.resume();
            const source = audioContext.createMediaStreamSource(stream);
            analyser = audioContext.createAnalyser();
            analyser.fftSize = 1024;
            analyser.smoothingTimeConstant = 0.2;
            source.connect(analyser);
          } catch {
            analyser = null;
          }
        }

        recorder.start(250);
        setState("recording", "fallback", "fallback-listening", button);
        fallbackTimer = window.setTimeout(stopFallbackRecording, MAX_FALLBACK_RECORDING_MS);
        if (analyser) animationFrame = requestAnimationFrame(monitorFallbackVoice);
      } catch (error) {
        console.error("Samuel fallback microphone capture failed", error);
        cleanupFallbackAudio();
        recorder = null;
        setState("error", "fallback", "error", button);
      }
    };

    const syncRealtime = () => {
      const cockpit = activeCockpit ?? document.querySelector<HTMLElement>(".samuel-focus-cockpit");
      if (!cockpit || recorder?.state === "recording" || fallbackProcessing) return;
      const button = activeButton ?? cockpit.querySelector<HTMLButtonElement>(".samuel-reference-mic");
      if (!button) return;

      const { consoleElement, startButton } = realtimeElements(cockpit);
      const active = realtimeSessionActive(startButton);
      const phase = active ? realtimePhase(consoleElement) : "idle";
      const providerError = Boolean(
        consoleElement?.classList.contains("samuel-voice-console--error"),
      );

      if (active) {
        setState("recording", "realtime", phase, button);
        if (phase !== "connecting") {
          connected = true;
          clearBootTimer();
        }
        return;
      }

      if (desired && providerError) {
        void startFallback(cockpit, button);
        return;
      }

      if (desired && !connected) {
        setState("recording", "realtime", "connecting", button);
        return;
      }

      if (!desired) setState("idle", "none", "idle", button);
    };

    const beginRealtime = (cockpit: HTMLElement, button: HTMLButtonElement) => {
      const { startButton } = realtimeElements(cockpit);
      if (!startButton || startButton.disabled) {
        void startFallback(cockpit, button);
        return;
      }

      activeCockpit = cockpit;
      activeButton = button;
      desired = true;
      connected = false;
      fallbackUsed = false;
      primeAudioOutput();
      setState("recording", "realtime", "connecting", button);

      // Direct synchronous click preserves browser microphone/autoplay gesture permission.
      startButton.click();

      clearBootTimer();
      bootTimer = window.setTimeout(() => {
        if (desired && !connected) void startFallback(cockpit, button);
      }, REALTIME_BOOT_TIMEOUT_MS);
    };

    const endVoice = (cockpit: HTMLElement, button: HTMLButtonElement) => {
      desired = false;
      connected = false;
      fallbackUsed = false;
      clearBootTimer();

      if (recorder?.state === "recording") {
        stopFallbackRecording();
        return;
      }

      const { startButton } = realtimeElements(cockpit);
      if (realtimeSessionActive(startButton) && startButton && !startButton.disabled) {
        startButton.click();
      }
      setState("idle", "none", "idle", button);
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

      const { startButton } = realtimeElements(cockpit);
      if (desired || realtimeSessionActive(startButton) || recorder?.state === "recording") {
        endVoice(cockpit, button);
      } else if (!fallbackProcessing) {
        beginRealtime(cockpit, button);
      }
    };

    window.addEventListener("click", onPrimaryMic, true);
    syncTimer = window.setInterval(syncRealtime, STATE_SYNC_MS);
    syncRealtime();

    return () => {
      window.removeEventListener("click", onPrimaryMic, true);
      if (syncTimer) window.clearInterval(syncTimer);
      clearBootTimer();
      if (recorder?.state === "recording") recorder.stop();
      cleanupFallbackAudio();
    };
  }, []);

  return null;
}
