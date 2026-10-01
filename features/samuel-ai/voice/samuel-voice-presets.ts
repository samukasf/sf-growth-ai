export type SamuelVoicePreset = {
  id: string;
  name: string;
  description: string;
};

export const SAMUEL_VOICE_PRESETS: readonly SamuelVoicePreset[] = [
  {
    id: "k5aKjuBz9NhUMZc7SDpl",
    name: "Marilita",
    description: "Natural e conversacional · PT-BR",
  },
  {
    id: "YklVF5l1Q8os8glyd5SM",
    name: "Camilla",
    description: "Suave, moderna e natural · PT-BR",
  },
  {
    id: "fpqzllOdDmER4wwFESLO",
    name: "Athena",
    description: "Humana, confiante e sofisticada · PT-BR",
  },
  {
    id: "HRSah1W6jpO9LAGaA4T7",
    name: "Deya",
    description: "Fluida, acolhedora e profissional · PT-BR",
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
