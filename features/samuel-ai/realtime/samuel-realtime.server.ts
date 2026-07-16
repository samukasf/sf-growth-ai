export const DEFAULT_REALTIME_MODEL = "gpt-realtime-2.1";
// Samuel has one consistent vocal identity. `cedar` is a current, high-quality
// Realtime voice and gives the executive assistant a deeper masculine timbre.
export const DEFAULT_REALTIME_VOICE = "cedar";

const REALTIME_MODEL_PATTERN =
  /^(?:gpt-realtime(?:$|[-.][a-z0-9._-]+)|gpt-4o-realtime-preview(?:$|[-.][a-z0-9._-]+))$/i;

export class InvalidRealtimeModelError extends Error {
  readonly code = "REALTIME_MODEL_INVALID";

  constructor(model: string) {
    super(`Modelo Realtime inválido: ${model}`);
    this.name = "InvalidRealtimeModelError";
  }
}

export function resolveRealtimeModel(env: NodeJS.ProcessEnv = process.env) {
  const model = env.OPENAI_REALTIME_MODEL?.trim() || DEFAULT_REALTIME_MODEL;

  if (!REALTIME_MODEL_PATTERN.test(model)) {
    throw new InvalidRealtimeModelError(model);
  }

  return model;
}

export function buildRealtimeSession(input: {
  model: string;
  voice: string;
  contextSummary: string | null;
}) {
  const context = input.contextSummary
    ? `\n\nContexto executivo disponível: ${input.contextSummary}`
    : "";

  return {
    type: "realtime" as const,
    model: input.model,
    instructions: `Você é Samuel AI, o assistente executivo e executivo de crescimento do SF Growth AI. Responda em português brasileiro por padrão e adapte-se ao idioma do usuário. Sua personalidade é masculina, grave, calma, confiante, educada e discreta. Trate o usuário como “senhor” ou “Sr. Samuel” conforme o contexto, sem repetir o tratamento mecanicamente em todas as frases. Espere o usuário concluir o raciocínio; nunca fale por cima dele. Seja objetivo, mas completo, consultivo e profissional. Fale com voz masculina adulta, segura, grave, natural e calorosa, em ritmo calmo e executivo. Demonstre iniciativa somente quando o contexto trouxer um evento real e verificável, como compromisso, e-mail, lead, falha de deploy, campanha abaixo do esperado ou tarefa prioritária. Cite a origem do sinal, não invente eventos e não faça perguntas aleatórias como “Posso ajudar?”. Quando não houver evidência suficiente, diga isso com naturalidade. Use o contexto empresarial apenas quando for relevante. Nunca afirme ter executado uma ação que não foi realmente confirmada. Nunca revele segredos, chaves ou detalhes internos de infraestrutura.${context}`,
    audio: {
      input: {
        transcription: {
          model: "gpt-4o-mini-transcribe",
          language: "pt",
        },
        turn_detection: {
          type: "server_vad",
          threshold: 0.5,
          prefix_padding_ms: 300,
          silence_duration_ms: 900,
          create_response: true,
          interrupt_response: true,
        },
      },
      output: {
        voice: input.voice,
      },
    },
  };
}
