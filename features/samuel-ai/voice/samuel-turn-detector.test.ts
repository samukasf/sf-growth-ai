import { describe, expect, it } from "vitest";

import {
  SamuelTurnDetector,
  calculatePcmRms,
  concatPcm,
  downsamplePcm,
  encodePcm16Wav,
} from "./samuel-turn-detector";

describe("SamuelTurnDetector", () => {
  it("starts normal speech after consecutive voiced frames", () => {
    const detector = new SamuelTurnDetector({ speechStartMs: 50 });

    expect(detector.observe(0.03, 1_000, false).started).toBe(false);
    expect(detector.observe(0.03, 1_025, false).started).toBe(false);
    const decision = detector.observe(0.03, 1_055, false);

    expect(decision.started).toBe(true);
    expect(decision.bargeIn).toBe(false);
    expect(detector.isActive).toBe(true);
  });

  it("uses the stricter barge-in gate while Samuel is speaking", () => {
    const detector = new SamuelTurnDetector({ bargeStartMs: 75 });

    expect(detector.observe(0.02, 1_000, true).started).toBe(false);
    expect(detector.observe(0.04, 1_050, true).started).toBe(false);
    const decision = detector.observe(0.04, 1_130, true);

    expect(decision.started).toBe(true);
    expect(decision.bargeIn).toBe(true);
  });

  it("ends the utterance after sustained silence", () => {
    const detector = new SamuelTurnDetector({ speechStartMs: 25, endSilenceMs: 300 });
    detector.observe(0.04, 1_000, false);
    detector.observe(0.04, 1_040, false);
    detector.observe(0.04, 1_100, false);

    const decision = detector.observe(0.001, 1_450, false);
    expect(decision.ended).toBe(true);
    expect(detector.isActive).toBe(false);
  });

  it("adapts its noise floor without treating quiet room noise as speech", () => {
    const detector = new SamuelTurnDetector();
    for (let index = 0; index < 50; index += 1) {
      detector.observe(0.004, index * 25, false);
    }

    expect(detector.currentNoiseFloor).toBeLessThan(0.006);
    expect(detector.isActive).toBe(false);
  });
});

describe("voice PCM helpers", () => {
  it("calculates RMS", () => {
    expect(calculatePcmRms(new Float32Array([0.5, -0.5, 0.5, -0.5]))).toBeCloseTo(0.5);
  });

  it("downsamples and concatenates PCM", () => {
    const source = new Float32Array(4_800).fill(0.25);
    const downsampled = downsamplePcm(source, 48_000, 16_000);
    expect(downsampled.length).toBe(1_600);

    const combined = concatPcm([downsampled, downsampled]);
    expect(combined.length).toBe(3_200);
  });

  it("writes a valid mono PCM16 WAV header", () => {
    const wav = encodePcm16Wav(new Float32Array(1_600), 16_000);
    expect(new TextDecoder().decode(wav.slice(0, 4))).toBe("RIFF");
    expect(new TextDecoder().decode(wav.slice(8, 12))).toBe("WAVE");
    expect(wav.byteLength).toBe(44 + 1_600 * 2);
  });
});
