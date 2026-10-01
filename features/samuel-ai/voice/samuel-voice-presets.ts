export type SamuelVoicePreset = {
  id: string;
  name: string;
  description: string;
  gender: "masculina" | "feminina";
};

export const SAMUEL_VOICE_PRESETS: readonly SamuelVoicePreset[] = [
  {
    id: "nLSNxtDmAgEDCV5VA6oz",
    name: "Bruno Ferreira",
    description: "Natural, firme e conversacional · PT-BR",
    gender: "masculina",
  },
] as const;

export const DEFAULT_SAMUEL_VOICE_PRESET = SAMUEL_VOICE_PRESETS[0];

export function findSamuelVoicePreset(id?: string | null) {
  const voiceId = id?.trim();
  return (
    SAMUEL_VOICE_PRESETS.find((voice) => voice.id === voiceId) ??
    DEFAULT_SAMUEL_VOICE_PRESET
  );
}
