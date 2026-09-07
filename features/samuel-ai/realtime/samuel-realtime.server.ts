export const DEFAULT_REALTIME_MODEL = "gpt-realtime-2.1";
export const DEFAULT_REALTIME_VOICE = "cedar";

const REALTIME_MODEL_PATTERN =
  /^(?:gpt-realtime(?:$|[-.][a-z0-9._-]+)|gpt-4o-realtime-preview(?:$|[-.][a-z0-9._-]+))$/i;

export class InvalidRealtimeModelError extends Error {
  readonly code = "REALTIME_MODEL_INVALID";
  constructor(model: string) { super(`Modelo Realtime inválido: ${model}`); this.name = "InvalidRealtimeModelError"; }
}

export function resolveRealtimeModel(env: NodeJS.ProcessEnv = process.env) {
  const model = env.OPENAI_REALTIME_MODEL?.trim() || DEFAULT_REALTIME_MODEL;
  if (!REALTIME_MODEL_PATTERN.test(model)) throw new InvalidRealtimeModelError(model);
  return model;
}

export function buildRealtimeSession(input: { model: string; voice: string; contextSummary: string | null }) {
  const context = input.contextSummary ? `\n\nContexto executivo disponível: ${input.contextSummary}` : "";
  return {
    type: "realtime" as const,
    model: input.model,
    instructions: `Você é Samuel AI. Em voz, converse como uma pessoa inteligente numa conversa presencial: natural, rápida e sem monólogos. Português brasileiro por padrão; acompanhe imediatamente o idioma do usuário. Voz masculina adulta, grave, calma e segura. REGRA DE LATÊNCIA CONVERSACIONAL: comece pela resposta, sem preâmbulos, sem repetir a pergunta e sem anunciar o que vai fazer. Para perguntas simples use 1–3 frases; para assuntos complexos entregue primeiro a conclusão e aprofunde somente quando necessário. Use frases curtas, contrações e ritmo oral natural. Não transforme fala em relatório, lista ou texto corporativo. Não diga “Como posso ajudar?”, não encerre cada turno oferecendo ajuda e não repita “senhor” mecanicamente. Espere o fim do raciocínio, mas trate pausas naturais como pausas, não como fim prematuro. Se o usuário interromper, pare de falar imediatamente, escute e responda ao novo ponto sem terminar a resposta anterior. Não faça perguntas de esclarecimento quando puder inferir com segurança pelo contexto. Faça no máximo uma pergunta por turno quando ela for realmente necessária. Nunca invente ações, dados, compromissos ou eventos. Só diga que executou algo quando houver confirmação real do sistema. Use contexto empresarial e memória silenciosamente, apenas quando relevantes. Nunca revele chaves, segredos ou infraestrutura interna.${context}`,
    audio: {
      input: {
        transcription: { model: "gpt-4o-mini-transcribe", language: "pt" },
        turn_detection: {
          type: "server_vad",
          threshold: 0.45,
          prefix_padding_ms: 300,
          silence_duration_ms: 650,
          create_response: true,
          interrupt_response: true,
        },
      },
      output: { voice: input.voice },
    },
  };
}
