import type {
  SamuelRealtimeAction,
  SamuelRealtimeSession,
} from "./samuel-realtime.types";

export const SAMUEL_REALTIME_MAX_DURATION_MS = 8 * 60 * 1000;

export const initialSamuelRealtimeSession: SamuelRealtimeSession = {
  state: "idle",
  muted: false,
  textMode: false,
  error: null,
  startedAt: null,
  expiresAt: null,
  userTranscript: "",
  assistantTranscript: "",
  audioLevel: 0,
};

export function samuelRealtimeReducer(
  state: SamuelRealtimeSession,
  action: SamuelRealtimeAction,
): SamuelRealtimeSession {
  switch (action.type) {
    case "request_permission":
      return { ...state, state: "requesting_permission", error: null };
    case "session_started":
      return {
        ...state,
        state: "listening",
        error: null,
        startedAt: action.now,
        expiresAt: action.now + action.maxDurationMs,
        userTranscript: "",
        assistantTranscript: "",
      };
    case "listening":
    case "processing":
    case "speaking":
    case "paused":
      return { ...state, state: action.type, error: null };
    case "set_muted":
      return { ...state, muted: action.muted };
    case "set_text_mode":
      return { ...state, textMode: action.textMode };
    case "set_audio_level":
      return { ...state, audioLevel: Math.max(0, Math.min(1, action.audioLevel)) };
    case "user_transcript":
      return {
        ...state,
        userTranscript: action.final
          ? action.content
          : `${state.userTranscript}${action.content}`,
      };
    case "assistant_transcript":
      return {
        ...state,
        assistantTranscript: action.final
          ? action.content
          : `${state.assistantTranscript}${action.content}`,
      };
    case "error":
      return { ...state, state: "error", error: action.error, audioLevel: 0 };
    case "reset":
      return initialSamuelRealtimeSession;
    default:
      return state;
  }
}
