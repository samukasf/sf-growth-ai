"use client";

import { useEffect } from "react";

import {
  SAMUEL_VOICE_PRE_ROLL_MS,
  SAMUEL_VOICE_SAMPLE_RATE,
  SamuelTurnDetector,
  calculatePcmRms,
  concatPcm,
  downsamplePcm,
  encodePcm16Wav,
} from "../voice/samuel-turn-detector";

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

type VoiceTelemetryEvent =
  | "session_started"
  | "session_ended"
  | "speech_started"
  | "barge_in"
  | "speech_ended"
  | "transcription_ok"
  | "transcription_error"
  | "echo_rejected"
  | "turn_routed"
  | "confirmation_routed"
  | "microphone_error";

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
  return /^(para|pare|parar|chega|silencio|cala|cala a boca|stop|quieto|quiet|shush|enough)( agora)?$/i.test(text);
}

function isConfirmationPhrase(value: string) {
  const text = normalizeText(value);
  return /^(sim|sim confirma|confirmo|confirma|confirmar|pode confirmar|pode criar|pode fazer|pode executar|execute|executa|faz isso|pode marcar|pode agendar)$/i.test(text);
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

function setNativeTextareaValue(textarea: HTMLTextAreaElement, value: string) {
  const descriptor = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value");
  descriptor?.set?.call(textarea, value);
  textarea.dispatchEvent(new Event("input", { bubbles: true }));
}

function findConfirmationButton(cockpit: HTMLElement) {
  return Array.from(cockpit.querySelectorAll<HTMLButtonElement>("button")).find((button) =>
    /confirmar e executar/i.test(button.textContent ?? ""),
  ) ?? null;
}

function speakConfirmedActionResult(cockpit: HTMLElement) {
  const startedAt = performance.now();
  let previous = "";
  const poll = () => {
    if (performance.now() - startedAt > 15_000) return;
    const assistantMessages = Array.from(
      cockpit.querySelectorAll<HTMLElement>(".samuel-message--assistant .samuel-message__content"),
    );
    const latest = assistantMessages.at(-1)?.textContent?.trim() ?? "";
    if (
      latest &&
      latest !== previous &&
      /ação executada|não consegui executar|evento criado|evento atualizado|evento .*removido|enviado|rascunho/i.test(latest)
    ) {
      window.dispatchEvent(
        new CustomEvent("samuel:voice-speak-request", { detail: { text: latest } }),
      );
      return;
    }
    previous = latest || previous;
    window.setTimeout(poll, 120);
  };
  window.setTimeout(poll, 120);
}

function routeTranscriptToSamuel(cockpit: HTMLElement, transcript: string) {
  if (isConfirmationPhrase(transcript)) {
    const confirmation = findConfirmationButton(cockpit);
    if (confirmation && !confirmation.disabled) {
      confirmation.click();
      speakConfirmedActionResult(cockpit);
      return "confirmation" as const;
    }
  }

  const cancel = cockpit.querySelector<HTMLButtonElement>(".samuel-chat-send.is-cancel");
  if (cancel && !cancel.disabled) cancel.click();

  const trySubmit = (attempt = 0) => {
    const textarea = cockpit.querySelector<HTMLTextAreaElement>(".samuel-chat-textarea");
    const send = cockpit.querySelector<HTMLButtonElement>(".samuel-chat-send:not(.is-cancel)");
    if (textarea && send && !send.disabled) {
      setNativeTextareaValue(textarea, transcript);
      textarea.focus();
      window.setTimeout(() => {
        const ready = cockpit.querySelector<HTMLButtonElement>(".samuel-chat-send:not(.is-cancel)");
        if (ready && !ready.disabled) ready.click();
      }, 24);
      return;
    }
    if (attempt < 40) window.setTimeout(() => trySubmit(attempt + 1), 75);
  };

  window.setTimeout(() => trySubmit(), cancel ? 140 : 0);
  return "turn" as const;
}

function postTelemetry(
  companyId: string,
  event: VoiceTelemetryEvent,
  details: Record<string, unknown> = {},
) {
  const body = JSON.stringify({ companyId, event, details, at: new Date().toISOString() });
  try {
    if (navigator.sendBeacon) {
      navigator.sendBeacon(
        "/api/samuel-ai/voice/telemetry",
        new Blob([body], { type: "application/json" }),
      );
      return;
    }
  } catch {
    // Fall through to keepalive fetch.
  }
  void fetch("/api/samuel-ai/voice/telemetry", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => undefined);
}

function companyIdFor(cockpit: HTMLElement | null) {
  return (
    cockpit?.querySelector<HTMLElement>("[data-samuel-company-id]")?.dataset.samuelCompanyId ||
    "default-company"
  );
}

/**
 * Continuous Samuel voice controller.
 *
 * This deliberately follows the architecture used by mature open-source voice
 * agents: the microphone is independent from TTS/model state; a local turn
 * detector segments PCM with pre-roll; STT is a second-stage validator; and
 * assistant audio can be cancelled as soon as a real user interruption begins.
 */
export function SamuelVoiceReliabilityBridge() {
  useEffect(() => {
    let sessionActive = false;
    let stream: MediaStream | null = null;
    let audioContext: AudioContext | null = null;
    let sourceNode: MediaStreamAudioSourceNode | null = null;
    let processorNode: ScriptProcessorNode | null = null;
    let silentGain: GainNode | null = null;
    let activeCockpit: HTMLElement | null = null;
    let activeButton: HTMLButtonElement | null = null;
    let assistantSpeaking = false;
    let lastAssistantText = "";
    let pendingTranscriptions = 0;

    const detector = new SamuelTurnDetector();
    const preRollParts: Float32Array[] = [];
    let preRollSampleCount = 0;
    let segmentParts: Float32Array[] = [];
    let segmentSampleCount = 0;
    let currentSegmentBargeIn = false;

    const maxPreRollSamples = Math.round(
      (SAMUEL_VOICE_SAMPLE_RATE * SAMUEL_VOICE_PRE_ROLL_MS) / 1_000,
    );

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
          phase === "error"
            ? "error"
            : phase === "processing"
              ? "processing"
              : sessionActive
                ? "recording"
                : "idle";
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

    const clearAudioBuffers = () => {
      preRollParts.length = 0;
      preRollSampleCount = 0;
      segmentParts = [];
      segmentSampleCount = 0;
      currentSegmentBargeIn = false;
    };

    const pushPreRoll = (pcm: Float32Array) => {
      const copy = pcm.slice();
      preRollParts.push(copy);
      preRollSampleCount += copy.length;
      while (preRollSampleCount > maxPreRollSamples && preRollParts.length > 1) {
        const removed = preRollParts.shift();
        preRollSampleCount -= removed?.length ?? 0;
      }
    };

    const cleanup = () => {
      processorNode?.disconnect();
      processorNode = null;
      sourceNode?.disconnect();
      sourceNode = null;
      silentGain?.disconnect();
      silentGain = null;
      if (audioContext && audioContext.state !== "closed") void audioContext.close();
      audioContext = null;
      stream?.getTracks().forEach((track) => track.stop());
      stream = null;
      detector.reset();
      clearAudioBuffers();
      assistantSpeaking = false;
      pendingTranscriptions = 0;
    };

    const endSession = () => {
      if (!sessionActive && !stream) return;
      const companyId = companyIdFor(activeCockpit);
      sessionActive = false;
      window.dispatchEvent(new CustomEvent("samuel:voice-interrupt"));
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
      cleanup();
      setState("idle");
      postTelemetry(companyId, "session_ended");
      activeCockpit = null;
      activeButton = null;
    };

    const transcribe = async (pcm: Float32Array, wasBargeIn: boolean) => {
      if (!sessionActive || !activeCockpit || pcm.length < SAMUEL_VOICE_SAMPLE_RATE * 0.12) return;
      pendingTranscriptions += 1;
      setState("processing");
      const cockpit = activeCockpit;
      const companyId = companyIdFor(cockpit);
      const wavBytes = encodePcm16Wav(pcm, SAMUEL_VOICE_SAMPLE_RATE);
      const form = new FormData();
      form.set(
        "audio",
        new File([wavBytes], "samuel-turn.wav", { type: "audio/wav" }),
      );

      const startedAt = performance.now();
      try {
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
        const latencyMs = Math.round(performance.now() - startedAt);
        postTelemetry(companyId, "transcription_ok", {
          provider: payload.provider ?? "unknown",
          model: payload.model ?? "unknown",
          latencyMs,
          bargeIn: wasBargeIn,
          audioMs: Math.round((pcm.length / SAMUEL_VOICE_SAMPLE_RATE) * 1_000),
        });

        if (isStopPhrase(text)) {
          window.dispatchEvent(new CustomEvent("samuel:voice-interrupt"));
          setState("listening");
          return;
        }

        if (wasBargeIn && isLikelyEcho(text, lastAssistantText)) {
          postTelemetry(companyId, "echo_rejected", {
            transcriptLength: text.length,
          });
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
        const routed = routeTranscriptToSamuel(cockpit, text);
        postTelemetry(
          companyId,
          routed === "confirmation" ? "confirmation_routed" : "turn_routed",
          { bargeIn: wasBargeIn },
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : "Falha na transcrição.";
        console.error("Samuel continuous voice transcription failed", { message });
        postTelemetry(companyId, "transcription_error", { message });
        setState("error", message);
      } finally {
        pendingTranscriptions = Math.max(0, pendingTranscriptions - 1);
        if (sessionActive && pendingTranscriptions === 0 && !assistantSpeaking) {
          setState("listening");
        }
      }
    };

    const finalizeSegment = (wasBargeIn: boolean) => {
      if (!segmentParts.length) return;
      const pcm = concatPcm(segmentParts);
      segmentParts = [];
      segmentSampleCount = 0;
      preRollParts.length = 0;
      preRollSampleCount = 0;
      postTelemetry(companyIdFor(activeCockpit), "speech_ended", {
        audioMs: Math.round((pcm.length / SAMUEL_VOICE_SAMPLE_RATE) * 1_000),
        bargeIn: wasBargeIn,
      });
      void transcribe(pcm, wasBargeIn);
    };

    const handlePcm = (pcm: Float32Array) => {
      if (!sessionActive || !pcm.length) return;
      const now = performance.now();
      const rms = calculatePcmRms(pcm);
      const wasActive = detector.isActive;
      const decision = detector.observe(rms, now, assistantSpeaking);

      if (decision.started) {
        currentSegmentBargeIn = decision.bargeIn;
        segmentParts = preRollParts.map((part) => part.slice());
        segmentSampleCount = segmentParts.reduce((total, part) => total + part.length, 0);
        segmentParts.push(pcm.slice());
        segmentSampleCount += pcm.length;
        preRollParts.length = 0;
        preRollSampleCount = 0;

        postTelemetry(
          companyIdFor(activeCockpit),
          decision.bargeIn ? "barge_in" : "speech_started",
          {
            rms: Number(rms.toFixed(4)),
            threshold: Number(decision.threshold.toFixed(4)),
            noiseFloor: Number(decision.noiseFloor.toFixed(4)),
          },
        );

        if (decision.bargeIn) {
          assistantSpeaking = false;
          window.dispatchEvent(new CustomEvent("samuel:voice-interrupt"));
          if ("speechSynthesis" in window) window.speechSynthesis.cancel();
        }
        setState("listening");
      } else if (wasActive && detector.isActive) {
        segmentParts.push(pcm.slice());
        segmentSampleCount += pcm.length;
      } else if (!detector.isActive && !decision.ended) {
        pushPreRoll(pcm);
      }

      if (decision.ended) {
        if (wasActive) {
          segmentParts.push(pcm.slice());
          segmentSampleCount += pcm.length;
        }
        finalizeSegment(currentSegmentBargeIn || decision.bargeIn);
        currentSegmentBargeIn = false;
      }
    };

    const startSession = async (cockpit: HTMLElement, button: HTMLButtonElement) => {
      if (sessionActive) return;
      if (!navigator.mediaDevices?.getUserMedia) {
        setState("error", "Este navegador não oferece captura de áudio compatível.");
        return;
      }

      activeCockpit = cockpit;
      activeButton = button;
      sessionActive = true;
      setState("connecting");
      const companyId = companyIdFor(cockpit);

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
        sourceNode = audioContext.createMediaStreamSource(stream);
        processorNode = audioContext.createScriptProcessor(2048, 1, 1);
        silentGain = audioContext.createGain();
        silentGain.gain.value = 0;

        sourceNode.connect(processorNode);
        processorNode.connect(silentGain);
        silentGain.connect(audioContext.destination);
        processorNode.onaudioprocess = (event) => {
          if (!sessionActive || !audioContext) return;
          const raw = event.inputBuffer.getChannelData(0);
          const pcm = downsamplePcm(raw, audioContext.sampleRate, SAMUEL_VOICE_SAMPLE_RATE);
          handlePcm(pcm);
        };

        detector.reset();
        clearAudioBuffers();
        setState("listening");
        postTelemetry(companyId, "session_started", {
          inputSampleRate: audioContext.sampleRate,
          targetSampleRate: SAMUEL_VOICE_SAMPLE_RATE,
          preRollMs: SAMUEL_VOICE_PRE_ROLL_MS,
        });
      } catch (error) {
        const message =
          error instanceof DOMException && error.name === "NotAllowedError"
            ? "Permissão do microfone bloqueada."
            : error instanceof Error
              ? error.message
              : "Não foi possível abrir o microfone.";
        console.error("Samuel continuous microphone failed", { message });
        postTelemetry(companyId, "microphone_error", { message });
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
      if (sessionActive && pendingTranscriptions === 0 && !detector.isActive) setState("listening");
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
