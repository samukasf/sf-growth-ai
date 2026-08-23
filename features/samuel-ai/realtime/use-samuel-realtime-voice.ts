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

type OpenAiServerEvent = {
  type?: string;
  delta?: string;
  transcript?: string;
  error?: { message?: string };
};

type GeminiServerMessage = {
  serverContent?: {
    interrupted?: boolean;
    turnComplete?: boolean;
    inputTranscription?: { text?: string };
    outputTranscription?: { text?: string };
    modelTurn?: {
      parts?: Array<{
        inlineData?: { data?: string; mimeType?: string };
      }>;
    };
  };
};

const GEMINI_OUTPUT_RATE = 24_000;

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
    for (let source = start; source < end; source += 1) {
      total += input[source] ?? 0;
      count += 1;
    }
    output[index] = count > 0 ? total / count : input[start] ?? 0;
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
  return `Você é Samuel AI, um assistente executivo de inteligência artificial. Converse de forma natural, fluida e objetiva em português brasileiro, adaptando-se ao idioma do utilizador. Espere a pessoa terminar, aceite interrupções naturalmente e evite respostas longas quando uma resposta curta resolver. Nunca invente ações, dados empresariais ou eventos. Quando uma ação externa for necessária e não estiver disponível nesta sessão, diga claramente o que precisa ser executado pelo sistema. Sua presença vocal deve parecer adulta, calma, segura e profissional.${context}`;
}

export function useSamuelRealtimeVoice({
  companyId,
  conversationId,
  contextSummary,
  onTranscript,
}: UseSamuelRealtimeVoiceInput) {
  const [session, dispatch] = useReducer(samuelRealtimeReducer, initialSamuelRealtimeSession);
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

  const stopGeminiOutput = useCallback(() => {
    geminiSourcesRef.current.forEach((source) => {
      try { source.stop(); } catch { /* source already stopped */ }
    });
    geminiSourcesRef.current.clear();
    geminiPlaybackAtRef.current = 0;
    if (geminiOutputTimerRef.current) clearTimeout(geminiOutputTimerRef.current);
    geminiOutputTimerRef.current = null;
    dispatch({ type: "set_output_audio_level", audioLevel: 0 });
  }, []);

  const cleanup = useCallback(() => {
    closingRef.current = true;
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
    if (geminiInputContextRef.current && geminiInputContextRef.current.state !== "closed") {
      void geminiInputContextRef.current.close();
    }
    geminiInputContextRef.current = null;
    stopGeminiOutput();
    if (geminiOutputContextRef.current && geminiOutputContextRef.current.state !== "closed") {
      void geminiOutputContextRef.current.close();
    }
    geminiOutputContextRef.current = null;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = null;
  }, [stopGeminiOutput]);

  const end = useCallback(() => {
    cleanup();
    dispatch({ type: "reset" });
  }, [cleanup]);

  const attachAudioAnalyser = useCallback((stream: MediaStream, channel: "input" | "output") => {
    if (typeof AudioContext === "undefined") return false;
    const cleanupRef = channel === "input" ? inputAnalyserCleanupRef : outputAnalyserCleanupRef;
    cleanupRef.current?.();
    const audioContext = new AudioContext({ latencyHint: "interactive" });
    void audioContext.resume();
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 128;
    analyser.smoothingTimeConstant = 0.7;
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
  }, []);

  const emitTranscript = useCallback((role: SamuelRealtimeTranscriptRole, content: string, final: boolean) => {
    const text = content.trim();
    if (!text) return;
    if (role === "user") dispatch({ type: "user_transcript", content: text, final });
    else dispatch({ type: "assistant_transcript", content: text, final });
    onTranscript?.({ role, content: text, final });
  }, [onTranscript]);

  const handleOpenAiEvent = useCallback((event: OpenAiServerEvent) => {
    switch (event.type) {
      case "input_audio_buffer.speech_started": dispatch({ type: "listening" }); break;
      case "input_audio_buffer.speech_stopped": dispatch({ type: "processing" }); break;
      case "response.audio.delta":
      case "response.output_audio.delta": dispatch({ type: "speaking" }); break;
      case "response.audio.done":
      case "response.output_audio.done":
        dispatch({ type: "set_output_audio_level", audioLevel: 0 });
        dispatch({ type: "listening" });
        break;
      case "response.done": dispatch({ type: "listening" }); break;
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
      case "error": dispatch({ type: "error", error: event.error?.message ?? "A sessão de voz encontrou um erro." }); break;
      default: break;
    }
  }, [emitTranscript]);

  const playGeminiAudio = useCallback((base64: string) => {
    const samples = decodePcm16Base64(base64);
    if (samples.length === 0) return;
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
    const startAt = Math.max(context.currentTime + 0.02, geminiPlaybackAtRef.current);
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
    }, Math.max(120, (geminiPlaybackAtRef.current - context.currentTime) * 1000));
  }, []);

  const handleGeminiMessage = useCallback((event: MessageEvent<string>) => {
    let message: GeminiServerMessage;
    try { message = JSON.parse(String(event.data)) as GeminiServerMessage; }
    catch { return; }
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
      emitTranscript("assistant", content.outputTranscription.text, Boolean(content.turnComplete));
    }
    for (const part of content.modelTurn?.parts ?? []) {
      const audio = part.inlineData;
      if (audio?.data && (!audio.mimeType || audio.mimeType.startsWith("audio/"))) {
        playGeminiAudio(audio.data);
      }
    }
    if (content.turnComplete && geminiSourcesRef.current.size === 0) dispatch({ type: "listening" });
  }, [emitTranscript, playGeminiAudio, stopGeminiOutput]);

  const startGeminiInput = useCallback((stream: MediaStream, socket: WebSocket) => {
    const context = new AudioContext({ latencyHint: "interactive" });
    geminiInputContextRef.current = context;
    const source = context.createMediaStreamSource(stream);
    const processor = context.createScriptProcessor(4096, 1, 1);
    const silentGain = context.createGain();
    silentGain.gain.value = 0;
    source.connect(processor);
    processor.connect(silentGain);
    silentGain.connect(context.destination);
    processor.onaudioprocess = (event) => {
      if (socket.readyState !== WebSocket.OPEN) return;
      const pcm = downsample(event.inputBuffer.getChannelData(0), context.sampleRate, 16_000);
      socket.send(JSON.stringify({
        realtimeInput: {
          audio: {
            data: floatToPcm16Base64(pcm),
            mimeType: "audio/pcm;rate=16000",
          },
        },
      }));
    };
    geminiProcessorRef.current = processor;
    void context.resume();
  }, []);

  const startGemini = useCallback(async (
    bootstrap: Extract<SamuelLiveBootstrap, { provider: "gemini" }>,
    stream: MediaStream,
  ) => {
    if (!supportsGeminiLive()) throw new Error("Gemini Live não é suportado neste navegador.");
    await new Promise<void>((resolve, reject) => {
      const socket = new WebSocket(bootstrap.websocketUrl);
      websocketRef.current = socket;
      closingRef.current = false;
      let opened = false;
      socket.onerror = () => {
        if (!opened) reject(new Error("Não foi possível conectar ao Gemini Live."));
      };
      socket.onclose = (event) => {
        if (!closingRef.current && opened && !event.wasClean) {
          dispatch({ type: "error", error: "A sessão Gemini Live foi interrompida." });
        }
      };
      socket.onmessage = handleGeminiMessage;
      socket.onopen = () => {
        opened = true;
        socket.send(JSON.stringify({
          setup: {
            model: `models/${bootstrap.model}`,
            responseModalities: ["AUDIO"],
            inputAudioTranscription: {},
            outputAudioTranscription: {},
            realtimeInputConfig: {
              automaticActivityDetection: {
                startOfSpeechSensitivity: "START_SENSITIVITY_HIGH",
                endOfSpeechSensitivity: "END_SENSITIVITY_HIGH",
                prefixPaddingMs: 300,
                silenceDurationMs: 850,
              },
            },
            systemInstruction: { parts: [{ text: systemInstruction(contextSummary) }] },
            sessionResumption: {},
          },
        }));
        startGeminiInput(stream, socket);
        resolve();
      };
    });
  }, [contextSummary, handleGeminiMessage, startGeminiInput]);

  const startOpenAi = useCallback(async (stream: MediaStream, controller: AbortController) => {
    if (!supportsOpenAiRealtime()) throw new Error("WebRTC indisponível neste navegador.");
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
        dispatch({ type: "error", error: "A conexão de voz foi interrompida. Tente iniciar novamente." });
        cleanup();
      }
    };
    const channel = peer.createDataChannel("oai-events");
    dataChannelRef.current = channel;
    channel.addEventListener("message", (message) => {
      try { handleOpenAiEvent(JSON.parse(String(message.data)) as OpenAiServerEvent); }
      catch { /* ignore malformed provider events */ }
    });
    const offer = await peer.createOffer({ offerToReceiveAudio: true });
    await peer.setLocalDescription(offer);
    const answerSdp = await exchangeSamuelRealtimeOffer(
      offer.sdp ?? "",
      { companyId, conversationId, contextSummary },
      controller.signal,
    );
    await peer.setRemoteDescription({ type: "answer", sdp: answerSdp });
  }, [attachAudioAnalyser, cleanup, companyId, contextSummary, conversationId, handleOpenAiEvent]);

  const start = useCallback(async () => {
    if (!supportsMicrophone()) {
      dispatch({ type: "error", error: "Microfone indisponível neste navegador. Use o chat textual." });
      return;
    }
    if (peerRef.current || websocketRef.current) return;
    dispatch({ type: "request_permission" });
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const bootstrap = await getSamuelLiveBootstrap(companyId, controller.signal);
      providerRef.current = bootstrap.provider;
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
      localStreamRef.current = stream;
      attachAudioAnalyser(stream, "input");
      if (bootstrap.provider === "gemini") await startGemini(bootstrap, stream);
      else await startOpenAi(stream, controller);
      const now = Date.now();
      dispatch({ type: "session_started", now, maxDurationMs: SAMUEL_REALTIME_MAX_DURATION_MS });
      timeoutRef.current = setTimeout(end, SAMUEL_REALTIME_MAX_DURATION_MS);
    } catch (error) {
      cleanup();
      dispatch({
        type: "error",
        error:
          error instanceof DOMException && error.name === "NotAllowedError"
            ? "Permissão de microfone negada. Ative o microfone ou use o chat textual."
            : error instanceof Error
              ? error.message
              : "Não foi possível iniciar a voz do Samuel.",
      });
    }
  }, [attachAudioAnalyser, cleanup, companyId, end, startGemini, startOpenAi]);

  const sendOpenAiEvent = useCallback((event: Record<string, unknown>) => {
    const channel = dataChannelRef.current;
    if (channel?.readyState === "open") channel.send(JSON.stringify(event));
  }, []);

  const interrupt = useCallback(() => {
    if (providerRef.current === "openai") sendOpenAiEvent({ type: "response.cancel" });
    else stopGeminiOutput();
    dispatch({ type: "paused" });
  }, [sendOpenAiEvent, stopGeminiOutput]);

  const setMuted = useCallback((muted: boolean) => {
    localStreamRef.current?.getAudioTracks().forEach((track) => { track.enabled = !muted; });
    dispatch({ type: "set_muted", muted });
  }, []);

  const setTextMode = useCallback((textMode: boolean) => {
    setMuted(textMode);
    dispatch({ type: "set_text_mode", textMode });
  }, [setMuted]);

  useEffect(() => cleanup, [cleanup]);

  return {
    session,
    supported: supportsMicrophone() && (supportsOpenAiRealtime() || supportsGeminiLive()),
    start,
    end,
    interrupt,
    setMuted,
    setTextMode,
  };
}
