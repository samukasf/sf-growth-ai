import { afterEach, describe, expect, it } from "vitest";

import {
  buildRealtimeSession,
  DEFAULT_REALTIME_MODEL,
  DEFAULT_REALTIME_VOICE,
  InvalidRealtimeModelError,
  resolveRealtimeModel,
} from "./samuel-realtime.server";

const originalRealtimeModel = process.env.OPENAI_REALTIME_MODEL;
const originalGatewayModel = process.env.AI_GATEWAY_MODEL;

afterEach(() => {
  if (originalRealtimeModel === undefined) delete process.env.OPENAI_REALTIME_MODEL;
  else process.env.OPENAI_REALTIME_MODEL = originalRealtimeModel;

  if (originalGatewayModel === undefined) delete process.env.AI_GATEWAY_MODEL;
  else process.env.AI_GATEWAY_MODEL = originalGatewayModel;
});

describe("Realtime voice server configuration", () => {
  it("uses the Realtime default without reading the text gateway model", () => {
    delete process.env.OPENAI_REALTIME_MODEL;
    process.env.AI_GATEWAY_MODEL = "open-source-text-model";

    expect(resolveRealtimeModel()).toBe(DEFAULT_REALTIME_MODEL);
  });

  it("accepts a configured Realtime model", () => {
    process.env.OPENAI_REALTIME_MODEL = "gpt-realtime-2.1";

    expect(resolveRealtimeModel()).toBe("gpt-realtime-2.1");
  });

  it("rejects a non-Realtime model", () => {
    process.env.OPENAI_REALTIME_MODEL = "open-source-text-model";

    expect(() => resolveRealtimeModel()).toThrow(InvalidRealtimeModelError);
  });

  it("builds the GA audio schema with automatic turn detection", () => {
    const session = buildRealtimeSession({
      model: "gpt-realtime-2.1",
      voice: DEFAULT_REALTIME_VOICE,
      contextSummary: "Empresa de teste",
    });

    expect(session.audio.input.transcription.model).toBe("gpt-4o-mini-transcribe");
    expect(session.audio.input.turn_detection).toMatchObject({
      type: "server_vad",
      create_response: true,
      interrupt_response: true,
      silence_duration_ms: 900,
    });
    expect(session.audio.output.voice).toBe("cedar");
    expect(session).not.toHaveProperty("input_audio_transcription");
    expect(session).not.toHaveProperty("turn_detection");
    expect(session.instructions).toContain("Empresa de teste");
    expect(session.instructions).toContain("voz masculina adulta");
    expect(session.instructions).toContain("Sr. Samuel");
    expect(session.instructions).toContain("evento real e verificável");
    expect(session.instructions).toContain("nunca fale por cima dele");
  });
});
