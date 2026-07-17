"use client";

import { useCallback, useEffect, useReducer, useRef } from "react";

import { exchangeSamuelRealtimeOffer } from "./samuel-realtime.client";
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

type RealtimeServerEvent = {
  type?: string;
  delta?: string;
  transcript?: string;
  error?: { message?: string };
};

function supportsRealtimeVoice() {
  return (
    typeof window !== "undefined" &&
    "RTCPeerConnection" in window &&
    Boolean(navigator.mediaDevices?.getUserMedia)
  );
}

function stopStream(stream: MediaStream | null) {
  stream?.getTracks().forEach((track) => track.stop());
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
  const localStreamRef = useRef<MediaStream | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputAnalyserCleanupRef = useRef<(() => void) | null>(null);
  const outputAnalyserCleanupRef = useRef<(() => void) | null>(null);

  const cleanup = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    dataChannelRef.current?.close();
    dataChannelRef.current = null;
    peerRef.current?.getSenders().forEach((sender) => sender.track?.stop());
    peerRef.current?.close();
    peerRef.current = null;
    stopStream(localStreamRef.current);
    localStreamRef.current = null;
    inputAnalyserCleanupRef.current?.();
    inputAnalyserCleanupRef.current = null;
    outputAnalyserCleanupRef.current?.();
    outputAnalyserCleanupRef.current = null;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.srcObject = null;
      audioRef.current.remove();
      audioRef.current = null;
    }
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = null;
  }, []);

  const end = useCallback(() => {
    cleanup();
    dispatch({ type: "reset" });
  }, [cleanup]);

  const sendEvent = useCallback((event: Record<string, unknown>) => {
    const channel = dataChannelRef.current;
    if (channel?.readyState === "open") {
      channel.send(JSON.stringify(event));
    }
  }, []);

  const interrupt = useCallback(() => {
    sendEvent({ type: "response.cancel" });
    dispatch({ type: "paused" });
  }, [sendEvent]);

  const setMuted = useCallback((muted: boolean) => {
    localStreamRef.current?.getAudioTracks().forEach((track) => {
      track.enabled = !muted;
    });
    dispatch({ type: "set_muted", muted });
  }, []);

  const setTextMode = useCallback((textMode: boolean) => {
    setMuted(textMode);
    dispatch({ type: "set_text_mode", textMode });
  }, [setMuted]);

  const attachAudioAnalyser = useCallback((stream: MediaStream, channel: "input" | "output") => {
    if (typeof AudioContext === "undefined") return false;

    const cleanupRef = channel === "input"
      ? inputAnalyserCleanupRef
      : outputAnalyserCleanupRef;
    cleanupRef.current?.();
    const audioContext = new AudioContext({ latencyHint: "interactive" });
    void audioContext.resume();
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 128;
    analyser.smoothingTimeConstant = 0.7;
    const source = audioContext.createMediaStreamSource(stream);
    // Keep Realtime playback native. On iOS/Safari, routing the remote stream
    // through WebAudio and muting the <audio> element can make Samuel silent.
    // The analyser is used only as a parallel signal for the hologram/mouth.
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

  const handleServerEvent = useCallback(
    (event: RealtimeServerEvent) => {
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
          dispatch({ type: "listening" });
          break;
        case "conversation.item.input_audio_transcription.completed": {
          const content = event.transcript?.trim();
          if (content) {
            dispatch({ type: "user_transcript", content, final: true });
            onTranscript?.({ role: "user", content, final: true });
          }
          break;
        }
        case "response.output_audio_transcript.delta":
          if (event.delta) {
            dispatch({ type: "speaking" });
            dispatch({ type: "assistant_transcript", content: event.delta });
            onTranscript?.({ role: "assistant", content: event.delta, final: false });
          }
          break;
        case "response.output_audio_transcript.done": {
          const content = event.transcript?.trim();
          if (content) {
            dispatch({ type: "assistant_transcript", content, final: true });
            onTranscript?.({ role: "assistant", content, final: true });
          }
          break;
        }
        case "error":
          dispatch({
            type: "error",
            error: event.error?.message ?? "A sessão de voz encontrou um erro.",
          });
          break;
        default:
          break;
      }
    },
    [onTranscript],
  );

  const start = useCallback(async () => {
    if (!supportsRealtimeVoice()) {
      dispatch({
        type: "error",
        error: "WebRTC ou microfone indisponível neste navegador. Use o chat textual.",
      });
      return;
    }
    if (peerRef.current) return;

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
      });
      localStreamRef.current = stream;
      attachAudioAnalyser(stream, "input");

      const peer = new RTCPeerConnection();
      peerRef.current = peer;
      stream.getAudioTracks().forEach((track) => peer.addTrack(track, stream));

      const audio = document.createElement("audio");
      audio.autoplay = true;
      audio.setAttribute("playsinline", "true");
      audio.muted = false;
      audio.volume = 1;
      audioRef.current = audio;
      peer.ontrack = (event) => {
        audio.srcObject = event.streams[0];
        if (event.streams[0]) attachAudioAnalyser(event.streams[0], "output");
        audio.muted = false;
        audio.volume = 1;
        void audio.play().catch(() => {
          // Mobile Safari may wait for the next explicit user interaction.
        });
      };
      peer.onconnectionstatechange = () => {
        if (peer.connectionState === "failed") {
          dispatch({
            type: "error",
            error: "A conexão de voz foi interrompida. Tente iniciar novamente.",
          });
          cleanup();
        }
      };

      const channel = peer.createDataChannel("oai-events");
      dataChannelRef.current = channel;
      channel.addEventListener("message", (message) => {
        try {
          handleServerEvent(JSON.parse(String(message.data)) as RealtimeServerEvent);
        } catch {
          // Ignore malformed events without logging conversation content.
        }
      });

      const offer = await peer.createOffer({ offerToReceiveAudio: true });
      await peer.setLocalDescription(offer);
      const answerSdp = await exchangeSamuelRealtimeOffer(
        offer.sdp ?? "",
        { companyId, conversationId, contextSummary },
        controller.signal,
      );
      await peer.setRemoteDescription({ type: "answer", sdp: answerSdp });

      const now = Date.now();
      dispatch({
        type: "session_started",
        now,
        maxDurationMs: SAMUEL_REALTIME_MAX_DURATION_MS,
      });
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
  }, [
    attachAudioAnalyser,
    cleanup,
    companyId,
    contextSummary,
    conversationId,
    end,
    handleServerEvent,
  ]);

  useEffect(() => cleanup, [cleanup]);

  return {
    session,
    supported: supportsRealtimeVoice(),
    start,
    end,
    interrupt,
    setMuted,
    setTextMode,
  };
}
