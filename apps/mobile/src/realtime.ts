import {
  mediaDevices,
  MediaStream,
  RTCPeerConnection,
  RTCSessionDescription,
  type MediaStreamTrack,
} from "react-native-webrtc";

import { exchangeRealtimeOffer } from "./api";

export type VoiceStatus =
  | "idle"
  | "requesting"
  | "connecting"
  | "listening"
  | "processing"
  | "speaking"
  | "error";

export type VoiceTranscript = {
  role: "user" | "assistant";
  content: string;
  final: boolean;
};

type ProviderEvent = {
  type?: string;
  transcript?: string;
  delta?: string;
  error?: { message?: string };
};

export class SamuelRealtimeVoice {
  private peer: RTCPeerConnection | null = null;
  private stream: MediaStream | null = null;
  private channel: ReturnType<RTCPeerConnection["createDataChannel"]> | null = null;

  constructor(
    private readonly input: {
      companyId: string;
      conversationId: string | null;
      onStatus: (status: VoiceStatus) => void;
      onTranscript: (transcript: VoiceTranscript) => void;
      onError: (message: string) => void;
    },
  ) {}

  async start() {
    if (this.peer) return;
    this.input.onStatus("requesting");
    try {
      const stream = await mediaDevices.getUserMedia({ audio: true, video: false });
      this.stream = stream;
      this.input.onStatus("connecting");

      const peer = new RTCPeerConnection();
      this.peer = peer;
      stream.getAudioTracks().forEach((track: MediaStreamTrack) => {
        peer.addTrack(track, stream);
      });

      peer.onconnectionstatechange = () => {
        if (peer.connectionState === "connected") this.input.onStatus("listening");
        if (peer.connectionState === "failed" || peer.connectionState === "disconnected") {
          this.input.onError("A ligação de voz foi interrompida.");
          this.input.onStatus("error");
        }
      };

      const channel = peer.createDataChannel("oai-events");
      this.channel = channel;
      channel.onmessage = (message: { data: unknown }) => {
        try {
          this.handleEvent(JSON.parse(String(message.data)) as ProviderEvent);
        } catch {
          // Ignore malformed provider events.
        }
      };

      const offer = await peer.createOffer({ offerToReceiveAudio: true });
      await peer.setLocalDescription(offer);
      const answerSdp = await exchangeRealtimeOffer({
        companyId: this.input.companyId,
        conversationId: this.input.conversationId,
        sdp: offer.sdp ?? "",
      });
      await peer.setRemoteDescription(
        new RTCSessionDescription({ type: "answer", sdp: answerSdp }),
      );
    } catch (error) {
      this.stop();
      const message = error instanceof Error ? error.message : "Não foi possível iniciar a conversa por voz.";
      this.input.onError(message);
      this.input.onStatus("error");
      throw error;
    }
  }

  private handleEvent(event: ProviderEvent) {
    switch (event.type) {
      case "input_audio_buffer.speech_started":
        this.input.onStatus("listening");
        break;
      case "input_audio_buffer.speech_stopped":
        this.input.onStatus("processing");
        break;
      case "response.audio.delta":
      case "response.output_audio.delta":
        this.input.onStatus("speaking");
        break;
      case "response.audio.done":
      case "response.output_audio.done":
      case "response.done":
        this.input.onStatus("listening");
        break;
      case "conversation.item.input_audio_transcription.completed":
        if (event.transcript) {
          this.input.onTranscript({ role: "user", content: event.transcript, final: true });
        }
        break;
      case "response.output_audio_transcript.delta":
        if (event.delta) {
          this.input.onStatus("speaking");
          this.input.onTranscript({ role: "assistant", content: event.delta, final: false });
        }
        break;
      case "response.output_audio_transcript.done":
        if (event.transcript) {
          this.input.onTranscript({ role: "assistant", content: event.transcript, final: true });
        }
        break;
      case "error":
        this.input.onError(event.error?.message ?? "A sessão de voz encontrou um erro.");
        this.input.onStatus("error");
        break;
      default:
        break;
    }
  }

  interrupt() {
    if (this.channel?.readyState === "open") {
      this.channel.send(JSON.stringify({ type: "response.cancel" }));
    }
    this.input.onStatus("listening");
  }

  setMuted(muted: boolean) {
    this.stream?.getAudioTracks().forEach((track: MediaStreamTrack) => {
      track.enabled = !muted;
    });
  }

  stop() {
    this.channel?.close();
    this.channel = null;
    this.stream?.getTracks().forEach((track: MediaStreamTrack) => track.stop());
    this.stream = null;
    this.peer?.close();
    this.peer = null;
    this.input.onStatus("idle");
  }
}
