"use client";

import { useEffect } from "react";

const MAX_RECORDING_MS = 30_000;
const SILENCE_AFTER_SPEECH_MS = 1_150;
const VOICE_RMS_THRESHOLD = 0.028;

type TranscriptionResponse = {
  ok?: boolean;
  text?: string;
  error?: string;
};

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
    if (attempt < 4) {
      window.setTimeout(() => trySend(attempt + 1), 35);
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
    // Voice output still has its normal fallback/error handling.
  }
}

/**
 * Reliable browser voice bridge for the main Samuel microphone.
 *
 * Audio is captured with MediaRecorder, stopped automatically after natural
 * silence, transcribed by the SF Growth AI server and routed through the same
 * ChatPanel message path used by typed conversation.
 */
export function SamuelVoiceReliabilityBridge() {
  useEffect(() => {
    let recorder: MediaRecorder | null = null;
    let stream: MediaStream | null = null;
    let audioContext: AudioContext | null = null;
    let analyser: AnalyserNode | null = null;
    let animationFrame = 0;
    let maxTimer = 0;
    let chunks: Blob[] = [];
    let speechStarted = false;
    let lastVoiceAt = 0;
    let activeCockpit: HTMLElement | null = null;
    let activeButton: HTMLButtonElement | null = null;
    let processing = false;

    const setButtonState = (
      button: HTMLButtonElement | null,
      state: "idle" | "recording" | "processing" | "error",
    ) => {
      const buttons = Array.from(
        document.querySelectorAll<HTMLButtonElement>(
          ".samuel-focus-cockpit .samuel-reference-mic",
        ),
      );
      if (button && !buttons.includes(button)) buttons.push(button);

      for (const target of buttons) {
        target.dataset.voiceCaptureState = state;
        target.setAttribute(
          "aria-label",
          state === "recording"
            ? "Samuel está ouvindo. Toque para parar."
            : state === "processing"
              ? "Samuel está transcrevendo sua fala."
              : state === "error"
                ? "Falha ao captar a voz. Toque para tentar novamente."
                : "Iniciar conversa por voz",
        );
      }
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
      processing = true;
      setButtonState(activeButton, "processing");
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
        setButtonState(activeButton, "idle");
      } catch (error) {
        console.error("Samuel voice capture failed", error);
        setButtonState(activeButton, "error");
      } finally {
        processing = false;
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

    const startRecording = async (
      cockpit: HTMLElement,
      button: HTMLButtonElement,
    ) => {
      if (processing) return;
      if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
        setButtonState(button, "error");
        return;
      }

      activeCockpit = cockpit;
      activeButton = button;
      chunks = [];
      speechStarted = false;
      lastVoiceAt = 0;

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
          setButtonState(button, "error");
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
            setButtonState(button, "error");
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
        setButtonState(button, "recording");
        maxTimer = window.setTimeout(finishRecording, MAX_RECORDING_MS);
        if (analyser) animationFrame = requestAnimationFrame(monitorVoice);
      } catch (error) {
        console.error("Samuel microphone permission/capture failed", error);
        cleanupAudioGraph();
        recorder = null;
        setButtonState(button, "error");
      }
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

      if (recorder?.state === "recording") {
        finishRecording();
        return;
      }

      if (!processing) void startRecording(cockpit, primaryButton);
    };

    window.addEventListener("click", onPrimaryVoiceClick, true);
    return () => {
      window.removeEventListener("click", onPrimaryVoiceClick, true);
      if (recorder?.state === "recording") recorder.stop();
      cleanupAudioGraph();
    };
  }, []);

  return null;
}
