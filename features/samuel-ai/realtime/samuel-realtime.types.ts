export type SamuelRealtimeVoiceState =
  | "idle"
  | "requesting_permission"
  | "listening"
  | "processing"
  | "speaking"
  | "paused"
  | "error";

export type SamuelRealtimeTranscriptRole = "user" | "assistant";

export type SamuelRealtimeTranscript = {
  id: string;
  role: SamuelRealtimeTranscriptRole;
  content: string;
  final: boolean;
  createdAt: string;
};

export type SamuelRealtimeSession = {
  state: SamuelRealtimeVoiceState;
  muted: boolean;
  textMode: boolean;
  error: string | null;
  startedAt: number | null;
  expiresAt: number | null;
  userTranscript: string;
  assistantTranscript: string;
  audioLevel: number;
};

export type SamuelRealtimeAction =
  | { type: "request_permission" }
  | { type: "session_started"; now: number; maxDurationMs: number }
  | { type: "listening" }
  | { type: "processing" }
  | { type: "speaking" }
  | { type: "paused" }
  | { type: "set_muted"; muted: boolean }
  | { type: "set_text_mode"; textMode: boolean }
  | { type: "set_audio_level"; audioLevel: number }
  | { type: "user_transcript"; content: string; final?: boolean }
  | { type: "assistant_transcript"; content: string; final?: boolean }
  | { type: "error"; error: string }
  | { type: "reset" };
