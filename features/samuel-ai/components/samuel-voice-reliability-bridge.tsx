"use client";

import { useEffect } from "react";

const MAX_RECORDING_MS = 60_000;
const SILENCE_AFTER_SPEECH_MS = 1_800;
const VOICE_RMS_THRESHOLD = 0.028;
const REALTIME_BOOT_TIMEOUT_MS = 12_000;
const REALTIME_SYNC_MS = 120;

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
  const candidates = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4;codecs=mp4a.40.2",
    "audio/mp4",
  ];
  return candidates.find((type) => MediaRecorder.isTypeSupported(type)) ?? "";
}

function setTextareaValue(textarea: HTMLTextAreaElement, value: string) {
  const descriptor = Object.getOwnPropertyDescriptor(
    HTMLTextAreaElement.prototype,
    "value",
  );
  descriptor?.set?.call(textarea, value);
  textarea.dispatchEvent(new Event("input", { bubbles: true }));
}

function dispatchTranscript(cockpit: HTMLElement, transcript: string) {
  const textarea = cockpit.querySelector<HTMLTextAreaElement>(
    ".samuel-chat-textarea",
  );
  if (!textarea) return false;

  setTextareaValue(textarea, transcript);
  textarea.focus();

  const trySend = (attempt = 0) => {
    const sendButton = cockpit.querySelector<HTMLButtonElement>(
      ".samuel-chat-send:not(.is-cancel)",
    );
    if (sendButton && !sendButton.disabled) {
      sendButton.click();
      return;
    }
    if (attempt < 8) {
      window.setTimeout(() => trySend(attempt + 1), 45);
    }
  };
  window.setTimeout(() => trySend(), 0);

  return true;
}

function primeBrowserSpeech() {
  if (
    typeof window === "undefined" ||
    !("speechSynthesis" in window) ||
    !("SpeechSynthesisUtterance" in window)
  ) {
    return;
  }

  try {
    const unlock = new SpeechSynthesisUtterance(" ");
    unlock.volume = 0;
    unlock.rate = 1;
    window.speechSynthesis.speak(unlock);
  } catch {
    // The fallback TTS keeps its own error handling.
  }
}

function realtimeElements(cockpit: HTMLElement) {
  const consoleElement = cockpit.querySelector<HTMLElement>(
    ".samuel-voice-console",
  );
  const startButton = cockpit.querySelector<HTMLButtonElement>(
    ".samuel-voice-console__start",
  );
  return { consoleElement, startButton };
}

function inferRealtimePhase(consoleElement: HTMLElement): VoicePhase {
  if (consoleElement.classList.contains("samuel-voice-console--speaking")) {
    return "speaking";
  }
  const text = consoleElement.textContent?.toLowerCase() ?? "";
  if (text.includes("solicitando microfone")) return "connecting";
  if (text.includes("processando")) return "processing";
  if (text.includes("falando")) return "speaking";
  return "listening";
}

/**
 * Voice controller for the large Samuel microphone.
 *
 * Realtime audio is always attempted first. The existing ChatPanel owns the
 * actual WebRTC/WebSocket session and remains mounted even when its visual
 * conversation layer is closed. MediaRecorder + transcription is only a
 * one-turn fallback when the Realtime session cannot be established.
 */
export function SamuelVoiceReliabilityBridge() {
  useEffect(() => {
    let recorder: MediaRecorder | null = null;
    let stream: MediaStream | null = null;
    let audioContext: AudioContext | null = null;
    let analyser: AnalyserNode | null = null;
    let animationFrame = 0;
    let maxTimer = 0;
    let realtimeBootTimer = 0;
    let syncTimer = 0;
    let chunks: Blob[] = [];
    let speechStarted = false;
    let lastVoiceAt = 0;
    let activeCockpit: HTMLElement | null = null;
    let activeButton: HTMLButtonElement | null = null;
    let fallbackProcessing = false;
    let sessionDesired = false;
    let realtimeEverActive = false;
    let fallbackAttempted = false;
    let suppressRealtimeError = false;

    const setButtonState = (
      button: HTMLButtonElement | null,
      state: VoiceState,
      mode: VoiceMode,
      phase: VoicePhase,
    ) => {
      const buttons = Array.from(
        document.querySelectorAll<HTMLButtonElement>(
          ".samuel-focus-cockpit .samuel-reference-mic",
        ),
      );
      if (button && !buttons.includes(button)) buttons.push(button);

      for (const target of buttons) {
        target.dataset.voiceCaptureState = state;
        target.dataset.voiceMode = mode;
        target.dataset.voicePhase = phase;
        const cockpit = target.closest<HTMLElement>(".samuel-focus-cockpit");
        if (cockpit) {
          cockpit.dataset.samuelVoiceMode = mode;
          cockpit.dataset.samuelVoicePhase = phase;
        }
        target.setAttribute(
          "aria-label",
          phase === "speaking"
            ? "Samuel está falando. Comece a falar para interromper ou toque para encerrar."
            : state === "recording"
              ? mode === "realtime"
                ? "Conversa de voz ativa. Fale naturalmente. Toque para encerrar."
                : "Samuel está ouvindo em modo de contingência. Toque para parar."
              : state === "processing"
                ? mode === "realtime"
                  ? "Samuel está iniciando a conversa em tempo real."
                  : "Samuel está transcrevendo sua fala."
                : state === "error"
                  ? "A conversa de voz encontrou um erro. Toque para tentar novamente."
                  : "Iniciar conversa por voz",
        );
      }
    };

    const clearRealtimeBootTimer = () => {
      if (realtimeBootTimer) window.clearTimeout(realtimeBootTimer);
      realtimeBootTimer = 0;
    };

    const cleanupAudioGraph = () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
      animationFrame = 0;
      if (maxTimer) window.clearTimeout(maxTimer);
      maxTimer = 0;
      analyser?.disconnect();
      analyser = null;
      if (audioContext && audioContext.state !== "closed") {
        void audioContext.close();
      }
      audioContext = null;
      stream?.getTracks().forEach((track) => track.stop());
      stream = null;
    };

    const transcribeAndSend = async (blob: Blob, cockpit: HTMLElement) => {
      fallbackProcessing = true;
      setButtonState(activeButton, "processing", "fallback", "fallback-processing");
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

        const delivered = dispatchTranscript(cockpit, payload.text.trim());
        if (!delivered) {
          throw new Error("O campo de conversa do Samuel não está disponível.");
        }
        setButtonState(activeButton, "idle", "none", "idle");
      } catch (error) {
        console.error("Samuel fallback voice capture failed", error);
        setButtonState(activeButton, "error", "fallback", "error");
      } finally {
        fallbackProcessing = false;
        sessionDesired = false;
        activeCockpit = null;
        activeButton = null;
      }
    };

    const finishRecording = () => {
      if (!recorder || recorder.state === "inactive") return;
      recorder.stop();
    };

    const monitorVoice = () => {
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
        now - lastVoiceAt >= SILENCE_AFTER_SPEECH_MS
      ) {
        finishRecording();
        return;
      }

      animationFrame = requestAnimationFrame(monitorVoice);
    };

    const startFallbackRecording = async (
      cockpit: HTMLElement,
      button: HTMLButtonElement,
    ) => {
      if (fallbackProcessing || recorder?.state === "recording") return;
      if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
        setButtonState(button, "error", "fallback", "error");
        return;
      }

      activeCockpit = cockpit;
      activeButton = button;
      chunks = [];
      speechStarted = false;
      lastVoiceAt = 0;
      suppressRealtimeError = true;
      sessionDesired = false;

      primeBrowserSpeech();
      const AudioContextCtor =
        window.AudioContext ||
        (window as typeof window & { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (AudioContextCtor) {
        try {
          audioContext = new AudioContextCtor({ latencyHint: "interactive" });
          void audioContext.resume().catch(() => undefined);
        } catch {
          audioContext = null;
        }
      }

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
        recorder = mimeType
          ? new MediaRecorder(stream, { mimeType })
          : new MediaRecorder(stream);

        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) chunks.push(event.data);
        };
        recorder.onerror = () => {
          setButtonState(button, "error", "fallback", "error");
          cleanupAudioGraph();
        };
        recorder.onstop = () => {
          const type = recorder?.mimeType || mimeType || "audio/webm";
          const blob = new Blob(chunks, { type });
          const targetCockpit = activeCockpit;
          cleanupAudioGraph();
          recorder = null;
          if (targetCockpit && blob.size > 0) {
            void transcribeAndSend(blob, targetCockpit);
          } else {
            setButtonState(button, "error", "fallback", "error");
          }
        };

        if (audioContext) {
          try {
            if (audioContext.state === "suspended") {
              void audioContext.resume().catch(() => undefined);
            }
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
        setButtonState(button, "recording", "fallback", "fallback-listening");
        maxTimer = window.setTimeout(finishRecording, MAX_RECORDING_MS);
        if (analyser) animationFrame = requestAnimationFrame(monitorVoice);
      } catch (error) {
        console.error("Samuel fallback microphone capture failed", error);
        cleanupAudioGraph();
        recorder = null;
        setButtonState(button, "error", "fallback", "error");
      }
    };

    const startFallbackIfNeeded = (cockpit: HTMLElement, button: HTMLButtonElement) => {
      if (fallbackAttempted || recorder?.state === "recording" || fallbackProcessing) return;
      fallbackAttempted = true;
      clearRealtimeBootTimer();
      void startFallbackRecording(cockpit, button);
    };

    const syncRealtimeState = () => {
      const cockpit =
        activeCockpit ??
        document.querySelector<HTMLElement>(".samuel-focus-cockpit");
      if (!cockpit) return;
      const button =
        activeButton ??
        cockpit.querySelector<HTMLButtonElement>(".samuel-reference-mic");
      if (!button) return;

      if (recorder?.state === "recording" || fallbackProcessing) return;

      const { consoleElement } = realtimeElements(cockpit);
      if (!consoleElement) return;

      const realtimeActive = consoleElement.classList.contains(
        "samuel-voice-console--active",
      );
      const realtimeError = consoleElement.classList.contains(
        "samuel-voice-console--error",
      );

      if (realtimeActive) {
        realtimeEverActive = true;
        suppressRealtimeError = false;
        clearRealtimeBootTimer();
        setButtonState(button, "recording", "realtime", inferRealtimePhase(consoleElement));
        return;
      }

      if (realtimeError) {
        if (sessionDesired && !suppressRealtimeError) {
          startFallbackIfNeeded(cockpit, button);
        } else if (!suppressRealtimeError) {
          setButtonState(button, "error", "realtime", "error");
        }
        return;
      }

      if (!sessionDesired && !fallbackProcessing) {
        setButtonState(button, "idle", "none", "idle");
      } else if (sessionDesired && !realtimeEverActive) {
        setButtonState(button, "processing", "realtime", "connecting");
      }
    };

    const startRealtime = (cockpit: HTMLElement, button: HTMLButtonElement) => {
      const { startButton } = realtimeElements(cockpit);
      if (!startButton || startButton.disabled) {
        startFallbackIfNeeded(cockpit, button);
        return;
      }

      activeCockpit = cockpit;
      activeButton = button;
      sessionDesired = true;
      realtimeEverActive = false;
      fallbackAttempted = false;
      suppressRealtimeError = false;
      primeBrowserSpeech();
      setButtonState(button, "processing", "realtime", "connecting");

      startButton.click();

      clearRealtimeBootTimer();
      realtimeBootTimer = window.setTimeout(() => {
        if (!sessionDesired || realtimeEverActive) return;
        startFallbackIfNeeded(cockpit, button);
      }, REALTIME_BOOT_TIMEOUT_MS);
    };

    const stopVoiceSession = (cockpit: HTMLElement, button: HTMLButtonElement) => {
      sessionDesired = false;
      fallbackAttempted = false;
      suppressRealtimeError = true;
      clearRealtimeBootTimer();

      if (recorder?.state === "recording") {
        finishRecording();
        return;
      }

      const { consoleElement, startButton } = realtimeElements(cockpit);
      const realtimeActive = consoleElement?.classList.contains(
        "samuel-voice-console--active",
      );
      if (realtimeActive && startButton && !startButton.disabled) {
        startButton.click();
      }
      setButtonState(button, "idle", "none", "idle");
    };

    const onPrimaryVoiceClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const primaryButton = target.closest<HTMLButtonElement>(
        ".samuel-focus-cockpit .samuel-reference-mic",
      );
      if (!primaryButton) return;

      const cockpit = primaryButton.closest<HTMLElement>(".samuel-focus-cockpit");
      if (!cockpit) return;

      event.preventDefault();
      event.stopImmediatePropagation();

      const { consoleElement } = realtimeElements(cockpit);
      const realtimeActive = consoleElement?.classList.contains(
        "samuel-voice-console--active",
      );

      if (realtimeActive || sessionDesired || recorder?.state === "recording") {
        stopVoiceSession(cockpit, primaryButton);
        return;
      }

      if (!fallbackProcessing) startRealtime(cockpit, primaryButton);
    };

    window.addEventListener("click", onPrimaryVoiceClick, true);
    syncTimer = window.setInterval(syncRealtimeState, REALTIME_SYNC_MS);
    syncRealtimeState();

    return () => {
      window.removeEventListener("click", onPrimaryVoiceClick, true);
      if (syncTimer) window.clearInterval(syncTimer);
      clearRealtimeBootTimer();
      if (recorder?.state === "recording") recorder.stop();
      cleanupAudioGraph();
    };
  }, []);

  return null;
}
