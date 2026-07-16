import { describe, expect, it } from "vitest";

import {
  initialSamuelRealtimeSession,
  SAMUEL_REALTIME_MAX_DURATION_MS,
  samuelRealtimeReducer,
} from "./samuel-realtime.reducer";

describe("samuelRealtimeReducer", () => {
  it("moves through permission and active session states", () => {
    const requesting = samuelRealtimeReducer(initialSamuelRealtimeSession, {
      type: "request_permission",
    });
    expect(requesting.state).toBe("requesting_permission");

    const started = samuelRealtimeReducer(requesting, {
      type: "session_started",
      now: 1000,
      maxDurationMs: SAMUEL_REALTIME_MAX_DURATION_MS,
    });
    expect(started.state).toBe("listening");
    expect(started.startedAt).toBe(1000);
    expect(started.expiresAt).toBe(1000 + SAMUEL_REALTIME_MAX_DURATION_MS);

    expect(samuelRealtimeReducer(started, { type: "processing" }).state).toBe(
      "processing",
    );
    expect(samuelRealtimeReducer(started, { type: "speaking" }).state).toBe(
      "speaking",
    );
  });

  it("supports mute, text mode, transcripts and audio level clamping", () => {
    const muted = samuelRealtimeReducer(initialSamuelRealtimeSession, {
      type: "set_muted",
      muted: true,
    });
    expect(muted.muted).toBe(true);

    const textMode = samuelRealtimeReducer(muted, {
      type: "set_text_mode",
      textMode: true,
    });
    expect(textMode.textMode).toBe(true);

    const withUserTranscript = samuelRealtimeReducer(textMode, {
      type: "user_transcript",
      content: "Olá Samuel",
      final: true,
    });
    expect(withUserTranscript.userTranscript).toBe("Olá Samuel");

    const withAssistantTranscript = samuelRealtimeReducer(withUserTranscript, {
      type: "assistant_transcript",
      content: "Olá, Samuel aqui.",
      final: true,
    });
    expect(withAssistantTranscript.assistantTranscript).toBe("Olá, Samuel aqui.");

    expect(
      samuelRealtimeReducer(withAssistantTranscript, {
        type: "set_audio_level",
        audioLevel: 2,
      }).audioLevel,
    ).toBe(1);

    expect(
      samuelRealtimeReducer(withAssistantTranscript, {
        type: "set_output_audio_level",
        audioLevel: 0.65,
      }).outputAudioLevel,
    ).toBe(0.65);
  });

  it("handles interruption, errors and cleanup reset", () => {
    const speaking = samuelRealtimeReducer(initialSamuelRealtimeSession, {
      type: "speaking",
    });
    const paused = samuelRealtimeReducer(speaking, { type: "paused" });
    expect(paused.state).toBe("paused");

    const failed = samuelRealtimeReducer(paused, {
      type: "error",
      error: "Permissão negada",
    });
    expect(failed.state).toBe("error");
    expect(failed.error).toBe("Permissão negada");

    expect(samuelRealtimeReducer(failed, { type: "reset" })).toEqual(
      initialSamuelRealtimeSession,
    );
  });
});
