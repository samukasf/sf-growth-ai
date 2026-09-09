export const SAMUEL_VOICE_SAMPLE_RATE = 16_000;
export const SAMUEL_VOICE_PRE_ROLL_MS = 750;

export type SamuelTurnDecision = {
  started: boolean;
  ended: boolean;
  bargeIn: boolean;
  threshold: number;
  noiseFloor: number;
};

type SamuelTurnDetectorOptions = {
  speechFloor?: number;
  bargeFloor?: number;
  speechNoiseMultiplier?: number;
  bargeNoiseMultiplier?: number;
  speechStartMs?: number;
  bargeStartMs?: number;
  endSilenceMs?: number;
  maxUtteranceMs?: number;
};

/**
 * Lightweight local turn detector.
 *
 * Design goals borrowed from production voice-agent systems such as LiveKit,
 * Pipecat and Jarvis: short consecutive-frame confirmation before declaring
 * speech, a stricter threshold while assistant audio is playing, adaptive
 * ambient-noise calibration and deterministic end-of-turn timing.
 *
 * This does not try to replace semantic VAD. It is the fast local gate that
 * makes barge-in immediate; STT + echo rejection remain the second stage.
 */
export class SamuelTurnDetector {
  private readonly speechFloor: number;
  private readonly bargeFloor: number;
  private readonly speechNoiseMultiplier: number;
  private readonly bargeNoiseMultiplier: number;
  private readonly speechStartMs: number;
  private readonly bargeStartMs: number;
  private readonly endSilenceMs: number;
  private readonly maxUtteranceMs: number;

  private noiseFloor = 0.006;
  private candidateAt = 0;
  private active = false;
  private startedAt = 0;
  private lastSpeechAt = 0;
  private activeBargeIn = false;

  constructor(options: SamuelTurnDetectorOptions = {}) {
    this.speechFloor = options.speechFloor ?? 0.018;
    this.bargeFloor = options.bargeFloor ?? 0.032;
    this.speechNoiseMultiplier = options.speechNoiseMultiplier ?? 2.7;
    this.bargeNoiseMultiplier = options.bargeNoiseMultiplier ?? 4.0;
    this.speechStartMs = options.speechStartMs ?? 50;
    this.bargeStartMs = options.bargeStartMs ?? 75;
    this.endSilenceMs = options.endSilenceMs ?? 800;
    this.maxUtteranceMs = options.maxUtteranceMs ?? 45_000;
  }

  get isActive() {
    return this.active;
  }

  get currentNoiseFloor() {
    return this.noiseFloor;
  }

  reset(options: { preserveNoiseFloor?: boolean } = {}) {
    if (!options.preserveNoiseFloor) this.noiseFloor = 0.006;
    this.candidateAt = 0;
    this.active = false;
    this.startedAt = 0;
    this.lastSpeechAt = 0;
    this.activeBargeIn = false;
  }

  observe(rms: number, now: number, assistantSpeaking: boolean): SamuelTurnDecision {
    const speechThreshold = Math.max(
      this.speechFloor,
      this.noiseFloor * this.speechNoiseMultiplier,
    );
    const bargeThreshold = Math.max(
      this.bargeFloor,
      this.noiseFloor * this.bargeNoiseMultiplier,
    );
    const threshold = assistantSpeaking ? bargeThreshold : speechThreshold;

    let started = false;
    let ended = false;
    let bargeIn = false;

    if (this.active) {
      if (rms >= speechThreshold) this.lastSpeechAt = now;

      const hitMaxDuration = now - this.startedAt >= this.maxUtteranceMs;
      const hitEndSilence =
        now - this.startedAt >= 180 &&
        this.lastSpeechAt > 0 &&
        now - this.lastSpeechAt >= this.endSilenceMs;

      if (hitMaxDuration || hitEndSilence) {
        ended = true;
        bargeIn = this.activeBargeIn;
        this.active = false;
        this.activeBargeIn = false;
        this.candidateAt = 0;
        this.startedAt = 0;
        this.lastSpeechAt = 0;
      }
    } else {
      if (!assistantSpeaking && rms < speechThreshold) {
        this.noiseFloor = Math.max(
          0.0025,
          Math.min(0.025, this.noiseFloor * 0.97 + rms * 0.03),
        );
      }

      if (rms >= threshold) {
        if (!this.candidateAt) this.candidateAt = now;
        const requiredMs = assistantSpeaking ? this.bargeStartMs : this.speechStartMs;
        if (now - this.candidateAt >= requiredMs) {
          started = true;
          bargeIn = assistantSpeaking;
          this.active = true;
          this.activeBargeIn = assistantSpeaking;
          this.startedAt = now;
          this.lastSpeechAt = now;
          this.candidateAt = 0;
        }
      } else {
        this.candidateAt = 0;
      }
    }

    return {
      started,
      ended,
      bargeIn,
      threshold,
      noiseFloor: this.noiseFloor,
    };
  }
}

export function calculatePcmRms(samples: Float32Array) {
  if (!samples.length) return 0;
  let energy = 0;
  for (let index = 0; index < samples.length; index += 1) {
    const sample = samples[index] ?? 0;
    energy += sample * sample;
  }
  return Math.sqrt(energy / samples.length);
}

export function downsamplePcm(
  input: Float32Array,
  sourceRate: number,
  targetRate = SAMUEL_VOICE_SAMPLE_RATE,
) {
  if (!input.length || sourceRate <= 0 || targetRate <= 0) return new Float32Array();
  if (sourceRate === targetRate) return input.slice();

  const ratio = sourceRate / targetRate;
  const outputLength = Math.max(1, Math.round(input.length / ratio));
  const output = new Float32Array(outputLength);

  if (sourceRate < targetRate) {
    for (let index = 0; index < outputLength; index += 1) {
      const sourceIndex = Math.min(input.length - 1, Math.round(index * ratio));
      output[index] = input[sourceIndex] ?? 0;
    }
    return output;
  }

  for (let index = 0; index < outputLength; index += 1) {
    const start = Math.floor(index * ratio);
    const end = Math.min(input.length, Math.max(start + 1, Math.floor((index + 1) * ratio)));
    let total = 0;
    let count = 0;
    for (let sourceIndex = start; sourceIndex < end; sourceIndex += 1) {
      total += input[sourceIndex] ?? 0;
      count += 1;
    }
    output[index] = count ? total / count : input[start] ?? 0;
  }
  return output;
}

export function concatPcm(parts: readonly Float32Array[]) {
  const totalLength = parts.reduce((total, part) => total + part.length, 0);
  const output = new Float32Array(totalLength);
  let offset = 0;
  for (const part of parts) {
    output.set(part, offset);
    offset += part.length;
  }
  return output;
}

export function encodePcm16Wav(
  samples: Float32Array,
  sampleRate = SAMUEL_VOICE_SAMPLE_RATE,
) {
  const bytes = new Uint8Array(44 + samples.length * 2);
  const view = new DataView(bytes.buffer);
  const writeAscii = (offset: number, value: string) => {
    for (let index = 0; index < value.length; index += 1) {
      view.setUint8(offset + index, value.charCodeAt(index));
    }
  };

  writeAscii(0, "RIFF");
  view.setUint32(4, 36 + samples.length * 2, true);
  writeAscii(8, "WAVE");
  writeAscii(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeAscii(36, "data");
  view.setUint32(40, samples.length * 2, true);

  for (let index = 0; index < samples.length; index += 1) {
    const sample = Math.max(-1, Math.min(1, samples[index] ?? 0));
    view.setInt16(
      44 + index * 2,
      sample < 0 ? Math.round(sample * 0x8000) : Math.round(sample * 0x7fff),
      true,
    );
  }

  return bytes;
}
