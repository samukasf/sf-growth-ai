"use client";

import { useCallback, useEffect, useReducer, useRef } from "react";

import {
  exchangeSamuelRealtimeOffer,
  getSamuelLiveBootstrap,
  type SamuelLiveBootstrap,
} from "./samuel-realtime.client";
import {
  initialSamuelRealtimeSession,
  SAMUEL_REALTIME_MAX_DURATION_MS,
  samuelRealtimeReducer,
} from "./samuel-realtime.reducer";
import type { SamuelRealtimeTranscriptRole } from "./samuel-realtime.types";

type UseSamuelRealtimeVoiceInput = {
  companyId: string;
  conversationId?: string | null;
  contextSummary?: string | null;
  onTranscript?: (transcript: {
    role: SamuelRealtimeTranscriptRole;
    content: string;
    final: boolean;
  }) => void;
};

type OpenAiFunctionItem = {
  type?: string;
  name?: string;
  call_id?: string;
  arguments?: string;
};

type OpenAiServerEvent = {
  type?: string;
  delta?: string;
  transcript?: string;
  call_id?: string;
  name?: string;
  arguments?: string;
  item?: OpenAiFunctionItem;
  error?: { message?: string };
};

type GeminiServerMessage = {
  setupComplete?: Record<string, never>;
  serverContent?: {
    interrupted?: boolean;
    turnComplete?: boolean;
    inputTranscription?: { text?: string };
    outputTranscription?: { text?: string };
    modelTurn?: {
      parts?: Array<{ inlineData?: { data?: string; mimeType?: string } }>;
    };
  };
  goAway?: { timeLeft?: string };
};

type DesktopVoiceCommandResponse = {
  ok: true;
  commandId: string;
  status: string;
  deviceId: string;
  deviceName: string;
};

type DesktopVoiceCommandStatus = {
  command: {
    id: string;
    status: string;
    result: unknown;
    evidence: unknown;
    error_message: string | null;
    completed_at: string | null;
  };
  terminal: boolean;
  verified: boolean;
};

const GEMINI_OUTPUT_RATE = 24_000;
const GEMINI_SETUP_TIMEOUT_MS = 10_000;
const DESKTOP_TOOL_WAIT_MS = 120_000;
const DESKTOP_TOOL_POLL_MS = 1_250;

function supportsMicrophone() {
  return typeof window !== "undefined" && Boolean(navigator.mediaDevices?.getUserMedia);
}

function supportsOpenAiRealtime() {
  return supportsMicrophone() && "RTCPeerConnection" in window;
}

function supportsGeminiLive() {
  return supportsMicrophone() && "WebSocket" in window && "AudioContext" in window;
}

function stopStream(stream: MediaStream | null) {
  stream?.getTracks().forEach((track) => track.stop());
}

function floatToPcm16Base64(samples: Float32Array) {
  const bytes = new Uint8Array(samples.length * 2);
  const view = new DataView(bytes.buffer);
  for (let index = 0; index < samples.length; index += 1) {
    const sample = Math.max(-1, Math.min(1, samples[index] ?? 0));
    view.setInt16(index * 2, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
  }
  let binary = "";
  for (let offset = 0; offset < bytes.length; offset += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000));
  }
  return btoa(binary);
}

function downsample(input: Float32Array, sourceRate: number, targetRate = 16_000) {
  if (sourceRate <= targetRate) return input.slice();
  const ratio = sourceRate / targetRate;
  const length = Math.max(1, Math.round(input.length / ratio));
  const output = new Float32Array(length);
  for (let index = 0; index < length; index += 1) {
    const start = Math.floor(index * ratio);
    const end = Math.min(input.length, Math.floor((index + 1) * ratio));
    let total = 0;
    let count = 0;
    for (let sampleIndex = start; sampleIndex < end; sampleIndex += 1) {
      total += input[sampleIndex] ?? 0;
      count += 1;
    }
    output[index] = count ? total / count : input[start] ?? 0;
  }
  return output;
}

function decodePcm16Base64(base64: string) {
  const binary = atob(base64);
  const samples = new Float32Array(Math.floor(binary.length / 2));
  for (let index = 0; index < samples.length; index += 1) {
    const low = binary.charCodeAt(index * 2);
    const high = binary.charCodeAt(index * 2 + 1);
    const unsigned = low | (high << 8);
    const signed = unsigned >= 0x8000 ? unsigned - 0x10000 : unsigned;
    samples[index] = signed / 0x8000;
  }
  return samples;
}

function systemInstruction(contextSummary?: string | null) {
  const context = contextSummary?.trim()
    ? ` Contexto empresarial atual: ${contextSummary.trim().slice(0, 600)}.`
    : "";
  return `Você é Samuel AI. Converse por voz como uma pessoa inteligente numa conversa presencial. Português brasileiro por padrão; acompanhe o idioma do usuário. Comece diretamente pela resposta: sem preâmbulo, sem repetir a pergunta e sem anunciar o que fará. Perguntas simples: 1 a 3 frases. Assuntos complexos: conclusão primeiro, detalhes depois. Use frases curtas e ritmo oral natural; não transforme a fala em relatório ou lista. Espere o usuário concluir, mas trate pausas normais sem demora artificial. Se ele interromper, pare imediatamente e escute o novo ponto. Faça no máximo uma pergunta por turno e apenas quando indispensável. Não encerre oferecendo ajuda e não repita tratamentos formais mecanicamente. Nunca invente ações, dados ou eventos.${context}`;
}

function sleep(ms: number) {
  return new Promise<void>((resolve) => window.setTimeout(resolve, ms));
}

async function parseJsonResponse<T>(response: Response): Promise<T> {
  const payload = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  if (!response.ok) {
    throw new Error(String(payload.error ?? `Falha HTTP ${response.status}`));
  }
  return payload as T;
}

export function useSamuelRealtimeVoice({
  companyId,
  conversationId,
  contextSummary,
  onTranscript,
}: UseSamuelRealtimeVoiceInput) {
  const [session, dispatch] = useReducer(
    samuelRealtimeReducer,
    initialSamuelRealtimeSession,
  );

  const peerRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const websocketRef = useRef<WebSocket | null>(null);
  const providerRef = useRef<SamuelLiveBootstrap["provider"] | null>(null);
  const closingRef = useRef(false);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputAnalyserCleanupRef = useRef<(() => void) | null>(null);
  const outputAnalyserCleanupRef = useRef<(() => void) | null>(null);
  const geminiInputContextRef = useRef<AudioContext | null>(null);
  const geminiProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const geminiOutputContextRef = useRef<AudioContext | null>(null);
  const geminiSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const geminiPlaybackAtRef = useRef(0);
  const geminiOutputTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handledToolCallsRef = useRef<Set<string>>(new Set());
  const activeDesktopCommandRef = useRef<string | null>(null);

  const stopGeminiOutput = useCallback(() => {
    geminiSourcesRef.current.forEach((source) => {
      try {
        source.stop();
      } catch {
        // Already stopped.
      }
    });
    geminiSourcesRef.current.clear();
    geminiPlaybackAtRef.current = 0;
    if (geminiOutputTimerRef.current) clearTimeout(geminiOutputTimerRef.current);
    geminiOutputTimerRef.current = null;
    dispatch({ type: "set_output_audio_level", audioLevel: 0 });
  }, []);

  const cancelActiveDesktopCommand = useCallback(() => {
    const commandId = activeDesktopCommandRef.current;
    if (!commandId) return;
    activeDesktopCommandRef.current = null;
    void fetch("/api/samuel-desktop/control", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ operation: "cancel", commandId }),
      keepalive: true,
    }).catch(() => undefined);
  }, []);

  const cleanup = useCallback(() => {
    closingRef.current = true;
    cancelActiveDesktopCommand();
    abortRef.current?.abort();
    abortRef.current = null;
    dataChannelRef.current?.close();
    dataChannelRef.current = null;
    peerRef.current?.getSenders().forEach((sender) => sender.track?.stop());
    peerRef.current?.close();
    peerRef.current = null;
    websocketRef.current?.close();
    websocketRef.current = null;
    providerRef.current = null;
    stopStream(localStreamRef.current);
    localStreamRef.current = null;
    inputAnalyserCleanupRef.current?.();
    inputAnalyserCleanupRef.current = null;
    outputAnalyserCleanupRef.current?.();
    outputAnalyserCleanupRef.current = null;
    if (remoteAudioRef.current) {
      remoteAudioRef.current.pause();
      remoteAudioRef.current.srcObject = null;
      remoteAudioRef.current.remove();
      remoteAudioRef.current = null;
    }
    geminiProcessorRef.current?.disconnect();
    geminiProcessorRef.current = null;
    if (
      geminiInputContextRef.current &&
      geminiInputContextRef.current.state !== "closed"
    ) {
      void geminiInputContextRef.current.close();
    }
    geminiInputContextRef.current = null;
    stopGeminiOutput();
    if (
      geminiOutputContextRef.current &&
      geminiOutputContextRef.current.state !== "closed"
    ) {
      void geminiOutputContextRef.current.close();
    }
    geminiOutputContextRef.current = null;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = null;
    handledToolCallsRef.current.clear();
  }, [cancelActiveDesktopCommand, stopGeminiOutput]);

  const end = useCallback(() => {
    cleanup();
    dispatch({ type: "reset" });
  }, [cleanup]);

  const attachAudioAnalyser = useCallback(
    (stream: MediaStream, channel: "input" | "output") => {
      if (typeof AudioContext === "undefined") return false;
      const cleanupRef =
        channel === "input" ? inputAnalyserCleanupRef : outputAnalyserCleanupRef;
      cleanupRef.current?.();
      const audioContext = new AudioContext({ latencyHint: "interactive" });
      void audioContext.resume();
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 128;
      analyser.smoothingTimeConstant = 0.65;
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      const data = new Uint8Array(analyser.frequencyBinCount);
      let frame = 0;
      let stopped = false;
      const tick = () => {
        if (stopped) return;
        analyser.getByteFrequencyData(data);
        const average = data.reduce((sum, value) => sum + value, 0) / data.length;
        dispatch({
          type: channel === "input" ? "set_audio_level" : "set_output_audio_level",
          audioLevel: average / 255,
        });
        frame = requestAnimationFrame(tick);
      };
      tick();
      cleanupRef.current = () => {
        stopped = true;
        cancelAnimationFrame(frame);
        source.disconnect();
        void audioContext.close();
      };
      return true;
    },
    [],
  );

  const emitTranscript = useCallback(
    (role: SamuelRealtimeTranscriptRole, content: string, final: boolean) => {
      const text = content.trim();
      if (!text) return;
      dispatch({
        type: role === "user" ? "user_transcript" : "assistant_transcript",
        content: text,
        final,
      });
      onTranscript?.({ role, content: text, final });
    },
    [onTranscript],
  );

  const sendOpenAiEvent = useCallback((event: Record<string, unknown>) => {
    const channel = dataChannelRef.current;
    if (!channel || channel.readyState !== "open") {
      throw new Error("Canal Realtime indisponível para devolver o resultado da ferramenta.");
    }
    channel.send(JSON.stringify(event));
  }, []);

  const waitDesktopCommand = useCallback(async (commandId: string) => {
    const startedAt = Date.now();
    while (Date.now() - startedAt < DESKTOP_TOOL_WAIT_MS) {
      const response = await fetch(
        `/api/samuel-desktop/voice-command?commandId=${encodeURIComponent(commandId)}`,
        { cache: "no-store" },
      );
      const status = await parseJsonResponse<DesktopVoiceCommandStatus>(response);
      if (status.terminal) return status;
      await sleep(DESKTOP_TOOL_POLL_MS);
    }
    return null;
  }, []);

  const runDesktopTool = useCallback(
    async (callId: string, rawArguments: string) => {
      if (handledToolCallsRef.current.has(callId)) return;
      handledToolCallsRef.current.add(callId);
      dispatch({ type: "processing" });

      let output: Record<string, unknown>;
      try {
        const parsed = JSON.parse(rawArguments || "{}") as Record<string, unknown>;
        const goal = String(parsed.goal ?? "").trim().slice(0, 4000);
        if (!goal) throw new Error("O comando de computador chegou sem objetivo.");

        const createResponse = await fetch("/api/samuel-desktop/voice-command", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ goal, companyId }),
        });
        const created = await parseJsonResponse<DesktopVoiceCommandResponse>(
          createResponse,
        );
        activeDesktopCommandRef.current = created.commandId;

        const completed = await waitDesktopCommand(created.commandId);
        if (!completed) {
          output = {
            ok: false,
            status: "running",
            commandId: created.commandId,
            deviceName: created.deviceName,
            message:
              "A tarefa foi iniciada no computador, mas ainda não terminou dentro da janela de espera da conversa por voz. Não afirme conclusão.",
          };
        } else if (completed.verified) {
          output = {
            ok: true,
            status: "verified",
            commandId: created.commandId,
            deviceName: created.deviceName,
            result: completed.command.result,
            evidence: completed.command.evidence,
            message: "A execução terminou com evidência verificável no computador.",
          };
        } else {
          output = {
            ok: false,
            status: completed.command.status,
            commandId: created.commandId,
            deviceName: created.deviceName,
            error: completed.command.error_message,
            message:
              "A tarefa não foi verificada como concluída. Explique a falha ou peça takeover se necessário.",
          };
        }
      } catch (error) {
        output = {
          ok: false,
          status: "failed",
          error: error instanceof Error ? error.message : "Falha no Samuel Desktop.",
          message: "Não afirme que a tarefa foi concluída.",
        };
      } finally {
        activeDesktopCommandRef.current = null;
      }

      try {
        sendOpenAiEvent({
          type: "conversation.item.create",
          item: {
            type: "function_call_output",
            call_id: callId,
            output: JSON.stringify(output),
          },
        });
        sendOpenAiEvent({ type: "response.create" });
      } catch (error) {
        dispatch({
          type: "error",
          error:
            error instanceof Error
              ? error.message
              : "Não foi possível devolver o resultado da ferramenta ao Samuel.",
        });
      }
    },
    [companyId, sendOpenAiEvent, waitDesktopCommand],
  );

  const handleOpenAiEvent = useCallback(
    (event: OpenAiServerEvent) => {
      switch (event.type) {
        case "input_audio_buffer.speech_started":
          dispatch({ type: "listening" });
          break;
        case "input_audio_buffer.speech_stopped":
          dispatch({ type: "processing" });
          break;
        case "response.audio.delta":
        case "response.output_audio.delta":
          dispatch({ type: "speaking" });
          break;
        case "response.audio.done":
        case "response.output_audio.done":
          dispatch({ type: "set_output_audio_level", audioLevel: 0 });
          dispatch({ type: "listening" });
          break;
        case "response.done":
          if (!activeDesktopCommandRef.current) dispatch({ type: "listening" });
          break;
        case "conversation.item.input_audio_transcription.completed":
          if (event.transcript) emitTranscript("user", event.transcript, true);
          break;
        case "response.output_audio_transcript.delta":
          if (event.delta) {
            dispatch({ type: "speaking" });
            emitTranscript("assistant", event.delta, false);
          }
          break;
        case "response.output_audio_transcript.done":
          if (event.transcript) emitTranscript("assistant", event.transcript, true);
          break;
        case "response.function_call_arguments.done": {
          const callId = event.call_id ?? event.item?.call_id;
          const name = event.name ?? event.item?.name ?? "computer_task";
          const args = event.arguments ?? event.item?.arguments ?? "{}";
          if (callId && name === "computer_task") void runDesktopTool(callId, args);
          break;
        }
        case "response.output_item.done": {
          const item = event.item;
          if (
            item?.type === "function_call" &&
            item.name === "computer_task" &&
            item.call_id
          ) {
            void runDesktopTool(item.call_id, item.arguments ?? "{}");
          }
          break;
        }
        case "error":
          dispatch({
            type: "error",
            error: event.error?.message ?? "A sessão de voz encontrou um erro.",
          });
          break;
      }
    },
    [emitTranscript, runDesktopTool],
  );

  const playGeminiAudio = useCallback((base64: string) => {
    const samples = decodePcm16Base64(base64);
    if (!samples.length) return;
    let context = geminiOutputContextRef.current;
    if (!context || context.state === "closed") {
      context = new AudioContext({ latencyHint: "interactive" });
      geminiOutputContextRef.current = context;
    }
    void context.resume();
    const buffer = context.createBuffer(1, samples.length, GEMINI_OUTPUT_RATE);
    buffer.copyToChannel(samples, 0);
    const source = context.createBufferSource();
    source.buffer = buffer;
    source.connect(context.destination);
    const startAt = Math.max(context.currentTime + 0.008, geminiPlaybackAtRef.current);
    geminiPlaybackAtRef.current = startAt + buffer.duration;
    geminiSourcesRef.current.add(source);
    source.onended = () => geminiSourcesRef.current.delete(source);
    source.start(startAt);
    dispatch({ type: "speaking" });
    dispatch({ type: "set_output_audio_level", audioLevel: 0.34 });
    if (geminiOutputTimerRef.current) clearTimeout(geminiOutputTimerRef.current);
    geminiOutputTimerRef.current = setTimeout(() => {
      dispatch({ type: "set_output_audio_level", audioLevel: 0 });
      dispatch({ type: "listening" });
    }, Math.max(80, (geminiPlaybackAtRef.current - context.currentTime) * 1000));
  }, []);

  const handleGeminiContent = useCallback(
    (message: GeminiServerMessage) => {
      const content = message.serverContent;
      if (!content) return;
      if (content.interrupted) {
        stopGeminiOutput();
        dispatch({ type: "listening" });
      }
      if (content.inputTranscription?.text) {
        emitTranscript("user", content.inputTranscription.text, Boolean(content.turnComplete));
      }
      if (content.outputTranscription?.text) {
        emitTranscript(
          "assistant",
          content.outputTranscription.text,
          Boolean(content.turnComplete),
        );
      }
      for (const part of content.modelTurn?.parts ?? []) {
        const audio = part.inlineData;
        if (
          audio?.data &&
          (!audio.mimeType || audio.mimeType.startsWith("audio/"))
        ) {
          playGeminiAudio(audio.data);
        }
      }
      if (content.turnComplete && geminiSourcesRef.current.size === 0) {
        dispatch({ type: "listening" });
      }
    },
    [emitTranscript, playGeminiAudio, stopGeminiOutput],
  );

  const startGeminiInput = useCallback((stream: MediaStream, socket: WebSocket) => {
    const context = new AudioContext({ latencyHint: "interactive" });
    geminiInputContextRef.current = context;
    const source = context.createMediaStreamSource(stream);
    const processor = context.createScriptProcessor(2048, 1, 1);
    const silentGain = context.createGain();
    silentGain.gain.value = 0;
    source.connect(processor);
    processor.connect(silentGain);
    silentGain.connect(context.destination);
    processor.onaudioprocess = (event) => {
      if (socket.readyState !== WebSocket.OPEN) return;
      const pcm = downsample(
        event.inputBuffer.getChannelData(0),
        context.sampleRate,
        16_000,
      );
      socket.send(
        JSON.stringify({
          realtimeInput: {
            audio: {
              data: floatToPcm16Base64(pcm),
              mimeType: "audio/pcm;rate=16000",
            },
          },
        }),
      );
    };
    geminiProcessorRef.current = processor;
    void context.resume();
  }, []);

  const startGemini = useCallback(
    async (
      bootstrap: Extract<SamuelLiveBootstrap, { provider: "gemini" }>,
      stream: MediaStream,
    ) => {
      if (!supportsGeminiLive()) {
        throw new Error("Gemini Live não é suportado neste navegador.");
      }
      await new Promise<void>((resolve, reject) => {
        const socket = new WebSocket(bootstrap.websocketUrl);
        websocketRef.current = socket;
        closingRef.current = false;
        let ready = false;
        let settled = false;
        const setupTimer = window.setTimeout(() => {
          if (!ready && !settled) {
            settled = true;
            socket.close();
            reject(
              new Error("Gemini Live não confirmou a configuração da sessão."),
            );
          }
        }, GEMINI_SETUP_TIMEOUT_MS);
        const fail = (message: string) => {
          if (settled) return;
          settled = true;
          window.clearTimeout(setupTimer);
          reject(new Error(message));
        };
        socket.onerror = () => fail("Não foi possível conectar ao Gemini Live.");
        socket.onclose = (event) => {
          window.clearTimeout(setupTimer);
          if (!closingRef.current && !ready) {
            fail(`Gemini Live encerrou durante a configuração (${event.code}).`);
          } else if (!closingRef.current && ready && !event.wasClean) {
            dispatch({
              type: "error",
              error: `A sessão Gemini Live foi interrompida (${event.code}).`,
            });
          }
        };
        socket.onmessage = (event) => {
          let message: GeminiServerMessage;
          try {
            message = JSON.parse(String(event.data)) as GeminiServerMessage;
          } catch {
            return;
          }
          if (message.setupComplete !== undefined && !ready) {
            ready = true;
            settled = true;
            window.clearTimeout(setupTimer);
            startGeminiInput(stream, socket);
            dispatch({ type: "listening" });
            resolve();
            return;
          }
          if (message.goAway) return;
          handleGeminiContent(message);
        };
        socket.onopen = () =>
          socket.send(
            JSON.stringify({
              setup: {
                model: `models/${bootstrap.model}`,
                generationConfig: { responseModalities: ["AUDIO"] },
                inputAudioTranscription: {},
                outputAudioTranscription: {},
                realtimeInputConfig: {
                  automaticActivityDetection: {
                    startOfSpeechSensitivity: "START_SENSITIVITY_HIGH",
                    endOfSpeechSensitivity: "END_SENSITIVITY_HIGH",
                    prefixPaddingMs: 250,
                    silenceDurationMs: 650,
                  },
                },
                systemInstruction: {
                  parts: [{ text: systemInstruction(contextSummary) }],
                },
                sessionResumption: {},
              },
            }),
          );
      });
    },
    [contextSummary, handleGeminiContent, startGeminiInput],
  );

  const startOpenAi = useCallback(
    async (stream: MediaStream, controller: AbortController) => {
      if (!supportsOpenAiRealtime()) {
        throw new Error("WebRTC indisponível neste navegador.");
      }
      const peer = new RTCPeerConnection();
      peerRef.current = peer;
      stream.getAudioTracks().forEach((track) => peer.addTrack(track, stream));

      const audio = document.createElement("audio");
      audio.autoplay = true;
      audio.setAttribute("playsinline", "true");
      audio.muted = false;
      audio.volume = 1;
      remoteAudioRef.current = audio;
      peer.ontrack = (event) => {
        audio.srcObject = event.streams[0];
        if (event.streams[0]) attachAudioAnalyser(event.streams[0], "output");
        void audio.play().catch(() => undefined);
      };
      peer.onconnectionstatechange = () => {
        if (peer.connectionState === "failed") {
          dispatch({
            type: "error",
            error: "A conexão de voz foi interrompida. Tente iniciar novamente.",
          });
        }
      };

      const channel = peer.createDataChannel("oai-events");
      dataChannelRef.current = channel;
      channel.onmessage = (event) => {
        try {
          handleOpenAiEvent(JSON.parse(String(event.data)) as OpenAiServerEvent);
        } catch {
          // Ignore malformed provider events.
        }
      };

      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);
      const answer = await exchangeSamuelRealtimeOffer(
        offer.sdp ?? "",
        { companyId, conversationId, contextSummary },
        controller.signal,
      );
      await peer.setRemoteDescription({ type: "answer", sdp: answer });
      providerRef.current = "openai";
      handledToolCallsRef.current.clear();
      dispatch({
        type: "session_started",
        now: Date.now(),
        maxDurationMs: SAMUEL_REALTIME_MAX_DURATION_MS,
      });
    },
    [
      attachAudioAnalyser,
      companyId,
      contextSummary,
      conversationId,
      handleOpenAiEvent,
    ],
  );

  const start = useCallback(async () => {
    if (!supportsMicrophone()) {
      dispatch({ type: "error", error: "Microfone indisponível neste navegador." });
      return;
    }
    cleanup();
    closingRef.current = false;
    dispatch({ type: "request_permission" });
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: false,
      });
      localStreamRef.current = stream;
      attachAudioAnalyser(stream, "input");
      let bootstrap = await getSamuelLiveBootstrap(companyId, controller.signal);
      if (bootstrap.provider === "openai") {
        try {
          await startOpenAi(stream, controller);
        } catch (openAiError) {
          bootstrap = await getSamuelLiveBootstrap(
            companyId,
            controller.signal,
            "gemini",
          );
          if (bootstrap.provider !== "gemini") throw openAiError;
          providerRef.current = "gemini";
          await startGemini(bootstrap, stream);
          dispatch({
            type: "session_started",
            now: Date.now(),
            maxDurationMs: SAMUEL_REALTIME_MAX_DURATION_MS,
          });
        }
      } else {
        providerRef.current = "gemini";
        await startGemini(bootstrap, stream);
        dispatch({
          type: "session_started",
          now: Date.now(),
          maxDurationMs: SAMUEL_REALTIME_MAX_DURATION_MS,
        });
      }
      timeoutRef.current = setTimeout(end, SAMUEL_REALTIME_MAX_DURATION_MS);
    } catch (error) {
      cleanup();
      dispatch({
        type: "error",
        error:
          error instanceof Error
            ? error.message
            : "Não foi possível iniciar a conversa de voz.",
      });
    }
  }, [attachAudioAnalyser, cleanup, companyId, end, startGemini, startOpenAi]);

  const interrupt = useCallback(() => {
    cancelActiveDesktopCommand();

    if (providerRef.current === "gemini") {
      stopGeminiOutput();
    } else if (dataChannelRef.current?.readyState === "open") {
      dataChannelRef.current.send(JSON.stringify({ type: "response.cancel" }));
    }
    dispatch({ type: "listening" });
  }, [cancelActiveDesktopCommand, stopGeminiOutput]);

  const setMuted = useCallback((muted: boolean) => {
    localStreamRef.current?.getAudioTracks().forEach((track) => {
      track.enabled = !muted;
    });
    dispatch({ type: "set_muted", muted });
  }, []);

  const setTextMode = useCallback(
    (enabled: boolean) => dispatch({ type: "set_text_mode", enabled }),
    [],
  );

  useEffect(() => cleanup, [cleanup]);

  return {
    session,
    supported:
      supportsMicrophone() && (supportsOpenAiRealtime() || supportsGeminiLive()),
    start,
    end,
    interrupt,
    setMuted,
    setTextMode,
  };
}
